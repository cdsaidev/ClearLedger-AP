import { useState } from 'react';
import { uploadInvoice } from '../lib/api';

// Interface for type safety
interface UploadResponse {
  extracted_data: {
    invoice_number: string;
    vendor_name: string;
    total_amount: number;
    confidence: number;
    validation_status: string;
  };
}

export default function UploadPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files) return;

    setLoading(true);
    setError(null);
    try {
      const data = await uploadInvoice(files);
      setResponse(data);
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Upload Invoice</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".pdf"
          multiple={false}
          onChange={(e) => setFiles(e.target.files)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {response && (
        <div>
          <p>Vendor: {response.extracted_data.vendor_name}</p>
          <p>Invoice Number: {response.extracted_data.invoice_number}</p>
          <p>Total Amount: {response.extracted_data.total_amount}</p>
          <p>Confidence: {(response.extracted_data.confidence * 100).toFixed(2)}%</p>
          <p>Status: {response.extracted_data.validation_status}</p>
        </div>
      )}
    </div>
  );
}