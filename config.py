import os


# Define the Entrez email, tool, and the optional api-key
PUBMED_ACCESS_EMAIL = ""
ENTREZ_TOOL = "pubmedconnections"
ENTREZ_API_KEY = None


# Statement for enabling the development environment
DEBUG = True
PUBMED_FTP_DEBUG = False
SQLALCHEMY_ECHO = False


# Define the application directory
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
APP_DB_FILE = os.path.join(DATA_DIR, "app.db")
PUBMED_DIR = os.path.join(DATA_DIR, "pubmed")
PUBMED_DB_FILE = os.path.join(PUBMED_DIR, "pubmed.db")


# Neo4J
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "password"


# SQLAlchemy settings.
SQLALCHEMY_DATABASE_URI = "sqlite:///{}".format(APP_DB_FILE)
SQLALCHEMY_TRACK_MODIFICATIONS = False
DATABASE_CONNECT_OPTIONS = {}


# Flask settings.
THREADS_PER_PAGE = 2
CSRF_ENABLED = True  # Cross-site Request Forgery (CSRF)
CSRF_SESSION_KEY = "secret"
SECRET_KEY = "secret"
