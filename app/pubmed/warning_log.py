"""
Contains mechanisms to report warnings about unrecognised
or invalid values encountered while parsing PubMed data.
"""
from datetime import datetime
from io import TextIOWrapper
from typing import Optional, Union


class LogFile:
    """
    Allows writing to a log file.
    """
    def __init__(self, filename: str):
        self.filename: str = filename
        self._enabled: bool = False
        self._file: Optional[TextIOWrapper] = None

    def __enter__(self) -> 'LogFile':
        if self._file is not None:
            raise Exception("Already opened")

        # Allows `append` to open the file.
        self._enabled = True
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self._file is None:
            return

        self._enabled = False
        if self._file is not None:
            try:
                self._file.close()
            finally:
                self._file = None

    def append(self, message: str):
        """ Appends a message to the log. """
        if not self._enabled:
            raise Exception("This LogFile has not been used within a with block")

        # We only open the file when we need to.
        if self._file is None:
            self._file = open(self.filename, "w")

        now: str = datetime.today().strftime('%Y-%m-%d %H:%M:%S')
        self._file.write(f"{now}: {message}\n")


class WarningLog:
    """
    Allows the creation of a log of warnings that can be written during parsing.
    """
    def __init__(self, parent_log: Union[LogFile, 'WarningLog'], group_name: Optional[str] = None):
        self.parent_log: Union[LogFile, WarningLog] = parent_log
        self.group_name: Optional[str] = group_name

    def append(self, warning: str):
        if self.group_name is not None:
            message = f"{self.group_name} -> {warning}"
        else:
            message = warning

        self.parent_log.append(message)

    def group(self, name: str) -> 'WarningLog':
        return WarningLog(self, name)
