# Handles structured logging for debugging & monitoring.
# /config/logging_config.py
import logging
import json
from logging.handlers import RotatingFileHandler

def setup_logging(log_file: str = "invoice_processing.log"):
    """Configure structured JSON logging for the project."""
    logger = logging.getLogger("InvoiceProcessing")
    logger.setLevel(logging.INFO)

    # JSON formatter
    class JsonFormatter(logging.Formatter):
        def format(self, record):
            log_data = {
                "timestamp": self.formatTime(record),
                "level": record.levelname,
                "message": record.msg,
                "module": record.module,
            }
            return json.dumps(log_data)

    # File handler with rotation
    handler = RotatingFileHandler(log_file, maxBytes=10*1024*1024, backupCount=5)
    handler.setFormatter(JsonFormatter())
    logger.addHandler(handler)

    # Console handler for development
    console = logging.StreamHandler()
    console.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
    logger.addHandler(console)

    return logger

if __name__ == "__main__":
    logger = setup_logging()
    logger.info("Logging configured successfully")