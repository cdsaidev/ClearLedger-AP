#!/usr/bin/env python3
import sqlite3
import sys
from pathlib import Path
from config.logging_config import logger


def create_database(db_path: Path):
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        # Create table for invoice metadata
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS invoice_metadata (
                id INTEGER PRIMARY KEY,
                invoice_number TEXT,
                vendor_name TEXT,
                invoice_date TEXT,
                total_amount REAL,
                status TEXT,
                pdf_url TEXT
            )
        ''')
        conn.commit()
        logger.info(f"Database created and table initialized at {db_path}")
        return conn
    except Exception as e:
        logger.error(f"Error creating database: {e}")
        sys.exit(1)


def insert_test_row(conn: sqlite3.Connection):
    try:
        cursor = conn.cursor()
        # Test row data
        test_data = (
            'INV001',         # invoice_number
            'Test Vendor',    # vendor_name
            '2023-10-10',     # invoice_date
            123.45,           # total_amount
            'paid',           # status
            'http://example.com/invoice_INV001.pdf'  # pdf_url
        )
        cursor.execute('''
            INSERT INTO invoice_metadata (invoice_number, vendor_name, invoice_date, total_amount, status, pdf_url)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', test_data)
        conn.commit()
        logger.info("Test row inserted successfully")
    except Exception as e:
        logger.error(f"Error inserting test row: {e}")


def verify_insertion(conn: sqlite3.Connection):
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM invoice_metadata WHERE invoice_number = 'INV001'")
        row = cursor.fetchone()
        if row:
            logger.info(f"Verification success, retrieved row: {row}")
        else:
            logger.error("Verification failed, test row not found")
    except Exception as e:
        logger.error(f"Error verifying insertion: {e}")


def main():
    # Get absolute path to the current directory of the Next.js project
    current_dir = Path(__file__).resolve().parent
    db_path = current_dir / 'invoices.db'
    logger.info(f"Using database path: {db_path}")

    # Create database and table
    conn = create_database(db_path)
    
    # Insert test row
    insert_test_row(conn)
    
    # Verify the test row
    verify_insertion(conn)
    
    conn.close()


if __name__ == '__main__':
    main()
