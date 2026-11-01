import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Job, JobCategory, Location } from '../../types';
import { apiClient } from '../../lib/api';

interface AdminJobModalProps {
  jobId: string | null; // null means new job
  onClose: () => void;
  onSaved: () => void;
}

export const AdminJobModal: React.FC<AdminJobModalProps> = ({ jobId, onClose, onSaved }) => {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    company_name: '',
    category_id: '',
    location_id: '',
    employment_type: 'Full-Time',
    workplace_type: 'On-site',
    salary_min: '',
    salary_max: '',
    salary_currency: 'LKR',
    salary_visible: true,
    description: '',
    responsibilities: '',
    requirements: '',
    experience_level: 'Mid Level (2-4 years)',
    application_method: 'whatsapp',
    career_url: '',
    whatsapp_number: '+94720312630',
    contact_email: '',
    external_instructions: '',
    deadline: '',
    featured: false,
    status: 'published',
  });

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [cats, locs] = await Promise.all([
          apiClient.getCategories(),
          apiClient.getLocations(),
        ]);
        if (cats) setCategories(cats);
        if (locs) setLocations(locs);

        if (jobId) {
          const j = await apiClient.getAdminJobById(jobId);
          if (j) {
            setForm({
              title: j.title || '',
              company_name: j.company_name || '',
              category_id: j.category_id || '',
              location_id: j.location_id || '',
              employment_type: j.employment_type || 'Full-Time',
              workplace_type: j.workplace_type || 'On-site',
              salary_min: j.salary_min ? j.salary_min.toString() : '',
              salary_max: j.salary_max ? j.salary_max.toString() : '',
              salary_currency: j.salary_currency || 'LKR',
              salary_visible: Boolean(j.salary_visible),
              description: j.description || '',
              responsibilities: j.responsibilities || '',
              requirements: j.requirements || '',
              experience_level: j.experience_level || '',
              application_method: j.application_method || 'whatsapp',
              career_url: j.career_url || '',
              whatsapp_number: j.whatsapp_number || '',
              contact_email: j.contact_email || '',
              external_instructions: j.external_instructions || '',
              deadline: j.deadline ? j.deadline.split('T')[0] : '',
              featured: Boolean(j.featured),
              status: j.status || 'published',
            });
          }
        } else if (cats && cats.length > 0 && locs && locs.length > 0) {
          setForm((prev) => ({
            ...prev,
            category_id: prev.category_id || cats[0].id,
            location_id: prev.location_id || locs[0].id,
          }));
        }
      } catch (err) {
        console.error('Failed to init job modal:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.company_name || !form.description) {
      setError('Title, Company Name, and Description are required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const result = await apiClient.saveAdminJob(jobId, {
        ...form,
        salary_min: form.salary_min ? parseFloat(form.salary_min) : null,
        salary_max: form.salary_max ? parseFloat(form.salary_max) : null,
        salary_visible: form.salary_visible ? 1 : 0,
        featured: form.featured ? 1 : 0,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to save job');
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || 'Error saving vacancy.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {jobId ? 'Edit Job Vacancy' : 'Create New Job Vacancy'}
            </h2>
            <p className="text-xs text-slate-500">
              Fill in all vacancy details for public listing and search indexing.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Senior Software Engineer"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                placeholder="e.g. Virtusa Sri Lanka"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Industry Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Location District</label>
              <select
                value={form.location_id}
                onChange={(e) => setForm({ ...form, location_id: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Employment Type</label>
              <select
                value={form.employment_type}
                onChange={(e) => setForm({ ...form, employment_type: e.target.value as any })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Workplace</label>
              <select
                value={form.workplace_type}
                onChange={(e) => setForm({ ...form, workplace_type: e.target.value as any })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Min Salary (LKR)</label>
              <input
                type="number"
                value={form.salary_min}
                onChange={(e) => setForm({ ...form, salary_min: e.target.value })}
                placeholder="e.g. 150000"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Max Salary (LKR)</label>
              <input
                type="number"
                value={form.salary_max}
                onChange={(e) => setForm({ ...form, salary_max: e.target.value })}
                placeholder="e.g. 250000"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Application Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Experience Level</label>
              <input
                type="text"
                value={form.experience_level}
                onChange={(e) => setForm({ ...form, experience_level: e.target.value })}
                placeholder="e.g. 2+ years"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Responsibilities</label>
              <textarea
                rows={3}
                value={form.responsibilities}
                onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
                placeholder="List key daily responsibilities..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Requirements</label>
              <textarea
                rows={3}
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                placeholder="Qualifications and skills required..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Application Routing */}
          <div className="p-4 bg-slate-50 rounded-xl space-y-4 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Application Channels
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={form.whatsapp_number}
                  onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                  placeholder="+94720312630"
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Career Portal URL</label>
                <input
                  type="url"
                  value={form.career_url}
                  onChange={(e) => setForm({ ...form, career_url: e.target.value })}
                  placeholder="https://company.lk/careers"
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Contact Email</label>
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                  placeholder="careers@company.lk"
                  className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Publishing Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Publication Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
              >
                <option value="published">Published (Live)</option>
                <option value="draft">Draft</option>
                <option value="expired">Expired</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Mark as Featured Vacancy</span>
              </label>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.salary_visible}
                  onChange={(e) => setForm({ ...form, salary_visible: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Show Salary Publicly</span>
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : jobId ? 'Update Vacancy' : 'Create Vacancy'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
