type InvoiceStatus = "valid" | "needs_review" | "failed" | string;

const STYLES: Record<string, string> = {
  valid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  needs_review: "bg-amber-50 text-amber-700 border border-amber-200",
  failed: "bg-red-50 text-red-700 border border-red-200",
};

export default function StatusBadge({ status }: { status: InvoiceStatus }) {
  const style = STYLES[status] ?? "bg-slate-50 text-slate-600 border border-slate-200";
  const label = status === "needs_review" ? "Needs review" : status;

  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}>
      {label}
    </span>
  );
}
