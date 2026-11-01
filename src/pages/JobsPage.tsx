import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, X, ChevronLeft, ChevronRight, Briefcase, RefreshCw, SlidersHorizontal, Banknote, Check } from 'lucide-react';
import { Job, JobCategory, Location } from '../types';
import { JobCard } from '../components/JobCard';
import { apiClient } from '../lib/api';

interface JobsPageProps {
  initialSearch?: string;
  initialCategory?: string;
  initialLocation?: string;
  initialWorkplace?: string;
  initialEmployment?: string;
  initialFeatured?: string;
  onSelectJob: (slug: string) => void;
  onNavigate: (path: string) => void;
}

export const JobsPage: React.FC<JobsPageProps> = ({
  initialSearch = '',
  initialCategory = 'all',
  initialLocation = 'all',
  initialWorkplace = 'all',
  initialEmployment = 'all',
  initialFeatured = '',
  onSelectJob,
  onNavigate,
}) => {
  const [q, setQ] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState(initialLocation);
  const [workplace, setWorkplace] = useState(initialWorkplace);
  const [employment, setEmployment] = useState(initialEmployment);
  const [featuredOnly, setFeaturedOnly] = useState(initialFeatured === '1' || initialFeatured === 'true');
  
  // Salary Filters requested by user
  const [minSalary, setMinSalary] = useState<string>('');
  const [includeNegotiable, setIncludeNegotiable] = useState<boolean>(true);

  const [sort, setSort] = useState<'newest' | 'salary_high' | 'oldest'>('newest');
  const [page, setPage] = useState(1);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    setQ(initialSearch);
    setCategory(initialCategory);
    setLocation(initialLocation);
    setWorkplace(initialWorkplace);
    setEmployment(initialEmployment);
    setFeaturedOnly(initialFeatured === '1' || initialFeatured === 'true');
    setPage(1);
  }, [initialSearch, initialCategory, initialLocation, initialWorkplace, initialEmployment, initialFeatured]);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, locs] = await Promise.all([
          apiClient.getCategories(),
          apiClient.getLocations(),
        ]);
        setCategories(cats);
        setLocations(locs);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    }
    loadMeta();
  }, []);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        const salaryVal = minSalary ? parseInt(minSalary.replace(/[^0-9]/g, ''), 10) : 0;
        const res = await apiClient.getJobs({
          q,
          category,
          location,
          workplace_type: workplace,
          employment_type: employment,
          featured: featuredOnly ? '1' : undefined,
          min_salary: salaryVal > 0 ? salaryVal : undefined,
          include_negotiable: includeNegotiable,
          page,
          limit: 12,
        });

        // Apply sorting
        let sortedJobs = [...res.jobs];
        if (sort === 'salary_high') {
          sortedJobs.sort((a, b) => (b.salary_max || b.salary_min || 0) - (a.salary_max || a.salary_min || 0));
        } else if (sort === 'oldest') {
          sortedJobs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        }

        setJobs(sortedJobs);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [q, category, location, workplace, employment, featuredOnly, minSalary, includeNegotiable, sort, page]);

  const handleClearFilters = () => {
    setQ('');
    setCategory('all');
    setLocation('all');
    setWorkplace('all');
    setEmployment('all');
    setFeaturedOnly(false);
    setMinSalary('');
    setIncludeNegotiable(true);
    setPage(1);
  };

  const hasActiveFilters =
    q !== '' ||
    category !== 'all' ||
    location !== 'all' ||
    workplace !== 'all' ||
    employment !== 'all' ||
    featuredOnly ||
    minSalary !== '';

  const FilterSidebar = () => (
    <div className="space-y-6">
      
      {/* Search Header inside sidebar for mobile */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Filter className="w-4 h-4 text-blue-700" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
          >
            Reset all
          </button>
        )}
      </div>

      {/* SALARY FILTER SECTION (User Requested) */}
      <div className="space-y-3 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900">
          <Banknote className="w-4 h-4 text-emerald-600" />
          <span>Salary (LKR / Month)</span>
        </div>

        <div>
          <label className="text-[11px] font-medium text-slate-500 mb-1 block">
            Minimum Salary (Rs.)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-400">Rs.</span>
            <input
              type="text"
              placeholder="e.g. 100,000"
              value={minSalary}
              onChange={(e) => {
                const numeric = e.target.value.replace(/[^0-9]/g, '');
                setMinSalary(numeric);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Quick Salary Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {['50000', '100000', '200000', '350000'].map((val) => {
            const isSelected = minSalary === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setMinSalary(isSelected ? '' : val);
                  setPage(1);
                }}
                className={`text-[10px] px-2 py-1 rounded-md font-semibold border transition-colors ${
                  isSelected
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Rs. {parseInt(val, 10).toLocaleString()}+
              </button>
            );
          })}
        </div>

        {/* Negotiable Salary Tick Box */}
        <label className="flex items-start gap-2 pt-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeNegotiable}
            onChange={(e) => {
              setIncludeNegotiable(e.target.checked);
              setPage(1);
            }}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 mt-0.5"
          />
          <span className="text-xs text-slate-700 font-medium">
            Include Negotiable / Open Salary
            <span className="block text-[10px] text-slate-400 font-normal">
              Shows vacancies with salary to be decided during interview
            </span>
          </span>
        </label>
      </div>

      {/* DISTRICT FILTER (All 25 Sri Lankan Districts) */}
      <div className="space-y-3 pb-6 border-b border-slate-200">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
          District (All 25 Districts)
        </label>
        <select
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setPage(1);
          }}
          className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
        >
          <option value="all">All 25 Districts (Island-wide)</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.slug}>
              {loc.name} ({loc.province.replace(' Province', '')})
            </option>
          ))}
        </select>
      </div>

      {/* INDUSTRY CATEGORY */}
      <div className="space-y-3 pb-6 border-b border-slate-200">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
          Industry & Field
        </label>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* EMPLOYMENT TYPE */}
      <div className="space-y-3 pb-6 border-b border-slate-200">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
          Employment Type
        </label>
        <div className="space-y-2">
          {['all', 'Full-Time', 'Part-Time', 'Contract', 'Internship'].map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="radio"
                name="employment_type"
                value={type}
                checked={employment === type}
                onChange={() => {
                  setEmployment(type);
                  setPage(1);
                }}
                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>{type === 'all' ? 'Any Type' : type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* WORKPLACE MODE */}
      <div className="space-y-3 pb-6 border-b border-slate-200">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
          Workplace Mode
        </label>
        <div className="space-y-2">
          {['all', 'On-site', 'Hybrid', 'Remote'].map((mode) => (
            <label key={mode} className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="radio"
                name="workplace_type"
                value={mode}
                checked={workplace === mode}
                onChange={() => {
                  setWorkplace(mode);
                  setPage(1);
                }}
                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span>{mode === 'all' ? 'Any Mode' : mode}</span>
            </label>
          ))}
        </div>
      </div>

      {/* FEATURED ONLY */}
      <div className="pt-1">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 select-none">
          <input
            type="checkbox"
            checked={featuredOnly}
            onChange={(e) => {
              setFeaturedOnly(e.target.checked);
              setPage(1);
            }}
            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
          />
          <span>Priority Featured Vacancies Only</span>
        </label>
      </div>

    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* PAGE HEADER */}
      <div className="mb-8 space-y-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Find Job Vacancies in Sri Lanka
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse verified career openings across all 25 districts. Filter by location, industry, or expected salary.
          </p>
        </div>

        {/* SEARCH BAR & QUICK SORT */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-8 relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by job title, company name, skills, or responsibilities..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-3 py-2 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            {q && (
              <button
                onClick={() => setQ('')}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {hasActiveFilters && '(Active)'}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium shrink-0">Sort:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="salary_high">Highest Salary</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* ACTIVE FILTER BADGES */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold">Active:</span>
            {q && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium border border-blue-200">
                Keyword: "{q}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setQ('')} />
              </span>
            )}
            {location !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium border border-blue-200">
                District: {locations.find((l) => l.slug === location)?.name || location}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setLocation('all')} />
              </span>
            )}
            {category !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-medium border border-blue-200">
                Category: {categories.find((c) => c.slug === category)?.name || category}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setCategory('all')} />
              </span>
            )}
            {minSalary && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-medium border border-emerald-200">
                Min. Rs. {parseInt(minSalary, 10).toLocaleString()}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setMinSalary('')} />
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline underline-offset-2 ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs sticky top-24">
          <FilterSidebar />
        </aside>

        {/* RESULTS GRID */}
        <main className="lg:col-span-9 space-y-6">
          
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Showing <strong className="text-slate-900">{jobs.length}</strong> of{' '}
              <strong className="text-slate-900">{total}</strong> vacancies
            </span>
            {totalPages > 1 && (
              <span>Page {page} of {totalPages}</span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} onSelect={onSelectJob} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">{total === 0 ? 'No jobs published yet' : 'No vacancies match your criteria'}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {total === 0 ? 'Please check back soon for new opportunities.' : 'Try adjusting your search terms, clearing selected districts, or lowering your minimum salary filter.'}
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-2 inline-flex items-center gap-2 text-xs font-semibold bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset all filters</span>
              </button>
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1 text-xs font-semibold">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg ${
                      page === p
                        ? 'bg-blue-700 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </main>
      </div>

      {/* MOBILE FILTER MODAL DRAWER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex justify-end md:hidden">
          <div className="w-full max-w-xs bg-white h-full min-h-screen p-6 space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6 overflow-y-auto flex-1 pr-1">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">Filter Vacancies</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-slate-500 hover:text-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterSidebar />
            </div>
            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full bg-blue-700 text-white text-xs font-semibold py-3 rounded-xl shadow-sm"
              >
                Apply Filters & Show {total} Results
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
