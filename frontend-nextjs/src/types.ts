export interface Invoice {
    id?: number;  // Optional because not always present in extraction results
    invoice_number: string;
    vendor_name: string;
    total_amount: number;
    confidence?: number;  // Optional because only present in extraction results
    validation_status?: string;  // Optional legacy field
    review_status?: string;  // Optional for review workflow
    invoice_date: string;
    status: string;  // From database
    pdf_url: string;
    created_at?: string;  // Optional because not present in extraction results
}

export interface UploadResponse {
    status: string;
    detail: string;
    extracted_data?: Invoice;
    pdf_url?: string;
    type?: string;  // For error responses
}

export interface Anomaly {
    file_name: string;
    reason: string;
    confidence: number;
    review_status: string;
    type: string;
    invoice_number?: string;
    vendor_name?: string;
}
