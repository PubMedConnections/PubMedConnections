"""
This file contains utilities to help with downloading files.
"""
import hashlib
import os
from typing import Final

DOWNLOADING_FILE_SUFFIX: Final[str] = ".downloading"


class DownloadTempFile:
    """
    A file that is used to store a file that is being downloaded.
    If the file is successfully downloaded, it will be moved into
    its permanent location. Otherwise, it will be deleted.
    """
    def __init__(self, target_file, *, collect_contents_in_memory=False):
        """
        This will remove any .downloading file that already exists.
        """
        self.temp_file = None
        self.temp_file_path = target_file + DOWNLOADING_FILE_SUFFIX
        self.target_file = target_file
        self.do_delete = False

        self.hash_builder = hashlib.md5()
        self.bytes_downloaded = 0

        self.collect_contents_in_memory = collect_contents_in_memory
        self._contents = bytearray() if collect_contents_in_memory else None

        # We want to start fresh.
        self.delete_downloaded_file()
        if os.path.exists(self.temp_file_path):
            os.unlink(self.temp_file_path)

        self.recursive_entries = 0

    @property
    def contents(self):
        if not self.collect_contents_in_memory:
            raise TypeError("This DownloadTempFile was not created with collect_contents_in_memory=True")
        return self._contents

    def __enter__(self):
        self.recursive_entries += 1
        if self.recursive_entries > 1:
            return

        self.temp_file = open(self.temp_file_path, "wb")
        if self.bytes_downloaded > 0:
            self.temp_file.seek(self.bytes_downloaded)
        self.do_delete = False
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.recursive_entries -= 1
        if self.recursive_entries >= 1:
            return

        self.temp_file.close()
        self.temp_file = None
        if self.do_delete:
            os.unlink(self.temp_file_path)
        elif exc_type is None:
            os.rename(self.temp_file_path, self.target_file)

    def mark_for_deletion(self):
        """
        Marks that this file should be deleted once the current with block is exited.
        """
        self.do_delete = True

    def delete_downloaded_file(self):
        """
        Deletes the result downloaded file.
        """
        if os.path.exists(self.target_file):
            os.unlink(self.target_file)

    def write(self, block):
        """
        Writes a block of data to the file.
        """
        try:
            if self.collect_contents_in_memory:
                self._contents += bytearray(block)

            self.hash_builder.update(block)
            self.temp_file.write(block)
            self.bytes_downloaded += len(block)
        except Exception as e:
            # If an error occurred, this file is probably in
            # an inconsistent state...
            self.mark_for_deletion()
            raise e

    def get_md5_hash(self):
        """
        :return: The MD5 hash calculated from the contents of the downloaded file.
        """
        return self.hash_builder.hexdigest()
