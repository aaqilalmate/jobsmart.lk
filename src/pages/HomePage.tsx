import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, ChevronRight, CheckCircle2, ShieldCheck, MapPinned, FileCheck } from 'lucide-react';
import { Job, JobCategory, Location } from '../types';
import { JobCard } from '../components/JobCard';
import { apiClient } from '../lib/api';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onSelectJob: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectJob }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [latestJobs, setLatestJobs] = useState<Job[]>([]);
  const [totalJobsCount, setTotalJobsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cats, locs, jobsData] = await Promise.all([
          apiClient.getCategories(),
          apiClient.getLocations(),
          apiClient.getJobs({ limit: 8 }),
        ]);

        setCategories(cats);
        setLocations(locs);
        setTotalJobsCount(jobsData.pagination?.total || jobsData.jobs.length);
        setLatestJobs(jobsData.jobs);

        const featured = jobsData.jobs.filter((j: Job) => Boolean(j.featured));
        setFeaturedJobs(featured.length > 0 ? featured.slice(0, 4) : jobsData.jobs.slice(0, 4));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchKeyword.trim()) params.set('q', searchKeyword.trim());
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedLocation !== 'all') params.set('location', selectedLocation);
    onNavigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* HERO SECTION - 100% RECRUITMENT FOCUSED FOR JOB SEEKERS */}
      <section className="relative bg-gradient-to-b from-blue-900 via-slate-900 to-slate-900 text-white pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Subtle geometric pattern backdrop */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-300 bg-blue-950/80 border border-blue-800/80 px-3.5 py-1.5 rounded-full">
              <span>Sri Lanka's Dedicated Job Portal</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
              Find Your Next Opportunity with <span className="text-blue-400">Jobsmart.lk</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Discover verified corporate vacancies, software roles, banking opportunities, and skilled careers across all 25 districts in Sri Lanka.
            </p>

            {/* HIGH CONTRAST SEARCH BAR */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 bg-white p-3 rounded-2xl shadow-xl border border-slate-200/80 text-slate-900 grid grid-cols-1 md:grid-cols-12 gap-2 text-left"
            >
              <div className="md:col-span-5 relative flex items-center px-3 py-2 border-b md:border-b-0 md:border-r border-slate-200">
                <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
                />
              </div>

              <div className="md:col-span-3 flex items-center px-3 py-2 border-b md:border-b-0 md:border-r border-slate-200">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0 mr-2" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full text-sm font-medium text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="all">All 25 Districts</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.slug}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex items-center px-3 py-2">
                <Briefcase className="w-5 h-5 text-slate-400 shrink-0 mr-2" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-sm font-medium text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="all">All Industries</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full h-full min-h-[46px] bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* Popular District Quick Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
              <span className="text-slate-400 font-medium">Popular Districts:</span>
              {['Colombo', 'Kandy', 'Galle', 'Gampaha', 'Kurunegala', 'Jaffna', 'Badulla', 'Anuradhapura'].map((district) => (
                <button
                  key={district}
                  onClick={() => onNavigate(`/jobs?location=${district.toLowerCase()}`)}
                  className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/60 transition-colors"
                >
                  {district}
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* SECTION: BROWSE BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Explore by Industry
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Browse Sri Lanka's leading employment sectors and find vacancies matching your specialization.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/jobs')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View all positions</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate(`/jobs?category=${cat.slug}`)}
              className="text-left p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between h-32"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm group-hover:bg-blue-700 group-hover:text-white transition-colors">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Explore roles</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* SECTION: FEATURED VACANCIES */}
      {featuredJobs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
                <span>Priority Corporate Recruitment</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Featured Vacancies
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/jobs?featured=1')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              <span>See all featured</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} onSelect={onSelectJob} />
            ))}
          </div>
        </section>
      )}

      {/* SECTION: LATEST VACANCIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Latest Job Vacancies
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Newly published positions from corporate institutions, financial firms, tech hubs, and growing enterprises.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/jobs')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Explore all {totalJobsCount} vacancies</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 bg-slate-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : latestJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {latestJobs.map((job) => (
              <JobCard key={job.id} job={job} onSelect={onSelectJob} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">No vacancies published currently</h3>
            <p className="text-xs text-slate-500 mt-1">Check back soon or post a vacancy.</p>
          </div>
        )}
      </section>

      {/* SECTION: ALL 25 DISTRICTS DIRECTORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
              <MapPinned className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Jobs Across All 25 Districts in Sri Lanka
              </h2>
              <p className="text-xs text-slate-500">
                We cover job opportunities across every single administrative district in all 9 provinces.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2">
            {locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => onNavigate(`/jobs?location=${loc.slug}`)}
                className="text-left px-3 py-2 rounded-lg text-xs font-medium bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200/70 transition-colors flex items-center justify-between group"
              >
                <span className="truncate">{loc.name}</span>
                <span className="text-[10px] text-slate-400 group-hover:text-blue-600 shrink-0 ml-1">
                  {loc.province.replace(' Province', '')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: TRUST & HOW IT WORKS (100% Focused on Job Seekers) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Why Job Seekers Choose Jobsmart.lk
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Built to provide high transparency, verified employers, and direct contact methods across Sri Lanka.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-base">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900">100% Free for Job Seekers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Job seekers never pay any registration fees or hidden charges. Apply directly to verified employers via WhatsApp or corporate career portals.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-base">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900">Standardized Clear Details</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clean structured vacancy cards with responsibilities, qualifications, transparent salary ranges, and confirmed application deadlines.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-base">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900">All 25 Districts Covered</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Discover localized vacancies spanning Western, Central, Southern, Northern, Eastern, North Western, North Central, Uva, and Sabaragamuwa provinces.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
