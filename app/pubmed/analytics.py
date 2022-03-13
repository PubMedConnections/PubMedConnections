"""
Calculates download analytics on the fly.
"""
import numpy as np


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

    def report(self, *, recent=50):
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
        estimated_remaining = 0.4 * estimated_remaining_by_files + 0.6 * estimated_remaining_by_size

        est_hours_remaining = int(estimated_remaining / 60 / 60)
        est_mins_remaining = int((estimated_remaining / 60) % 60)
        est_time_remaining = "{} minutes".format(est_mins_remaining)
        if est_hours_remaining > 0:
            est_time_remaining = "{} hours, ".format(est_hours_remaining) + est_time_remaining

        print("{} / {}. Estimated {} remaining ({:.2f} MB/s)\n".format(
            self.total_files - len(self.download_sizes), self.total_files,
            est_time_remaining, avg_mb_per_sec
        ))
