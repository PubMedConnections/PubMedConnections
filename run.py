import sys

from app import app as application
from app.pubmed.manager import PubMedManager
from config import NEO4J_DATABASE


def print_valid_modes():
    print("Valid Modes:", file=sys.stderr)
    print(" - sync: Synchronise the data files from the PubMed FTP server", file=sys.stderr)
    print(" - test: Run the test Flask webserver", file=sys.stderr)


def run_test():
    """
    Runs a test webserver.
    """
    application.run(host='0.0.0.0', port=8080, debug=True)


if __name__ == "__main__":
    args = sys.argv
    if len(args) < 2:
        print("Expected a run-mode to be supplied.", file=sys.stderr)
        print_valid_modes()
        sys.exit(1)

    mode = args[1]
    if mode == "sync":
        if len(args) != 2:
            print("Expected no arguments to sync", file=sys.stderr)
            sys.exit(1)

        manager = PubMedManager(NEO4J_DATABASE)
        manager.run_sync()

    elif mode == "extract":
        if len(args) != 2:
            print("Expected no arguments to extract", file=sys.stderr)
            sys.exit(1)

        manager = PubMedManager(NEO4J_DATABASE)
        manager.run_extract()

    elif mode == "test":
        if len(args) != 2:
            print("Expected no arguments to test", file=sys.stderr)
            sys.exit(1)
        run_test()

    else:
        print("Unknown run-mode", mode, file=sys.stderr)
        sys.exit(1)
