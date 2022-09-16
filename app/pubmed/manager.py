"""
This file contains code to manage the PubMed data. This includes
the download of the data, the extraction of relevant information
from the data, and the updating of the Neo4J databse with this
information.
"""
import gzip
import os
import sys
import pathlib
import time
from typing import Optional

from app.pubmed.mesh import process_mesh_headings, get_latest_mesh_desc_file
from app.pubmed.model import DBMetadataMeshFile, DBMetadataDataFile, DatabaseStatus, DBMetadata, \
    LATEST_PUBMED_DB_VERSION
from app.pubmed.progress_analytics import DownloadAnalytics
from app.pubmed.pubmed_db_conn import PubMedCacheConn
from app.pubmed.source_files import list_downloaded_pubmed_files, read_all_pubmed_files
from app.pubmed.source_ftp import PubMedFTP
from app.utils import format_minutes, calc_md5_hash_of_file, flush_print
from config import LOGS_DIR, DATA_DIR


class PubMedManager:
    """
    Provides the functionality required to populate and
    maintain the PubMed Neo4J database.
    """
    def __init__(self, db_name: Optional[str] = None):
        self.db_name = db_name

    def _report_regenerate_instructions(self):
        """ Reports instructs to re-generate the database. """
        flush_print(
            f"Please re-generate your database or change the version of\n"
            f"PubMedConnections that you are running.\n"
            f"\n"
            f"You can re-generate your database by first clearing it, and then\n"
            f"re-generating it. The most efficient method to clear your database\n"
            f"is to delete the data on-disk.\n"
            f"See: https://neo4j.com/developer/kb/large-delete-transaction-best-practices-in-neo4j/\n"
            f"\n"
            f"The 'clear' sub-command may also be used to clear your database,\n"
            f"although it is slow.\n"
            f"\n"
            f"The 'extract' sub-command may then be used to re-generate your database\n",
            file=sys.stderr
        )

    def report_db_incompatible(self, current_pubmed_db_version: int):
        """
        Reports to the user when what is stored in the database is incompatible
        with the current version of PubMedConnections.
        """
        flush_print(
            f"Your database has an unsupported version. Expected version {LATEST_PUBMED_DB_VERSION},\n"
            f"but the database has version {current_pubmed_db_version}.\n\n",
            file=sys.stderr
        )
        self._report_regenerate_instructions()

    def report_db_outdated(self, current_pubmed_db_year: int, expected_pubmed_db_year: int):
        """
        Reports to the user when the data stored in the database is from a previous
        year to what has been synchronised to disk.
        """
        flush_print(
            f"Your database is outdated. Your database contains data from {current_pubmed_db_year},\n"
            f"but the latest downloaded data is from {expected_pubmed_db_year}.\n\n",
            file=sys.stderr
        )
        self._report_regenerate_instructions()

    def run_sync(self, *, target_directory=None) -> int:
        """
        Synchronises the PubMed dataset from FTP.
        """
        # Use the config defaults if not supplied explicitly.
        if target_directory is None:
            target_directory = DATA_DIR

        # Read the available files.
        with PubMedFTP() as ftp:
            targets = ftp.sync(target_directory)
            flush_print()

        # Write an example file for us to look at the available data.
        example_target = targets[0]
        example_target_parts = pathlib.Path(example_target).parts

        flush_print("PubMedSync: Reading example file from", example_target)
        with gzip.open(targets[0], "rb") as file:
            example_file_contents = file.read()

        example_filename = example_target_parts[-2] + example_target_parts[-1]
        example_filename = example_filename[:example_filename.index(".")]
        example_file_prefix = os.path.join(target_directory, "pubmed", "example.")
        example_file_xml = example_file_prefix + example_filename + ".xml"

        flush_print("PubMedSync: Writing example file to", example_file_xml)
        with open(example_file_xml, "w") as f:
            f.write(example_file_contents.decode("utf8"))

        return 0

    def run_clear(self):
        """
        Clears the content of the Neo4J database.
        """
        flush_print("Are you sure you wish to delete all of the data in your Neo4J Database (y/N):")
        value = input()
        if value.lower() != "y":
            flush_print("Aborted")
            return

        flush_print()
        with PubMedCacheConn(database=self.db_name) as conn:
            if conn.count_nodes() > 1_000_000:
                flush_print("Your database is too large to clear using this command.")
                flush_print("Please delete the data manually from your file system.")
                flush_print("See: https://neo4j.com/developer/kb/large-delete-transaction-best-practices-in-neo4j/")
                return

            flush_print("Deleting the entire contents of the Neo4J database... (This may take a while)")
            conn.delete_entire_database_contents()
            flush_print("Success")

    def run_extract(
            self, *,
            log_dir=None, target_directory=None, report_every=60,
            do_md5_file_change_check=False) -> int:
        """
        Extracts data from the synchronized PubMed data files.
        Returns 0 on success, and an error code on failure.
        """
        overall_start = time.time()

        # Use the config defaults if not supplied explicitly.
        if target_directory is None:
            target_directory = DATA_DIR
        if log_dir is None:
            log_dir = LOGS_DIR

        # List the data files that have been downloaded.
        baseline_info, latest_info, pubmed_file_specs = list_downloaded_pubmed_files(target_directory)
        (_, latest_baseline_year) = baseline_info
        (_, latest_update_year) = latest_info

        # Check that the baseline and updatefiles years match.
        if latest_baseline_year != latest_update_year:
            flush_print(
                f"The latest baseline dataset and the latest updatefiles dataset\n"
                f"do not match. (latest_baseline={latest_baseline_year}, latest_update={latest_update_year})\n"
                f"Has the sync of a new year's dataset not completed successfully?",
                file=sys.stderr
            )
            return 1

        pubmed_files = [f for _, _, f in pubmed_file_specs]
        pubmed_file_sizes = []
        for pubmed_file in pubmed_files:
            pubmed_file_sizes.append(os.path.getsize(pubmed_file))

        # Make sure the directory where we store warnings has been created.
        if not os.path.isdir(log_dir):
            os.mkdir(log_dir)

        # Find the latest MeSH descriptor file.
        mesh_directory, mesh_heading_file, mesh_year = get_latest_mesh_desc_file(target_directory)

        # Generate the metadata model that we will use to update the database metadata.
        mesh_file_hash = calc_md5_hash_of_file(mesh_heading_file)
        meta_mesh = DBMetadataMeshFile(mesh_year, mesh_heading_file, False, mesh_file_hash)

        # Generate the PubMed data file model that we will use to update the database metadata.
        meta_pubmed = []
        for group, year, file in pubmed_file_specs:
            meta_pubmed.append(DBMetadataDataFile(
                group, year, file, False
            ))

        # Generate the general database metadata object.
        meta = DBMetadata(
            LATEST_PUBMED_DB_VERSION, None, latest_baseline_year, None,
            DatabaseStatus.UPDATING, meta_mesh, meta_pubmed
        )

        # Open a connection to the database!
        with PubMedCacheConn(database=self.db_name) as conn:

            # Get the current metadata.
            existing_meta = conn.fetch_db_metadata()
            existing_meta_mesh = None if existing_meta is None else existing_meta.mesh_file
            existing_meta_pubmed = [] if existing_meta is None else existing_meta.data_files
            existing_meta_year = None if existing_meta is None else existing_meta.year

            # Check if the current version of the database is incompatible.
            if existing_meta is not None and existing_meta.is_incompatible():
                self.report_db_incompatible(existing_meta.pubmed_db_version)
                return 1

            # Check if the current version of the database is outdated.
            if existing_meta_year is not None and existing_meta_year != latest_baseline_year:
                self.report_db_outdated(existing_meta_year)
                return 1

            # Detect if we will need to update the MeSH headings.
            requires_mesh_processing = (existing_meta_mesh is None or not existing_meta_mesh.is_same_file(meta_mesh))
            if not requires_mesh_processing:
                meta_mesh = existing_meta_mesh
                meta.mesh_file = existing_meta_mesh

            # Skip the files that have already been processed and haven't changed.
            flush_print("\nPubMedExtract: Detecting the data files that have changed...")
            start_file_index = 0
            for index, meta_pubmed_file in enumerate(meta_pubmed):
                matching_meta_pubmed_file = None

                on_disk_md5_hash = calc_md5_hash_of_file(meta_pubmed_file.file) if do_md5_file_change_check else None
                for existing_meta_pubmed_file in existing_meta_pubmed:
                    if not existing_meta_pubmed_file.processed:
                        continue
                    if not existing_meta_pubmed_file.is_same_file_path(meta_pubmed_file):
                        continue
                    if do_md5_file_change_check and on_disk_md5_hash != existing_meta_pubmed_file.md5_hash:
                        continue

                    # Found that we already processed this file!
                    matching_meta_pubmed_file = existing_meta_pubmed_file
                    break

                if matching_meta_pubmed_file is None:
                    break

                # Copy the existing metadata.
                meta_pubmed[index] = existing_meta_pubmed_file

                # Mark that we don't want to process this file.
                start_file_index = index + 1

            # Start the update of the database.
            analytics = DownloadAnalytics(
                pubmed_file_sizes,
                no_threads=1,
                prediction_size_bias=0.6,
                history_for_prediction=150,
                start_file_index=start_file_index
            )

            # Print out the state going into the processing.
            previous_work_detection_report = []
            if not requires_mesh_processing:
                previous_work_detection_report.append(
                    f"PubMedExtract: Detected that the MeSH descriptor file for {meta_mesh.year} "
                    f"has already been processed. It will not be processed again."
                )
            if start_file_index > 0:
                previous_work_detection_report.append(
                    f"PubMedExtract: Detected that {start_file_index} PubMed files "
                    f"have already been processed. They will not be processed again."
                )
            if len(previous_work_detection_report) > 0:
                flush_print("\n" + "\n".join(previous_work_detection_report))

            # Mark that the database is being updated.
            conn.push_new_db_metadata(meta)

            # First, we need to make sure the MESH headings are up-to-date.
            if requires_mesh_processing:
                process_mesh_headings(mesh_directory, mesh_heading_file, conn)
                meta_mesh.processed = True
                # Mark that the MeSH headings have been updated in the database.
                conn.push_new_db_metadata(meta)

            # Then, we get started on the data files...
            new_pubmed_files = pubmed_files[start_file_index:]
            flush_print(f"\nPubMedExtract: Extracting data from {len(new_pubmed_files)} PubMed files\n")

            file_queue = read_all_pubmed_files(
                log_dir, target_directory, new_pubmed_files
            )

            last_report_time = time.time()
            while True:
                start = time.time()
                file = file_queue.get()
                file_index = file.index + start_file_index
                if file.articles is None:
                    break  # Marks that there are no more files.

                try:
                    conn.insert_article_batch(file.articles)
                except Exception as e:
                    flush_print(f"Error occurred in file {analytics.num_processed + 1}:", file=sys.stderr)
                    raise e

                file_meta = meta_pubmed[file_index]
                file_meta.processed = True
                file_meta.md5_hash = file.md5_hash
                file_meta.no_articles = len(file.articles)

                duration = time.time() - start
                analytics.update(duration, pubmed_file_sizes[start_file_index + file.index])
                analytics.update_remaining(pubmed_file_sizes[start_file_index + file.index + 1:])

                if time.time() - last_report_time >= report_every:
                    last_report_time = time.time()
                    analytics.report(prefix="PubMedExtract: ", verb="Processed")

                    # Mark the progress in the database.
                    conn.push_new_db_metadata(meta)

            # Mark that the extraction has completed.
            meta.status = DatabaseStatus.NORMAL
            conn.push_new_db_metadata(meta)

        overall_duration = time.time() - overall_start
        flush_print(
            f"PubMedExtract: Completed extraction of {len(new_pubmed_files)} "
            f"data files in {format_minutes(overall_duration / 60)}\n"
        )
        return 0
