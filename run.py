import sys
from app.pubmed.pubmed_ftp import PubMedFTP


def print_valid_modes():
    print("Valid Modes:", file=sys.stderr)
    print(" - sync: Synchronise the data files from the PubMed FTP server", file=sys.stderr)
    print(" - test: Run the test Flask webserver", file=sys.stderr)


if __name__ == "__main__":
    args = sys.argv
    if len(args) < 2:
        print("Expected a run-mode to be supplied.", file=sys.stderr)
        print_valid_modes()
        sys.exit(1)

    mode = args[1]
    if mode == "sync":
        with PubMedFTP() as ftp:
            ftp.sync("./data")

    elif mode == "test":
        # Run a test server.
        from app import app as application
        application.run(host='0.0.0.0', port=8080, debug=True)
