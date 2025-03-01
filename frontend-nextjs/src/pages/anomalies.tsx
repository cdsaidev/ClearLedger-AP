import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { getAnomalies } from "../../lib/api";
import { Anomaly } from "../types";
import PageHeader from "../components/PageHeader";

const TYPE_COLORS: Record<Anomaly["type"], string> = {
  invalid_pdf: "bg-red-50 text-red-700 border-red-200",
  extraction_error: "bg-orange-50 text-orange-700 border-orange-200",
  missing_data: "bg-amber-50 text-amber-700 border-amber-200",
  low_confidence: "bg-blue-50 text-blue-700 border-blue-200",
  processing_error: "bg-purple-50 text-purple-700 border-purple-200",
  system_error: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function AnomaliesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const { data: anomaliesData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["anomalies", currentPage],
    queryFn: () => getAnomalies(currentPage, perPage),
    retry: 2,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  const sortedAnomalies = [...(anomaliesData?.data || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <>
      <PageHeader
        title="Anomaly log"
        subtitle="RAG fallback cases, OCR failures, and low-confidence extractions flagged by the pipeline."
        actions={
          <button onClick={() => refetch()} disabled={isLoading} className="btn-secondary">
            {isLoading ? "Refreshing…" : "Refresh"}
          </button>
        }
      />

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error instanceof Error ? error.message : "Failed to load anomalies"}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-16 text-sm text-slate-500">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-500 border-t-transparent mr-3" />
          Loading anomalies…
        </div>
      )}

      {!isLoading && sortedAnomalies.length === 0 && (
        <div className="card p-10 text-center text-slate-500">No anomalies found.</div>
      )}

      {sortedAnomalies.length > 0 && (
        <div className="space-y-3">
          {sortedAnomalies.map((anomaly, idx) => (
            <div key={idx} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1.5 flex-grow">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-semibold text-slate-900">{anomaly.file_name}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                        TYPE_COLORS[anomaly.type] ?? TYPE_COLORS.system_error
                      }`}
                    >
                      {anomaly.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{anomaly.reason}</p>
                  {anomaly.invoice_number && (
                    <p className="text-xs text-slate-500">Invoice: {anomaly.invoice_number}</p>
                  )}
                  {anomaly.vendor_name && (
                    <p className="text-xs text-slate-500">Vendor: {anomaly.vendor_name}</p>
                  )}
                  {anomaly.confidence !== undefined && (
                    <p className="text-xs text-slate-500">
                      Confidence: {(anomaly.confidence * 100).toFixed(1)}%
                    </p>
                  )}
                  <p className="text-xs text-slate-400">
                    {new Date(anomaly.timestamp).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    anomaly.review_status === "needs_review"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {anomaly.review_status === "needs_review" ? "Needs review" : "Reviewed"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {anomaliesData?.pagination && anomaliesData.pagination.total_pages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-3">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn-secondary px-3 py-1.5"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {currentPage} of {anomaliesData.pagination.total_pages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(anomaliesData.pagination.total_pages, p + 1))
            }
            disabled={currentPage === anomaliesData.pagination.total_pages}
            className="btn-secondary px-3 py-1.5"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
