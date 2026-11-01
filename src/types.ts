export interface JobCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  display_order: number;
  job_count?: number;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  province: string;
  display_order: number;
  job_count?: number;
}

export interface Job {
  id: string;
  title: string;
  slug: string;
  company_name: string;
  company_logo_url: string | null;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  location_id: string;
  location_name?: string;
  location_slug?: string;
  location_province?: string;
  employment_type: 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship' | 'Temporary';
  workplace_type: 'On-site' | 'Remote' | 'Hybrid';
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  salary_visible: number | boolean;
  description: string;
  responsibilities: string;
  requirements: string;
  experience_level: string;
  application_method: 'portal' | 'whatsapp' | 'email' | 'mixed';
  career_url: string | null;
  whatsapp_number: string | null;
  contact_email: string | null;
  external_instructions: string | null;
  deadline: string | null;
  featured: number | boolean;
  status: 'draft' | 'published' | 'expired' | 'archived';
  views_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdRequestFile {
  id: string;
  request_id: string;
  file_type: 'poster' | 'logo' | 'supporting' | 'completed_poster';
  original_filename: string;
  storage_filename: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  download_url?: string;
}

export interface PosterVersion {
  id: string;
  request_id: string;
  version_number: number;
  file_path: string;
  notes: string | null;
  created_by_user_id: string;
  created_by_name?: string;
  created_at: string;
}

export interface AdRequest {
  id: string;
  reference_no: string;
  has_poster: number | boolean;
  employer_name: string;
  contact_person: string;
  email: string;
  phone: string;
  job_title: string;
  category_id: string | null;
  category_name?: string;
  location: string;
  employment_type: string | null;
  salary_info: string | null;
  job_description: string;
  responsibilities: string | null;
  requirements: string | null;
  experience_required: string | null;
  application_deadline: string | null;
  preferred_publish_date: string | null;
  application_url: string | null;
  poster_whatsapp: string | null;
  poster_email: string | null;
  brand_colors: string | null;
  design_instructions: string | null;
  additional_instructions: string | null;
  terms_accepted: number | boolean;
  status: 'pending_review' | 'awaiting_payment' | 'approved' | 'in_progress' | 'ready_to_publish' | 'completed' | 'rejected' | 'cancelled';
  payment_status: 'unpaid' | 'pending_verification' | 'paid' | 'refunded' | 'waived';
  payment_reference: string | null;
  payment_notes: string | null;
  assigned_to_user_id: string | null;
  assigned_to_name?: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  attachments?: AdRequestFile[];
  files?: AdRequestFile[];
  poster_versions?: PosterVersion[];
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin';
  must_change_password: boolean;
  is_active: boolean;
  created_at?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  username: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  created_at: string;
}
