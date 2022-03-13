import time
from unittest import TestCase
from app.pubmed.entrez import *


class TestEntrez(TestCase):
    def test_do_rate_limit(self):
        # Serial Test
        start = time.time()
        do_rate_limit()
        do_rate_limit()
        do_rate_limit()
        do_rate_limit()
        elapsed = time.time() - start
        self.assertTrue(0.37 * 3 < elapsed < 0.37 * 4, "Incorrect elapsed time for serial test, " + str(elapsed))
        time.sleep(0.37)

        # Parallel Test 1
        start = time.time()
        run_over_threads(do_rate_limit, [[], [], [], []])
        elapsed = time.time() - start
        self.assertTrue(0.37 * 3 < elapsed < 0.37 * 4, "Incorrect elapsed time for parallel test, " + str(elapsed))
        time.sleep(0.37)

        # Parallel Test 2
        start = time.time()
        run_over_threads(do_rate_limit, [[], [], [], [], [], [], []])
        elapsed = time.time() - start
        self.assertTrue(0.37 * 6 < elapsed < 0.37 * 7, "Incorrect elapsed time for parallel test, " + str(elapsed))

    def test_request_entrez_einfo(self):
        response = request_entrez_einfo()
        self.assertIsInstance(response, dict)
        self.assertTrue("DbList" in response)

        databases = response["DbList"]
        self.assertIsInstance(databases, list)
        self.assertTrue(PUBMED_DB_NAME in databases)
        self.assertTrue(PUBMED_CENTRAL_DB_NAME in databases)

    def test_request_entrez_database_list(self):
        databases = request_entrez_database_list()
        self.assertIsInstance(databases, list)
        self.assertTrue(PUBMED_DB_NAME in databases)
        self.assertTrue(PUBMED_CENTRAL_DB_NAME in databases)

    def test_request_entrez_by_date(self):
        # This test is really slow...
        # print(len(download_all_modified_since(PUBMED_DB_NAME, "2022/03/08")))
        pass
