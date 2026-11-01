import { Job, JobCategory, Location, AdminUser, AdRequest, ActivityLog, ContactMessage, AdRequestFile, PosterVersion } from '../types';
import { SRI_LANKA_DISTRICTS, INITIAL_CATEGORIES } from '../data/sriLankanData';
import { supabaseFetch } from './supabase';

export const STORAGE_KEYS = {
  JOBS: 'jobsmart_jobs',
  CATEGORIES: 'jobsmart_categories',
  LOCATIONS: 'jobsmart_locations',
  REQUESTS: 'jobsmart_requests',
  SETTINGS: 'jobsmart_settings',
  ADMIN_USER: 'jobsmart_admin_user',
  AUTH_TOKEN: 'jobsmart_auth_token',
  MESSAGES: 'jobsmart_messages',
  ADMIN_USERS: 'jobsmart_admin_users',
  ACTIVITY_LOGS: 'jobsmart_activity_logs',
};

// Initialize localStorage fallback cache
function initializeLocalStore() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.LOCATIONS)) {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(SRI_LANKA_DISTRICTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
      employer_popup_enabled: true,
      site_name: 'Jobsmart.lk',
      headline: 'Find Your Next Opportunity with Jobsmart.lk'
    }));
  }
}

initializeLocalStore();

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

function getStoredJobs(): Job[] { return []; }
function saveStoredJobs(_jobs: Job[]) {}

function addActivityLog(username: string, action: string, entityType: string, details?: string) {
  try {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS) || '[]');
    logs.unshift({
      id: 'act_' + Date.now(),
      user_id: null,
      username,
      action,
      entity_type: entityType,
      entity_id: null,
      details: details || null,
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(logs.slice(0, 100)));
  } catch {}
}

export async function safeFetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; data?: T; status: number }> {
  try {
    const token = getStoredToken();
    const headers = new Headers(options?.headers || {});
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Ensure session cookies are sent across origin & iframe
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { ok: false, status: res.status };
    }

    const text = await res.text();
    if (!text || text.trim().length === 0) {
      return { ok: false, status: res.status };
    }

    const data = JSON.parse(text);
    return { ok: res.ok, data, status: res.status };
  } catch (err) {
    return { ok: false, status: 0 };
  }
}

export const apiClient = {
  // ----------------------------------------------------
  // PUBLIC CATEGORIES
  // ----------------------------------------------------
  async getCategories(): Promise<JobCategory[]> {
    const res = await safeFetchJson<{ categories: JobCategory[] }>('/api/categories');
    if (res.ok && res.data?.categories && res.data.categories.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(res.data.categories));
      return res.data.categories;
    }
    const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return stored ? JSON.parse(stored) : INITIAL_CATEGORIES;
  },

  // ----------------------------------------------------
  // PUBLIC LOCATIONS (All 25 Sri Lankan Districts)
  // ----------------------------------------------------
  async getLocations(): Promise<Location[]> {
    const res = await safeFetchJson<{ locations: Location[] }>('/api/locations');
    if (res.ok && res.data?.locations && res.data.locations.length >= 25) {
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(res.data.locations));
      return res.data.locations;
    }
    const stored = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    return stored ? JSON.parse(stored) : SRI_LANKA_DISTRICTS;
  },

  // ----------------------------------------------------
  // PUBLIC JOBS (with reactive search, district & salary filtering)
  // ----------------------------------------------------
  async getJobs(params: {
    q?: string;
    category?: string;
    location?: string;
    employment_type?: string;
    workplace_type?: string;
    featured?: string;
    min_salary?: number;
    include_negotiable?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ jobs: Job[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.location && params.location !== 'all') query.set('location', params.location);
    if (params.employment_type && params.employment_type !== 'all') query.set('employment_type', params.employment_type);
    if (params.workplace_type && params.workplace_type !== 'all') query.set('workplace_type', params.workplace_type);
    if (params.featured) query.set('featured', params.featured);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());

    const allJobs = await supabaseFetch<Job[]>(`/rest/v1/jobs?select=*,category:job_categories(name,slug),location:locations(name,slug,province)&status=eq.published&order=created_at.desc`);
    let filtered = allJobs.map((j: any) => ({ ...j, category_name: j.category?.name, category_slug: j.category?.slug, location_name: j.location?.name, location_slug: j.location?.slug, location_province: j.location?.province }));

    if (params.q && params.q.trim()) {
      const term = params.q.toLowerCase().trim();
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(term) ||
          j.company_name.toLowerCase().includes(term) ||
          (j.description && j.description.toLowerCase().includes(term))
      );
    }

    if (params.category && params.category !== 'all') {
      filtered = filtered.filter((j) => j.category_slug === params.category || j.category_id === params.category);
    }

    if (params.location && params.location !== 'all') {
      filtered = filtered.filter((j) => j.location_slug === params.location || j.location_id === params.location);
    }

    if (params.employment_type && params.employment_type !== 'all') {
      filtered = filtered.filter((j) => j.employment_type === params.employment_type);
    }

    if (params.workplace_type && params.workplace_type !== 'all') {
      filtered = filtered.filter((j) => j.workplace_type === params.workplace_type);
    }

    if (params.featured === '1') {
      filtered = filtered.filter((j) => Boolean(j.featured));
    }

    // Salary filter logic: min salary + negotiable tick box
    if (params.min_salary && params.min_salary > 0) {
      const minSalary = params.min_salary;
      filtered = filtered.filter((j) => {
        const isNegotiable = !j.salary_visible || !j.salary_min || j.salary_min === 0;
        if (params.include_negotiable && isNegotiable) return true;
        const max = j.salary_max || j.salary_min || 0;
        return max >= minSalary;
      });
    }

    const page = params.page || 1;
    const limit = params.limit || 12;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      jobs: paginated,
      pagination: { total, page, limit, totalPages },
    };
  },

  // ----------------------------------------------------
  // PUBLIC JOB BY SLUG
  // ----------------------------------------------------
  async getJobBySlug(slug: string): Promise<{ job: Job; relatedJobs: Job[] } | null> {
    const rows: any[] = await supabaseFetch(`/rest/v1/jobs?select=*,category:job_categories(name,slug),location:locations(name,slug,province)&slug=eq.${encodeURIComponent(slug)}&status=eq.published&limit=1`);
    const row = rows[0];
    const job = row ? { ...row, category_name: row.category?.name, category_slug: row.category?.slug, location_name: row.location?.name, location_slug: row.location?.slug, location_province: row.location?.province } as Job : null;
    if (!job) return null;
    const relatedRows: any[] = await supabaseFetch(`/rest/v1/jobs?select=*,category:job_categories(name,slug),location:locations(name,slug,province)&status=eq.published&id=neq.${job.id}&category_id=eq.${job.category_id}&limit=3`);
    const related = relatedRows.map((j) => ({ ...j, category_name: j.category?.name, category_slug: j.category?.slug, location_name: j.location?.name, location_slug: j.location?.slug, location_province: j.location?.province }));

    return { job, relatedJobs: related };
  },

  // ----------------------------------------------------
  // SETTINGS (Employer Ad Popup ON / OFF)
  // ----------------------------------------------------
  async getSettings(): Promise<{ employer_popup_enabled: boolean }> {
    const res = await safeFetchJson<{ settings: { employer_popup_enabled: boolean } }>('/api/settings/public');
    if (res.ok && res.data?.settings) {
      return res.data.settings;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { employer_popup_enabled: true };
  },

  async updateSettings(settings: { employer_popup_enabled: boolean }): Promise<boolean> {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      await safeFetchJson('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      return true;
    } catch {
      return true;
    }
  },

  // ----------------------------------------------------
  // ADMIN AUTHENTICATION
  // ----------------------------------------------------
  async adminLogin(username: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    try {
      const session: any = await supabaseFetch('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email: username.trim(), password }) });
      const role = session.user?.app_metadata?.admin_role;
      if (!['admin', 'super_admin'].includes(role)) throw new Error('This Supabase account is not authorized as an administrator.');
      const user: AdminUser = { id: session.user.id, username: session.user.email, email: session.user.email, full_name: session.user.user_metadata?.full_name || session.user.email, role, must_change_password: false, is_active: true };
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, session.access_token);
      localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(user));
      return { success: true, user };
    } catch (error: any) { return { success: false, error: error.message || 'Invalid email or password.' }; }
  },

  async getAdminMe(): Promise<AdminUser | null> {
    try {
      const token = getStoredToken(); if (!token) return null;
      const session: any = await supabaseFetch('/auth/v1/user', {}, token);
      const role = session.app_metadata?.admin_role;
      if (!['admin', 'super_admin'].includes(role)) return null;
      const user: AdminUser = { id: session.id, username: session.email, email: session.email, full_name: session.user_metadata?.full_name || session.email, role, must_change_password: false, is_active: true };
      localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(user)); return user;
    } catch {
      return null;
    }
  },

  async adminLogout(): Promise<void> {
    const token = getStoredToken();
    const currentUser = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
    if (currentUser) {
      try {
        const u = JSON.parse(currentUser);
        addActivityLog(u.username, 'Admin Logged Out', 'auth');
      } catch {}
    }
    localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) await supabaseFetch('/auth/v1/logout', { method: 'POST' }, token).catch(() => undefined);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_USER) || 'null');
      if (!currentUser?.email) throw new Error('Sign in again to change your password.');
      const session: any = await supabaseFetch('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email: currentUser.email, password: currentPassword }) });
      await supabaseFetch('/auth/v1/user', { method: 'PUT', body: JSON.stringify({ password: newPassword }) }, session.access_token);
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, session.access_token);
      return { success: true };
    } catch (error: any) { return { success: false, error: error.message || 'Failed to change password.' }; }
  },

  // ----------------------------------------------------
  // ADMIN VACANCY CRUD (Resilient and always populated)
  // ----------------------------------------------------
  async getAdminJobs(params: {
    q?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ jobs: Job[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const query = new URLSearchParams();
    if (params.q) query.set('q', params.q);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());

    const rows: any[] = await supabaseFetch(`/rest/v1/jobs?select=*,category:job_categories(name,slug),location:locations(name,slug,province)&order=created_at.desc`, {}, getStoredToken() || undefined);
    let filtered: Job[] = rows.map((j) => ({ ...j, category_name: j.category?.name, category_slug: j.category?.slug, location_name: j.location?.name, location_slug: j.location?.slug, location_province: j.location?.province }));

    if (params.q && params.q.trim()) {
      const term = params.q.toLowerCase().trim();
      filtered = filtered.filter(
        (j) =>
          j.title.toLowerCase().includes(term) ||
          j.company_name.toLowerCase().includes(term) ||
          (j.description && j.description.toLowerCase().includes(term))
      );
    }

    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((j) => j.status === params.status);
    }

    const page = params.page || 1;
    const limit = params.limit || 25;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      jobs: paginated,
      pagination: { total, page, limit, totalPages },
    };
  },

  async getAdminJobById(id: string): Promise<Job | null> {
    const rows: any[] = await supabaseFetch(`/rest/v1/jobs?select=*,category:job_categories(name,slug),location:locations(name,slug,province)&id=eq.${encodeURIComponent(id)}&limit=1`, {}, getStoredToken() || undefined);
    return rows[0] || null;
  },

  async saveAdminJob(id: string | null, jobData: any): Promise<{ success: boolean; job?: Job; error?: string }> {
    try {
      const timestamp = new Date().toISOString();
      const payload = { ...jobData, salary_visible: Boolean(jobData.salary_visible), featured: Boolean(jobData.featured), deadline: jobData.deadline || null, updated_at: timestamp, ...(id ? {} : { id: crypto.randomUUID(), slug: `${String(jobData.title || 'job').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`, created_at: timestamp, views_count: 0, published_at: jobData.status === 'published' ? timestamp : null }) };
      const saved: Job[] = await supabaseFetch(`/rest/v1/jobs${id ? `?id=eq.${encodeURIComponent(id)}` : ''}`, { method: id ? 'PATCH' : 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(payload) }, getStoredToken() || undefined);
      return { success: true, job: saved[0] };
    } catch (error: any) { return { success: false, error: error.message || 'Unable to save job.' }; }
  },

  async deleteAdminJob(id: string): Promise<boolean> {
    await supabaseFetch(`/rest/v1/jobs?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' }, getStoredToken() || undefined); return true;
  },

  async toggleAdminJobFeatured(id: string, current: boolean): Promise<boolean> {
    await supabaseFetch(`/rest/v1/jobs?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ featured: !current, updated_at: new Date().toISOString() }) }, getStoredToken() || undefined); return true;
  },

  async updateAdminJobStatus(id: string, newStatus: string): Promise<boolean> {
    await supabaseFetch(`/rest/v1/jobs?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus, updated_at: new Date().toISOString() }) }, getStoredToken() || undefined); return true;
  },

  async duplicateAdminJob(id: string): Promise<Job | null> {
    const source = await this.getAdminJobById(id);
    if (!source) return null;
    const { id: _id, category_name: _categoryName, category_slug: _categorySlug, location_name: _locationName, location_slug: _locationSlug, location_province: _locationProvince, ...data } = source;
    const copy = await this.saveAdminJob(null, { ...data, title: `${source.title} (Copy)`, status: 'draft', featured: false, published_at: null, views_count: 0 });
    return copy.job || null;
  },

  // ----------------------------------------------------
  // ADMIN DASHBOARD & METRICS
  // ----------------------------------------------------
  async getAdminMetrics(): Promise<any> {
    const token = getStoredToken() || undefined;
    const [allJobs, requests] = await Promise.all([
      supabaseFetch<Job[]>('/rest/v1/jobs?select=*&order=created_at.desc', {}, token),
      supabaseFetch<AdRequest[]>('/rest/v1/ad_requests?select=*&order=created_at.desc', {}, token),
    ]);

    const totalJobs = allJobs.length;
    const publishedJobs = allJobs.filter((j) => j.status === 'published').length;
    const draftJobs = allJobs.filter((j) => j.status === 'draft').length;
    const expiredJobs = allJobs.filter((j) => j.status === 'expired').length;

    const totalRequests = requests.length;
    const pendingRequests = requests.filter((r) => r.status === 'pending_review').length;
    const posterDesignRequests = requests.filter((r) => !r.has_poster && r.status !== 'completed' && r.status !== 'rejected').length;
    const inProgressRequests = requests.filter((r) => r.status === 'in_progress').length;
    const completedRequests = requests.filter((r) => r.status === 'completed').length;
    const unpaidRequests = requests.filter((r) => r.payment_status === 'unpaid').length;

    return {
      metrics: {
        totalJobs,
        publishedJobs,
        draftJobs,
        expiredJobs,
        totalRequests,
        pendingRequests,
        posterDesignRequests,
        inProgressRequests,
        completedRequests,
        unpaidRequests,
      },
      recentJobs: allJobs.slice(0, 5),
      recentRequests: requests.slice(0, 5),
      recentActivity: [],
    };
  },

  // ----------------------------------------------------
  // ADMIN REQUESTS
  // ----------------------------------------------------
  async getAdminRequests(params: {
    q?: string;
    status?: string;
    payment_status?: string;
    has_poster?: string;
    page?: number;
    limit?: number;
  }): Promise<{ requests: AdRequest[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    let filtered: AdRequest[] = await supabaseFetch('/rest/v1/ad_requests?select=*&order=created_at.desc', {}, getStoredToken() || undefined);

    if (params.q && params.q.trim()) {
      const term = params.q.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.reference_no.toLowerCase().includes(term) ||
          r.employer_name.toLowerCase().includes(term) ||
          r.job_title.toLowerCase().includes(term) ||
          r.phone.includes(term)
      );
    }

    if (params.status && params.status !== 'all') {
      filtered = filtered.filter((r) => r.status === params.status);
    }

    if (params.payment_status && params.payment_status !== 'all') {
      filtered = filtered.filter((r) => r.payment_status === params.payment_status);
    }

    if (params.has_poster && params.has_poster !== 'all') {
      const val = parseInt(params.has_poster, 10);
      filtered = filtered.filter((r) => (r.has_poster ? 1 : 0) === val);
    }

    const page = params.page || 1;
    const limit = params.limit || 25;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      requests: paginated,
      pagination: { total, page, limit, totalPages },
    };
  },

  async getAdminRequestById(id: string): Promise<{ request: AdRequest; files: AdRequestFile[]; posterVersions: PosterVersion[] } | null> {
    const rows: AdRequest[] = await supabaseFetch(`/rest/v1/ad_requests?select=*&id=eq.${encodeURIComponent(id)}&limit=1`, {}, getStoredToken() || undefined);
    const req = rows[0];
    if (!req) return null;
    const files = await Promise.all((req.attachments || []).map(async (file) => {
      try {
        const path = file.storage_filename.split('/').map(encodeURIComponent).join('/');
        const signed = await supabaseFetch<{ signedURL: string }>(
          `/storage/v1/object/sign/jobsmart-submissions/${path}`,
          { method: 'POST', body: JSON.stringify({ expiresIn: 3600 }) },
          getStoredToken() || undefined,
        );
        const signedPath = signed.signedURL.startsWith('http')
          ? signed.signedURL
          : `/storage/v1${signed.signedURL}`;
        return { ...file, download_url: new URL(signedPath, import.meta.env.VITE_SUPABASE_URL).toString() };
      } catch {
        return file;
      }
    }));
    return {
      request: req,
      files,
      posterVersions: req.poster_versions || [],
    };
  },

  async updateAdminRequest(id: string, data: Partial<AdRequest>): Promise<boolean> {
    await supabaseFetch(`/rest/v1/ad_requests?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH', headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ ...data, updated_at: new Date().toISOString() }),
    }, getStoredToken() || undefined);
    return true;
  },

  // ----------------------------------------------------
  // ADMIN CONTACT INQUIRIES
  // ----------------------------------------------------
  async getAdminContactMessages(): Promise<ContactMessage[]> {
    return supabaseFetch('/rest/v1/contact_messages?select=*&order=created_at.desc', {}, getStoredToken() || undefined);
  },

  async updateAdminContactMessage(id: string, status: string): Promise<boolean> {
    await supabaseFetch(`/rest/v1/contact_messages?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status }),
    }, getStoredToken() || undefined);
    return true;
  },

  // ----------------------------------------------------
  // ADMIN USERS (Team)
  // ----------------------------------------------------
  async getAdminUsers(): Promise<AdminUser[]> {
    const res = await safeFetchJson<{ users: AdminUser[] }>('/api/admin/users');
    if (res.ok && res.data?.users) {
      return res.data.users;
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_USERS) || '[]');
  },

  async createAdminUser(userData: any): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    try {
      const res = await safeFetchJson<{ success: boolean; user: AdminUser; error?: string }>('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (res.ok && res.data?.user) {
        return { success: true, user: res.data.user };
      }
    } catch {}

    const users: AdminUser[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_USERS) || '[]');
    const newUser: AdminUser = {
      id: 'usr_' + Date.now(),
      username: userData.username.trim().toLowerCase(),
      email: userData.email.trim(),
      full_name: userData.full_name.trim(),
      role: userData.role || 'admin',
      must_change_password: false,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));
    addActivityLog('admin', 'Created Admin User', 'user', newUser.username);
    return { success: true, user: newUser };
  },

  // ----------------------------------------------------
  // ADMIN ACTIVITY LOGS
  // ----------------------------------------------------
  async getAdminActivityLogs(page = 1, limit = 25): Promise<{ logs: ActivityLog[]; total: number; totalPages: number }> {
    const res = await safeFetchJson<{ logs: ActivityLog[]; total: number; totalPages: number }>(`/api/admin/activity-logs?page=${page}&limit=${limit}`);
    if (res.ok && res.data?.logs) {
      return res.data;
    }
    const all: ActivityLog[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS) || '[]');
    const total = all.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    return {
      logs: all.slice(start, start + limit),
      total,
      totalPages,
    };
  },

  // ----------------------------------------------------
  // PUBLIC CONTACT SUBMISSION
  // ----------------------------------------------------
  async submitContact(data: { full_name: string; email: string; phone?: string; subject: string; message: string }): Promise<{ success: boolean; message: string }> {
    await supabaseFetch('/rest/v1/contact_messages', {
      method: 'POST', headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ ...data, phone: data.phone || null }),
    });
    return { success: true, message: 'Thank you for reaching out. We will get back to you shortly.' };
  },

  // ----------------------------------------------------
  // PUBLIC AD REQUEST SUBMISSION
  // ----------------------------------------------------
  async submitAdRequest(formData: FormData): Promise<{ success: boolean; reference_no?: string; error?: string }> {
    const selectedFiles = [
      ...formData.getAll('poster_file').filter((value): value is File => value instanceof File && value.size > 0).map((file) => ({ file, file_type: 'poster' as const })),
      ...formData.getAll('logo_file').filter((value): value is File => value instanceof File && value.size > 0).map((file) => ({ file, file_type: 'logo' as const })),
      ...formData.getAll('supporting_files').filter((value): value is File => value instanceof File && value.size > 0).map((file) => ({ file, file_type: 'supporting' as const })),
    ];
    if (selectedFiles.length > 3) return { success: false, error: 'Please attach no more than three files.' };
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
    for (const { file, file_type } of selectedFiles) {
      if (file.size > 10 * 1024 * 1024) return { success: false, error: `${file.name} is larger than the 10 MB limit.` };
      if (!allowedTypes.has(file.type) || (file_type === 'logo' && file.type === 'application/pdf')) {
        return { success: false, error: `${file.name} is not an allowed file type.` };
      }
    }
    const randomSuffix = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
    const reference_no = `JS-${new Date().getFullYear()}-${randomSuffix}`;
    const request_id = crypto.randomUUID();
    const attachments: AdRequestFile[] = [];
    for (const { file, file_type } of selectedFiles) {
      const extension = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'pdf';
      const storage_filename = `${reference_no}/${crypto.randomUUID()}.${extension}`;
      const path = storage_filename.split('/').map(encodeURIComponent).join('/');
      await supabaseFetch(`/storage/v1/object/jobsmart-submissions/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': file.type, 'x-upsert': 'false' },
        body: file,
      });
      attachments.push({
        id: crypto.randomUUID(), request_id, file_type,
        original_filename: file.name, storage_filename,
        mime_type: file.type, file_size: file.size, created_at: new Date().toISOString(),
      });
    }
    const value = (key: string) => String(formData.get(key) || '').trim() || null;
    const payload = {
      id: request_id, reference_no, attachments, employer_name: value('employer_name'), contact_person: value('contact_person'),
      email: value('email'), phone: value('phone'), job_title: value('job_title'),
      category_id: value('category_id'), location: value('location'), employment_type: value('employment_type'),
      salary_info: value('salary_info'), job_description: value('job_description'), responsibilities: value('responsibilities'),
      requirements: value('requirements'), experience_required: value('experience_required'), application_deadline: value('application_deadline'),
      preferred_publish_date: value('preferred_publish_date'), application_url: value('application_url'), poster_whatsapp: value('poster_whatsapp'),
      poster_email: value('poster_email'), brand_colors: value('brand_colors'), design_instructions: value('design_instructions'),
      additional_instructions: value('additional_instructions'), terms_accepted: true, has_poster: formData.get('has_poster') === '1',
    };
    await supabaseFetch('/rest/v1/ad_requests', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(payload) });
    return { success: true, reference_no };
  },

  // ----------------------------------------------------
  // PUBLIC TRACK AD REQUEST
  // ----------------------------------------------------
  async trackRequest(ref: string): Promise<any | null> {
    const rows: any[] = await supabaseFetch(`/rest/v1/rpc/track_ad_request`, { method: 'POST', body: JSON.stringify({ p_reference_no: ref.trim().toUpperCase() }) });
    return rows[0] || null;
  },
};
