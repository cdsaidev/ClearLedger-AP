import Link from "next/link";
import { useRouter } from "next/router";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/upload", label: "Upload" },
  { href: "/invoices", label: "Invoices" },
  { href: "/review", label: "Review" },
  { href: "/metrics", label: "Metrics" },
  { href: "/anomalies", label: "Anomalies" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold tracking-tight">CL</span>
              </div>
              <span className="text-base font-semibold text-slate-900 hidden sm:inline">
                ClearLedger AP
              </span>
            </Link>

            <nav className="flex items-center gap-1 overflow-x-auto">
              {NAV_ITEMS.map(({ href, label }) => {
                const isActive =
                  href === "/" ? router.pathname === "/" : router.pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                      isActive
                        ? "bg-brand-50 text-brand-700 border border-brand-200"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
