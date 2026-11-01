import React, { useState } from 'react';
import { Briefcase, Menu, X, ArrowUpRight, Search, PlusCircle } from 'lucide-react';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Find Jobs', path: '/jobs' },
    { label: 'Advertise With Us', path: '/advertise' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact Us', path: '/contact' },
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-8">
          
          {/* Zone 1: Brand Wordmark with official Jobsmart logo */}
          <button
            onClick={() => handleLinkClick('/')}
            className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg group"
          >
            <img
              src="/assets/aistudio/82a6b71b-b6ef-4c17-b9ab-a400eb8df2ab_8d2ada0f.jpg"
              alt="Jobsmart.lk Logo"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-102"
              onError={(e) => {
                // Graceful CSS fallback if asset loading is interrupted
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span className="sr-only">Jobsmart.lk</span>
          </button>

          {/* Zone 2: 4-5 single-line clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path || (link.path !== '/' && currentPath.startsWith(link.path));
              return (
                <button
                  key={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  className={`text-sm font-medium tracking-tight whitespace-nowrap transition-colors py-1 ${
                    isActive
                      ? 'text-blue-700 font-semibold border-b-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Only Post a Vacancy CTA Button */}
          <div className="hidden sm:flex items-center">
            <button
              onClick={() => handleLinkClick('/advertise')}
              className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post a Vacancy</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => handleLinkClick('/advertise')}
              className="text-xs font-semibold bg-blue-700 text-white px-3 py-1.5 rounded-lg"
            >
              Post a Vacancy
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleLinkClick(link.path)}
                className={`text-left text-sm py-2 px-3 rounded-lg font-medium ${
                  currentPath === link.path ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => handleLinkClick('/advertise')}
                className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post a Vacancy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
