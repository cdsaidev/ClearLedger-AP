import { useState, useEffect } from 'react';
import { getInvoices } from '../lib/api';

// Interface for type safety
interface Invoice {
  invoice_number: string;
  vendor_name: string;
  total_amount: number;
  confidence: number;
  validation_status: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInvoices();
      setInvoices(data);
    } catch (err) {
      setError('Failed to load invoices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div>
      <h1>Invoices</h1>
      <button onClick={fetchInvoices} disabled={loading}>
        {loading ? 'Refreshing...' : 'Refresh'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {invoices.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Invoice Number</th>
              <th>Total Amount</th>
              <th>Confidence</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.invoice_number}>
                <td>{invoice.vendor_name}</td>
                <td>{invoice.invoice_number}</td>
                <td>{invoice.total_amount}</td>
                <td>{(invoice.confidence * 100).toFixed(2)}%</td>
                <td>{invoice.validation_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No invoices found.</p>
      )}
    </div>
  );
}