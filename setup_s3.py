#!/usr/bin/env python3
import boto3
from botocore.exceptions import ClientError
from pathlib import Path
from config.logging_config import logger

BUCKET_NAME = "chris-clear-ledger-nextjs-2025"  

def upload_to_s3(file_path: str) -> str:
    s3_client = boto3.client("s3")
    file_name = Path(file_path).name
    try:
        s3_client.upload_file(file_path, BUCKET_NAME, f"invoices/{file_name}")
        pdf_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/invoices/{file_name}"
        logger.info(f"Successfully uploaded {file_name} to S3: {pdf_url}")
        return pdf_url
    except ClientError as e:
        logger.error(f"Failed to upload to S3: {e}")
        raise

def main():
    sample_pdf = str(Path(__file__).parent / "data" / "raw" / "invoices" / "invoice_0_missing_product_code.pdf")
    try:
        pdf_url = upload_to_s3(sample_pdf)
        logger.debug(f"Generated PDF URL: {pdf_url}")
    except Exception as e:
        logger.error(f"S3 setup failed: {e}")

if __name__ == "__main__":
    main()