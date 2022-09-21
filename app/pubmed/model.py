"""
This package contains the database models for the
PubMed Neo4J database.
"""
import sys
from datetime import datetime
from typing import Optional, cast
from enum import Enum


LATEST_PUBMED_DB_VERSION = 2


class DatabaseStatus(Enum):
    NORMAL = 'normal'
    UPDATING = 'updating'


class DBMetadataMeshFile:
    """
    Stores metadata about a MeSH description file, which are
    specification files released yearly. The MeSH headings
    from these specifications are used to categorise research.
    """
    def __init__(self, year: str, file: str, processed: bool, md5_hash: Optional[str]):
        self.year = year
        self.file = file
        self.processed = processed
        self.md5_hash = md5_hash

    def is_same_file(self, obj):
        if not isinstance(obj, DBMetadataMeshFile):
            return False

        other = cast(DBMetadataMeshFile, obj)
        return self.year == other.year and \
               self.file == other.file and \
               self.md5_hash == other.md5_hash

    def to_processed_dict(self) -> dict:
        if not self.processed:
            raise Exception("This mesh file has not been processed")

        return {
            "year": self.year,
            "file": self.file,
            "md5_hash": self.md5_hash
        }

    @staticmethod
    def from_processed_dict(data: dict) -> 'DBMetadataMeshFile':
        return DBMetadataMeshFile(
            year=data["year"],
            file=data["file"],
            processed=True,
            md5_hash=data["md5_hash"],
        )


class DBMetadataDataFile:
    """
    Stores metadata about a PubMed data file. These are the data
    files that are parsed from XML to be added into the Neo4J
    database.
    """
    def __init__(self, category: str,
                 year: int,
                 file: str,
                 processed: bool,
                 md5_hash: Optional[str] = None,
                 no_articles: Optional[int] = None):
        """
        :param category: One of 'baseline' or 'updatefiles'.
        """
        self.category = category
        self.year = year
        self.file = file
        self.processed = processed
        self.md5_hash = md5_hash
        self.no_articles = no_articles

    def is_same_file_path(self, obj):
        if not isinstance(obj, DBMetadataDataFile):
            return False

        other = cast(DBMetadataDataFile, obj)
        return self.category == other.category and \
               self.year == other.year and \
               self.file == other.file

    def to_processed_dict(self) -> dict:
        if not self.processed:
            raise Exception("This data file has not been processed")

        return {
            "category": self.category,
            "year": self.year,
            "file": self.file,
            "md5_hash": self.md5_hash,
            "no_articles": self.no_articles
        }

    @staticmethod
    def from_processed_dict(data: dict) -> 'DBMetadataDataFile':
        return DBMetadataDataFile(
            category=data["category"],
            year=data["year"],
            file=data["file"],
            processed=True,
            md5_hash=data["md5_hash"],
            no_articles=data["no_articles"]
        )

    def __str__(self):
        return f"{type(self).__name__}(" \
               f"category={self.category}, " \
               f"year={self.year}, " \
               f"file={self.file}, " \
               f"processed={self.processed})"


class DBMetadata:
    """
    Stores metadata about the data within the database.
    """
    def __init__(self, pubmed_db_version: int,
                 version: Optional[int],
                 year: Optional[int],
                 time: Optional[datetime],
                 status: DatabaseStatus,
                 mesh_file: Optional[DBMetadataMeshFile],
                 data_files: list[DBMetadataDataFile]):

        self.pubmed_db_version = pubmed_db_version
        self.version = version
        self.year = year
        self.time = time
        self.status = status
        self.mesh_file = mesh_file
        self.data_files = data_files

    def is_incompatible(self):
        """
        Returns whether the model in the database is
        incompatible with the current version.
        """
        return self.pubmed_db_version != LATEST_PUBMED_DB_VERSION

    def update_version(self, version: int):
        self.version = version
        self.time = datetime.now()

    def to_dict(self) -> dict:
        if self.version is None or self.time is None:
            raise Exception("The version has not been supplied for this metadata object through update_version")

        return {
            "pubmed_db_version": self.pubmed_db_version,
            "version": self.version,
            "year": self.year,
            "time": self.time,
            "status": self.status.value
        }

    @staticmethod
    def from_dicts(base: dict, mesh: list[dict], data: list[dict]) -> 'DBMetadata':
        if len(mesh) > 1:
            print("Unexpectedly got more than one related MeSH file! Ignoring them all", file=sys.stderr)
            mesh = []

        mesh_file = None if len(mesh) == 0 else DBMetadataMeshFile.from_processed_dict(mesh[0])
        data_files = [DBMetadataDataFile.from_processed_dict(f) for f in data]

        return DBMetadata(
            pubmed_db_version=base["pubmed_db_version"] if "pubmed_db_version" in base else 0,
            version=base["version"],
            year=base["year"] if "year" in base else None,
            time=base["time"],
            status=DatabaseStatus(base["status"]),
            mesh_file=mesh_file,
            data_files=data_files
        )

    def __str__(self):
        processed_files = 0
        for file in self.data_files:
            if file.processed:
                processed_files += 1

        return f"{type(self).__name__}(" \
               f"pubmed_db_version={self.pubmed_db_version}, " \
               f"version={self.version}, " \
               f"time={self.time.strftime('%Y-%m-%d, %H:%M:%S')}, " \
               f"progress={processed_files}/{len(self.data_files)})"


class DBAuthor:
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
    def generate(
            last_name: str, fore_name: str, initials: str,
            suffix: str, collective_name: str,
            *, max_name_length: int = 512
    ) -> 'DBAuthor':

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

            return DBAuthor(collective_name, True)

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

        return DBAuthor(full_name, False)

    def __str__(self):
        return self.full_name

    def __repr__(self):
        if self.is_collective:
            return "<Author Collective {}>".format(self.full_name)

        return "<Author {}>".format(self.full_name)


class DBJournal:
    """
    A journal within which an article was published.
    """
    SPECIAL_MISSING_VOLUME_TEXT = "<NO_VOLUME>"
    SPECIAL_MISSING_ISSUE_TEXT = "<NO_ISSUE>"

    def __init__(
            self,
            identifier: str,
            title: str,
            volume: Optional[str],
            issue: Optional[str],
            date: datetime.date):

        self.identifier = identifier
        self.title = title
        self.volume = volume if volume != DBJournal.SPECIAL_MISSING_VOLUME_TEXT else None
        self.issue = issue if issue != DBJournal.SPECIAL_MISSING_ISSUE_TEXT else None
        self.date = date

    @property
    def non_null_volume(self) -> str:
        """ If the volume is None, returns Journal.SPECIAL_MISSING_VOLUME_TEXT. """
        return self.volume if self.volume is not None else DBJournal.SPECIAL_MISSING_VOLUME_TEXT

    @property
    def non_null_issue(self) -> str:
        """ If the issue is None, returns Journal.SPECIAL_MISSING_ISSUE_TEXT. """
        return self.issue if self.issue is not None else DBJournal.SPECIAL_MISSING_ISSUE_TEXT

    @staticmethod
    def generate(
            iso_abbrev: Optional[str],
            issn: Optional[str],
            title: str,
            volume: Optional[str],
            issue: Optional[str],
            date: datetime.date):

        identifier = issn if issn is not None else "[{}]".format(iso_abbrev)
        return DBJournal(identifier, title, volume, issue, date)

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


class DBArticleAuthorRelation:
    """
    Represents the relationship that represents authorship of an article.
    The authorship is represented by the
    """
    def __init__(self,
                 article: 'DBArticle',
                 author: DBAuthor,
                 affiliation: Optional[str],
                 author_position: int,
                 is_first_author: bool,
                 is_last_author: bool):

        self.article = article
        self.author = author
        self.affiliation = affiliation
        self.author_position = author_position
        self.is_first_author = is_first_author
        self.is_last_author = is_last_author

    def __str__(self):
        return f"({str(self.author)}) " \
               f"-[:AUTHOR_OF {{author_pos={self.author_position}, " \
               f"affiliation={self.affiliation}, " \
               f"first={self.is_first_author}, " \
               f"last={self.is_last_author} }}]-> " \
               f"({str(self.article)})"

    def __repr__(self):
        return f"<ArticleAuthorRelation {str(self)}>"


class DBArticle:
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
        self._journal: Optional[DBJournal] = None
        self._author_relations: Optional[list[DBArticleAuthorRelation]] = None
        self._reference_pmids: Optional[list[int]] = None
        self._mesh_descriptor_ids: Optional[list[int]] = None

    @staticmethod
    def generate(pmid: int, date: datetime.date, english_title: str, original_title: str):
        """
        Generates an article entry given its information from PubMed.
        """
        return DBArticle(
            pmid=pmid,
            date=date,
            title=DBArticle.generate_title(english_title, original_title)
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
    def authors(self) -> list[DBAuthor]:
        """ Returns all the Authors of this article. """
        return [relation.author for relation in self.author_relations]

    @property
    def author_relations(self) -> list[DBArticleAuthorRelation]:
        """ Returns all the ArticleAuthorRelations of this article. """
        if self._author_relations is None:
            raise ValueError("The authors of this article have not been read from the database")
        return self._author_relations

    @author_relations.setter
    def author_relations(self, author_relations: list[DBAuthor]):
        """ Sets the Authors of this article. """
        self._author_relations = author_relations

    @property
    def journal(self) -> DBJournal:
        """ Returns all the Authors of this article. """
        if self._journal is None:
            raise ValueError("The journal of this article have not been read from the database")
        return self._journal

    @journal.setter
    def journal(self, journal: DBJournal):
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


class DBMeSHHeading:
    """
    A MeSH Heading from the NLM database
    https://www.nlm.nih.gov/databases/download/mesh.html
    """
    def __init__(self, descriptor_id: int, name: str, tree_numbers: list[str]):
        self.descriptor_id: int = descriptor_id
        self.name = name
        self._upper_name = name.upper()
        self.tree_numbers = tree_numbers

    @staticmethod
    def search(mesh_headings: list['DBMeSHHeading'], name: str) -> list['DBMeSHHeading']:
        """
        Searches for the MeSH headings within mesh_headings that
        have the given name, or a similar name.
        """
        name = name.strip().upper()
        if len(name) == 0:
            return []

        results = []
        for heading in mesh_headings:
            if name in heading.name.upper():
                results.append(heading)

        return results

    def __str__(self):
        return f"{self.descriptor_id}: {self.name} ({self.tree_numbers})"

    def __repr__(self):
        return f"<MeshHeading {self.descriptor_id}>"
