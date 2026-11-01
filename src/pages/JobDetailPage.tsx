import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Building2,
  Calendar,
  Clock,
  Briefcase,
  Share2,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Mail,
  ArrowLeft,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Job } from '../types';
import { JobCard } from '../components/JobCard';
import { apiClient } from '../lib/api';

interface JobDetailPageProps {
  slug: string;
  onBack: () => void;
  onSelectJob: (slug: string) => void;
  onNavigate: (path: string) => void;
}

export const JobDetailPage: React.FC<JobDetailPageProps> = ({ slug, onBack, onSelectJob, onNavigate }) => {
  const [job, setJob] = useState<Job | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadJob() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.getJobBySlug(slug);
        if (res && res.job) {
          setJob(res.job);
          setRelatedJobs(res.relatedJobs || []);
        } else {
          setError('Job not found');
        }
      } catch (err: any) {
        setError('Failed to load job details. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [slug]);

  // Inject schema.org JobPosting structured data
  useEffect(() => {
    if (!job) return;

    const scriptId = 'jobposting-schema-jsonld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      description: `${job.description}\n\nKey Responsibilities:\n${job.responsibilities}\n\nRequirements:\n${job.requirements}`,
      datePosted: job.published_at || job.created_at,
      validThrough: job.deadline ? `${job.deadline}T23:59:59Z` : undefined,
      employmentType: job.employment_type === 'Full-Time' ? 'FULL_TIME' : job.employment_type === 'Part-Time' ? 'PART_TIME' : 'OTHER',
      hiringOrganization: {
        '@type': 'Organization',
        name: job.company_name,
        sameAs: job.career_url || undefined,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: job.location_name || 'Colombo',
          addressRegion: job.location_province || 'Western Province',
          addressCountry: 'LK',
        },
      },
      baseSalary: job.salary_visible && job.salary_min ? {
        '@type': 'MonetaryAmount',
        currency: 'LKR',
        value: {
          '@type': 'QuantitativeValue',
          minValue: job.salary_min,
          maxValue: job.salary_max || job.salary_min,
          unitText: 'MONTH',
        },
      } : undefined,
    };

    script.textContent = JSON.stringify(schemaData);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [job]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${job?.title} at ${job?.company_name} | Jobsmart.lk`,
        text: `Check out this vacancy: ${job?.title} on Jobsmart.lk`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <div className="h-6 w-32 bg-slate-200 animate-pulse rounded" />
        <div className="h-10 w-3/4 bg-slate-200 animate-pulse rounded" />
        <div className="h-64 bg-slate-200 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Job Vacancy Not Available</h2>
        <p className="text-xs text-slate-500">
          {error || 'This vacancy has expired or was removed by the employer.'}
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Vacancies</span>
        </button>
      </div>
    );
  }

  // Generate WhatsApp apply link
  const getWhatsAppUrl = () => {
    if (!job.whatsapp_number) return null;
    const cleanNumber = job.whatsapp_number.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Hello, I am interested in applying for the "${job.title}" position at "${job.company_name}" listed on Jobsmart.lk.`
    );
    return `https://wa.me/${cleanNumber}?text=${text}`;
  };

  const getMailtoUrl = () => {
    if (!job.contact_email) return null;
    const subject = encodeURIComponent(`Application for ${job.title} - Jobsmart.lk`);
    const body = encodeURIComponent(
      `Dear Hiring Team,\n\nI am writing to express my interest in the ${job.title} vacancy at ${job.company_name} advertised on Jobsmart.lk.\n\nPlease find attached my CV for your review.\n\nThank you.`
    );
    return `mailto:${job.contact_email}?subject=${subject}&body=${body}`;
  };

  const whatsappUrl = getWhatsAppUrl();
  const mailtoUrl = getMailtoUrl();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Breadcrumb / Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Vacancies</span>
        </button>
      </div>

      {/* Main Job Header Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        
        <div className="space-y-3">
          {job.featured ? (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Priority Featured Vacancy</span>
            </div>
          ) : null}

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {job.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700 font-medium">
            <span className="flex items-center gap-1.5 text-slate-900 font-semibold">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{job.company_name}</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="flex items-center gap-1 text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{job.location_name || 'Sri Lanka'}</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{job.employment_type}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{job.workplace_type}</span>
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 px-5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Salary</span>
            <span className="font-semibold text-slate-900 font-mono tabular-nums">
              {job.salary_visible && job.salary_min
                ? `LKR ${job.salary_min.toLocaleString()} ${job.salary_max ? `- ${job.salary_max.toLocaleString()}` : ''}`
                : 'Negotiable / Unspecified'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Experience Level</span>
            <span className="font-semibold text-slate-900">{job.experience_level || 'Open'}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Published</span>
            <span className="font-semibold text-slate-900">
              {job.published_at ? new Date(job.published_at).toLocaleDateString('en-GB') : 'Recent'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Deadline</span>
            <span className="font-semibold text-slate-900">
              {job.deadline ? new Date(job.deadline).toLocaleDateString('en-GB') : 'Open until filled'}
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          
          {/* Career Portal URL */}
          {job.career_url && (
            <a
              href={job.career_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-sm transition-all"
            >
              <span>Apply on Career Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* WhatsApp Direct */}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact via WhatsApp</span>
            </a>
          )}

          {/* Email Application */}
          {mailtoUrl && (
            <a
              href={mailtoUrl}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-sm transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Email Employer</span>
            </a>
          )}

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl transition-all"
          >
            <Share2 className="w-4 h-4 text-slate-500" />
            <span>{copied ? 'Link Copied!' : 'Share Vacancy'}</span>
          </button>

        </div>

      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Job Description & Details */}
        <div className="lg:col-span-8 space-y-8 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
          
          {/* Overview */}
          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
              About the Role
            </h2>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Key Responsibilities */}
          {job.responsibilities && (
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                Key Responsibilities
              </h2>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {job.responsibilities}
              </div>
            </div>
          )}

          {/* Requirements & Qualifications */}
          {job.requirements && (
            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                Requirements & Qualifications
              </h2>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {job.requirements}
              </div>
            </div>
          )}

          {/* Application Instructions */}
          {job.external_instructions && (
            <div className="space-y-3 p-4 rounded-xl bg-blue-50/60 border border-blue-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                Application Instructions
              </h3>
              <p className="text-xs text-blue-800 leading-relaxed">
                {job.external_instructions}
              </p>
            </div>
          )}

        </div>

        {/* Right Column: Employer Card & Safety Notice */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Employer Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Employer Details
            </h3>
            <div>
              <div className="text-base font-bold text-slate-900">{job.company_name}</div>
              <div className="text-xs text-slate-500 mt-1">{job.location_name}, Sri Lanka</div>
            </div>

            {job.career_url && (
              <a
                href={job.career_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Visit Company Careers</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <div>Reference: <span className="font-mono text-slate-700 font-semibold">{job.slug}</span></div>
              <div>Industry: <span className="text-slate-700">{job.category_name}</span></div>
            </div>
          </div>

          {/* Job Seeker Safe Recruitment Notice */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Jobsmart Safety Promise</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Jobsmart.lk does not charge any application or interview fees. Genuine employers will never ask for payment to process a job application.
            </p>
          </div>

        </div>

      </div>

      {/* RELATED JOBS */}
      {relatedJobs.length > 0 && (
        <div className="pt-10 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Related Vacancies in {job.category_name || 'this industry'}
            </h2>
            <button
              onClick={() => onNavigate(`/jobs?category=${job.category_slug || ''}`)}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800"
            >
              View more
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedJobs.map((rj) => (
              <div
                key={rj.id}
                onClick={() => onSelectJob(rj.slug)}
                className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer space-y-2"
              >
                <h4 className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-blue-700">
                  {rj.title}
                </h4>
                <div className="text-xs text-slate-600">{rj.company_name}</div>
                <div className="text-xs text-slate-400 font-mono tabular-nums">
                  {rj.location_name} · {rj.employment_type}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
