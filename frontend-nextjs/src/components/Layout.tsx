import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex space-x-8">
                <Link 
                  href="/upload" 
                  className="text-gray-700 hover:text-blue-500 hover:border-blue-500 px-3 py-2 text-sm font-medium border-b-2 border-transparent"
                >
                  Upload
                </Link>
                <Link 
                  href="/invoices" 
                  className="text-gray-700 hover:text-blue-500 hover:border-blue-500 px-3 py-2 text-sm font-medium border-b-2 border-transparent"
                >
                  Invoices
                </Link>
                <Link 
                  href="/review" 
                  className="text-gray-700 hover:text-blue-500 hover:border-blue-500 px-3 py-2 text-sm font-medium border-b-2 border-transparent"
                >
                  Review
                </Link>
                <Link 
                  href="/metrics" 
                  className="text-gray-700 hover:text-blue-500 hover:border-blue-500 px-3 py-2 text-sm font-medium border-b-2 border-transparent"
                >
                  Metrics
                </Link>
                <Link 
                  href="/anomalies" 
                  className="text-gray-700 hover:text-blue-500 hover:border-blue-500 px-3 py-2 text-sm font-medium border-b-2 border-transparent"
                >
                  Anomalies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}