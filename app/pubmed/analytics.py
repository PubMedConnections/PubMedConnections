"""
Calculates download analytics on the fly.
"""
import numpy as np


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


class DownloadAnalytics:
    def __init__(self, remaining_file_sizes, no_threads):
        self.download_times = []
        self.download_sizes = []
        self.remaining_file_sizes = remaining_file_sizes
        self.total_files = len(remaining_file_sizes)
        self.no_threads = no_threads

    def update_remaining(self, remaining_file_sizes):
        """
        Updates the list of remaining files.
        """
        self.remaining_file_sizes = remaining_file_sizes

    def update(self, download_time, download_size):
        """
        Adds the statistics for a downloaded file.
        """
        self.download_times.append(download_time)
        self.download_sizes.append(download_size)

    def report(self, *, prefix="", recent=50):
        """
        Prints out a report of how the downloads are progressing.
        """
        if len(self.download_sizes) <= 0:
            return  # Nothing to report.

        recent_times = np.array(self.download_times[-recent:]) / self.no_threads
        recent_sizes = np.array(self.download_sizes[-recent:])

        avg_time_per_file = np.mean(recent_times)
        avg_size_per_file = np.mean(recent_sizes)
        avg_mb_per_sec = avg_size_per_file / avg_time_per_file / 1024.0 / 1024.0

        mb_remaining = np.sum(self.remaining_file_sizes) / 1024.0 / 1024.0

        estimated_remaining_by_files = len(self.remaining_file_sizes) * avg_time_per_file
        estimated_remaining_by_size = mb_remaining / avg_mb_per_sec
        estimated_remaining = 0.2 * estimated_remaining_by_files + 0.8 * estimated_remaining_by_size

        print(prefix + "Downloaded {} of {} files. Estimated {} remaining ({:.2f} MB/s)\n".format(
            len(self.download_sizes), self.total_files,
            format_minutes(estimated_remaining / 60), avg_mb_per_sec
        ))
