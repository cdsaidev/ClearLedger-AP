import { Invoice } from '../src/types';

interface ApiError {
    detail?: string;
    message?: string;
}

function handleError(response: Response): never {
    throw new Error(`Request failed with status ${response.status}`);
}

export async function uploadInvoice(file: File): Promise<{ 
    status: string; 
    detail?: string;
    extracted_data?: Invoice;
}> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_MAIN_API_URL}/api/upload_invoice`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const contentType = response.headers.get('Content-Type');
        if (contentType?.includes('application/json')) {
            const errorData = await response.json() as ApiError;
            throw new Error(errorData.detail || errorData.message || 'Upload failed');
        }
        throw new Error(`Upload failed: ${await response.text()}`);
    }
    
    return response.json();
}

export async function getInvoices(): Promise<Invoice[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_MAIN_API_URL}/api/invoices`, {
        method: 'GET'
    });

    if (!response.ok) {
        if (response.status === 404) return []; // Return empty array for no invoices
        throw new Error('Failed to fetch invoices');
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

export async function getInvoicePdf(invoiceId: string): Promise<Blob> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_MAIN_API_URL}/api/invoice_pdf/${invoiceId}`);
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('PDF not found for this invoice');
        }
        
        const contentType = response.headers.get('Content-Type');
        if (contentType?.includes('application/json')) {
            const errorData = await response.json() as ApiError;
            throw new Error(errorData.detail || 'Failed to retrieve PDF');
        }
        
        throw new Error('Failed to retrieve PDF from server');
    }
    
    return response.blob();
}

export async function updateInvoiceStatus(
    invoiceId: string, 
    status: string
): Promise<Invoice> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_MAIN_API_URL}/api/invoices/${invoiceId}`,
        {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        }
    );

    if (!response.ok) {
        const errorData = await response.json() as ApiError;
        throw new Error(errorData.detail || 'Failed to update invoice status');
    }

    return response.json();
}

export async function getAnomalies(): Promise<unknown[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_MAIN_API_URL}/api/anomalies`);
    if (!response.ok) {
        if (response.status === 404) return []; // Return empty array for no anomalies
        throw new Error('Failed to fetch anomalies');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
}