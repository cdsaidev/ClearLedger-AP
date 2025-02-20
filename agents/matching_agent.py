#Matches invoices to POs

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import logging
from config.logging_config import setup_logging
from agents.base_agent import BaseAgent
from models.invoice import InvoiceData

logger = setup_logging()

class PurchaseOrderMatchingAgent(BaseAgent):
    def __init__(self):
        super().__init__()

    def run(self, invoice_data: InvoiceData) -> dict:
        logger.info(f"Matching invoice: {invoice_data.invoice_number}")
        # Placeholder for PO matching logic
        match_result = {"status": "pending", "po_number": None, "match_confidence": 0.0}
        logger.info(f"Matching result: {match_result}")
        return match_result

if __name__ == "__main__":
    sample_data = InvoiceData(
        vendor_name="ABC Corp Ltd.",
        invoice_number="INV-2024-001",
        invoice_date="2024-02-18",
        total_amount="7595.00",
        confidence=0.955
    )
    agent = PurchaseOrderMatchingAgent()
    result = agent.run(sample_data)
    print(result)