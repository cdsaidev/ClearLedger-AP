import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { getInvoices, getInvoicePdf } from "../../lib/api";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import ConfidenceBar from "../components/ConfidenceBar";

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export default function InvoicesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const perPage = 10;
  const [error, setError] = useState<string | null>(null);
  const retryCount = useRef(0);
  const isMounted = useRef(true);

  const {
    data: invoiceData,
    isLoading,
    isError,
    error: queryError,
    isSuccess,
    refetch,
  } = useQuery({
    queryKey: ["invoices", currentPage, sortBy, order],
    queryFn: () => getInvoices(currentPage, perPage, sortBy, order),
    retry: MAX_RETRIES - 1,
    retryDelay: (attempt) => RETRY_DELAY * (attempt + 1),
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (isSuccess && isMounted.current) {
      retryCount.current = 0;
      setError(null);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError && isMounted.current) {
      retryCount.current++;
      const errorMessage = queryError instanceof Error ? queryError.message : "Unknown error";
      if (retryCount.current < MAX_RETRIES) {
        toast.error(`Failed to load invoices (attempt ${retryCount.current}/${MAX_RETRIES}). Retrying…`);
      } else {
        setError("Failed to load invoices after multiple attempts.");
        toast.error(`Failed after ${MAX_RETRIES} attempts: ${errorMessage}`);
      }
    }
  }, [isError, queryError]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleViewPdf = async (invoiceNumber: string) => {
    const toastId = toast.loading("Fetching PDF…");
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("PDF fetch timed out after 20 seconds")), 20000);
      });
      const blob = await Promise.race([getInvoicePdf(invoiceNumber), timeoutPromise]);
      if (timeoutId) clearTimeout(timeoutId);
      if (!blob || blob.size === 0) throw new Error("Empty or invalid PDF received");

      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, "_blank");
      if (!newWindow) {
        toast.error("Please allow popups to view PDFs", { id: toastId });
      } else {
        toast.success("PDF opened successfully", { id: toastId });
      }
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      const errorMessage = err instanceof Error ? err.message : "Failed to load PDF";
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setOrder("desc");
    }
  };

  const renderSortArrow = (column: string) => {
    if (sortBy !== column) return null;
    return order === "asc" ? " ↑" : " ↓";
  };

  const pageInvoices = invoiceData?.data ?? [];
  const validOnPage = pageInvoices.filter((i) => i.status === "valid").length;
  const reviewOnPage = pageInvoices.filter((i) => i.status === "needs_review").length;

  return (
    <>
      <PageHeader
        title="Invoice registry"
        subtitle="Processed documents with extraction confidence, validation status, and S3 PDF storage."
        actions={
          <>
            <Link href="/upload" className="btn-primary">
              Upload new
            </Link>
            <button onClick={() => refetch()} disabled={isLoading} className="btn-secondary">
              {isLoading ? "Refreshing…" : "Refresh"}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="On this page" value={pageInvoices.length} />
        <StatCard label="Valid (page)" value={validOnPage} />
        <StatCard label="Needs review (page)" value={reviewOnPage} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-16 text-sm text-slate-500">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-500 border-t-transparent mr-3" />
          Loading invoices…
        </div>
      )}

      {!isLoading && pageInvoices.length === 0 && (
        <div className="card p-10 text-center">
          <p className="text-slate-500 mb-4">No invoices found.</p>
          <Link href="/upload" className="btn-primary inline-block">
            Upload your first invoice
          </Link>
        </div>
      )}

      {pageInvoices.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {[
                    { key: "id", label: "ID" },
                    { key: "vendor_name", label: "Vendor" },
                    { key: "invoice_number", label: "Invoice #" },
                    { key: "invoice_date", label: "Date" },
                    { key: "total_amount", label: "Total" },
                    { key: "confidence", label: "Confidence" },
                    { key: "status", label: "Status" },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none"
                    >
                      {label}
                      {renderSortArrow(key)}
                    </th>
                  ))}
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 text-sm text-slate-600">{invoice.id}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-800">{invoice.vendor_name}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-blue-600">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{invoice.invoice_date}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-800">
                      £{invoice.total_amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      {invoice.confidence != null ? (
                        <ConfidenceBar confidence={invoice.confidence} />
                      ) : (
                        <span className="text-sm text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleViewPdf(invoice.invoice_number)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {invoiceData?.pagination && invoiceData.pagination.total_pages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn-secondary px-3 py-1.5"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {currentPage} of {invoiceData.pagination.total_pages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(invoiceData.pagination.total_pages, p + 1))
            }
            disabled={currentPage === invoiceData.pagination.total_pages}
            className="btn-secondary px-3 py-1.5"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
