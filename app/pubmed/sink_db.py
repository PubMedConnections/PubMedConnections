"""
Allows dumping data into SQLite to speed up iteration
over the ~33 million records.
"""
from typing import Final, Tuple, Any

from app import db
from app.pubmed.db_model import Author, PUBMED_DB_BIND, Article, article_authors_table
from sqlalchemy import inspect
from sqlalchemy.orm import sessionmaker, Session


pubmedCacheSessionMaker: Final[sessionmaker] = sessionmaker(
    autocommit=False, autoflush=False, bind=db.get_engine(bind=PUBMED_DB_BIND)
)


class PubmedCacheSession:
    """
    Can be used to automatically create and commit an SQLAlchemy session.
    """
    session: Session = None

    def __enter__(self):
        if self.session is not None:
            raise ValueError("Already created session!")

        self.session = pubmedCacheSessionMaker()
        return self

    def __exit__(self, exc_type, exc_value, exc_traceback):
        if self.session is None:
            return

        self.session.commit()
        self.session = None

    def __getattr__(self, attr):
        """ Delegate accesses to the session object itself. """
        return getattr(self.session, attr)


def create_or_get_author(session: PubmedCacheSession, author: Author) -> tuple[int, bool]:
    """
    Attempts to find the given author in the database,
    and creates it if it doesn't yet exist. Returns a
    tuple of the author's ID, and whether it was new.
    """
    mapper = inspect(Author)
    duplicate_filters = {}
    for column in mapper.attrs:
        if column.key != "id":
            duplicate_filters[column.key] = getattr(author, column.key)

    existing_id = session.query(Author.id).filter_by(**duplicate_filters).scalar()
    if existing_id is not None:
        return existing_id, False

    session.add(author)
    session.flush()
    return author.id, True


def extract_article(pubmed_article_dict: dict) -> Article:
    citation_dict = pubmed_article_dict["MedlineCitation"]
    article_dict = citation_dict["Article"]

    article = Article()
    article.title = article_dict["ArticleTitle"]
    # TODO : There's a lot more that should go here.
    return article


def extract_author(author_dict: dict) -> Author:
    author = Author()
    author.lastName = author_dict.get("LastName")
    author.foreName = author_dict.get("ForeName")
    author.initials = author_dict.get("Initials")
    author.suffix = author_dict.get("Suffix")
    author.collectiveName = author_dict.get("CollectiveName")
    return author


def extract_to_pubmed_cache(session: PubmedCacheSession, data, *, print_every=5000):
    """
    Takes in a parsed PubMed data file object, and adds information
    from it to the PubMed cache db.
    """
    entries = data["PubmedArticle"]
    total_authors = 0

    for index, pubmed_article_dict in enumerate(entries):
        citation_dict = pubmed_article_dict["MedlineCitation"]
        article_dict = citation_dict["Article"]

        # Create the article.
        article = extract_article(pubmed_article_dict)
        session.add(article)
        session.flush()

        # Create its authors.
        author_ids = []
        if "AuthorList" in article_dict:
            for author_dict in article_dict["AuthorList"]:
                author = extract_author(author_dict)
                author_id, is_new_author = create_or_get_author(session, author)
                author_ids.append(author_id)
                if is_new_author:
                    total_authors += 1

        # Link the authors to the article.
        for author_id in author_ids:
            session.execute(article_authors_table.insert(), params={
                "article_id": article.id,
                "author_id": author_id
            })
        session.flush()

        if (index + 1) % print_every == 0:
            print("PubMedSync: {} / {}...".format(index + 1, len(entries)))

    print("PubMedSync: Found {} new authors from {} articles".format(total_authors, len(entries)))
