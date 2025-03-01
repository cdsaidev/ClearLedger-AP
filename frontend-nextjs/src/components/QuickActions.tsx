import Link from "next/link";

const ACTIONS = [
  { href: "/upload", title: "Upload single PDF", subtitle: "Run extraction workflow" },
  { href: "/invoices", title: "Browse invoices", subtitle: "Sort, filter, view PDFs" },
  { href: "/review", title: "Human review", subtitle: "Correct low-confidence fields" },
  { href: "/anomalies", title: "Anomaly log", subtitle: "RAG & OCR error cases" },
];

export default function QuickActions() {
  return (
    <div className="card p-6">
      <h2 className="text-base font-semibold text-slate-900 mb-4">Quick actions</h2>
      <ul className="divide-y divide-slate-100">
        {ACTIONS.map(({ href, title, subtitle }) => (
          <li key={href}>
            <Link
              href={href}
              className="block py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors group"
            >
              <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                {title}
              </span>
              <span className="block text-xs text-slate-400 mt-0.5">{subtitle}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
