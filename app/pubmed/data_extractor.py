"""
Functions to parse results downloaded from the FTP server
or retrieved from the Entrez API, and extract the data
we want from the results.
"""
import gzip
import json

from Bio import Entrez
from Bio.Entrez import Parser


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
        if "__attributes__" in content:
            attrs = content["__attributes__"]
            if isinstance(attrs, list):
                attrs = union_objects(attrs)
            if len(attrs) > 0:
                text += whole_prefix + ".attributes = " + ", ".join([key for key in attrs]) + "\n"

        if "__type__" in content:
            data_type = content["__type__"]
            if issubclass(data_type, str):
                data_type = str
            if issubclass(data_type, int):
                data_type = int
            text += whole_prefix + ".type = " + data_type.__name__ + "\n"

        for key in content:
            if key == "__attributes__" or key == "__type__":
                continue
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
        # Swaps the dict and list around.
        # [{key: val}] -> {key: [val]}
        map_of_lists = {}
        for obj in objects:
            if issubclass(elem_type, Entrez.Parser.DictionaryElement):
                if "__attributes__" not in map_of_lists:
                    map_of_lists["__attributes__"] = TempUnionList()
                map_of_lists["__attributes__"].append(obj.attributes)

            for key in obj:
                if key not in map_of_lists:
                    map_of_lists[key] = TempUnionList()
                map_of_lists[key].append(obj[key])

        if isinstance(objects, TempUnionList):
            return map_of_lists
        else:
            return {array_desc: map_of_lists}

    if issubclass(elem_type, list):
        # Flattens lists of lists.
        # [[values]...] -> [values...]
        union = []
        for obj in objects:
            union.extend(obj)

        if isinstance(objects, TempUnionList):
            return union
        else:
            return {array_desc: union}

    # Reduce lists of elements to empty dictionaries with attributes.
    attrs = TempUnionList()
    for obj in objects:
        if hasattr(obj, "attributes") and len(obj.attributes) > 0:
            attrs.append({"__attributes__": obj.attributes})

    result = {"__type__": elem_type}
    if len(attrs) > 0:
        result = {**result, **union_objects(attrs)}

    if isinstance(objects, TempUnionList):
        return result
    else:
        return {array_desc: result}


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