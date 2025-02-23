import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// Updated Yup schema
const schema = yup.object().shape({
  vendor_name: yup.string().required('Vendor name is required'),
  total_amount: yup.number().positive('Total must be positive').required('Total is required'),
  invoice_number: yup.string().required('Invoice number is required'),
  invoice_date: yup.date().required('Invoice date is required'),
});

interface Invoice {
  invoice_number: string;
  vendor_name: string;
  total_amount: number;
  validation_status: string;
  invoice_date: string;
}

// Add new interface for form inputs to match Yup schema
interface FormInputs {
  vendor_name: string;
  total_amount: number;
  invoice_number: string;
  invoice_date: Date;
}

export default function ReviewPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // New function to handle viewing PDF
  const handleViewPdf = async (invoiceId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/invoice_pdf/${invoiceId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to view PDF');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error viewing PDF:', error);
      alert(`Failed to view PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/invoices');
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
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

  // Updated onSubmit function with corrected backend URL and improved error handling
  const onSubmit = async (data: FormInputs) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/invoices/${data.invoice_number}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_name: data.vendor_name,
          invoice_number: data.invoice_number,
          invoice_date: data.invoice_date,
          total_amount: data.total_amount,
        }),
      });
      if (!response.ok) {
        let errorMessage = 'Failed to save invoice';
        try {
          const contentType = response.headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
          } else {
            const text = await response.text();
            errorMessage = `Server returned non-JSON response: ${text.slice(0, 50)}...`;
          }
        } catch (err) {
          errorMessage = 'Failed to parse error response';
        }
        throw new Error(errorMessage);
      }
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('Error saving invoice:', err);
      alert(`Error saving invoice: ${err.message}`);
      setError(`Failed to save invoice: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Review Invoices</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {selectedInvoice ? (
        // Begin form with react-hook-form
        <FormSection selectedInvoice={selectedInvoice} onSubmit={onSubmit} setSelectedInvoice={setSelectedInvoice} loading={loading} />
      ) : (
        <ul className="space-y-4">
          {invoices.map((invoice, idx) => (
            <li key={`${invoice.invoice_number}-${idx}`} className="p-4 bg-white rounded-lg shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Invoice: {invoice.invoice_number}</p>
                  <p className="text-sm text-gray-600">Amount: {invoice.total_amount}</p>
                  <p className="text-sm text-gray-600">Status: {invoice.validation_status || 'Unknown'}</p>
                  <button
                    onClick={() => handleViewPdf(invoice.invoice_number)}
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    View PDF
                  </button>
                </div>
                <button
                  onClick={() => setSelectedInvoice(invoice)}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// New component for the form section using react-hook-form
function FormSection({ selectedInvoice, onSubmit, setSelectedInvoice, loading }: { selectedInvoice: Invoice, onSubmit: (data: any) => Promise<void>, setSelectedInvoice: (inv: Invoice | null) => void, loading: boolean }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInputs>({
    resolver: yupResolver(schema),
    // Remove defaultValues here; they'll be set via useEffect
  });

  useEffect(() => {
    if (selectedInvoice) {
      // Convert invoice_date from string to Date to satisfy the Yup schema
      reset({
        ...selectedInvoice,
        invoice_date: new Date(selectedInvoice.invoice_date)
      });
    }
  }, [selectedInvoice, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Edit Invoice {selectedInvoice.invoice_number}</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
          <input
            type="text"
            {...register('vendor_name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.vendor_name && <p className="text-red-500 text-sm mt-1">{errors.vendor_name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
          <input
            type="text"
            {...register('invoice_number')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
          <input
            type="date"
            {...register('invoice_date')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
          <input
            type="number"
            step="0.01"
            {...register('total_amount')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          {errors.total_amount && <p className="text-red-500 text-sm mt-1">{errors.total_amount.message}</p>}
        </div>
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => setSelectedInvoice(null)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}