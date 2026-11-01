import React from 'react';
import { MapPin, Building2, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { Job } from '../types';

interface JobCardProps {
  job: Job;
  onSelect: (jobSlug: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSelect }) => {
  const isFeatured = Boolean(job.featured);

  // Format salary
  const renderSalary = () => {
    if (!job.salary_visible) return null;
    if (job.salary_min && job.salary_max) {
      return `LKR ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} / mo`;
    }
    if (job.salary_min) {
      return `From LKR ${job.salary_min.toLocaleString()} / mo`;
    }
    return null;
  };

  const salaryString = renderSalary();

  // Format date
  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'Recently posted';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div
      onClick={() => onSelect(job.slug)}
      className={`group relative bg-white rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md p-6 ${
        isFeatured
          ? 'border-blue-300 ring-1 ring-blue-100 bg-linear-to-b from-blue-50/20 to-white'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Featured Indicator: quiet inline label, not a gaudy floating pill */}
      {isFeatured && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 mb-2.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Featured Vacancy</span>
        </div>
      )}

      {/* Main Job Title */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 mb-1.5">
        {job.title}
      </h3>

      {/* Company Name */}
      <div className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-3">
        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
        <span className="truncate">{job.company_name}</span>
      </div>

      {/* Clean Unboxed Metadata with middot separators (Zero-pill discipline) */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-4 font-normal">
        <span className="flex items-center gap-1 text-slate-700 font-medium">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{job.location_name || 'Sri Lanka'}</span>
        </span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span>{job.employment_type}</span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span>{job.workplace_type}</span>
        {job.category_name && (
          <>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{job.category_name}</span>
          </>
        )}
      </div>

      {/* Description Snippet */}
      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
        {job.description}
      </p>

      {/* Bottom Row: Salary & Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div>
          {salaryString ? (
            <span className="font-semibold text-slate-900 font-mono tabular-nums">
              {salaryString}
            </span>
          ) : (
            <span className="text-slate-400">Salary negotiable / Unspecified</span>
          )}
        </div>

        <div className="flex items-center gap-1 font-semibold text-blue-700 group-hover:translate-x-0.5 transition-transform">
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
