"use client";

import useSWR from "swr";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function LogsPanel() {
  const { data, isLoading } = useSWR("/api/logs", fetcher, {
    refreshInterval: 10000,
  });
  if (isLoading) return <div className="text-sm opacity-70">Loading logs…</div>;

  const hits = data?.hits || [];
  return (
    <div className="border rounded-xl p-3 space-y-2 w-100">
      <h3 className="font-semibold">Recent Logs</h3>
      <ul className="space-y-2 max-h-72 overflow-auto">
        {hits.map((h: any) => (
          <li key={h.id} className="text-xs">
            <div className="opacity-70">
              {h.at} — <span className="font-mono">{h.kind}</span>
            </div>
            <pre className="bg-gray-50 p-2 rounded overflow-auto">
              {JSON.stringify(h, null, 2)}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
