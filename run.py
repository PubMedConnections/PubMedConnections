import gzip
import os.path
import pathlib
import sys
import time

from app import app as application
from app.pubmed.progress_analytics import DownloadAnalytics
from app.pubmed.sink_db import PubmedCacheConn
from app.pubmed.source_ftp import PubMedFTP
from app.pubmed.source_files import list_downloaded_pubmed_files, read_all_pubmed_files
from app.utils import format_minutes
from config import PUBMED_DB_FILE, NEO4J_DATABASE


def print_valid_modes():
    print("Valid Modes:", file=sys.stderr)
    print(" - sync: Synchronise the data files from the PubMed FTP server", file=sys.stderr)
    print(" - test: Run the test Flask webserver", file=sys.stderr)


def run_sync(*, target_directory="./data"):
    """
    Synchronises the PubMed dataset from FTP.
    """
    with PubMedFTP() as ftp:
        targets = ftp.sync(target_directory)
        print()

    # Write an example file for us to look at the available data.
    example_target = targets[0]
    example_target_parts = pathlib.Path(example_target).parts

    print("PubMedSync: Reading example file from", example_target)
    with gzip.open(targets[0], "rb") as file:
        example_file_contents = file.read()

    example_filename = example_target_parts[-2] + example_target_parts[-1]
    example_filename = example_filename[:example_filename.index(".")]
    example_file_prefix = os.path.join(target_directory, "pubmed", "example.")
    example_file_xml = example_file_prefix + example_filename + ".xml"

    print("PubMedSync: Writing example file to", example_file_xml)
    with open(example_file_xml, "w") as f:
        f.write(example_file_contents.decode("utf8"))


def run_extract(*, target_directory="./data", report_every=60):
    """
    Extracts data from the synchronized PubMed data files.
    """
    overall_start = time.time()

    pubmed_files = list_downloaded_pubmed_files(target_directory)

    # TODO : REMOVE ME, just for testing
    pubmed_files = pubmed_files[:10]

    pubmed_file_sizes = []
    for pubmed_file in pubmed_files:
        pubmed_file_sizes.append(os.path.getsize(pubmed_file))

    print("PubMedExtract: Extracting data from {} PubMed files".format(len(pubmed_files)))
    print()

    file_queue = read_all_pubmed_files(target_directory, pubmed_files)

    db_name = "{}.extract".format(NEO4J_DATABASE)
    with PubmedCacheConn(database=db_name, reset_on_connect=True) as conn:
        analytics = DownloadAnalytics(
            pubmed_file_sizes,
            no_threads=1,
            prediction_size_bias=0.4,
            history_for_prediction=150
        )
        last_report_time = time.time()
        while True:
            start = time.time()
            file = file_queue.get()
            if file.articles is None:
                break  # Marks that there are no more files.

            conn.insert_article_batch(file.articles)

            duration = time.time() - start

            analytics.update(duration, pubmed_file_sizes[file.index])
            analytics.update_remaining(pubmed_file_sizes[file.index + 1:])

            if time.time() - last_report_time >= report_every:
                last_report_time = time.time()
                analytics.report(prefix="PubMedExtract: ", verb="Processed")

    overall_duration = time.time() - overall_start
    print("PubMedExtract: Completed extraction of {} data files in {}".format(
        len(pubmed_files), format_minutes(overall_duration / 60)
    ))


def run_test():
    """
    Runs a test webserver.
    """
    application.run(host='0.0.0.0', port=8080, debug=True)


if __name__ == "__main__":
    args = sys.argv
    if len(args) < 2:
        print("Expected a run-mode to be supplied.", file=sys.stderr)
        print_valid_modes()
        sys.exit(1)

    mode = args[1]
    if mode == "sync":
        if len(args) != 2:
            print("Expected no arguments to sync", file=sys.stderr)
            sys.exit(1)
        run_sync()

    elif mode == "extract":
        if len(args) != 2:
            print("Expected no arguments to extract", file=sys.stderr)
            sys.exit(1)
        run_extract()

    elif mode == "test":
        if len(args) != 2:
            print("Expected no arguments to test", file=sys.stderr)
            sys.exit(1)
        run_test()

    else:
        print("Unknown run-mode", mode, file=sys.stderr)
        sys.exit(1)
