import time
from unittest import TestCase
from app.pubmed.source_ftp import *


class TestDownloadTempFile(TestCase):
    def test_write(self):
        target = "./__tmp_file_test.delete_me"
        if os.path.exists(target):
            raise ValueError("The target file, " + target + ", already exists")

        try:
            with DownloadTempFile(target) as file:
                file.write(b"test")

            if not os.path.exists(target):
                self.fail("target file, " + target + ", did not exist after test")

            with open(target) as file:
                self.assertEqual("test", file.read())
        finally:
            if os.path.exists(target):
                os.unlink(target)


class TestPubmedFTP(TestCase):
    def test_connect_to_pubmed_ftp(self):
        with PubMedFTP() as ftp:
            pairs = ftp.read_baseline_file_pairs()
            self.assertTrue(len(pairs) > 0)

            prefix = PubMedFTP.get_datafiles_prefix(pairs)
            expected_prefix_prefix = os.path.relpath(os.path.normpath(PUBMED_FTP_BASELINE_DIR), start=os.sep)
            self.assertTrue(prefix.startswith(expected_prefix_prefix))
            self.assertTrue(len(prefix[len(expected_prefix_prefix):]) > 0)
