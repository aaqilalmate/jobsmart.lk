import React from 'react';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

interface AdvertisePageProps {
  onNavigate: (path: string) => void;
}

export const AdvertisePage: React.FC<AdvertisePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 py-12 pb-24">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 text-center space-y-4">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
          Sri Lankan Employer Recruitment Solutions
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight" style={{ textWrap: 'balance' }}>
          Reach Active Job Seekers Across Sri Lanka with <span className="text-blue-700">Jobsmart.lk</span>
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Publish your job vacancy to thousands of candidates. Whether you already have an artwork or need a custom recruitment flyer designed from scratch, our package has you covered.
        </p>
        <div>
          <button
            onClick={() => onNavigate('/advertise/apply')}
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <span>Submit Advertisement Request</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Official Package Card */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-3xl border-2 border-blue-600 shadow-xl overflow-hidden">
          <div className="bg-linear-to-r from-blue-900 to-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-blue-300 uppercase tracking-widest block mb-1">
                Standard Recruitment Package
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Jobsmart.lk Advertising Package
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-3xl sm:text-4xl font-extrabold text-yellow-400 font-mono tabular-nums">
                Rs. 1,000/=
              </div>
              <div className="text-xs text-blue-200 mt-0.5">One-time flat publishing fee</div>
            </div>
          </div>

          <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-6">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Bonus Included Feature
                  </div>
                  <div className="text-sm font-semibold text-emerald-800">
                    +1 Free Custom Advertisement Poster Design (Worth Rs. 500)
                  </div>
                  <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                    Don't have a poster ready? Our creative design team creates a tailored, high-converting social media flyer based on your job requirements at zero extra cost.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  What You Get in the Rs. 1,000 Package:
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Post your job vacancy in our verified WhatsApp communities & Telegram channels.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Reach over <strong>5,000+ active job seekers</strong> across Sri Lanka.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Permanent indexable text listing on the Jobsmart.lk website with verified schema.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Direct candidate engagement via WhatsApp, Email, or your own Career Portal URL.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Professional review by our moderation team before public distribution.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/advertise/apply')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <span>Submit Advertisement Request Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Poster Preview Section */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md max-w-xs group">
                <img
                  src="/assets/aistudio/ab24e034-e4b3-46bc-a94f-d779914c1a8b_7467cf00.jpg"
                  alt="Example Advertisement Poster for Rs 1000 Package"
                  className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <div className="p-3 bg-slate-900 text-white text-center">
                  <div className="text-[11px] font-semibold text-slate-300">
                    Example Advertisement Poster Preview
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Official illustrative layout provided with package
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Steps */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-slate-900">How It Works</h2>
          <p className="text-xs text-slate-500 mt-1">A simple, transparent 4-step workflow from submission to candidate applications.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
            <div className="text-blue-700 font-bold text-sm">01. Choose Poster Option</div>
            <p className="text-xs text-slate-600">Select whether you have a prepared poster or want our design team to design one for you.</p>
          </div>
          <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
            <div className="text-blue-700 font-bold text-sm">02. Provide Job Details</div>
            <p className="text-xs text-slate-600">Submit your company name, vacancy requirements, preferred contact numbers, and optional logo.</p>
          </div>
          <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
            <div className="text-blue-700 font-bold text-sm">03. Review & Verification</div>
            <p className="text-xs text-slate-600">Our admin team reviews your vacancy and gives you payment instructions (LKR 1,000) and reference code.</p>
          </div>
          <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
            <div className="text-blue-700 font-bold text-sm">04. Publication</div>
            <p className="text-xs text-slate-600">Your ad is published on the portal and broadcasted across 5,000+ candidates in Sri Lanka.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
