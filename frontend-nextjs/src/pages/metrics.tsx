import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

interface Metrics {
  total_invoices: number;
  status_breakdown: {
    [key: string]: number;
  };
  confidence_metrics: {
    average: number;
    minimum: number;
    maximum: number;
    low_confidence_rate: number;
  };
  processing_metrics: {
    average_seconds: number;
    minimum_seconds: number;
    maximum_seconds: number;
    total_processed: number;
  };
  recent_activity: {
    processed_24h: number;
    low_confidence_24h: number;
    valid_24h: number;
    needs_review_24h: number;
    avg_processing_time_24h: number;
  };
}

// Function to fetch metrics from the API
async function fetchMetrics(): Promise<Metrics> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_MAIN_API_URL}/api/metrics`);
  if (!response.ok) {
    throw new Error('Failed to fetch metrics');
  }
  return response.json();
}

export default function MetricsPage() {
  const { 
    data: metrics,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
    retry: 2,
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Metrics</h1>
        <button 
          onClick={() => refetch()}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {isError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <p className="text-red-700">{error instanceof Error ? error.message : 'Failed to load metrics'}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="ml-2 text-gray-600">Loading metrics...</p>
        </div>
      ) : metrics ? (
        <div className="space-y-6">
          {/* Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Total Invoices</h3>
              <p className="mt-2 text-3xl font-semibold text-blue-600">{metrics.total_invoices}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Processing Time</h3>
              <p className="mt-2 text-3xl font-semibold text-green-600">{metrics.processing_metrics.average_seconds.toFixed(1)}s</p>
              <p className="text-sm text-gray-500">Average</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Confidence Score</h3>
              <p className="mt-2 text-3xl font-semibold text-purple-600">{(metrics.confidence_metrics.average * 100).toFixed(1)}%</p>
              <p className="text-sm text-gray-500">Average</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">Last 24h Activity</h3>
              <p className="mt-2 text-3xl font-semibold text-orange-600">{metrics.recent_activity.processed_24h}</p>
              <p className="text-sm text-gray-500">Invoices Processed</p>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(metrics.status_breakdown).map(([status, count]) => (
                <div key={status} className="text-center">
                  <p className="text-2xl font-semibold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-500 capitalize">{status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence Metrics */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confidence Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-semibold text-blue-600">{(metrics.confidence_metrics.average * 100).toFixed(1)}%</p>
                <p className="text-sm text-gray-500">Average</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-green-600">{(metrics.confidence_metrics.maximum * 100).toFixed(1)}%</p>
                <p className="text-sm text-gray-500">Maximum</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-red-600">{(metrics.confidence_metrics.minimum * 100).toFixed(1)}%</p>
                <p className="text-sm text-gray-500">Minimum</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-yellow-600">{(metrics.confidence_metrics.low_confidence_rate * 100).toFixed(1)}%</p>
                <p className="text-sm text-gray-500">Low Confidence Rate</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Last 24 Hours</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-semibold text-blue-600">{metrics.recent_activity.processed_24h}</p>
                <p className="text-sm text-gray-500">Processed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-green-600">{metrics.recent_activity.valid_24h}</p>
                <p className="text-sm text-gray-500">Valid</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-yellow-600">{metrics.recent_activity.needs_review_24h}</p>
                <p className="text-sm text-gray-500">Needs Review</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-red-600">{metrics.recent_activity.low_confidence_24h}</p>
                <p className="text-sm text-gray-500">Low Confidence</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-purple-600">{metrics.recent_activity.avg_processing_time_24h.toFixed(1)}s</p>
                <p className="text-sm text-gray-500">Avg Processing Time</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No metrics available.</p>
        </div>
      )}
    </div>
  );
}