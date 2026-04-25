/**
 * SystemStatusCard — A8.
 * Displays GET /system/status health indicators in the admin dashboard.
 */
import { useSystemStatusQuery } from '@/data/dashboard';

const DOT_COLOR: Record<string, string> = {
  HEALTHY: 'bg-green-500',
  DEGRADED: 'bg-yellow-500',
  DOWN: 'bg-red-500',
  UP: 'bg-green-500',
  unknown: 'bg-gray-400',
};

export default function SystemStatusCard() {
  const { status, loading, error } = useSystemStatusQuery({ retry: false });

  if (loading) {
    return (
      <div className="rounded-lg bg-light p-5">
        <p className="text-sm text-gray-400">Checking system status…</p>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-5">
        <p className="text-sm text-red-600">System status unavailable.</p>
      </div>
    );
  }

  const overallColor = DOT_COLOR[status.overall_status] ?? DOT_COLOR.unknown;

  return (
    <div className="rounded-lg bg-light p-5">
      {/* Overall badge */}
      <div className="mb-4 flex items-center gap-2">
        <span
          className={`inline-block h-3 w-3 rounded-full ${overallColor} ring-2 ring-offset-1 ${overallColor.replace('bg-', 'ring-')}`}
        />
        <span className="font-semibold text-heading">
          System: {status.overall_status}
        </span>
        <span className="ms-auto text-xs text-gray-400">
          {status.application.version} ({status.application.environment})
        </span>
      </div>

      {/* Health checks */}
      <div className="space-y-2">
        {Object.entries(status.health).map(([service, info]) => (
          <div key={service} className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${DOT_COLOR[info.status] ?? DOT_COLOR.unknown}`}
            />
            <span className="text-sm capitalize text-body">{service}</span>
            <span className="ms-auto text-xs text-gray-400">{info.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
