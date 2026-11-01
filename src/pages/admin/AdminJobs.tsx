import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Sparkles,
  Edit,
  Copy,
  Trash2,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Job } from '../../types';
import { AdminJobModal } from './AdminJobModal';
import { apiClient } from '../../lib/api';

interface AdminJobsProps {
  onNavigatePublic: (path: string) => void;
}

export const AdminJobs: React.FC<AdminJobsProps> = ({ onNavigatePublic }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAdminJobs({
        q: search.trim(),
        status: statusFilter,
        page,
        limit: 25,
      });
      if (data && data.jobs) {
        setJobs(data.jobs);
        setTotal(data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load admin jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [search, statusFilter, page]);

  const toggleFeatured = async (id: string, current: boolean) => {
    try {
      await apiClient.toggleAdminJobFeatured(id, current);
      loadJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await apiClient.updateAdminJobStatus(id, newStatus);
      loadJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await apiClient.duplicateAdminJob(id);
      loadJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vacancy? This cannot be undone.')) return;
    try {
      await apiClient.deleteAdminJob(id);
      loadJobs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Job Vacancies Management
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
            Total {total} vacancies in database
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedJobId(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vacancy</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search title, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="expired">Expired</option>
            <option value="archived">Archived</option>
          </select>

          <button
            onClick={loadJobs}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Title & Company</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Featured</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    Loading vacancies...
                  </td>
                </tr>
              ) : jobs.length > 0 ? (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 line-clamp-1">{job.title}</div>
                      <div className="text-[11px] text-slate-500">{job.company_name}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {job.category_name}
                    </td>

                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {job.location_name}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {job.employment_type}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={job.status}
                        onChange={(e) => updateStatus(job.id, e.target.value)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border-0 cursor-pointer focus:outline-none ${
                          job.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                          job.status === 'draft' ? 'bg-slate-100 text-slate-700' :
                          job.status === 'expired' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="expired">Expired</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleFeatured(job.id, Boolean(job.featured))}
                        className={`p-1 rounded transition-colors ${
                          job.featured ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-slate-400'
                        }`}
                        title="Toggle Featured"
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onNavigatePublic(`/jobs/${job.slug}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="View on site"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedJobId(job.id);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(job.id)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                          title="Duplicate as draft"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No vacancies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AdminJobModal
          jobId={selectedJobId}
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            setIsModalOpen(false);
            loadJobs();
          }}
        />
      )}

    </div>
  );
};
