from shutil import ExecError


class PubMedSnapshotDoesNotExistError(Exception):
    """
    An error that is raised when a Snapshot does not exist.
    """

    def __init__(self, message: str):
        super().__init__(message)

class PubMedUpdateSnapshotError(Exception):
    """
    An error that is raised when a Snapshot cannot be updated.
    """

    def __init__(self, message: str):
        super().__init__(message)

class PubMedAnalyticsError(Exception):
    """
    An error that is raised when there is a problem with running the analytics.
    """

    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
