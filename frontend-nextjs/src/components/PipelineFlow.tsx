const STEPS = [
  { name: "Extraction", detail: "GPT-4o-mini + PDF parser", color: "bg-blue-500" },
  { name: "Validation", detail: "Pydantic schema checks", color: "bg-purple-500" },
  { name: "PO matching", detail: "Fuzzy vendor catalogue", color: "bg-indigo-500" },
  { name: "Human review", detail: "Confidence below 90%", color: "bg-orange-500" },
  { name: "RAG fallback", detail: "FAISS error recovery", color: "bg-emerald-500" },
];

interface PipelineFlowProps {
  compact?: boolean;
  showTitle?: boolean;
  showLegend?: boolean;
}

export default function PipelineFlow({
  compact = false,
  showTitle = true,
  showLegend = true,
}: PipelineFlowProps) {
  const mainSteps = STEPS.slice(0, 4);
  const fallback = STEPS[4];

  return (
    <div className={compact ? "" : "card p-6"}>
      {showTitle && (
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-900">Multi-agent processing pipeline</h2>
          {!compact && (
            <p className="mt-1 text-sm text-slate-500">
              LangChain orchestrator routes each invoice through extraction, validation, and PO matching.
            </p>
          )}
        </div>
      )}

      {!compact ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {mainSteps.map((step, i) => (
              <div key={step.name} className="flex items-center gap-2">
                <div className={`${step.color} text-white rounded-lg px-3 py-2 text-sm`}>
                  <span className="font-medium">{step.name}</span>
                  <span className="block text-[10px] opacity-80 mt-0.5">{step.detail}</span>
                </div>
                {i < mainSteps.length - 1 && <span className="text-slate-300 text-lg">→</span>}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-slate-300 text-lg ml-1">↓</span>
            <div className={`${fallback.color} text-white rounded-lg px-3 py-2 text-sm`}>
              <span className="font-medium">{fallback.name}</span>
              <span className="block text-[10px] opacity-80 mt-0.5">{fallback.detail}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {STEPS.map((step, i) => (
            <div key={step.name} className="flex items-center gap-2">
              <span className={`${step.color} text-white text-xs font-medium px-2.5 py-1 rounded-md`}>
                {step.name}
              </span>
              {i < STEPS.length - 1 && <span className="text-slate-300">→</span>}
            </div>
          ))}
        </div>
      )}

      {showLegend && (
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> SQLite metadata
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500" /> AWS S3 PDF storage
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> WebSocket live updates
          </span>
        </div>
      )}
    </div>
  );
}
