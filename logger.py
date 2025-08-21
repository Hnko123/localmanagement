import os
from pathlib import Path
from datetime import datetime

class Logger:
    """Simple file‑based logger used by the PortableEtsyManager.
    The logger writes a timestamped line to the supplied log file.  It is
    intentionally lightweight – no external logging frameworks are
    required, keeping the package portable and easy to run on the target
    Windows machine.
    """

    def __init__(self, path: str | Path):
        self.path = Path(path)
        # Ensure parent directory exists; create it if necessary
        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            # If we cannot create the directory we silently ignore – the
            # rest of the application can still run.  The error will be
            # logged by the calling code.
            pass

    def _write(self, level: str, message: str) -> None:
        """Internal helper that appends a single log line."""
        timestamp = datetime.now().isoformat(timespec="seconds")
        line = f"{timestamp} [{level}] {message}\n"
        try:
            with open(self.path, 'a', encoding='utf-8') as fh:
                fh.write(line)
        except Exception as e:
            # If writing fails we silently drop the log – this keeps the
            # main application responsive.
            pass

    def log_info(self, message: str) -> None:
        self._write("INFO", message)

    def log_success(self, message: str) -> None:
        self._write("SUCCESS", message)

    def log_error(self, message: str) -> None:
        self._write("ERROR", message)

    def log_debug(self, message: str) -> None:
        self._write("DEBUG", message)
