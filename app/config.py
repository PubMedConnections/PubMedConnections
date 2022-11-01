import os
from datetime import timedelta


REGISTRATION_INVITE_CODE = "pubmedconnections2022"


# Configurations to allow printing additional debug information to console.
PUBMED_FTP_DEBUG = False
SQLALCHEMY_ECHO = False


# Define the application directory
BASE_DIR = "/"
DATA_DIR = os.path.join(BASE_DIR, "data")
LOGS_DIR = os.path.join(BASE_DIR, "logs")
APP_DB_FILE = os.path.join(DATA_DIR, "app.db")
PUBMED_DIR = os.path.join(DATA_DIR, "pubmed")
PUBMED_DB_FILE = os.path.join(PUBMED_DIR, "pubmed.db")


# Neo4J
NEO4J_URI = "bolt://host.docker.internal:7687"
NEO4J_REQUIRES_AUTH = False
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "password"


# Flask settings.
class FlaskConfig:
    THREADS_PER_PAGE = 2
    CSRF_ENABLED = True  # Cross-site Request Forgery (CSRF)
    CSRF_SESSION_KEY = "secret"
    SECRET_KEY = "secret"

    # Authentication configuration.
    JWT_SECRET_KEY = "a5ee6ccda844d043e1e7039787bee989"
    JWT_HEADER_TYPE = ""
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)


# Define the Entrez email, tool, and the optional api-key
PUBMED_ACCESS_EMAIL = ""
ENTREZ_TOOL = "pubmedconnections"
ENTREZ_API_KEY = None
