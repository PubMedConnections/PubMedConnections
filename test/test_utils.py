import time
from unittest import TestCase
from app.utils import *


def _test_run_over_threads_func(a, b, c):
    time.sleep(1)
    return a + b - c


class TestUtils(TestCase):
    def test_curry(self):
        def func(*args, **kwargs):
            key_args = [key + "=" + kwargs[key] for key in kwargs]
            return "[" + ", ".join(args) + "], {" + ", ".join(key_args) + "}"

        self.assertEqual("[a], {}", curry(func, "a")())
        self.assertEqual("[a, b], {}", curry(func, "a", "b")())
        self.assertEqual("[], {a=b}", curry(func, a="b")())
        self.assertEqual("[a], {a=b}", curry(func, "a", a="b")())
        self.assertEqual("[a, c], {a=b, d=e}", curry(func, "a", "c", a="b", d="e")())

    def test_run_over_threads(self):
        args = [
            [1, 2, 3],
            [2, 3, 4],
            [3, 4, 5],
            [4, 5, 6]
        ]
        expected_results = [0, 1, 2, 3]

        start = time.time()
        actual_results = run_over_threads(_test_run_over_threads_func, args)
        elapsed = time.time() - start
        self.assertTrue(0.9 < elapsed < 1.5)

        self.assertEqual(set(expected_results), set(actual_results))
