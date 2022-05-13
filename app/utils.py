"""
This file contains general utility functions that don't
really fit anywhere else.
"""
from multiprocessing.pool import ThreadPool
from typing import TypeVar


T = TypeVar('T')


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
