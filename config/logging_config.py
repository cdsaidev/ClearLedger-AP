# /config/logging_config.py
import logging
from pythonjsonlogger import jsonlogger

def setup_logging(verbose=False):
    """Configure structured JSON logging with optional verbosity."""
    logger = logging.getLogger("InvoiceProcessing")
    log_level = logging.DEBUG if verbose else logging.INFO
    logger.setLevel(log_level)
    handler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter(
        '%(asctime)s %(name)s %(levelname)s %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    handler.setFormatter(formatter)
    logger.handlers = [handler]  # Single handler to avoid duplicates
    logger.debug("Logging initialized with verbose mode" if verbose else "Logging initialized with info mode")
    return logger

if __name__ == "__main__":
    logger = setup_logging(verbose=True)
    logger.debug("This is a debug message")
    logger.info("This is an info message")
    logger.warning("This is a warning message")
    logger.error("This is an error message")