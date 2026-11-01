import React, { useState } from 'react';
import { Mail, Phone, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '../lib/api';

interface StaticPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<StaticPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          About Jobsmart.lk
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Sri Lanka's dedicated career vacancies directory and recruitment advertising platform.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 space-y-6 text-sm text-slate-700 leading-relaxed shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
        <p>
          Jobsmart.lk was founded to bridge the gap between talented Sri Lankan job seekers and growing local organizations. We believe recruitment should be transparent, accessible, and free of unnecessary barriers.
        </p>

        <h2 className="text-xl font-bold text-slate-900 pt-4">For Job Seekers</h2>
        <p>
          Our platform is 100% free for candidates. We maintain clean, structured, and verified text-based vacancy cards with clear descriptions, essential requirements, confirmed application deadlines, and direct channels to employers via Career Portals, WhatsApp, and official emails.
        </p>

        <h2 className="text-xl font-bold text-slate-900 pt-4">For Employers & Recruiters</h2>
        <p>
          We offer an accessible, flat-rate advertising package for only <strong>LKR 1,000</strong>. To support small-to-medium businesses and enterprises alike, every advertising package includes a <strong>complimentary custom poster design worth LKR 500</strong>, distributed to over 5,000+ active candidates in our recruitment networks.
        </p>

        <div className="pt-6 border-t border-slate-100 flex gap-4">
          <button
            onClick={() => onNavigate('/jobs')}
            className="bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors"
          >
            Explore Vacancies
          </button>
          <button
            onClick={() => onNavigate('/advertise')}
            className="bg-slate-100 text-slate-800 text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Advertise With Us
          </button>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC<StaticPageProps> = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await apiClient.submitContact(formData);
      if (res.success) {
        setSuccess(true);
        setFormData({ full_name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        throw new Error(res.message || 'Failed to send message');
      }
    } catch (err: any) {
      setError(err.message || 'Error sending inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Contact Us</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Have an inquiry about posting a vacancy or need assistance? Reach out to our support team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact Info */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Direct Inquiries</h3>
            
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <span>info@jobsmart.lk</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                <span>+94 72 031 2630</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/94720312630"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
              >
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
            {success ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">Message Sent Successfully!</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Thank you for reaching out. A representative from Jobsmart.lk will respond shortly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-xs font-semibold text-blue-700 hover:underline pt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs px-6 py-2.5 rounded-xl disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
      <p className="text-xs text-slate-400 font-mono">Last updated: October 2026</p>
      
      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4 text-xs text-slate-700 leading-relaxed">
        <h3 className="text-sm font-bold text-slate-900">1. Information We Collect</h3>
        <p>
          Jobsmart.lk collects information provided by employers when submitting job advertisement requests, including company name, contact details, vacancy requirements, and uploaded graphic assets.
        </p>

        <h3 className="text-sm font-bold text-slate-900 pt-2">2. Use of Information</h3>
        <p>
          Submitted job vacancies are published on our website and distributed across our official social channels to connect candidates with opportunities. Private contact details (such as administrative billing emails) are retained internally and not exposed to unauthorized third parties.
        </p>

        <h3 className="text-sm font-bold text-slate-900 pt-2">3. Data Retention & Security</h3>
        <p>
          All uploaded files and request records are stored in secure relational databases and authenticated storage. We do not sell or monetize personal data to third-party ad brokers.
        </p>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900">Terms and Conditions</h1>
      <p className="text-xs text-slate-400 font-mono">Effective: October 2026</p>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4 text-xs text-slate-700 leading-relaxed">
        <h3 className="text-sm font-bold text-slate-900">1. General Platform Terms</h3>
        <p>
          Jobsmart.lk provides an advertising and vacancy directory service in Sri Lanka. By using the platform or requesting an advertisement, you agree to comply with these terms.
        </p>

        <h3 className="text-sm font-bold text-slate-900 pt-2">2. Advertising Package & Verification</h3>
        <p>
          The standard advertising package fee is LKR 1,000, which includes one custom advertisement poster design. Submission of an advertisement request constitutes a service inquiry and is subject to verification by our administrative moderation team. Jobsmart.lk reserves the right to reject vacancies that violate Sri Lankan labor laws, constitute fraudulent schemes, or misrepresent employment terms.
        </p>

        <h3 className="text-sm font-bold text-slate-900 pt-2">3. Job Seeker Protections</h3>
        <p>
          Advertisers may not request payments, interview charges, or deposits from candidates through listings published on Jobsmart.lk.
        </p>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC<StaticPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
      <div className="text-6xl font-extrabold text-blue-700 font-mono">404</div>
      <h2 className="text-xl font-bold text-slate-900">Page Not Found</h2>
      <p className="text-xs text-slate-500">
        The page you are looking for does not exist or may have been moved.
      </p>
      <button
        onClick={() => onNavigate('/')}
        className="bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors"
      >
        Return to Homepage
      </button>
    </div>
  );
};
