import React, { useState, useEffect } from 'react';
import {
  FileImage,
  Palette,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Building,
  User,
  Mail,
  Phone,
  FileText,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { JobCategory } from '../types';
import { apiClient } from '../lib/api';

interface AdvertiseApplyPageProps {
  onNavigate: (path: string) => void;
}

export const AdvertiseApplyPage: React.FC<AdvertiseApplyPageProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [hasPoster, setHasPoster] = useState<boolean | null>(null);
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [referenceNo, setReferenceNo] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    employer_name: '',
    contact_person: '',
    email: '',
    phone: '',
    job_title: '',
    category_id: '',
    location: '',
    employment_type: 'Full-Time',
    salary_info: '',
    job_description: '',
    responsibilities: '',
    requirements: '',
    experience_required: '',
    application_deadline: '',
    preferred_publish_date: '',
    application_url: '',
    poster_whatsapp: '',
    poster_email: '',
    brand_colors: '',
    design_instructions: '',
    additional_instructions: '',
    terms_accepted: false,
  });

  // Files
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [supportingFiles, setSupportingFiles] = useState<File[]>([]);

  useEffect(() => {
    apiClient.getCategories().then((cats) => {
      if (cats && cats.length > 0) setCategories(cats);
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateStep2 = () => {
    if (!formData.employer_name.trim()) return 'Employer/Company Name is required.';
    if (!formData.contact_person.trim()) return 'Contact Person Full Name is required.';
    if (!formData.email.trim() || !formData.email.includes('@')) return 'A valid Contact Email is required.';
    if (!formData.phone.trim()) return 'Contact Phone / WhatsApp number is required.';
    if (!formData.job_title.trim()) return 'Job Title is required.';
    if (!formData.location.trim()) return 'Job Location (e.g. Colombo, Kandy) is required.';
    if (!formData.job_description.trim()) return 'Job description is required.';
    if (hasPoster && !posterFile) return 'Please upload your advertisement poster file.';
    return null;
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) {
      setSubmitError(err);
      return;
    }
    setSubmitError(null);
    setStep(3); // Proceed to Review
  };

  const handleSubmitFinal = async () => {
    if (!formData.terms_accepted) {
      setSubmitError('Please agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const data = new FormData();
      data.append('has_poster', hasPoster ? '1' : '0');
      data.append('employer_name', formData.employer_name);
      data.append('contact_person', formData.contact_person);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('job_title', formData.job_title);
      data.append('category_id', formData.category_id);
      data.append('location', formData.location);
      data.append('employment_type', formData.employment_type);
      data.append('salary_info', formData.salary_info);
      data.append('job_description', formData.job_description);
      data.append('responsibilities', formData.responsibilities);
      data.append('requirements', formData.requirements);
      data.append('experience_required', formData.experience_required);
      data.append('application_deadline', formData.application_deadline);
      data.append('preferred_publish_date', formData.preferred_publish_date);
      data.append('application_url', formData.application_url);
      data.append('poster_whatsapp', formData.poster_whatsapp || formData.phone);
      data.append('poster_email', formData.poster_email || formData.email);
      data.append('brand_colors', formData.brand_colors);
      data.append('design_instructions', formData.design_instructions);
      data.append('additional_instructions', formData.additional_instructions);
      data.append('terms_accepted', '1');

      if (posterFile) {
        data.append('poster_file', posterFile);
      }
      if (logoFile) {
        data.append('logo_file', logoFile);
      }
      for (const sf of supportingFiles) {
        data.append('supporting_files', sf);
      }

      const resData = await apiClient.submitAdRequest(data);
      if (!resData.success || !resData.reference_no) {
        throw new Error(resData.error || 'Failed to submit request.');
      }

      setReferenceNo(resData.reference_no);
      setStep(4); // Success screen
    } catch (err: any) {
      setSubmitError(err.message || 'Error submitting request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Package: LKR 1,000 (+1 Free Poster Design)
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Submit Advertisement Request
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Reach thousands of active Sri Lankan job seekers in just a few steps.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-3 text-xs font-semibold">
        <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-blue-700' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-blue-700 text-white' : 'bg-slate-200'}`}>
            1
          </span>
          <span>Poster Option</span>
        </div>
        <span className="text-slate-300">──</span>
        <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-blue-700' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-blue-700 text-white' : 'bg-slate-200'}`}>
            2
          </span>
          <span>Vacancy Details</span>
        </div>
        <span className="text-slate-300">──</span>
        <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-blue-700' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-blue-700 text-white' : 'bg-slate-200'}`}>
            3
          </span>
          <span>Review & Submit</span>
        </div>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* STEP 1: SELECT POSTER OPTION */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-lg font-bold text-slate-900">
              Do you already have an advertisement poster?
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select one of the two options below to configure your application form.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* OPTION A */}
            <div
              onClick={() => {
                setHasPoster(true);
                setSubmitError(null);
              }}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer space-y-4 ${
                hasPoster === true
                  ? 'border-blue-600 bg-blue-50/40 shadow-md ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileImage className="w-6 h-6" />
                </div>
                {hasPoster === true && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Option A: Yes, I Have a Poster</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Your company already created an artwork or social media flyer. You will upload the file and provide vacancy info.
                </p>
              </div>
              <div className="text-[11px] font-semibold text-blue-700">
                Ready for verification & distribution
              </div>
            </div>

            {/* OPTION B */}
            <div
              onClick={() => {
                setHasPoster(false);
                setSubmitError(null);
              }}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer space-y-4 ${
                hasPoster === false
                  ? 'border-blue-600 bg-blue-50/40 shadow-md ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Palette className="w-6 h-6" />
                </div>
                {hasPoster === false && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div>
                <div className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded mb-1">
                  1 Free Poster Design Included
                </div>
                <h3 className="text-base font-bold text-slate-900">Option B: No, Please Design My Poster</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  You don't have a poster? Jobsmart.lk can design your advertisement poster for you at no additional design charge with the advertising package.
                </p>
              </div>
              <div className="text-[11px] font-semibold text-emerald-700">
                Custom graphic design included in Rs. 1,000 package
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              disabled={hasPoster === null}
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span>Continue to Step 2</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: VACANCY & FORM FIELDS */}
      {step === 2 && (
        <form onSubmit={handleStep2Submit} className="space-y-8">
          
          {/* Banner message for Option B */}
          {!hasPoster && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Poster Design Workflow Activated</span>
                <span>You don't have a poster? No problem! Jobsmart.lk can design your advertisement poster for you at no additional design charge with the advertising package. Please fill in the details below so our graphic designers have all necessary information.</span>
              </div>
            </div>
          )}

          {/* Section 1: Employer & Contact Communication Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                1. Employer Contact Information (For Communication)
              </h3>
              <p className="text-[11px] text-slate-500">
                Used by Jobsmart administrators to verify your request and send confirmation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Company / Employer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="employer_name"
                  placeholder="e.g. Ceylon Solutions (Pvt) Ltd"
                  value={formData.employer_name}
                  onChange={handleInputChange}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Contact Person Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contact_person"
                  placeholder="e.g. Kasun Jayawardena"
                  value={formData.contact_person}
                  onChange={handleInputChange}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. hr@company.lk"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  WhatsApp / Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. 077 123 4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Vacancy Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                2. Vacancy Details
              </h3>
              <p className="text-[11px] text-slate-500">
                This information will appear in the structured job listing and on the designed poster.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="job_title"
                  placeholder="e.g. Senior Accounts Executive"
                  value={formData.job_title}
                  onChange={handleInputChange}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Industry / Job Category
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Job Location (District / City) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Colombo 03, Kandy, Gampaha"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Employment Type
                </label>
                <select
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleInputChange}
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
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Salary / Range (Optional)
                </label>
                <input
                  type="text"
                  name="salary_info"
                  placeholder="e.g. LKR 80,000 - 120,000 / Negotiable"
                  value={formData.salary_info}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Application Deadline (Optional)
                </label>
                <input
                  type="date"
                  name="application_deadline"
                  value={formData.application_deadline}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Full Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="job_description"
                rows={4}
                placeholder="Describe the company, the job role, and key expectations..."
                value={formData.job_description}
                onChange={handleInputChange}
                required
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* If Option B: Additional fields for graphic designer */}
            {!hasPoster && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Key Responsibilities (to feature on poster)
                    </label>
                    <textarea
                      name="responsibilities"
                      rows={3}
                      placeholder="• Reconcile monthly bank statements&#10;• Prepare payroll filings"
                      value={formData.responsibilities}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Qualifications & Requirements
                    </label>
                    <textarea
                      name="requirements"
                      rows={3}
                      placeholder="• AAT / CA Sri Lanka part-qualification&#10;• 2+ years experience in QuickBooks"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      WhatsApp Number to Print on Poster (Optional)
                    </label>
                    <input
                      type="text"
                      name="poster_whatsapp"
                      placeholder="e.g. 077 123 4567"
                      value={formData.poster_whatsapp}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Email to Print on Poster (Optional)
                    </label>
                    <input
                      type="text"
                      name="poster_email"
                      placeholder="e.g. careers@company.lk"
                      value={formData.poster_email}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Brand Colors / Style Preferences (Optional)
                    </label>
                    <input
                      type="text"
                      name="brand_colors"
                      placeholder="e.g. Royal Blue & Gold, Minimalist corporate style"
                      value={formData.brand_colors}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Career Portal / Apply URL (Optional)
                    </label>
                    <input
                      type="url"
                      name="application_url"
                      placeholder="https://company.lk/careers"
                      value={formData.application_url}
                      onChange={handleInputChange}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            {/* If Option A: Application URL */}
            {hasPoster && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Career Portal / Apply URL (Optional)
                </label>
                <input
                  type="url"
                  name="application_url"
                  placeholder="https://company.lk/careers"
                  value={formData.application_url}
                  onChange={handleInputChange}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Section 3: File Uploads */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                3. File Uploads
              </h3>
              <p className="text-[11px] text-slate-500">
                Accepts JPG, PNG, WebP, and PDF files up to 10MB each.
              </p>
            </div>

            {hasPoster ? (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Upload Advertisement Poster <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                  required
                  className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {posterFile && (
                  <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                    ✓ Selected: {posterFile.name} ({(posterFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Upload Company Logo (Optional - for poster design)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
                {logoFile && (
                  <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                    ✓ Selected: {logoFile.name} ({(logoFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Additional Instructions or Notes (Optional)
              </label>
              <textarea
                name="additional_instructions"
                rows={2}
                placeholder="Any special requests or instructions for our team..."
                value={formData.additional_instructions}
                onChange={handleInputChange}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Step 1</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all"
            >
              <span>Review Request</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>
      )}

      {/* STEP 3: REVIEW & CONFIRM */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Review Your Advertisement Request
              </h2>
              <p className="text-xs text-slate-500">
                Please verify your details before final submission.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 space-y-1">
                <span className="text-slate-400 block">Employer</span>
                <span className="font-bold text-slate-900">{formData.employer_name}</span>
                <div className="text-slate-600">{formData.contact_person} · {formData.phone}</div>
                <div className="text-slate-600">{formData.email}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 space-y-1">
                <span className="text-slate-400 block">Vacancy</span>
                <span className="font-bold text-slate-900">{formData.job_title}</span>
                <div className="text-slate-600">{formData.location} · {formData.employment_type}</div>
                <div className="text-slate-600 font-mono">
                  {formData.salary_info || 'Salary negotiable'}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2 text-xs">
              <div className="font-bold text-blue-900 flex items-center justify-between">
                <span>Advertising Package Summary</span>
                <span className="text-sm font-mono text-blue-800">LKR 1,000/=</span>
              </div>
              <div className="text-blue-800 space-y-1">
                <div>• Poster Status: <strong>{hasPoster ? 'Employer provided poster' : 'Free poster design requested (Worth Rs. 500)'}</strong></div>
                <div>• Distribution: 5,000+ active candidates via WhatsApp channels and Jobsmart directory</div>
                <div>• Payment: Manual bank transfer / deposit upon verification</div>
              </div>
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="terms_accepted"
                  checked={formData.terms_accepted}
                  onChange={handleInputChange}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4 shrink-0"
                />
                <span>
                  I agree to the <button type="button" onClick={() => onNavigate('/terms')} className="text-blue-700 underline">Terms and Conditions</button> and <button type="button" onClick={() => onNavigate('/privacy-policy')} className="text-blue-700 underline">Privacy Policy</button>. I understand that submitting this request does not automatically publish the vacancy until verified by the administration team.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Edit Details</span>
              </button>

              <button
                disabled={submitting || !formData.terms_accepted}
                onClick={handleSubmitFinal}
                className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm px-8 py-3.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all cursor-pointer"
              >
                <span>{submitting ? 'Submitting Request...' : 'Confirm & Submit Request'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS CONFIRMATION */}
      {step === 4 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Advertisement Request Received!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you for choosing Jobsmart.lk. Your request has been queued for review by our operations team.
            </p>
          </div>

          {/* Reference Card */}
          <div className="max-w-xs mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Your Reference Number
            </span>
            <span className="text-xl font-bold font-mono text-blue-700 tracking-wider">
              {referenceNo}
            </span>
          </div>

          <div className="max-w-md mx-auto text-left text-xs text-slate-600 bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-2">
            <div className="font-bold text-blue-900">What Happens Next?</div>
            <p>1. Our team will verify your vacancy details and check your files.</p>
            <p>2. We will contact you via WhatsApp / email with payment details for the LKR 1,000 package.</p>
            {!hasPoster && <p>3. Our graphic design team will prepare your custom recruitment flyer.</p>}
            <p>4. Once verified, your vacancy will be published and broadcasted to 5,000+ job seekers.</p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('/track')}
              className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm"
            >
              <span>Track Request Status</span>
            </button>
            <button
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-5 py-2.5 rounded-xl"
            >
              <span>Back to Homepage</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
