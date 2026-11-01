import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { ActivityLog } from '../../types';
import { apiClient } from '../../lib/api';

export const AdminActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAdminActivityLogs(page, 25);
      if (data && data.logs) {
        setLogs(data.logs);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Security & Audit Activity Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident record of administrator logins, vacancy modifications, and request status updates.
          </p>
        </div>
        <button
          onClick={loadLogs}
          className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Entity Type</th>
              <th className="py-3 px-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400">Loading audit trail...</td>
              </tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                  {new Date(log.created_at).toLocaleString('en-GB')}
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                  @{log.username}
                </td>
                <td className="py-3 px-4 font-semibold text-blue-700">
                  {log.action}
                </td>
                <td className="py-3 px-4 uppercase text-[10px] text-slate-500">
                  {log.entity_type}
                </td>
                <td className="py-3 px-4 text-slate-600 truncate max-w-xs">
                  {log.details || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40"
          >
            Previous
          </button>
          <span className="font-mono text-slate-500">Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
