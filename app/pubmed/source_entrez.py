"""
This file provides functions to fetch metadata from the PubMed API.
"""
import sys
import threading
import time
from typing import Final
from Bio import Entrez
from app.utils import run_over_threads
from config import PUBMED_ACCESS_EMAIL, ENTREZ_TOOL, ENTREZ_API_KEY


PUBMED_DB_NAME: Final = "pubmed"
PUBMED_CENTRAL_DB_NAME: Final = "pmc"


def init_entrez():
    """
    Initialises connection information for Entrez.
    """
    if PUBMED_ACCESS_EMAIL is None:
        raise ValueError("Please fill out the ENTREZ_EMAIL field in config.py")
    if ENTREZ_TOOL is None:
        raise ValueError("Please fill out the ENTREZ_TOOL field in config.py")

    Entrez.email = PUBMED_ACCESS_EMAIL
    Entrez.tool = ENTREZ_TOOL
    Entrez.api_key = ENTREZ_API_KEY


def do_rate_limit():
    """
    Enforces that we do not exceed the rate limits of the e-utilities API.
    The biopython Entrez API does this automatically, although it is not
    thread-safe.
    """
    # Adapted from the biopython Entrez library, but
    # with fixed multi-threading support.
    delay = 0.11 if Entrez.api_key else 0.371
    current_time = time.time()

    do_rate_limit.lock.acquire()
    try:
        wait = do_rate_limit.next_request_time - current_time
        if wait > 0:
            do_rate_limit.next_request_time += delay
        else:
            do_rate_limit.next_request_time = current_time + delay
    finally:
        do_rate_limit.lock.release()

    if wait > 0:
        time.sleep(wait)


do_rate_limit.lock = threading.Lock()
do_rate_limit.next_request_time = 0


def request_entrez_einfo():
    """
    The einfo endpoint lists the databases that are available.
    :return: {'DbList': [databases...]}
    """
    init_entrez()
    do_rate_limit()
    handle = Entrez.einfo()
    response = Entrez.read(handle)
    handle.close()
    return response


def request_entrez_database_list():
    """
    :return: A list of the names of the databases available from Entrez.
    """
    einfo_response = request_entrez_einfo()
    if "DbList" not in einfo_response:
        print(einfo_response, file=sys.stderr)
        raise ValueError("einfo response did not contain DbList")
    return einfo_response["DbList"]


def download_all_modified_since(db, date, max_download=50_000):
    """
    Downloads all PubMed entries that have been modified since the given date using Entrez.

    The date should be in the format YYYY/MM/DD.
    """
    init_entrez()
    do_rate_limit()
    search_handle = Entrez.esearch(
        db=db,
        retmax=0,  # We don't want the IDs yet
        term="(\"" + date + "\"[MDAT]:\"3000\"[MDAT])",
        sort="pub date",
        sort_order="asc",
        datetype="mdat",
        usehistory="y"
    )
    search_response = Entrez.read(search_handle)
    search_handle.close()

    count = int(search_response["Count"])
    query_key = search_response["QueryKey"]
    webenv = search_response["WebEnv"]

    if count > max_download:
        raise ValueError("There are more than the maximum number of entries to download,", count, ">", max_download)

    start = 0
    max_per_request = 10_000
    arguments = []
    while start < count:
        arguments.append([start])
        start += max_per_request

    def do_fetch(start):
        do_rate_limit()
        fetch_handle = Entrez.efetch(
            db=db,
            query_key=query_key,
            WebEnv=webenv,
            retstart=start,
            retmax=max_per_request,
            retmode="xml"
        )
        fetch_response = fetch_handle.read()
        fetch_handle.close()
        return fetch_response

    return run_over_threads(do_fetch, arguments)
