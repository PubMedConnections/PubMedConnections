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

# SQLAlchemy settings.
SQLALCHEMY_DATABASE_URI = "sqlite:///{}".format(APP_DB_FILE)
SQLALCHEMY_TRACK_MODIFICATIONS = False
DATABASE_CONNECT_OPTIONS = {}


# Flask settings.
THREADS_PER_PAGE = 2
CSRF_ENABLED = True  # Cross-site Request Forgery (CSRF)
CSRF_SESSION_KEY = "secret"
SECRET_KEY = "secret"
JWT_SECRET_KEY = 'a5ee6ccda844d043e1e7039787bee989' #pubmedconnections2022
JWT_HEADER_TYPE = ""

REGISTRATION_INVITE_CODE = "pubmedconnections2022"