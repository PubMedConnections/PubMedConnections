import sys

from app import app as application
from app.pubmed.manager import PubMedManager
from app.utils import err_print


def print_valid_modes():
    err_print("Valid Modes:")
    err_print(" - update: Synchronise from the PubMed FTP server, and extract the new data")
    err_print(" - sync: Synchronise the data files from the PubMed FTP server")
    err_print(" - extract: Extracts the data files into a Neo4J database")
    err_print(" - clear: Clears the content of the Neo4J database")
    err_print(" - test: Run the test Flask webserver")


def run_test():
    """
    Runs a test webserver.
    """
    application.run(host='0.0.0.0', port=8080, debug=True)


def run_prod():
    """
    Runs a test webserver.
    """
    application.run(host='0.0.0.0', port=8080, debug=False)


if __name__ == "__main__":
    args = sys.argv
    if len(args) < 2:
        err_print("Expected a run-mode to be supplied.")
        print_valid_modes()
        sys.exit(1)

    mode = args[1]
    if mode == "update":
        if len(args) != 2:
            err_print("Expected no arguments to update")
            sys.exit(1)

        print("PubMedConnections: Updating the database...\n")
        manager = PubMedManager()
        exit_code = manager.run_sync()
        if exit_code != 0:
            sys.exit(exit_code)

        exit_code = manager.run_extract()
        sys.exit(exit_code)

    elif mode == "sync":
        if len(args) != 2:
            err_print("Expected no arguments to sync")
            sys.exit(1)

        manager = PubMedManager()
        exit_code = manager.run_sync()
        sys.exit(exit_code)

    elif mode == "extract":
        if len(args) != 2:
            err_print("Expected no arguments to extract")
            sys.exit(1)

        manager = PubMedManager()
        exit_code = manager.run_extract()
        sys.exit(exit_code)

    elif mode == "stats":
        if len(args) != 2:
            err_print("Expected no arguments to stats")
            sys.exit(1)

        manager = PubMedManager()
        exit_code = manager.run_stats()
        sys.exit(exit_code)

    elif mode == "clear":
        if len(args) != 2:
            err_print("Expected no arguments to clear")
            sys.exit(1)

        manager = PubMedManager()
        manager.run_clear()

    elif mode == "test":
        if len(args) != 2:
            err_print("Expected no arguments to test")
            sys.exit(1)

        manager = PubMedManager()
        manager.initialise_backend_for_requests()
        run_test()

    elif mode == "prod":
        if len(args) != 2:
            err_print("Expected no arguments to test")
            sys.exit(1)

        print("PubMedConnections: Updating the database...\n")
        manager = PubMedManager()
        exit_code = manager.run_sync()
        if exit_code != 0:
            sys.exit(exit_code)

        exit_code = manager.run_extract()
        if exit_code != 0:
            sys.exit(exit_code)

        print("PubMedConnections: Starting the backend...\n")
        manager.initialise_backend_for_requests()
        run_prod()

    else:
        err_print("Unknown run-mode", mode)
        sys.exit(1)
