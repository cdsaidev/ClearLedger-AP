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
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Upload Invoice</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".pdf"
            multiple={false}
            onChange={(e) => setFiles(e.target.files)}
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {response && (
        <div className="bg-gray-100 p-4 rounded mt-4 space-y-2">
          <p><span className="font-semibold">Vendor:</span> {response.extracted_data.vendor_name}</p>
          <p><span className="font-semibold">Invoice Number:</span> {response.extracted_data.invoice_number}</p>
          <p><span className="font-semibold">Total Amount:</span> {response.extracted_data.total_amount}</p>
          <p><span className="font-semibold">Confidence:</span> {(response.extracted_data.confidence * 100).toFixed(2)}%</p>
          <p><span className="font-semibold">Status:</span> {response.extracted_data.validation_status}</p>
        </div>
      )}
    </div>
  );
}