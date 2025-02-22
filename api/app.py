from fastapi.middleware.cors import CORSMiddleware
print("Starting api/app.py")
import sys
print("sys imported")
import os
print("os imported")
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
print("Path adjusted")
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.responses import FileResponse
print("FastAPI imported")
from workflows.orchestrator import InvoiceProcessingWorkflow
print("Workflow imported")
import json
print("json imported")
from pathlib import Path
print("Path imported")
import uuid
print("uuid imported")
from glob import glob
from pydantic import BaseModel
from shutil import copyfile

# Ensure temp directory exists at startup
Path("data/temp").mkdir(parents=True, exist_ok=True)
print("Temp directory ensured")

app = FastAPI(title="Brim Invoice Processing API")
print("App created")
workflow = InvoiceProcessingWorkflow()
print("Workflow instance created")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

OUTPUT_FILE = Path("data/processed/structured_invoices.json")
PDF_OUTPUT_DIR = Path("data/processed")

def save_pdf_file(temp_path: Path, invoice_number: str) -> bool:
    """Save PDF file to processed directory."""
    try:
        PDF_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        output_path = PDF_OUTPUT_DIR / f"{invoice_number}.pdf"
        if isinstance(temp_path, str):
            temp_path = Path(temp_path)
        print(f"Copying PDF from {temp_path} to {output_path}")
        copyfile(temp_path, output_path)
        print(f"PDF saved successfully: {output_path}")
        return True
    except Exception as e:
        print(f"Error saving PDF: {e}")
        return False

@app.get("/api/process_all_invoices")
async def process_all_invoices():
    invoice_files = glob("data/raw/invoices/*.pdf")
    if not invoice_files:
        return {"message": "No invoices found in data/raw/invoices/"}
    results = []
    for file in invoice_files:
        result = await workflow.process_invoice(file)
        save_invoice(result['extracted_data'])
        # Copy PDF to processed directory
        if save_pdf_file(file, result['extracted_data']['invoice_number']):
            results.append(result)
        else:
            print(f"Warning: Failed to save PDF for {result['extracted_data']['invoice_number']}")
    return {"message": f"Processed {len(results)} invoices"}

def save_invoice(invoice_data: dict):
    """Save invoice data to the structured_invoices.json file.
    If an invoice with the same invoice_number exists, it will be updated instead of creating a duplicate."""
    try:
        if not OUTPUT_FILE.exists():
            OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
            with OUTPUT_FILE.open('w') as f:
                json.dump([], f)
                
        with OUTPUT_FILE.open('r+') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = []
                
            # Remove existing invoice with same number if it exists
            data = [inv for inv in data if inv.get('invoice_number') != invoice_data.get('invoice_number')]
            # Add the new/updated invoice
            data.append(invoice_data)
            
            # Write back to file
            f.seek(0)
            f.truncate()
            json.dump(data, f, indent=4)
            print(f"Invoice saved/updated successfully: {invoice_data.get('invoice_number', 'unknown')}")
    except Exception as e:
        print(f"Error saving invoice: {e}")
        raise HTTPException(status_code=500, detail=f"Error saving invoice: {str(e)}")

@app.post("/api/upload_invoice")
async def upload_invoice(file: UploadFile = File(...)):
    """Process an uploaded invoice PDF."""
    temp_path = Path(f"data/temp/{uuid.uuid4()}.pdf")
    try:
        temp_path.parent.mkdir(exist_ok=True)
        with open(temp_path, "wb") as f:
            f.write(await file.read())
        
        result = await workflow.process_invoice(str(temp_path))
        save_invoice(result['extracted_data'])
        
        # Save PDF to processed directory
        if not save_pdf_file(temp_path, result['extracted_data']['invoice_number']):
            raise HTTPException(status_code=500, detail="Failed to save PDF file")
        
        temp_path.unlink()  # Clean up temp file
        return result
    except Exception as e:
        if temp_path.exists():
            temp_path.unlink()
        raise HTTPException(status_code=500, detail=f"Error processing invoice: {str(e)}")

@app.get("/api/invoices")
async def get_invoices():
    """Fetch all processed invoices."""
    try:
        if not OUTPUT_FILE.exists():
            print(f"Warning: {OUTPUT_FILE} does not exist. Returning empty list.")
            return []
        with OUTPUT_FILE.open("r") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error reading invoices - malformed JSON: {e}")
        return []
    except Exception as e:
        print(f"Error reading invoices: {e}")
        return []

@app.get("/api/invoice_pdf/{invoice_number}")
async def get_invoice_pdf(invoice_number: str):
    """Serve invoice PDF file from processed directory."""
    pdf_path = PDF_OUTPUT_DIR / f"{invoice_number}.pdf"
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="Invoice PDF not found")
    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=f"{invoice_number}.pdf"
    )

class InvoiceUpdate(BaseModel):
    vendor_name: str
    invoice_number: str
    invoice_date: str
    total_amount: float

@app.put("/api/invoices/{invoice_number}")
async def update_invoice(invoice_number: str, update_data: InvoiceUpdate):
    try:
        if not OUTPUT_FILE.exists():
            raise HTTPException(status_code=404, detail="No invoices found")
            
        with OUTPUT_FILE.open('r') as f:
            invoices = json.load(f)
            
        # Find and update the invoice
        invoice_found = False
        for invoice in invoices:
            if invoice['invoice_number'] == invoice_number:
                invoice.update({
                    'vendor_name': update_data.vendor_name,
                    'invoice_number': update_data.invoice_number,
                    'invoice_date': update_data.invoice_date,
                    'total_amount': update_data.total_amount
                })
                invoice_found = True
                break
                
        if not invoice_found:
            raise HTTPException(status_code=404, detail=f"Invoice {invoice_number} not found")
            
        # Save updated data back to file
        with OUTPUT_FILE.open('w') as f:
            json.dump(invoices, f, indent=4)
            
        return {"message": f"Invoice {invoice_number} updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating invoice: {str(e)}")