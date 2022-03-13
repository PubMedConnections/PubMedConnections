"""
This file provides functions to download the baseline XML files containing the PubMed data.
"""
import hashlib
import os.path
import re
import statistics
import sys
import time
import numpy as np
from sklearn.linear_model import LinearRegression
from ftplib import FTP
from pathlib import Path
from typing import Final

import numpy as np

from app.pubmed.download import DownloadTempFile
from config import PUBMED_ACCESS_EMAIL, PUBMED_FTP_DEBUG

PUBMED_FTP_URL: Final[str] = "ftp.ncbi.nlm.nih.gov"
PUBMED_FTP_BASELINE_DIR: Final[str] = "/pubmed/baseline/"
PUBMED_FTP_UPDATES_DIR: Final[str] = "/pubmed/updatefiles/"

# Settings recommended for Pubmed's FTP server.
# See: https://ftp.ncbi.nlm.nih.gov/README.ftp
PUBMED_FTP_PASSIVE = True
PUBMED_FTP_BUFFER_SIZE_BYTES = 64 * 1024  # 64 KB
PUBMED_FTP_TIMEOUT_SECONDS = 5 * 60  # 5 Minutes


class HashMatchingException(Exception):
    pass


class PubMedFTP:
    """
    Wraps operations to interact with the PubMed FTP server.
    """
    def __init__(self):
        self._ftp = None
        if PUBMED_ACCESS_EMAIL == "" or PUBMED_ACCESS_EMAIL is None:
            raise ValueError("Your PUBMED_ACCESS_EMAIL should be set in config.py")

    def reopen_connection(self, *, delay=0):
        try:
            if self._ftp is not None:
                self._ftp.quit()
        except EOFError:
            pass

        if delay > 0:
            time.sleep(delay)

        self._ftp = FTP(timeout=PUBMED_FTP_TIMEOUT_SECONDS)
        self._ftp.set_debuglevel(2 if PUBMED_FTP_DEBUG else 0)
        self._ftp.connect(PUBMED_FTP_URL)
        self._ftp.login(passwd=PUBMED_ACCESS_EMAIL)
        self._ftp.set_pasv(PUBMED_FTP_PASSIVE)

    def __enter__(self):
        self.reopen_connection()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self._ftp is not None:
            self._ftp.quit()
            self._ftp = None

    @property
    def ftp(self):
        if self._ftp is None:
            raise ValueError("Not connected")
        return self._ftp

    def read_file_pairs(self, dirname):
        """
        Reads pairs of (XML data file path, MD5 hash file path) for
        PubMed files in the given directory, along with their size
        in bytes.
        """
        file_bytes = {}
        for name, facts in self.ftp.mlsd(dirname, facts=["size"]):
            if name != "." and name != "..":
                file_bytes[dirname + name] = int(facts["size"])

        data_suffix = ".xml.gz"
        hash_suffix = ".xml.gz.md5"
        names = [file[:-len(data_suffix)] for file in file_bytes if file.endswith(data_suffix)]
        names.sort()

        pairs = [(name + data_suffix, name + hash_suffix) for name in names]
        pairs_with_sizes = []
        for data_file, hash_file in pairs:
            if data_file not in file_bytes:
                raise ValueError("Data file " + data_file + " is missing from the directory listing")
            if hash_file not in file_bytes:
                raise ValueError("Hash file " + hash_file + " is missing from the directory listing")

            df_with_bytes = (data_file, file_bytes[data_file])
            hf_with_bytes = (hash_file, file_bytes[hash_file])
            pairs_with_sizes.append((df_with_bytes, hf_with_bytes))

        return pairs_with_sizes

    def read_baseline_file_pairs(self):
        return self.read_file_pairs(PUBMED_FTP_BASELINE_DIR)

    def read_updates_file_pairs(self):
        return self.read_file_pairs(PUBMED_FTP_UPDATES_DIR)

    def download_file(self, ftp_file: str, file_bytes: int, download_file: DownloadTempFile):
        """
        Downloads ftp_file from the FTP server and writes it into temp_file.
        """
        # We may be resuming a previously started download
        start_byte = download_file.bytes_downloaded
        if start_byte >= file_bytes:
            # Already downloaded the whole file...
            return

        print(" .. Downloading " + ftp_file + "...")
        with download_file:
            self.ftp.retrbinary(
                "RETR " + ftp_file,
                download_file.write,
                rest=start_byte,
                blocksize=PUBMED_FTP_BUFFER_SIZE_BYTES
            )

    def download_hash_file(self, ftp_hash_file: str, file_bytes: int, download_file: DownloadTempFile):
        """
        Downloads ftp_hash_file from the FTP server and writes it to local_target_file.
        :return: the downloaded hash string.
        """
        self.download_file(ftp_hash_file, file_bytes, download_file)

        # The hash from the FTP server is in the form MD5(filename)= <hash>\n
        extract_hash_pattern = re.compile("=\s*([\da-f]+)\s*$")
        expected_hash_str = download_file.contents.decode("utf-8")
        expected_hash_match = extract_hash_pattern.search(expected_hash_str)
        if expected_hash_match is None:
            raise HashMatchingException("Unable to extract expected hash from " + expected_hash_str)

        expected_hash = expected_hash_match.group(1)
        if expected_hash is None:
            raise HashMatchingException(
                "Unable to extract expected hash from " + expected_hash_str + ": group 1 doesn't exist"
            )

        return expected_hash

    def download_pair(self, pair, download_df: DownloadTempFile, download_hf: DownloadTempFile):
        """
        Downloads a data & hash file pair from the FTP server, and checks
        that the MD5 hash of the downloaded data file matches the hash
        from the hash file.
        """
        (ftp_df, df_bytes), (ftp_hf, hf_bytes) = pair
        expected_hash = self.download_hash_file(ftp_hf, hf_bytes, download_hf)

        with download_df:
            self.download_file(ftp_df, df_bytes, download_df)

            actual_hash = download_df.get_md5_hash()
            if expected_hash != actual_hash:
                download_df.mark_for_deletion()
                download_hf.delete_downloaded_file()
                raise HashMatchingException(
                    "Hash mismatch for data file " + download_df.target_file + ", " +
                    expected_hash + " != " + actual_hash
                )

            return download_df.bytes_downloaded

    def download_pair_with_retries(self, target_directory, dir_prefix, pair, *, retries=6):
        """
        Retries the download up to retries times if it fails.

        The connection to the FTP server breaks annoyingly often. It frequently
        will return corrupted files (hashes do not match), or the connection can
        get randomly closed. Therefore, this function will do its best to recover
        from these exceptions and try again.
        """
        target_df, target_hf = PubMedFTP.convert_pair_to_targets(target_directory, dir_prefix, pair)
        target_hf_unchecked = target_hf + ".unchecked"  # Before a successful hash check

        # Delete the target files if they already exist.
        if os.path.exists(target_df):
            os.unlink(target_df)
        if os.path.exists(target_hf):
            os.unlink(target_hf)
        if os.path.exists(target_hf_unchecked):
            os.unlink(target_hf_unchecked)

        download_df = None
        download_hf_unchecked = None

        for attempt in range(retries):
            try:
                if download_df is None:
                    download_df = DownloadTempFile(target_df)
                if download_hf_unchecked is None:
                    download_hf_unchecked = DownloadTempFile(target_hf_unchecked, collect_contents_in_memory=True)

                bytes_downloaded = self.download_pair(pair, download_df, download_hf_unchecked)

                # Success!
                os.rename(target_hf_unchecked, target_hf)
                return bytes_downloaded

            except Exception as e:
                message = str(e)
                is_broken_conn = (isinstance(e, EOFError) or isinstance(e, BrokenPipeError))
                if is_broken_conn:
                    message = ("" if message == "" else message + " (") + \
                              "Your connection to the FTP server may be too slow..." + \
                              ("" if message == "" else ")")

                if isinstance(e, HashMatchingException):
                    # Start the downloads from scratch.
                    download_df = None
                    download_hf_unchecked = None

                if attempt == 3 or is_broken_conn:
                    print(" .. Re-opening connection to the FTP server...")
                    self.reopen_connection(delay=5)

                if attempt == retries - 1:
                    raise e
                else:
                    print(
                        " .. " + type(e).__name__ + " on attempt " + str(attempt + 1) + ": " + message,
                        file=sys.stderr
                    )
                    time.sleep(1)

    def download_pairs(self, target_directory, dir_prefix, pairs):
        """
        Synchronises all the given pairs into the target directory.
        The subdirectories within target_directory for the result
        files should already exist. Existing files will be overridden.
        """
        print("PubMedFTP: Downloading", len(pairs), "data and hash file pairs into", dir_prefix)

        total_bytes = 0
        df_sizes_mbs = []
        for (_, df_bytes), (_, hf_bytes) in pairs:
            total_bytes += df_bytes + hf_bytes
            df_sizes_mbs.append(df_bytes / 1024.0 / 1024.0)
        df_sizes_mbs = np.array(df_sizes_mbs).reshape((-1, 1))

        elapsed_times = []
        downloaded_sizes = []
        downloaded_bytes = 0

        target_directory = os.path.join(target_directory, dir_prefix)
        for index, pair in enumerate(pairs):
            current_start = time.time()
            byte_count = self.download_pair_with_retries(target_directory, dir_prefix, pair)
            downloaded_bytes += byte_count
            elapsed = time.time() - current_start

            elapsed_times.append(elapsed)
            downloaded_sizes.append(byte_count)

            # We use the elapsed times and sizes of the files that have been downloaded
            # already to predict the relationship between file size and duration.
            recent_secs_per_file = np.array(elapsed_times[-50:])
            recent_mb_per_file = np.array(downloaded_sizes[-50:]) / 1024.0 / 1024.0

            recent_mb_per_sec = np.mean(recent_mb_per_file / recent_secs_per_file).item()
            current_mb_downloaded = byte_count / 1024.0 / 1024.0
            mb_remaining = (total_bytes - downloaded_bytes) / 1024.0 / 1024.0

            if len(recent_secs_per_file) >= 10:
                # Weight more recent files higher.
                weighted_recent_secs_per_file = np.concatenate((
                    recent_secs_per_file, recent_secs_per_file[-10:], recent_secs_per_file[-20:],
                    recent_secs_per_file[-30:], recent_secs_per_file[-40:]
                ))
                weighted_recent_mb_per_file = np.concatenate((
                    recent_mb_per_file, recent_mb_per_file[-10:], recent_mb_per_file[-20:],
                    recent_mb_per_file[-30:], recent_mb_per_file[-40:]
                ))

                # Do a linear regression to determine the relationship between file size and time.
                weighted_recent_mb_per_file = weighted_recent_mb_per_file.reshape((-1, 1))
                model = LinearRegression().fit(weighted_recent_mb_per_file, weighted_recent_secs_per_file)
                predicted_times = model.predict(df_sizes_mbs[(index + 1):])
                estimated_mins_remaining = np.sum(predicted_times) / 60
            else:
                # Use a dumb estimation if we don't have enough samples yet for the linear regression.
                estimated_mins_remaining = mb_remaining / recent_mb_per_sec / 60

            print(
                "{} / {}. Downloading and verifying {} MB took {:.3f} seconds. "
                "{} minutes remaining ({:.2f} MB/s)".format(
                    index + 1, len(pairs), int(current_mb_downloaded), elapsed,
                    "unknown" if estimated_mins_remaining < 0 else str(int(estimated_mins_remaining)),
                    recent_mb_per_sec
                )
            )
            print()

    def sync(self, target_directory):
        """
        Downloads the baseline AND update data from the PubMed FTP server
        into the local directory, target_directory. This does not download
        files that already exist locally.
        """
        print("PubMedFTP: Fetching available files...")
        baseline_pairs = self.read_baseline_file_pairs()
        updates_pairs = self.read_updates_file_pairs()
        print("PubMedFTP: Found", len(baseline_pairs), "baseline files, and", len(updates_pairs), "update files")

        baseline_prefix = PubMedFTP.get_datafiles_prefix(baseline_pairs)
        updates_prefix = PubMedFTP.get_datafiles_prefix(updates_pairs)

        baseline_path = os.path.join(target_directory, baseline_prefix)
        updates_path = os.path.join(target_directory, updates_prefix)
        print("PubMedFTP: Baseline file path =", baseline_path)
        print("PubMedFTP: Update file path =", updates_path)

        os.makedirs(baseline_path, exist_ok=True)
        os.makedirs(updates_path, exist_ok=True)

        # We want to skip any files that are already downloaded
        baseline_existing = os.listdir(baseline_path)
        updates_existing = os.listdir(updates_path)
        baseline_pairs = PubMedFTP.filter_out_existing(
            target_directory, baseline_prefix, baseline_pairs, baseline_existing
        )
        updates_pairs = PubMedFTP.filter_out_existing(
            target_directory, updates_prefix, updates_pairs, updates_existing
        )
        print("PubMedFTP: Found", len(baseline_pairs), "new baseline files to download")
        print("PubMedFTP: Found", len(updates_pairs), "new update files to download")

        self.download_pairs(target_directory, baseline_prefix, baseline_pairs)
        self.download_pairs(target_directory, updates_prefix, updates_pairs)

    @staticmethod
    def get_datafiles_prefix(pairs):
        """
        Finds the common prefix between the given filename pairs.
        e.g. pubmed/baseline/pubmed22
        This also checks to make sure that the suffixes remaining
        after the prefix is removed from the file names do not
        contain any directories.
        """
        filenames = [data_file for (data_file, _), (hash_file, _) in pairs]
        filenames.extend([hash_file for (data_file, _), (hash_file, _) in pairs])
        common_prefix = os.path.commonprefix(filenames)
        for filename in filenames:
            if len(Path(filename[len(common_prefix):]).parts) > 1:
                raise ValueError("All the pairs do not exist in the same directory")

        # Convert to a relative path.
        common_prefix = os.path.normpath(common_prefix)
        common_prefix = os.path.relpath(common_prefix, start=os.sep)

        # Remove everything after the last 'n' in the prefix.
        path, file = os.path.split(common_prefix)
        n_index = file.index("n")
        if n_index == -1:
            raise ValueError("Common prefix contains no 'n' character, " + common_prefix)

        file = file[:n_index]
        return os.path.join(path, file)

    @staticmethod
    def convert_pair_to_targets(target_directory, dir_prefix, pair):
        """
        Converts a pair of source files on the FTP server to target
        filenames on the local system.
        """
        (data_file, _), (hash_file, _) = pair

        df_name = os.path.relpath(os.path.normpath(data_file), start=os.sep).removeprefix(dir_prefix)
        hf_name = os.path.relpath(os.path.normpath(hash_file), start=os.sep).removeprefix(dir_prefix)

        target_df = os.path.join(target_directory, df_name)
        target_hf = os.path.join(target_directory, hf_name)
        return target_df, target_hf

    @staticmethod
    def filter_out_existing(target_directory, dir_prefix, pairs, existing):
        """
        Removes any pairs where the filenames of the data and hash
        files already exist in the existing list.
        """

        def contains_pair(pair):
            target_df, target_hf = PubMedFTP.convert_pair_to_targets(target_directory, dir_prefix, pair)
            return os.path.basename(target_df) in existing and os.path.basename(target_hf) in existing

        return [pair for pair in pairs if not contains_pair(pair)]
