"""
Functions to parse results downloaded from the FTP server
or retrieved from the Entrez API, and extract the data
we want from the results.
"""
import multiprocessing
import os.path
import queue
import threading
import time
import urllib.request
from typing import Optional

from lxml import etree

from app.pubmed.extract_xml import extract_articles
from app.pubmed.model import Article
from app.pubmed.warning_log import WarningLog, LogFile
from app.utils import calc_md5_hash_of_file


def list_pubmed_files_in_dir(d: str) -> list[str]:
    """
    Lists all the GZIP XML pubmed files in dir.
    """
    return [os.path.join(d, name) for name in os.listdir(d) if name.startswith("n") and name.endswith(".xml.gz")]


def list_downloaded_pubmed_files(
        target_directory: str
) -> tuple[tuple[str, int], tuple[str, int], list[tuple[str, int, str]]]:
    """
    Returns the paths to downloaded PubMed XML files.
    Returns a list of tuples of (group, year, file).
    """
    pubmed_dir = os.path.join(target_directory, "pubmed")
    baseline_dir = os.path.join(pubmed_dir, "baseline")
    update_dir = os.path.join(pubmed_dir, "updatefiles")

    baseline_groups = sorted(os.listdir(baseline_dir))
    update_groups = sorted(os.listdir(update_dir))

    latest_baseline_group = baseline_groups[-1]
    latest_update_group = update_groups[-1]

    latest_baseline_year = 2000 + int(latest_baseline_group[len("pubmed"):])
    latest_update_year = 2000 + int(latest_update_group[len("pubmed"):])

    latest_baseline_dir = os.path.join(baseline_dir, latest_baseline_group)
    latest_update_dir = os.path.join(update_dir, latest_update_group)

    return (latest_baseline_group, latest_baseline_year), (latest_update_group, latest_update_year), sorted([
        *[(latest_baseline_group, latest_baseline_year, f) for f in list_pubmed_files_in_dir(latest_baseline_dir)],
        *[(latest_update_group, latest_update_year, f) for f in list_pubmed_files_in_dir(latest_update_dir)]
    ])


class ReadPubMedItem:
    """ The contents of a PubMed file that has been read. """

    def __init__(self, index: int, md5_hash: Optional[str], articles: Optional[list[Article]]):
        self.index = index
        self.md5_hash = md5_hash
        self.articles = articles

    def __eq__(self, other):
        if type(other) != type(self):
            return False
        return self.index == other.index

    def __gt__(self, other):
        if type(other) != type(self):
            return False
        return self.index > other.index


def read_all_pubmed_files(
        log_dir: str,
        target_directory: str,
        file_paths: list[str],
        *,
        read_thread_count=4
) -> queue.PriorityQueue[ReadPubMedItem]:
    """
    Reads the contents of all the downloaded PubMed files and places
    them into the returned priority queue in the same order as file_paths.
    Once all files are read, a file with a contents of None will be
    returned from the queue.
    """
    input_queue = queue.SimpleQueue()
    for index, file in enumerate(file_paths):
        input_queue.put((index, file))

    # The lock is used for thread-safety. The queue is used to block when
    # the elements are being read faster than they are being used. The
    # indices are used to verify that the next file has been read and
    # is in the queue.
    unordered_queue_lock = multiprocessing.Lock()
    unordered_outputs = []

    def process_files():
        while True:
            # Grab the next input file to process.
            while True:
                # Wait until there is space for the output of the next file.
                with unordered_queue_lock:
                    # Check if there is space in the unordered outputs list.
                    if len(unordered_outputs) < read_thread_count:
                        try:
                            process_index, process_file = input_queue.get_nowait()
                            is_empty = False
                        except queue.Empty:
                            is_empty = True
                        break

                # Wait until there is space for new files on the queue.
                time.sleep(0.1)

            if is_empty:
                break

            articles = parse_pubmed_xml(log_dir, target_directory, process_file)
            md5_hash = calc_md5_hash_of_file(process_file)
            output = ReadPubMedItem(process_index, md5_hash, articles)
            with unordered_queue_lock:
                unordered_outputs.append(output)

    threads = []
    for thread_no in range(read_thread_count):
        thread = threading.Thread(name="read{}".format(thread_no), target=process_files, daemon=True)
        threads.append(thread)
        thread.start()

    ordered_output_queue = queue.PriorityQueue(maxsize=read_thread_count)

    def order_queue():
        next_index = 0
        while next_index < len(file_paths):
            # Check if the next_index has been read yet.
            with unordered_queue_lock:
                next_file = None
                next_file_index = None
                for output_index, output_file in enumerate(unordered_outputs):
                    if output_file.index == next_index:
                        next_file = output_file
                        next_file_index = output_index
                        break

                if next_file is not None:
                    del unordered_outputs[next_file_index]

            if next_file is not None:
                ordered_output_queue.put(next_file)
                next_index += 1
            else:
                time.sleep(0.1)

        ordered_output_queue.put(ReadPubMedItem(next_index, None, None))

    order_thread = threading.Thread(name="order", target=order_queue, daemon=True)
    threads.append(order_thread)
    order_thread.start()

    return ordered_output_queue


class DTDResolver(etree.Resolver):
    """
    Downloads the PubMed DTD files locally and re-uses them.
    """
    lock: threading.Lock = threading.Lock()
    dtd_cache: dict[str, str] = {}

    def __init__(self, target_directory: str, start_url: str):
        super().__init__()
        self.target_directory = target_directory
        self.cache_dir = os.path.join(target_directory, "dtd")
        os.makedirs(self.cache_dir, exist_ok=True)
        self.start_url = start_url

    def resolve(self, system_url, public_id, context):
        if system_url.startswith(self.start_url):
            if system_url in DTDResolver.dtd_cache:
                return self.resolve_string(self.dtd_cache[system_url], context)

            # We don't want to download the DTDs more than once on separate threads.
            with DTDResolver.lock:
                # In case of race conditions.
                if system_url in DTDResolver.dtd_cache:
                    return self.resolve_string(self.dtd_cache[system_url], context)

                # Find where the DTD should be stored locally.
                dtd_name = system_url.split("/")[-1]
                filename = os.path.join(self.cache_dir, dtd_name)

                if os.path.exists(filename):
                    # We have already downloaded the DTD, so just read it.
                    with open(filename, "rt") as f:
                        dtd_text = f.read()
                else:
                    # Download the DTD
                    with urllib.request.urlopen(system_url) as f:
                        dtd_text = f.read().decode('utf-8')

                    # Write the DTD locally.
                    with open(filename, "wt") as f:
                        f.write(dtd_text)

                # Store the DTD in the cache.
                DTDResolver.dtd_cache[system_url] = dtd_text
                return self.resolve_string(dtd_text, context)
        else:
            return super().resolve(system_url, public_id, context)


def create_pubmed_xml_parser(target_directory: str) -> etree.XMLParser:
    parser = etree.XMLParser(
        remove_blank_text=True,
        remove_comments=True,
        remove_pis=True,
        collect_ids=False,
        load_dtd=False,
        dtd_validation=False,
        attribute_defaults=False
    )
    parser.resolvers.add(DTDResolver(os.path.join(target_directory, "pubmed"), "http://dtd.nlm.nih.gov/"))
    return parser


def _do_parse_pubmed_xml(log_dir: str, target_directory: str, path: str, return_queue: multiprocessing.Queue):
    """
    Parses the contents of the given file and returns the result.
    """
    parser = create_pubmed_xml_parser(target_directory)
    tree: etree.ElementTree = etree.parse(path, parser)

    # Remove directories and all extensions from filename (i.e. removes .xml.gz)
    filename = os.path.basename(path)
    try:
        filename = filename[:filename.index(".", 1)]
    except ValueError:
        pass

    # Open the log file for warnings about the extraction of the articles.
    log_file: str = os.path.join(log_dir, f"warnings.{filename}.txt")
    with LogFile(log_file) as log:
        return_queue.put(extract_articles(WarningLog(log), tree))


def parse_pubmed_xml(log_dir: str, target_directory: str, path: str) -> list[Article]:
    """
    Parses the contents of the file at the given path into a Python object.
    A new process is started to perform the parsing due to repeated calls
    to lxml causing massive memory leaks. Instead, running lxml in a
    separate process allows the process to be killed afterwards, along
    with all of its memory.

    This is quite wasteful, but we can just spin up more threads to
    balance that waste. It is unfortunate that this is required.
    """
    return_queue = multiprocessing.Queue()
    process = multiprocessing.Process(
        name="parse_pubmed_xml",
        target=_do_parse_pubmed_xml,
        args=(log_dir, target_directory, path, return_queue),
        daemon=True
    )
    process.start()
    result: list[Article] = return_queue.get()
    process.terminate()
    return result
