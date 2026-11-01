import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Inbox,
  Palette,
  Clock,
  CheckCircle,
  FileText,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Plus
} from 'lucide-react';

import { apiClient } from '../../lib/api';

interface AdminDashboardProps {
  onSelectTab: (tab: string) => void;
  onOpenJobForm: () => void;
  onSelectRequest: (requestId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSelectTab,
  onOpenJobForm,
  onSelectRequest,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [employerPopupEnabled, setEmployerPopupEnabled] = useState(true);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        // Load settings
        const settings = await apiClient.getSettings();
        setEmployerPopupEnabled(Boolean(settings.employer_popup_enabled));

        // Load metrics safely via apiClient
        const metricsData = await apiClient.getAdminMetrics();
        setData(metricsData);
      } catch (err) {
        console.error('Failed to load metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const handleTogglePopup = async () => {
    try {
      setUpdatingSettings(true);
      const nextState = !employerPopupEnabled;
      setEmployerPopupEnabled(nextState);
      await apiClient.updateSettings({ employer_popup_enabled: nextState });
    } catch (err) {
      console.error('Failed to toggle employer popup:', err);
    } finally {
      setUpdatingSettings(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const { metrics, recentJobs, recentRequests, recentActivity } = data;

  return (
    <div className="space-y-8">
      
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status of job vacancies, advertiser requests, and administrative operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenJobForm}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Vacancy</span>
          </button>
        </div>
      </div>

      {/* EMPLOYER AD POPUP CONTROL (User requested: can ON & OFF in admin panel) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Employer "Post a Vacancy" Popup Modal
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                employerPopupEnabled
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border border-slate-300'
              }`}
            >
              {employerPopupEnabled ? 'POPUP ACTIVE (ON)' : 'POPUP DISABLED (OFF)'}
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            When enabled, clicking <strong>"Post a Vacancy"</strong> opens the modal with promotional flyer & WhatsApp routing. When disabled, it navigates directly to the application form.
          </p>
        </div>

        <button
          onClick={handleTogglePopup}
          disabled={updatingSettings}
          className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
            employerPopupEnabled
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
          }`}
        >
          <span>{employerPopupEnabled ? 'Turn OFF Popup' : 'Turn ON Popup'}</span>
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Total Vacancies */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Vacancies</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {metrics.totalJobs}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span className="text-emerald-600 font-semibold">{metrics.publishedJobs} Live</span>
            <span>·</span>
            <span>{metrics.draftJobs} Drafts</span>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Pending Ad Requests</span>
            <Inbox className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono tabular-nums">
            {metrics.pendingRequests}
          </div>
          <div className="text-[11px] text-slate-500">
            Requires initial review
          </div>
        </div>

        {/* Poster Design Requests */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Poster Design Queue</span>
            <Palette className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 font-mono tabular-nums">
            {metrics.posterDesignRequests}
          </div>
          <div className="text-[11px] text-slate-500">
            Employer needs poster designed
          </div>
        </div>

        {/* Completed Requests */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Completed Requests</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
            {metrics.completedRequests}
          </div>
          <div className="text-[11px] text-slate-500">
            Published and distributed
          </div>
        </div>

      </div>

      {/* TWO COLUMN SUMMARY: RECENT REQUESTS & VACANCIES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Advertiser Requests */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Latest Advertiser Requests
            </h2>
            <button
              onClick={() => onSelectTab('requests')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentRequests.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentRequests.map((req: any) => (
                <div
                  key={req.id}
                  onClick={() => onSelectRequest(req.id)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-700">
                        {req.reference_no}
                      </span>
                      <span className="text-xs font-semibold text-slate-900">
                        {req.job_title}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {req.employer_name} · {req.has_poster ? 'Has Poster' : 'Needs Poster Design'}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                      req.status === 'pending_review' ? 'bg-amber-100 text-amber-800' :
                      req.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {req.status.replace('_', ' ')}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {new Date(req.created_at).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No advertiser requests yet.
            </div>
          )}
        </div>

        {/* Recent Job Vacancies */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">
              Recently Posted Vacancies
            </h2>
            <button
              onClick={() => onSelectTab('jobs')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentJobs.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentJobs.map((j: any) => (
                <div key={j.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="truncate max-w-[200px]">
                    <div className="font-semibold text-slate-900 truncate">{j.title}</div>
                    <div className="text-[11px] text-slate-500 truncate">{j.company_name}</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                    j.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                    j.status === 'draft' ? 'bg-slate-100 text-slate-700' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {j.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No vacancies listed.
            </div>
          )}
        </div>

      </div>

      {/* RECENT ACTIVITY LOGS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            Recent Administrative Activity
          </h2>
          <button
            onClick={() => onSelectTab('activity')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View all logs
          </button>
        </div>

        <div className="space-y-2">
          {recentActivity.map((log: any) => (
            <div key={log.id} className="text-xs flex items-center justify-between py-1.5 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 font-mono">@{log.username}</span>
                <span className="text-slate-600">{log.action}</span>
                {log.details && <span className="text-slate-400">({log.details})</span>}
              </div>
              <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
