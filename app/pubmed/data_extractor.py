"""
Functions to parse results downloaded from the FTP server
or retrieved from the Entrez API, and extract the data
we want from the results.
"""
import gzip
from Bio import Entrez


def parse_pubmed_xml_gzipped(path):
    """
    Parses the contents of the file at the given path into a Python object.
    """
    with gzip.open(path, "rb") as file:
        return Entrez.read(file)


def get_object_structure(content, *, prefix=" ", depth=0, max_depth=8):
    """
    Takes a parsed PubMed XML data object, and creates a string representing the
    structure of the data it contains.
    """
    whole_prefix = prefix
    next_prefix = prefix + "  "
    next_depth = depth + 1

    if isinstance(content, dict):
        text = ""
        for key in content:
            text += whole_prefix + key + "\n"
            if next_depth < max_depth:
                text += get_object_structure(
                    content[key],
                    prefix=next_prefix,
                    depth=next_depth,
                    max_depth=max_depth
                )

        return text
    elif isinstance(content, list):
        text = get_object_structure(
            union_objects(content),
            prefix=prefix,
            depth=depth,
            max_depth=max_depth
        )
        return text
    else:
        # We only care about structure, not data.
        return ""


class TempUnionList(list):
    """ Used for union_objects. """
    pass

def union_objects(objects):
    """
    Attempts to union the list of objects into a single object.
    """
    if len(objects) == 0:
        return {"[]": None}

    elem_type = get_element_type(objects)
    array_desc = "[] of {}".format(len(objects))

    if issubclass(elem_type, dict):
        # [{key: val}] -> {key: [val]}
        map_of_lists = {}
        for obj in objects:
            for key in obj:
                if key not in map_of_lists:
                    map_of_lists[key] = TempUnionList()
                map_of_lists[key].append(obj[key])

        if isinstance(objects, TempUnionList):
            return map_of_lists
        else:
            return {array_desc: map_of_lists}

    if issubclass(elem_type, list):
        union = []
        for obj in objects:
            union.extend(obj)

        if isinstance(objects, TempUnionList):
            return union
        else:
            return {array_desc: union}

    if isinstance(objects, TempUnionList):
        return elem_type
    else:
        return {array_desc: elem_type}


def get_element_type(objects):
    """
    Returns the type of all objects within objects. If all the
    objects do not have a consistent type, then this raises
    an error. If objects is empty, this returns None.
    """
    inconsistent_type = False
    elem_type = None
    for obj in objects:
        if elem_type is None:
            elem_type = type(obj)
        elif elem_type != type(obj):
            elem_type = None
            inconsistent_type = True

    if inconsistent_type:
        raise ValueError("Inconsistent list element types " + str([type(obj).__name__ for obj in objects]))

    return elem_type