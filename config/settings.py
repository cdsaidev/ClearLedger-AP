# Stores environment variables (API keys, file paths, thresholds).

# /config/settings.py (Updated)
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")  # Rely solely on env var