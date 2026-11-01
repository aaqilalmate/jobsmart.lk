import React, { useState } from 'react';
import { Search, AlertCircle, CheckCircle2, Clock, FileText } from 'lucide-react';

import { apiClient } from '../lib/api';

export const TrackPage: React.FC = () => {
  const [refInput, setRefInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refInput.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const req = await apiClient.trackRequest(refInput.trim());
      if (!req) {
        throw new Error('Request reference not found');
      }
      setResult(req);
    } catch (err: any) {
      setError(err.message || 'Could not find a request matching that reference number.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs">Pending Review</span>;
      case 'awaiting_payment':
        return <span className="font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs">Awaiting Payment</span>;
      case 'in_progress':
        return <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">Poster In Progress</span>;
      case 'ready_to_publish':
        return <span className="font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded text-xs">Ready to Publish</span>;
      case 'completed':
        return <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs">Published & Completed</span>;
      case 'rejected':
        return <span className="font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs">Declined</span>;
      default:
        return <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-xs">{status}</span>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Track Advertisement Request
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Enter your reference number (e.g. JS-2026-000101) to check the status of your advertisement.
        </p>
      </div>

      <form onSubmit={handleTrack} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="e.g. JS-2026-000101"
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-500 uppercase"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !refInput.trim()}
          className="bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs px-6 py-3 rounded-xl disabled:opacity-40 transition-colors shrink-0"
        >
          {loading ? 'Checking...' : 'Track'}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Reference</span>
              <div className="text-sm font-bold font-mono text-slate-900">{result.reference_no}</div>
            </div>
            <div>{getStatusBadge(result.status)}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Employer</span>
              <span className="font-semibold text-slate-800">{result.employer_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Job Title</span>
              <span className="font-semibold text-slate-800">{result.job_title}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Payment Status</span>
              <span className="font-semibold capitalize text-slate-800">{result.payment_status}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Submission Date</span>
              <span className="font-semibold text-slate-800">
                {new Date(result.created_at).toLocaleDateString('en-GB')}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/60 text-xs text-blue-800">
            {result.status === 'pending_review' && 'Our operations team is currently reviewing your submission and verifying details.'}
            {result.status === 'awaiting_payment' && 'Your vacancy details are approved. Awaiting confirmation of the LKR 1,000 package fee.'}
            {result.status === 'in_progress' && 'Our graphic design team is creating your custom recruitment poster.'}
            {result.status === 'ready_to_publish' && 'Poster and vacancy are prepared. Publication scheduled.'}
            {result.status === 'completed' && 'Your vacancy is live on Jobsmart.lk and shared across recruitment channels.'}
          </div>
        </div>
      )}
    </div>
  );
};
