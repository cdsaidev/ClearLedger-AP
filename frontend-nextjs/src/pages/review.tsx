import { useState, useEffect } from 'react';
import { getInvoices, submitReview } from '../lib/api';

// Interface for type safety
interface Invoice {
  invoice_number: string;
  vendor_name: string;
  total_amount: number;
  confidence: number;
  validation_status: string;
}

export default function ReviewPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data: Invoice[] = await getInvoices();
      // Filter invoices needing review
      const flagged = data.filter(
        (inv) => inv.confidence < 0.9 || inv.validation_status !== 'valid'
      );
      setInvoices(flagged);
    } catch (err) {
      setError('Failed to load invoices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editInvoice) return;
    setLoading(true);
    try {
      const corrections = {
        total_amount: editInvoice.total_amount,
        // Add other fields if needed, e.g., vendor_name: editInvoice.vendor_name
      };
      await submitReview(editInvoice.invoice_number, corrections);
      fetchInvoices(); // Refresh the list
      setEditInvoice(null);
    } catch (err) {
      setError('Failed to save review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Review Invoices</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {editInvoice ? (
        <div className="border p-4 rounded-lg bg-white shadow-sm mb-4">
          <h2 className="text-xl font-semibold mb-4">Edit Invoice {editInvoice.invoice_number}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
              <input
                type="text"
                value={editInvoice.total_amount}
                onChange={(e) =>
                  setEditInvoice({ ...editInvoice, total_amount: Number(e.target.value) })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={handleSave} 
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button 
                onClick={() => setEditInvoice(null)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {invoices.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <li key={invoice.invoice_number} className="py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Invoice: {invoice.invoice_number}</p>
                      <p className="text-sm text-gray-600">Amount: {invoice.total_amount}</p>
                      <p className="text-sm text-gray-600">Status: {invoice.validation_status}</p>
                    </div>
                    <button 
                      onClick={() => setEditInvoice(invoice)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">No invoices need review.</p>
          )}
        </>
      )}
    </div>
  );
}