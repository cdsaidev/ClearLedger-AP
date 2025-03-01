export default function ConfidenceBar({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 1000) / 10;
  const barColor =
    pct >= 90 ? "bg-emerald-500" : pct >= 70 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="min-w-[80px]">
      <span className="text-sm text-slate-700">{pct.toFixed(1)}%</span>
      <div className="mt-1 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}
