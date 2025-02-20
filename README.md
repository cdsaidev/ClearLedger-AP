# Clear Ledger AP

## Overview
An intelligent invoice processing system built with LangChain multi-agent workflows to automate extraction, validation, and PO matching.

## Day 2 Progress
- Implemented `InvoiceExtractionAgent` for structured PDF data extraction.
- Added OCR and PDF parsing utilities.
- Defined `InvoiceData` Pydantic model and confidence scoring.

## Setup
1. Install dependencies: `pip install -r requirements.txt`
2. Set `OPENAI_API_KEY` environment variable.
3. Run: `python agents/extractor_agent.py`

## Next Steps
- Add validation agent (Day 3).
- Implement PO matching (Day 4).