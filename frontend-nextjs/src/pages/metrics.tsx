import { useQuery } from "@tanstack/react-query";
import { getMetrics } from "../../lib/api";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import PipelineFlow from "../components/PipelineFlow";

const STATUS_COLORS: Record<string, string> = {
  valid: "bg-emerald-500",
  needs_review: "bg-orange-500",
  failed: "bg-red-500",
};

const STATUS_LABELS: Record<string, string> = {
  valid: "Valid",
  needs_review: "Needs review",
  failed: "Failed",
};

function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-700">{label}</span>
        <span className="font-semibold text-slate-900">{count}</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function MetricsPage() {
  const { data: metrics, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["metrics"],
    queryFn: getMetrics,
    retry: 2,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  const total = metrics?.total_invoices ?? 0;
  const breakdown = metrics?.status_breakdown ?? {};

  return (
    <>
      <PageHeader
        title="Processing metrics"
        subtitle="Confidence scores, throughput, and status breakdown across the multi-agent pipeline."
        actions={
          <button onClick={() => refetch()} disabled={isLoading} className="btn-secondary">
            {isLoading ? "Refreshing…" : "Refresh"}
          </button>
        }
      />

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
          {error instanceof Error ? error.message : "Failed to load metrics"}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16 text-sm text-slate-500">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-500 border-t-transparent mr-3" />
          Loading metrics…
        </div>
      ) : metrics ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total invoices" value={metrics.total_invoices} />
            <StatCard
              label="Avg processing time"
              value={`${metrics.processing_metrics.average_seconds.toFixed(1)}s`}
              subtext={`${metrics.processing_metrics.minimum_seconds.toFixed(1)}s – ${metrics.processing_metrics.maximum_seconds.toFixed(1)}s`}
            />
            <StatCard
              label="Avg confidence"
              value={`${(metrics.confidence_metrics.average * 100).toFixed(1)}%`}
              subtext={`Low confidence rate: ${(metrics.confidence_metrics.low_confidence_rate * 100).toFixed(1)}%`}
            />
            <StatCard
              label="Processed (24h)"
              value={metrics.recent_activity.processed_24h}
              subtext={`${metrics.recent_activity.valid_24h} valid, ${metrics.recent_activity.needs_review_24h} review`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="text-base font-semibold text-slate-900">Status breakdown</h2>
              <p className="text-sm text-slate-500 mb-5">Distribution after validation &amp; PO matching</p>
              <div className="space-y-4">
                {Object.entries(breakdown).map(([status, count]) => (
                  <StatusBar
                    key={status}
                    label={STATUS_LABELS[status] ?? status}
                    count={count}
                    total={total}
                    color={STATUS_COLORS[status] ?? "bg-slate-400"}
                  />
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-5">Confidence analysis</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Average", value: `${(metrics.confidence_metrics.average * 100).toFixed(1)}%`, color: "text-blue-600" },
                  { label: "Maximum", value: `${(metrics.confidence_metrics.maximum * 100).toFixed(1)}%`, color: "text-emerald-600" },
                  { label: "Minimum", value: `${(metrics.confidence_metrics.minimum * 100).toFixed(1)}%`, color: "text-red-600" },
                  { label: "Low conf. rate", value: `${(metrics.confidence_metrics.low_confidence_rate * 100).toFixed(1)}%`, color: "text-orange-600" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-slate-50 rounded-lg p-4 text-center border border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">{label}</p>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-5">Last 24 hours</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: "Processed", value: metrics.recent_activity.processed_24h },
                { label: "Valid", value: metrics.recent_activity.valid_24h },
                { label: "Needs review", value: metrics.recent_activity.needs_review_24h },
                { label: "Low confidence", value: metrics.recent_activity.low_confidence_24h },
                { label: "Avg time", value: `${metrics.recent_activity.avg_processing_time_24h.toFixed(1)}s` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <PipelineFlow showTitle showLegend={false} />
        </div>
      ) : (
        <div className="card p-10 text-center text-slate-500">No metrics available.</div>
      )}
    </>
  );
}
