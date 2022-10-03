"""
This file contains general utility functions that don't
really fit anywhere else.
"""
import hashlib
import os
import sys
from multiprocessing.pool import ThreadPool
from typing import TypeVar


def truncate_long_names(name: str, max_name_length: int = 512, *, suffix: str = "... <Truncated Name>") -> str:
    """
    Some names in the PubMed dataset are ridiculously long.
    This often happens for labs that list all of their members
    in their names...
    """
    if len(name) <= max_name_length:
        return name
    if len(suffix) >= max_name_length:
        raise ValueError("The suffix is longer than the maximum name length!")

    # First, remove all content between brackets.
    for brackets in ["()", "[]", "{}"]:
        left_bracket, right_bracket = brackets
        result = ""
        depth = 0
        for ch in name:
            if ch == left_bracket:
                depth += 1
                if depth == 1:
                    result += f"{left_bracket}...{right_bracket}"
            elif ch == right_bracket:
                depth = max(0, depth - 1)
            elif depth == 0:
                result += ch

        # If the whole name is in brackets, we don't want to remove everything.
        if len(result) >= max_name_length // 3:
            name = result
            if len(name) <= max_name_length:
                return name

    # Remove text from end of the name.
    truncated = name[:(max_name_length - len(suffix))]

    def find_break(find: str):
        try:
            return truncated.rindex(find)
        except ValueError:
            return -1

    # Attempt to truncate at punctuation if possible.
    nice_break_index = max(find_break(", "), find_break(": "), find_break("; "))
    if nice_break_index < 0:
        nice_break_index = max(find_break(","), find_break(":"), find_break(";"))
    if nice_break_index < 0:
        nice_break_index = find_break(" ")
    if nice_break_index >= max_name_length // 2:
        truncated = truncated[:nice_break_index]

    return truncated + suffix


def calc_md5_hash_of_file(file_and_dir: str, *, block_size=2**20) -> str:
    """
    Calculates the MD5 hash for the contents of the given file encoded in hexadecimal.
    """
    with open(file_and_dir, 'rb') as f:
        md5 = hashlib.md5()
        while True:
            data = f.read(block_size)
            if not data:
                break
            md5.update(data)
        return md5.hexdigest()


T = TypeVar('T')


def split_into_batches(items: list[T], max_batch_size: int = 10_000) -> list[list[T]]:
    """
    Splits one long list into several shorter lists with a maximum
    size of max_batch_size entries.
    """
    batches: list[list[T]] = []

    required_batches = (len(items) + max_batch_size - 1) // max_batch_size
    items_per_batch = (len(items) + required_batches - 1) // required_batches
    for batch_no in range(required_batches):
        start_index = batch_no * items_per_batch
        end_index = (len(items) if batch_no == required_batches - 1 else (batch_no + 1) * items_per_batch)
        batches.append(items[start_index:end_index])

    return batches


def or_else(value: T, default_value: T) -> T:
    """
    Returns value if it is not None, or else returns default_value.
    """
    if value is not None:
        return value
    if default_value is None:
        raise Exception("default_value should not be None when value is None")
    return default_value


def format_minutes(mins):
    """
    Formats minutes in the form "X hours, Y minutes"
    """
    hours = max(0, int(mins / 60))
    hours_s = "s" if hours != 1 else ""

    mins = max(0, int(mins % 60))
    mins_s = "s" if mins != 1 else ""

    if hours <= 0:
        return "{} minute{}".format(mins, mins_s)
    return "{} hour{}, {} minute{}".format(hours, hours_s, mins, mins_s)


def curry(fn, *curry_args, **curry_kwargs):
    """
    Returns a function that invokes fn with the given arguments.
    """
    def curried(*args, **kwargs):
        return fn(*curry_args, *args, **curry_kwargs, **kwargs)
    return curried


def run_over_threads(fn, args):
    """
    Spawns many threads to execute the given function using Python multiprocessing by default.
    Each thread invokes the function with a set of arguments from the list of arguments given.
    :return: the list of all outputs from the invocations of the function.
    """
    with ThreadPool() as pool:
        return pool.starmap(fn, args)


def err_print(*args, **kwargs):
    print(*args, file=sys.stderr, flush=True, **kwargs)


def flush_print(*args, **kwargs):
    print(*args, flush=True, **kwargs)
