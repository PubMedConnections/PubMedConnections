"""
Calculates download analytics on the fly.
"""
import numpy as np

from app.utils import format_minutes, flush_print


class DownloadAnalytics:
    def __init__(self, remaining_file_sizes, no_threads, *,
                 prediction_size_bias=0.8, history_for_prediction=50,
                 start_file_index=0):

        self.start_file_index = start_file_index
        self.download_times = []
        self.download_sizes = []
        self.total_files = len(remaining_file_sizes)
        self.remaining_file_sizes = remaining_file_sizes[start_file_index:]
        self.no_threads = no_threads
        self.prediction_size_bias = prediction_size_bias
        self.history_for_prediction = history_for_prediction

    @property
    def num_processed(self):
        return self.start_file_index + len(self.download_sizes)

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

    def report(self, *, prefix="", verb="Downloaded"):
        """
        Prints out a report of how the downloads are progressing.
        """
        if len(self.download_sizes) <= 0:
            return  # Nothing to report.

        recent_times = np.array(self.download_times[-self.history_for_prediction:]) / self.no_threads
        recent_sizes = np.array(self.download_sizes[-self.history_for_prediction:])

        avg_time_per_file = np.mean(recent_times)
        avg_size_per_file = np.mean(recent_sizes)
        avg_mb_per_sec = avg_size_per_file / avg_time_per_file / 1024.0 / 1024.0

        mb_remaining = np.sum(self.remaining_file_sizes) / 1024.0 / 1024.0

        estimated_remaining_by_files = len(self.remaining_file_sizes) * avg_time_per_file
        estimated_remaining_by_size = mb_remaining / avg_mb_per_sec

        bias = self.prediction_size_bias
        estimated_remaining = (1 - bias) * estimated_remaining_by_files + bias * estimated_remaining_by_size

        flush_print(prefix + "{} {} of {} files. Estimated {} remaining ({:.2f} MB/s)\n".format(
            verb, self.num_processed, self.total_files,
            format_minutes(estimated_remaining / 60), avg_mb_per_sec
        ))
