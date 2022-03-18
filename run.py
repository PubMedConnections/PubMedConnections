import gzip
import os.path
import pathlib
import sys
import json
from app.pubmed.source_ftp import PubMedFTP
from app.pubmed.data_extractor import parse_pubmed_xml_gzipped, get_object_structure


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
            targets = ftp.sync("./data")
            print()

        # Write an example file for us to look at the available data.
        example_target = targets[0]
        example_target_parts = pathlib.Path(example_target).parts

        print("PubMedSync: Reading example PubMed file from", example_target)
        with gzip.open(targets[0], "rb") as file:
            example_file_contents = file.read()
        example_object = parse_pubmed_xml_gzipped(targets[0])

        example_filename = example_target_parts[-2] + example_target_parts[-1]
        example_filename = example_filename[:example_filename.index(".")]
        example_file_prefix = "./data/pubmed/example."
        example_file_xml = example_file_prefix + example_filename + ".xml"

        print("PubMedSync: Writing example file to", example_file_xml)
        with open(example_file_xml, "w") as f:
            f.write(example_file_contents.decode("utf8"))

        # Write out a file containing the structure of the example file.
        example_structure_file = example_file_prefix + example_filename + ".structure.txt"
        example_structure = get_object_structure(example_object)

        print("PubMedSync: Writing structure of example file to", example_structure_file)
        with open(example_structure_file, "w") as f:
            f.write(example_structure)

    elif mode == "test":
        # Run a test server.
        from app import app as application
        application.run(host='0.0.0.0', port=8080, debug=True)
