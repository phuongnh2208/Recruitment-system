/**
 * AuditLogPage — Admin audit log viewer.
 *
 * @category Frontend / Component
 */

import { useState } from "react";
import { useAuditLogs } from "../hooks/useAuditLogs";

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const { data, isLoading, isError } = useAuditLogs({
    page,
    limit: 10,
    action: action || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <input
          type="text"
          placeholder="Filter by action..."
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {isLoading && <p className="text-gray-500">Loading audit logs...</p>}
      {isError && <p className="text-red-500">Failed to load audit logs.</p>}

      {data && (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Timestamp
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Actor
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Entity
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">
                    Entity ID
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.items.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{log.actorId}</td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{log.entity}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {log.entityId}
                    </td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      No audit logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {data.page} of{" "}
              {Math.max(1, Math.ceil(data.total / data.limit))} ({data.total}{" "}
              total)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * data.limit >= data.total}
                className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
