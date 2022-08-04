import datetime
from app.pubmed.model import DBMetadata, DatabaseStatus
from app.pubmed.sink_db import PubmedCacheConn


def set_updating(conn: PubmedCacheConn, start_time: float, file_names: list):
    version = conn.fetch_db_metadata_version()
    if version is None:
        version = 1
    else:
        version += 1
    conn.write_db_metadata(DBMetadata(version, start_time, -1, DatabaseStatus.UPDATING, file_names, []))


def set_done_updating(conn: PubmedCacheConn, start_time: float, finish_time: float, file_names: list, file_hashes: list):
    version = conn.fetch_db_metadata_version() + 1
    conn.write_db_metadata(DBMetadata(version, start_time, finish_time, DatabaseStatus.NORMAL, file_names, file_hashes))
