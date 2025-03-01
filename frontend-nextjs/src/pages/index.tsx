import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getInvoices, getMetrics } from "../../lib/api";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import PipelineFlow from "../components/PipelineFlow";
import QuickActions from "../components/QuickActions";
import StatusBadge from "../components/StatusBadge";
import ConfidenceBar from "../components/ConfidenceBar";

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["metrics"],
    queryFn: getMetrics,
    retry: 1,
    staleTime: 30000,
  });

  const { data: recentData, isLoading: invoicesLoading } = useQuery({
    queryKey: ["invoices", "recent"],
    queryFn: () => getInvoices(1, 8, "created_at", "desc"),
    retry: 1,
    staleTime: 30000,
  });

  const validCount = metrics?.status_breakdown?.valid ?? 0;
  const reviewCount = metrics?.status_breakdown?.needs_review ?? 0;
  const avgTime = metrics?.processing_metrics?.average_seconds?.toFixed(1) ?? "—";

  return (
    <>
      <PageHeader
        title="ClearLedger AP dashboard"
        subtitle="Multi-agent pipeline for PDF extraction, validation, PO matching, and human-in-the-loop review. Powered by LangChain, OpenAI, FAISS, SQLite, and AWS S3."
        actions={
          <Link href="/upload" className="btn-primary">
            Upload invoice
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total invoices"
          value={metricsLoading ? "…" : (metrics?.total_invoices ?? 0)}
          subtext="In SQLite database"
        />
        <StatCard
          label="Auto-validated"
          value={metricsLoading ? "…" : validCount}
          subtext="Passed all agents"
        />
        <StatCard
          label="Needs review"
          value={metricsLoading ? "…" : reviewCount}
          subtext="Human review queue"
        />
        <StatCard
          label="Avg processing"
          value={metricsLoading ? "…" : `${avgTime}s`}
          subtext="Per document"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <PipelineFlow />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Recent processing activity</h2>
        </div>

        {invoicesLoading ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">Loading recent activity…</div>
        ) : !recentData?.data?.length ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            No invoices processed yet.{" "}
            <Link href="/upload" className="text-blue-600 hover:underline">
              Upload your first invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {["Invoice #", "Vendor", "Total", "Status", "Confidence"].map((col) => (
                    <th
                      key={col}
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentData.data.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3.5 text-sm font-medium text-blue-600">
                      {inv.invoice_number}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-slate-700">{inv.vendor_name}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-700">
                      £{inv.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-6 py-3.5">
                      {inv.confidence != null ? (
                        <ConfidenceBar confidence={inv.confidence} />
                      ) : (
                        <span className="text-sm text-slate-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
