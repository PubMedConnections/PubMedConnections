import time
from unittest import TestCase
from app.utils import *


def _test_run_over_threads_func(a, b, c):
    time.sleep(1)
    return a + b - c


class TestUtils(TestCase):
    def test_truncate_long_names(self):
        # Normal truncation.
        self.assertEqual(
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur at velit susc... <Truncated Name>",
            truncate_long_names(
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur at velit suscipit, efficitur"
                "eroseget, scelerisque sem. Etiam interdum a sem ut eleifend. Etiam tempus",
                max_name_length=100
            )
        )
        # Truncate at punctuation.
        self.assertEqual(
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur at velit suscipit... <Truncated Name>",
            truncate_long_names(
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur at velit suscipit, efficitur"
                "eroseget, scelerisque sem. Etiam interdum a sem ut eleifend. Etiam tempus",
                max_name_length=120
            )
        )
        # Remove content in brackets.
        self.assertEqual(
            "Lorem ipsum dolor sit amet, (...). Curabitur at velit suscipit, efficitur eroseget... <Truncated Name>",
            truncate_long_names(
                "Lorem ipsum dolor sit amet, (consectetur adipiscing elit). Curabitur at velit suscipit, efficitur"
                "eroseget, (scelerisque sem). Etiam interdum a sem ut eleifend. Etiam tempus",
                max_name_length=120
            )
        )
        self.assertEqual(
            "Lorem ipsum dolor sit amet, [...]. Curabitur at velit suscipit, {...}... <Truncated Name>",
            truncate_long_names(
                "Lorem ipsum dolor sit amet, [consectetur adipiscing elit]. Curabitur at velit suscipit, {efficitur"
                "eroseget}, scelerisque sem. Etiam interdum a sem ut eleifend. Etiam tempus",
                max_name_length=120
            )
        )
        self.assertEqual(
            "Lorem ipsum dolor sit amet, (...). Curabitur at velit suscipit, efficitureroseget... <Truncated Name>",
            truncate_long_names(
                "Lorem ipsum dolor sit amet, ([consectetur (adipiscing) elit]). Curabitur at velit suscipit, efficitur"
                "eroseget, scelerisque sem. Etiam interdum a sem ut eleifend. Etiam tempus",
                max_name_length=120
            )
        )

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
