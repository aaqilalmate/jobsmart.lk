import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Inbox,
  Palette,
  FileImage,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { AdRequest } from '../../types';
import { AdminRequestModal } from './AdminRequestModal';
import { apiClient } from '../../lib/api';

export const AdminRequests: React.FC = () => {
  const [requests, setRequests] = useState<AdRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [posterFilter, setPosterFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAdminRequests({
        q: search.trim(),
        status: statusFilter,
        payment_status: paymentFilter,
        has_poster: posterFilter,
        page,
        limit: 25,
      });
      if (data && data.requests) {
        setRequests(data.requests);
        setTotal(data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [search, statusFilter, paymentFilter, posterFilter, page]);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Advertisement Requests & Poster Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
            Total {total} submissions from employers
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ref, employer, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">All Workflow Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="awaiting_payment">Awaiting Payment</option>
            <option value="approved">Approved</option>
            <option value="in_progress">In Progress (Design)</option>
            <option value="ready_to_publish">Ready to Publish</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Payment filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">All Payments</option>
            <option value="unpaid">Unpaid</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="paid">Paid</option>
            <option value="waived">Waived</option>
          </select>

          {/* Poster status */}
          <select
            value={posterFilter}
            onChange={(e) => setPosterFilter(e.target.value)}
            className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
          >
            <option value="all">All Poster Options</option>
            <option value="1">Employer Has Poster</option>
            <option value="0">Needs Poster Design</option>
          </select>

          <button
            onClick={loadRequests}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Ref & Job Title</th>
                <th className="py-3 px-4">Employer & Contact</th>
                <th className="py-3 px-4">Poster Option</th>
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Workflow Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Loading requests...
                  </td>
                </tr>
              ) : requests.length > 0 ? (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-blue-700">{r.reference_no}</div>
                      <div className="font-semibold text-slate-900 line-clamp-1">{r.job_title}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{r.employer_name}</div>
                      <div className="text-[11px] text-slate-500">{r.contact_person} · {r.phone}</div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {r.has_poster ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          <FileImage className="w-3.5 h-3.5" />
                          <span>Has Poster</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                          <Palette className="w-3.5 h-3.5" />
                          <span>Design Needed</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono">
                      {new Date(r.created_at).toLocaleDateString('en-GB')}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        r.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        r.payment_status === 'pending_verification' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {r.payment_status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        r.status === 'pending_review' ? 'bg-amber-100 text-amber-800' :
                        r.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                        r.status === 'ready_to_publish' ? 'bg-blue-100 text-blue-800' :
                        r.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedRequestId(r.id)}
                        className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect & Manage</span>
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No requests found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Inspection Modal */}
      {selectedRequestId && (
        <AdminRequestModal
          requestId={selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
          onUpdated={() => {
            loadRequests();
          }}
        />
      )}

    </div>
  );
};
