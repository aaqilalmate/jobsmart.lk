const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export class SupabaseError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export async function supabaseFetch<T>(path: string, options: RequestInit = {}, accessToken?: string): Promise<T> {
  if (!isSupabaseConfigured()) {
    throw new SupabaseError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', 503);
  }
  const headers = new Headers(options.headers);
  headers.set('apikey', SUPABASE_ANON_KEY!);
  headers.set('Authorization', `Bearer ${accessToken || SUPABASE_ANON_KEY}`);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${SUPABASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new SupabaseError(body.msg || body.message || body.error_description || body.error || `Supabase request failed (${response.status})`, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
