from lxml import etree
import os
import glob
import sys

from app.pubmed.extract_xml import extract_mesh_headings
from app.pubmed.source_files import DTDResolver
from app.pubmed.sink_db import PubmedCacheConn


def create_mesh_parser(directory: str) -> etree.XMLParser:
    parser = etree.XMLParser(
        remove_blank_text=True,
        remove_comments=True,
        remove_pis=True,
        collect_ids=False,
        load_dtd=False,
        dtd_validation=False,
        attribute_defaults=False
    )
    parser.resolvers.add(DTDResolver(directory, "https://www.nlm.nih.gov/databases/dtd"))
    return parser



def process_mesh_headings(target_directory: str, conn: PubmedCacheConn):
    directory = os.path.join(target_directory, "mesh")

    # Find the XML file under data/mesh/
    xml_files = glob.glob(os.path.join(directory, "desc*.xml"))
    if len(xml_files) == 0:
        print("No MESH heading XML file found in the format desc*.xml")
        return
    elif len(xml_files) > 1:
        print("Multiple MESH heading XML files found, using the first one found.")

    mesh_xml_file = xml_files[0]
    parser = create_mesh_parser(directory)

    # Parse the XML
    tree = etree.parse(mesh_xml_file, parser)

    # Extract the MeshHeading objects
    headings = extract_mesh_headings(tree)

    # Add to the database
    conn.insert_mesh_heading_batch(headings)

    print(f"Finished adding {len(headings)} MESH headings to database.")
