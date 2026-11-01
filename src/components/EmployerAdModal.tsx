import React from 'react';
import { X, CheckCircle2, MessageCircle, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

interface EmployerAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const EmployerAdModal: React.FC<EmployerAdModalProps> = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full text-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 p-6 sm:p-10 items-center">
          
          {/* Left Column: Details & Value Proposition */}
          <div className="lg:col-span-7 space-y-5">
            
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/90 border border-emerald-700/60 px-3.5 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Employer Advertising</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Advertise Your Job Vacancy With Us for Only <span className="text-yellow-400">Rs. 1,000/=</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Reach over 5,000+ active Sri Lankan job seekers in our dedicated recruitment groups and social channels. Every advertising package includes <strong className="text-white">one free custom poster design worth Rs. 500</strong> created by our professional design team.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-200 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Reach 5,000+ active job seekers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Free professional poster design</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Direct WhatsApp & Career routing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-channel publication island-wide</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onNavigate('/advertise/apply');
                }}
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition-all"
              >
                <span>Submit Advertisement Request</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="https://wa.me/94720312630?text=Hello%20Jobsmart.lk,%20I%20would%20like%20to%20advertise%20a%20job%20vacancy."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: 072 031 2630</span>
              </a>
            </div>

            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Fast verification within 2-4 hours · Official invoice issued</span>
            </p>

          </div>

          {/* Right Column: Poster Flyer Asset */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-xs sm:max-w-sm rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
              <img
                src="/assets/aistudio/image_4c55f895.png"
                alt="Jobsmart.lk Employer Package Poster"
                className="w-full h-auto object-cover"
                onError={(e) => {
                  // Fallback to secondary asset if needed
                  (e.target as HTMLImageElement).src = '/assets/aistudio/ab24e034-e4b3-46bc-a94f-d779914c1a8b_7467cf00.jpg';
                }}
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
