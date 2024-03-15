import logging
from logging.handlers import RotatingFileHandler
import sys


class ColoredFormatter(logging.Formatter):
    COLORS = {
        "DEBUG": "\033[94m",  # Blue
        "INFO": "\033[92m",  # Green
        "WARNING": "\033[93m",  # Yellow
        "ERROR": "\033[91m",  # Red
        "CRITICAL": "\033[91m",  # Red
        "RESET": "\033[0m",  # Reset color
    }

    def format(self, record):
        log_message = super().format(record)
        return f"{self.COLORS.get(record.levelname, self.COLORS['RESET'])}{log_message}{self.COLORS['RESET']}"


def get_logger():
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO)

    formatter = ColoredFormatter(
        "[%(asctime)s] %(levelname)s [%(module)s]: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    ch = logging.StreamHandler(sys.stdout)
    ch.setFormatter(formatter)
    logger.addHandler(ch)

    fh = RotatingFileHandler(
        "logs/app.log", maxBytes=10 * 1024 * 1024, backupCount=50000
    )
    fh.setFormatter(formatter)
    logger.addHandler(fh)

    return logger
