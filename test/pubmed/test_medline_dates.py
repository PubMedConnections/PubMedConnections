from unittest import TestCase
from datetime import date
from app.pubmed.medline_dates import *


class TestMedlineDates(TestCase):
    def test_examples(self):
        self.assertEqual(date(1998, 1,  1),  parse_medline_date("1998"))
        self.assertEqual(date(1998, 12, 1),  parse_medline_date("1998 Dec"))
        self.assertEqual(date(1998, 12, 1),  parse_medline_date("1998 Dec-1999 Jan"))
        self.assertEqual(date(2000, 1,  1),  parse_medline_date("2000"))
        self.assertEqual(date(2000, 1,  1),  parse_medline_date("2000 Spring"))
        self.assertEqual(date(2000, 1,  1),  parse_medline_date("2000 Spring-Summer"))
        self.assertEqual(date(2000, 1,  1),  parse_medline_date("Spring-Summer 2000"))
        self.assertEqual(date(2000, 11, 1),  parse_medline_date("2000 Nov"))
        self.assertEqual(date(2000, 11, 1),  parse_medline_date("2000 Nov-Dec"))
        self.assertEqual(date(2000, 12, 1),  parse_medline_date("2000 Dec"))
        self.assertEqual(date(2000, 12, 23), parse_medline_date("2000 Dec 23- 30"))
        self.assertEqual(date(2000, 1,  1),  parse_medline_date("Summer 2000"))
        self.assertEqual(date(1975, 1,  1),  parse_medline_date("1975, 1977"))
        self.assertEqual(date(1977, 1,  1),  parse_medline_date("Summer-Fall 1977"))
