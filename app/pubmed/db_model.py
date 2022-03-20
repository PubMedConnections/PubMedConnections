"""
The model for the PubMed extracted data SQLite database.
This database is used as a caching layer over directly
accessing the PubMed data, as it is much faster.
"""
from typing import Final
from app import db


PUBMED_DB_BIND: Final[str] = "pubmed"


article_authors_table = db.Table(
    "article_authors",
    db.Model.metadata,
    db.Column("article_id", db.Integer, db.ForeignKey("article.id")),
    db.Column("author_id", db.Integer, db.ForeignKey("author.id")),
    info={"bind_key": PUBMED_DB_BIND}
)


class Author(db.Model):
    """
    An author of a citation.
    """
    __bind_key__ = PUBMED_DB_BIND
    __tablename__ = 'author'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    lastName = db.Column(db.String(127), nullable=True)
    foreName = db.Column(db.String(127), nullable=True)
    suffix = db.Column(db.String(31), nullable=True)
    initials = db.Column(db.String(15), nullable=True)
    collectiveName = db.Column(db.String(255), nullable=True)

    def __str__(self):
        # TODO : This needs some testing to make sure it works correctly in most cases.
        #        I just threw this together without testing it.
        if self.collectiveName is not None:
            return self.collectiveName

        last = " {}".format(self.lastName) if self.lastName is not None else ""
        suffix = " {}".format(self.suffix) if self.suffix is not None else ""
        if self.foreName is not None:
            first = self.foreName
        elif self.initials is not None:
            first = " ".join(self.initials)

        return first + last + suffix

    def __repr__(self):
        if self.collectiveName is not None:
            return "<Author Collective {}>".format(self.collectiveName)

        return "<Author {}>".format(str(self))


class Article(db.Model):
    """
    An article in the PubMed database.
    """
    __bind_key__ = PUBMED_DB_BIND
    __tablename__ = 'article'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False)
    title = db.Column(db.String(511), nullable=False)
    # TODO : There's a lot more to go here
    authors = db.relationship("Author", secondary=article_authors_table)

    def __str__(self):
        return self.title

    def __repr__(self):
        return "<Article {}>".format(str(self))
