"""
This file contains general utility functions that don't
really fit anywhere else.
"""
from multiprocessing.pool import ThreadPool


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
