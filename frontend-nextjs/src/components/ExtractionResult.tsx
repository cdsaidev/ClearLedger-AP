import StatusBadge from "./StatusBadge";

export interface ExtractionData {
  vendor_name: string;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  confidence: number;
  validation_status: string;
}

interface ExtractionResultProps {
  data?: ExtractionData | null;
  title?: string;
  variant?: "sample" | "result" | "warning" | "error";
  message?: string;
}

const SAMPLE: ExtractionData = {
  vendor_name: "Summit Software Licensing",
  invoice_number: "INV-2025-1048",
  invoice_date: "2025-05-15",
  total_amount: 4999,
  confidence: 0.94,
  validation_status: "valid",
};

export default function ExtractionResult({
  data,
  title = "Sample extraction result",
  variant = "sample",
  message,
}: ExtractionResultProps) {
  const display = data ?? SAMPLE;
  const isSample = variant === "sample" && !data;

  const borderClass =
    variant === "warning"
      ? "border-l-4 border-amber-400"
      : variant === "error"
        ? "border-l-4 border-red-400"
        : "border-l-4 border-brand-500";

  return (
    <div className={`card p-5 ${borderClass}`}>
      <h3
        className={`text-sm font-semibold mb-4 ${
          variant === "error"
            ? "text-red-600"
            : variant === "warning"
              ? "text-amber-600"
              : "text-brand-700"
        }`}
      >
        {title}
      </h3>

      {variant === "error" || variant === "warning" ? (
        <p className="text-sm text-slate-600">{message}</p>
      ) : (
        <dl className="space-y-2.5 text-sm">
          <Row label="Vendor" value={display.vendor_name} />
          <Row label="Invoice #" value={display.invoice_number} />
          <Row label="Date" value={display.invoice_date} />
          <Row label="Total" value={`GBP ${display.total_amount.toLocaleString()}`} />
          <Row
            label="Confidence"
            value={`${(display.confidence * 100).toFixed(1)}%`}
            valueClass="text-emerald-600 font-medium"
          />
          <div className="flex items-center justify-between pt-1">
            <dt className="text-slate-500">Status</dt>
            <dd>
              <StatusBadge status={display.validation_status} />
            </dd>
          </div>
          {isSample && (
            <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
              Example output from the extraction agent
            </p>
          )}
        </dl>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = "text-slate-900 font-medium",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className={valueClass}>{value}</dd>
    </div>
  );
}
