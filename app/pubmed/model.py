"""
This package contains the database models for the
PubMed cache database.
"""
import datetime
from typing import Optional


class DBMetadata:
    """
    Stores metadata about the data within the database.
    """
    def __init__(self, version: int):
        self.version = version

    def __repr__(self):
        return "<DBMetadata v{}>".format(self.version)


class Author:
    """
    An author of a PubMed article.
    """
    def __init__(self,
                 full_name: str = None,
                 is_collective: bool = False,
                 *,
                 author_id: int = None):

        if len(full_name) > 1024:
            raise Exception("Name is too long! {}".format(full_name))

        self.author_id = author_id
        self.full_name = full_name
        self.is_collective = is_collective

    @staticmethod
    def generate_from_name_pieces(
            last_name: str, fore_name: str, initials: str,
            suffix: str, collective_name: str,
            *, max_name_length: int = 512
    ) -> 'Author':

        if collective_name is not None:
            # Some consortium names are ridiculous...
            if len(collective_name) > max_name_length:
                truncated_suffix = "... <Truncated Name>"
                truncated = collective_name[:(max_name_length - len(truncated_suffix))]

                def find_break(find: str):
                    try:
                        return truncated.rindex(find)
                    except ValueError:
                        return -1

                # Attempt to truncate at punctuation if possible.
                nice_break_index = max(find_break(", "), find_break(": "), find_break("; "))
                if nice_break_index < 0:
                    nice_break_index = max(find_break(","), find_break(":"), find_break(";"))
                if nice_break_index < 0:
                    nice_break_index = find_break(" ")
                if nice_break_index >= max_name_length // 2:
                    truncated = truncated[:nice_break_index]

                collective_name = truncated + truncated_suffix

            return Author(collective_name, True)

        last = " {}".format(last_name) if last_name is not None else ""
        suffix = " {}".format(suffix) if suffix is not None else ""
        if fore_name is not None:
            first = fore_name
        elif initials is not None:
            first = " ".join(initials)
        else:
            first = ""

        full_name = first + last + suffix
        if len(full_name) == 0:
            raise ValueError("No name pieces supplied")

        # I don't think there are any author names that hit this, but just in case...
        if len(full_name) > max_name_length:
            full_name = full_name[:(max_name_length - 3)] + "..."

        return Author(full_name, False)

    def __str__(self):
        return self.full_name

    def __repr__(self):
        if self.is_collective:
            return "<Author Collective {}>".format(self.full_name)

        return "<Author {}>".format(self.full_name)


class Journal:
    """
    A journal within which an article was published.
    """
    def __init__(
            self,
            identifier: str,
            title: str,
            volume: str,
            issue: str,
            date: datetime.date):

        self.identifier = identifier
        self.title = title
        self.volume = volume
        self.issue = issue
        self.date = date

    @staticmethod
    def generate(
            iso_abbrev: Optional[str],
            issn: Optional[str],
            title: str,
            volume: Optional[str],
            issue: Optional[str],
            date: datetime.date):

        identifier = issn if issn is not None else "[{}]".format(iso_abbrev)
        return Journal(identifier, title, volume, issue, date)

    def __str__(self):
        if self.volume is None and self.issue is None:
            return self.title
        if self.volume is None:
            return "{}, Issue {}".format(self.identifier, self.title, self.issue)
        if self.issue is None:
            return "{}, Vol. {}".format(self.identifier, self.title, self.volume)
        return "{}, Vol. {} Issue {}".format(self.identifier, self.title, self.volume, self.issue)

    def __repr__(self):
        return "<Journal {}: {}>".format(self.identifier, str(self))


class Article:
    """
    An article in PubMed.
    """
    def __init__(
            self,
            pmid: int,
            date: datetime.date,
            title: str):

        self.pmid: int = pmid
        self.date: datetime.date = date
        self.title: str = title
        self._journal: Optional[Journal] = None
        self._authors: Optional[list[Author]] = None
        self._reference_pmids: Optional[list[int]] = None
        self._mesh_descriptor_ids: Optional[list[int]] = None

    @staticmethod
    def generate(pmid: int, date: datetime.date, english_title: str, original_title: str):
        """
        Generates an article entry given its information from PubMed.
        """
        return Article(
            pmid=pmid,
            date=date,
            title=Article.generate_title(english_title, original_title)
        )

    @staticmethod
    def generate_title(english_title: str, original_title: str):
        """
        Generates a title without formatting information.
        """
        if english_title is None:
            return original_title if original_title is not None else "<Unknown Title>"

        result = ""
        brackets = 0
        for ch in english_title:
            if ch == "[" or ch == "]":
                continue
            if ch == "(":
                brackets += 1
            elif ch == ")":
                brackets -= 1
            elif brackets <= 0:
                result += ch

        return result

    @property
    def authors(self) -> list[Author]:
        """ Returns all the Authors of this article. """
        if self._authors is None:
            raise ValueError("The authors of this article have not been read from the database")
        return self._authors

    @authors.setter
    def authors(self, authors: list[Author]):
        """ Sets the Authors of this article. """
        self._authors = authors

    @property
    def journal(self) -> Journal:
        """ Returns all the Authors of this article. """
        if self._journal is None:
            raise ValueError("The journal of this article have not been read from the database")
        return self._journal

    @journal.setter
    def journal(self, journal: Journal):
        """ Sets the Journal of this article. """
        self._journal = journal

    @property
    def reference_pmids(self) -> list[int]:
        """ Returns a list of all the PMIDs of the articles that this article references. """
        if self._reference_pmids is None:
            raise ValueError("The reference PMIDs of this article have not been read from the database")
        return self._reference_pmids

    @reference_pmids.setter
    def reference_pmids(self, reference_pmids: list[int]):
        """ Sets the list of all the PMIDs of the articles that this article references. """
        self._reference_pmids = reference_pmids

    @property
    def mesh_descriptor_ids(self) -> list[int]:
        """ Returns a list of all the MeSH descriptor IDs for this article. """
        if self._mesh_descriptor_ids is None:
            raise ValueError("The MeSH descriptor IDs for this article have not been read from the database")
        return self._mesh_descriptor_ids

    @mesh_descriptor_ids.setter
    def mesh_descriptor_ids(self, reference_pmids: list[int]):
        """ Sets the list of all the MeSH descriptor IDs for this article. """
        self._mesh_descriptor_ids = reference_pmids

    def __str__(self):
        return "{}: {}".format(self.pmid, self.title)

    def __repr__(self):
        return "<Article {}>".format(str(self))


class MeshHeading:
    """
    A MeSH Heading from the NLM database
    https://www.nlm.nih.gov/databases/download/mesh.html
    """
    def __init__(self, descriptor_id: int, name: str, tree_numbers: list[str]):
        self.descriptor_id: int = descriptor_id
        self.name = name
        self.tree_numbers = tree_numbers

    def __str__(self):
        return f"{self.descriptor_id}: {self.name} ({self.tree_numbers})"

    def __repr__(self):
        return f"<MeshHeading {self.descriptor_id}>"
