import React, { useState, useEffect } from 'react';
import { X, Palette, Upload, AlertCircle, Sparkles, Download } from 'lucide-react';
import { AdRequest, AdRequestFile, PosterVersion } from '../../types';
import { apiClient } from '../../lib/api';

interface AdminRequestModalProps {
  requestId: string;
  onClose: () => void;
  onUpdated: () => void;
}

export const AdminRequestModal: React.FC<AdminRequestModalProps> = ({ requestId, onClose, onUpdated }) => {
  const [request, setRequest] = useState<AdRequest | null>(null);
  const [files, setFiles] = useState<AdRequestFile[]>([]);
  const [posterVersions, setPosterVersions] = useState<PosterVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const [completedPosterFile, setCompletedPosterFile] = useState<File | null>(null);
  const [posterNotes, setPosterNotes] = useState('');
  const [uploadingPoster, setUploadingPoster] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAdminRequestById(requestId);
      if (data && data.request) {
        setRequest(data.request);
        setFiles(data.files || []);
        setPosterVersions(data.posterVersions || []);
        setStatus(data.request.status);
        setPaymentStatus(data.request.payment_status);
        setPaymentReference(data.request.payment_reference || '');
        setPaymentNotes(data.request.payment_notes || '');
        setInternalNotes(data.request.internal_notes || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [requestId]);

  const handleSaveStatus = async () => {
    setSaving(true);
    try {
      await apiClient.updateAdminRequest(requestId, {
        status: status as any,
        payment_status: paymentStatus as any,
        payment_reference: paymentReference,
        payment_notes: paymentNotes,
        internal_notes: internalNotes,
      });
      onUpdated();
      loadData();
    } catch (err: any) {
      setError(err.message || 'Error updating request');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPoster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completedPosterFile) return;

    setUploadingPoster(true);
    try {
      const formData = new FormData();
      formData.append('final_poster', completedPosterFile);
      formData.append('notes', posterNotes);

      const res = await fetch(`/api/admin/requests/${requestId}/upload-final-poster`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to upload completed poster');
      setCompletedPosterFile(null);
      setPosterNotes('');
      loadData();
      onUpdated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleConvertToJob = async () => {
    if (!window.confirm('Create and publish a Job Vacancy on Jobsmart.lk from this request?')) return;
    setConverting(true);
    try {
      const res = await fetch(`/api/admin/requests/${requestId}/convert-to-job`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to convert to vacancy');
      alert(`Success! Job vacancy published with slug: ${data.slug}`);
      onUpdated();
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConverting(false);
    }
  };

  if (loading || !request) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center text-xs text-slate-500">
          Loading request details...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl my-8 overflow-hidden shadow-2xl border border-slate-200">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-blue-700">{request.reference_no}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded capitalize bg-blue-100 text-blue-800">
                {request.has_poster ? 'Has Poster' : 'Needs Poster Design'}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {request.job_title} · {request.employer_name}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Top Status & Payment Bar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs font-semibold p-2 bg-white border border-slate-200 rounded-lg cursor-pointer"
              >
                <option value="pending_review">Pending Review</option>
                <option value="awaiting_payment">Awaiting Payment</option>
                <option value="approved">Approved</option>
                <option value="in_progress">In Progress (Design)</option>
                <option value="ready_to_publish">Ready to Publish</option>
                <option value="completed">Completed (Published)</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Payment</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full text-xs font-semibold p-2 bg-white border border-slate-200 rounded-lg cursor-pointer"
              >
                <option value="unpaid">Unpaid</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="paid">Paid</option>
                <option value="waived">Waived</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveStatus}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs py-2 px-3 rounded-lg cursor-pointer"
              >
                {saving ? 'Updating...' : 'Save Status'}
              </button>
            </div>
          </div>

          {/* Quick Publish Vacancy Action */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-blue-900">Publish to Live Directory</div>
              <div className="text-[11px] text-blue-700">Converts this request directly into a live vacancy on Jobsmart.lk</div>
            </div>
            <button
              onClick={handleConvertToJob}
              disabled={converting}
              className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs px-3.5 py-2 rounded-lg cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{converting ? 'Publishing...' : 'Convert to Vacancy'}</span>
            </button>
          </div>

          {/* Submitted Request Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900 pb-1 border-b">Employer & Contact</div>
              <div>Employer: <strong>{request.employer_name}</strong></div>
              <div>Contact: <strong>{request.contact_person}</strong> ({request.phone})</div>
              <div>Email: {request.email}</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900 pb-1 border-b">Vacancy Specs</div>
              <div>Title: <strong>{request.job_title}</strong></div>
              <div>Location: {request.location} · {request.employment_type || 'Full-Time'}</div>
              <div>Salary: {request.salary_info || 'Negotiable'}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 pb-1 border-b">Job Description</div>
            <p className="text-slate-700 whitespace-pre-line leading-relaxed">{request.job_description}</p>
          </div>

          {/* Poster Design Brief */}
          {!request.has_poster && (
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-3">
              <div className="font-bold text-purple-900 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-purple-700" />
                <span>Poster Design Brief</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-purple-900">
                <div>WhatsApp: {request.poster_whatsapp || request.phone}</div>
                <div>Email: {request.poster_email || request.email}</div>
                <div>Colors: {request.brand_colors || 'Default'}</div>
                <div>Notes: {request.design_instructions || 'None'}</div>
              </div>

              {/* Upload Completed Poster */}
              <form onSubmit={handleUploadPoster} className="pt-2 flex flex-col sm:flex-row gap-2">
                <input
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => setCompletedPosterFile(e.target.files?.[0] || null)}
                  className="text-xs file:py-1 file:px-2 file:rounded file:border-0 file:bg-purple-100 file:text-purple-800"
                />
                <input
                  type="text"
                  placeholder="Notes..."
                  value={posterNotes}
                  onChange={(e) => setPosterNotes(e.target.value)}
                  className="text-xs p-1.5 bg-white border border-slate-200 rounded flex-1"
                />
                <button
                  type="submit"
                  disabled={uploadingPoster || !completedPosterFile}
                  className="bg-purple-700 text-white font-semibold text-xs px-3 py-1.5 rounded cursor-pointer shrink-0"
                >
                  {uploadingPoster ? 'Uploading...' : 'Save Final Poster'}
                </button>
              </form>

              {/* Versions list */}
              {posterVersions.map((v) => (
                <div key={v.id} className="pt-1 flex items-center justify-between text-purple-900 border-t border-purple-100">
                  <span>Version {v.version_number} ({new Date(v.created_at).toLocaleDateString()})</span>
                  <a href={`/api/admin/files/${v.file_path}`} target="_blank" rel="noreferrer" className="text-purple-700 underline font-semibold">
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Files */}
          <div className="space-y-2">
            <div className="font-bold text-slate-900">Uploaded Files ({files.length})</div>
            {files.map((f) => (
              <div key={f.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">{f.original_filename}</span>
                  <span className="text-[10px] text-slate-400 ml-2">({f.file_type})</span>
                </div>
                {f.download_url ? (
                  <a href={f.download_url} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline">
                    Download
                  </a>
                ) : (
                  <span className="text-slate-400 text-xs">File link unavailable</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
