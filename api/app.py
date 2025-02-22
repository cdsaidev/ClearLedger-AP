from fastapi.middleware.cors import CORSMiddleware
print("Starting api/app.py")
import sys
print("sys imported")
import os
print("os imported")
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
print("Path adjusted")
from fastapi import FastAPI, UploadFile, File, HTTPException
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

@app.get("/api/process_all_invoices")
async def process_all_invoices():
    invoice_files = glob("data/raw/*.pdf")
    if not invoice_files:
        return {"message": "No invoices found in data/raw/"}
    results = []
    for file in invoice_files:
        result = await workflow.process_invoice(file)
        save_invoice(result['extracted_data'])
        results.append(result)
    return {"message": f"Processed {len(results)} invoices"}

def save_invoice(invoice_data: dict):
    """Save invoice data to the structured_invoices.json file."""
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
            data.append(invoice_data)
            f.seek(0)
            f.truncate()
            json.dump(data, f, indent=4)
            print(f"Invoice saved successfully: {invoice_data.get('invoice_number', 'unknown')}")
    except Exception as e:
        print(f"Error saving invoice: {e}")
        raise HTTPException(status_code=500, detail=f"Error saving invoice: {str(e)}")

@app.post("/api/upload_invoice")
async def upload_invoice(file: UploadFile = File(...)):
    """Process an uploaded invoice PDF."""
    try:
        temp_path = Path(f"data/temp/{uuid.uuid4()}.pdf")
        temp_path.parent.mkdir(exist_ok=True)
        with open(temp_path, "wb") as f:
            f.write(await file.read())
        result = await workflow.process_invoice(str(temp_path))
        save_invoice(result['extracted_data'])
        temp_path.unlink()
        return result
    except Exception as e:
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