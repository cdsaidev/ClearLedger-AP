import pytest
from workflows.orchestrator import InvoiceProcessingWorkflow

@pytest.mark.asyncio
async def test_orchestrator():
    workflow = InvoiceProcessingWorkflow()
    sample_pdf = "data/test_samples/invoice_standard_example.pdf"
    result = await workflow.process_invoice(sample_pdf)
    assert "extracted_data" in result
    assert result["validation_result"]["status"] == "valid"