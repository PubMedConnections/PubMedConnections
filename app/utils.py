"""
This file contains general utility functions that don't
really fit anywhere else.
"""
import threading


def curry(fn, *curry_args, **curry_kwargs):
    """
    Returns a function that invokes fn with the given arguments.
    """
    def curried(*args, **kwargs):
        return fn(*curry_args, *args, **curry_kwargs, **kwargs)
    return curried


def run_over_threads(name, fn, args_for_each_thread):
    """
    Spawns many threads to execute the given function.
    Each thread invokes the function with a set of arguments
    from the list of arguments given.
    :return: the list of all outputs from the invocations of the function.
    """
    threads = []
    results = []

    def write_output_to_results(fn, args):
        results.append(fn(*args))

    for index, args in enumerate(args_for_each_thread):
        t_name = "run_over_threads__" + name + "__" + str(index)
        t = threading.Thread(name=t_name, target=curry(write_output_to_results, fn, args))
        threads.append(t)
        t.start()

    for t in threads:
        t.join()

    return results
