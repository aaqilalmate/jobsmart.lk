import React from 'react';
import { Mail, Phone, MapPin, ShieldCheck, HeartHandshake, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <img
                src="/assets/aistudio/45258159-573a-4607-97d8-833700daca85_ba489a17.jpg"
                alt="Jobsmart Icon"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
              />
              <span className="text-xl font-bold text-white tracking-tight">Jobsmart.lk</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sri Lanka's dedicated career vacancies and recruitment advertising platform. Connecting qualified job seekers with top employers across all 9 provinces.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/94720312630"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-md transition-colors"
              >
                <span>WhatsApp: 072 031 2630</span>
              </a>
            </div>
          </div>

          {/* Col 2: Job Seekers */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Job Seekers</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('/jobs')} className="hover:text-white transition-colors text-left">
                  Browse All Vacancies
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/categories')} className="hover:text-white transition-colors text-left">
                  Jobs by Industry
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/locations')} className="hover:text-white transition-colors text-left">
                  Jobs by District
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/jobs?employment_type=Full-Time')} className="hover:text-white transition-colors text-left">
                  Full-Time Careers
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/jobs?workplace_type=Remote')} className="hover:text-white transition-colors text-left">
                  Remote Opportunities
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Employers */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Employers</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('/advertise/apply')} className="hover:text-white transition-colors text-left font-medium text-blue-400">
                  Post a Vacancy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/track')} className="hover:text-white transition-colors text-left">
                  Track Request Status
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors text-left">
                  Corporate Inquiries
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">Contact & Support</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>info@jobsmart.lk</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>+94 72 031 2630</span>
              </div>
              <div className="pt-2 flex flex-wrap gap-x-4 gap-y-2">
                <button onClick={() => onNavigate('/privacy-policy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
                <button onClick={() => onNavigate('/terms')} className="hover:text-white transition-colors">
                  Terms & Conditions
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Quiet copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Jobsmart.lk. All rights reserved. Sri Lanka's Trusted Job Directory.</p>
          <p className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Verified Vacancies · No Application Fees</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
