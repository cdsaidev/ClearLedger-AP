import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { getInvoicePdf, getInvoices, updateInvoiceStatus } from "../../lib/api";
import { Invoice } from "../types";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import ConfidenceBar from "../components/ConfidenceBar";

const schema = yup.object().shape({
  vendor_name: yup.string().required("Vendor name is required"),
  total_amount: yup.number().positive("Total must be positive").required("Total is required"),
  invoice_number: yup.string().required("Invoice number is required"),
  invoice_date: yup
    .string()
    .required("Invoice date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
});

type FormInputs = {
  vendor_name: string;
  total_amount: number;
  invoice_number: string;
  invoice_date: string;
};

export default function ReviewPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const { data: invoiceData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["invoices", currentPage],
    queryFn: () => getInvoices(currentPage, perPage, "created_at", "desc"),
    retry: 2,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  const reviewInvoices = (invoiceData?.data || []).filter(
    (invoice) =>
      invoice.status === "needs_review" ||
      invoice.status === "failed" ||
      (invoice.confidence !== undefined && invoice.confidence < 0.7)
  );

  const handleViewPdf = async (invoiceId: string) => {
    if (!invoiceId || invoiceId === "undefined") {
      toast.error("No invoice ID available to view PDF.");
      return;
    }
    const toastId = toast.loading("Downloading PDF…");
    let objectUrl: string | undefined;
    try {
      const blob = await getInvoicePdf(invoiceId);
      objectUrl = window.URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = objectUrl;
      downloadLink.download = `${invoiceId}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success("PDF downloaded successfully", { id: toastId });
    } catch (err) {
      toast.error(
        `Failed to fetch PDF: ${err instanceof Error ? err.message : "Unknown error"}`,
        { id: toastId }
      );
    } finally {
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    }
  };

  const onSubmit = async (data: FormInputs) => {
    if (!selectedInvoice?.id) {
      toast.error("No invoice selected");
      return;
    }
    try {
      await updateInvoiceStatus(selectedInvoice.id.toString(), {
        ...data,
        validation_status: "valid",
        confidence: 1.0,
      });
      toast.success("Invoice updated successfully");
      setSelectedInvoice(null);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save invoice");
    }
  };

  return (
    <>
      <PageHeader
        title="Human review queue"
        subtitle="Correct low-confidence or failed extractions before they enter the validated registry."
      />

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error instanceof Error ? error.message : "Failed to load invoices"}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16 text-sm text-slate-500">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-500 border-t-transparent mr-3" />
          Loading review queue…
        </div>
      ) : reviewInvoices.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">
          No invoices require review at this time.
        </div>
      ) : selectedInvoice ? (
        <FormSection
          selectedInvoice={selectedInvoice}
          onSubmit={onSubmit}
          setSelectedInvoice={setSelectedInvoice}
        />
      ) : (
        <>
          <div className="space-y-3">
            {reviewInvoices.map((invoice) => (
              <div key={invoice.id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-blue-600">
                        {invoice.invoice_number}
                      </span>
                      <StatusBadge status={invoice.status} />
                    </div>
                    <p className="text-sm text-slate-700">{invoice.vendor_name}</p>
                    <p className="text-sm text-slate-500">
                      £{invoice.total_amount.toFixed(2)} · {invoice.invoice_date}
                    </p>
                    {invoice.confidence != null && (
                      <div className="pt-1 max-w-[120px]">
                        <ConfidenceBar confidence={invoice.confidence} />
                      </div>
                    )}
                    <button
                      onClick={() => handleViewPdf(invoice.invoice_number)}
                      className="text-xs text-blue-600 hover:underline mt-1"
                    >
                      View PDF
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedInvoice(invoice)}
                    className="btn-primary shrink-0"
                  >
                    Edit &amp; approve
                  </button>
                </div>
              </div>
            ))}
          </div>

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
      )}
    </>
  );
}

function FormSection({
  selectedInvoice,
  onSubmit,
  setSelectedInvoice,
}: {
  selectedInvoice: Invoice;
  onSubmit: (data: FormInputs) => Promise<void>;
  setSelectedInvoice: (inv: Invoice | null) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
    defaultValues: {
      vendor_name: selectedInvoice.vendor_name,
      invoice_number: selectedInvoice.invoice_number,
      invoice_date: selectedInvoice.invoice_date,
      total_amount: selectedInvoice.total_amount,
    },
  });

  const inputClass =
    "mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6 max-w-xl">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">
        Edit invoice {selectedInvoice.invoice_number}
      </h2>
      <p className="text-sm text-slate-500 mb-6">Correct fields and approve for the registry.</p>
      <div className="space-y-4">
        {(
          [
            { name: "vendor_name" as const, label: "Vendor name", type: "text" },
            { name: "invoice_number" as const, label: "Invoice number", type: "text" },
            { name: "invoice_date" as const, label: "Invoice date", type: "date" },
            { name: "total_amount" as const, label: "Total amount", type: "number" },
          ] as const
        ).map(({ name, label, type }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-slate-700">{label}</label>
            <input type={type} step={type === "number" ? "0.01" : undefined} {...register(name)} className={inputClass} />
            {errors[name] && (
              <p className="text-red-500 text-xs mt-1">{errors[name]?.message}</p>
            )}
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? "Saving…" : "Save & approve"}
          </button>
          <button type="button" onClick={() => setSelectedInvoice(null)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
