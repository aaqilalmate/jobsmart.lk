import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { JobsPage } from './pages/JobsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { AdvertisePage } from './pages/AdvertisePage';
import { AdvertiseApplyPage } from './pages/AdvertiseApplyPage';
import { TrackPage } from './pages/TrackPage';
import { AboutPage, ContactPage, PrivacyPolicyPage, TermsPage, NotFoundPage } from './pages/StaticPages';

// Admin imports
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminJobs } from './pages/admin/AdminJobs';
import { AdminJobModal } from './pages/admin/AdminJobModal';
import { AdminRequests } from './pages/admin/AdminRequests';
import { AdminRequestModal } from './pages/admin/AdminRequestModal';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminActivityLogs } from './pages/admin/AdminActivityLogs';
import { AdminContactMessages } from './pages/admin/AdminContactMessages';
import { AdminLoginModal } from './pages/admin/AdminLoginModal';
import { AdminChangePasswordModal } from './pages/admin/AdminChangePasswordModal';
import { AdminUser } from './types';
import { EmployerAdModal } from './components/EmployerAdModal';
import { apiClient } from './lib/api';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname + window.location.search);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [adminChecking, setAdminChecking] = useState(true);
  const [adminTab, setAdminTab] = useState('dashboard');
  const [adminJobModalOpen, setAdminJobModalOpen] = useState(false);
  const [adminSelectedRequestId, setAdminSelectedRequestId] = useState<string | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [employerPopupOpen, setEmployerPopupOpen] = useState(false);

  // Sync with browser URL
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = async (path: string) => {
    // Intercept Post a Vacancy click: check if employer popup is enabled
    if (path === '/advertise') {
      const settings = await apiClient.getSettings();
      if (settings.employer_popup_enabled) {
        setEmployerPopupOpen(true);
        return;
      } else {
        path = '/advertise/apply';
      }
    }

    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  };

  // Check admin session on mount safely
  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await apiClient.getAdminMe();
        if (user) {
          setAdminUser(user);
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setAdminChecking(false);
      }
    }
    checkAuth();
  }, []);

  const handleAdminLogout = async () => {
    await apiClient.adminLogout();
    setAdminUser(null);
    navigate('/');
  };

  // Parse path & params
  const [pathname, searchString] = currentPath.split('?');
  const searchParams = new URLSearchParams(searchString || '');

  // ==========================================
  // ADMIN VIEW ROUTING (/admin)
  // ==========================================
  if (pathname.startsWith('/admin')) {
    if (adminChecking) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs font-mono">
          Verifying security credentials...
        </div>
      );
    }

    if (!adminUser) {
      return (
        <AdminLoginModal
          onSuccess={(user) => {
            setAdminUser(user);
          }}
          onCancel={() => navigate('/')}
        />
      );
    }

    return (
      <AdminLayout
        user={adminUser}
        currentTab={adminTab}
        onSelectTab={setAdminTab}
        onLogout={handleAdminLogout}
        onChangePasswordClick={() => setChangePasswordOpen(true)}
        onNavigatePublic={navigate}
      >
        {adminTab === 'dashboard' && (
          <AdminDashboard
            onSelectTab={setAdminTab}
            onOpenJobForm={() => setAdminJobModalOpen(true)}
            onSelectRequest={(id) => setAdminSelectedRequestId(id)}
          />
        )}

        {adminTab === 'jobs' && (
          <AdminJobs onNavigatePublic={navigate} />
        )}

        {adminTab === 'requests' && (
          <AdminRequests />
        )}

        {adminTab === 'messages' && (
          <AdminContactMessages />
        )}

        {adminTab === 'users' && adminUser.role === 'super_admin' && (
          <AdminUsers />
        )}

        {adminTab === 'activity' && (
          <AdminActivityLogs />
        )}

        {/* Global Admin Modals */}
        {adminJobModalOpen && (
          <AdminJobModal
            jobId={null}
            onClose={() => setAdminJobModalOpen(false)}
            onSaved={() => {
              setAdminJobModalOpen(false);
              setAdminTab('jobs');
            }}
          />
        )}

        {adminSelectedRequestId && (
          <AdminRequestModal
            requestId={adminSelectedRequestId}
            onClose={() => setAdminSelectedRequestId(null)}
            onUpdated={() => {}}
          />
        )}

        {changePasswordOpen && (
          <AdminChangePasswordModal
            mustChange={false}
            onClose={() => setChangePasswordOpen(false)}
            onSuccess={() => {
              setChangePasswordOpen(false);
            }}
          />
        )}
      </AdminLayout>
    );
  }

  // ==========================================
  // PUBLIC WEBSITE ROUTING
  // ==========================================
  const renderPublicContent = () => {
    // 1. Home
    if (pathname === '/') {
      return (
        <HomePage
          onNavigate={navigate}
          onSelectJob={(slug) => navigate(`/jobs/${slug}`)}
        />
      );
    }

    // 2. Job Details: /jobs/:slug
    if (pathname.startsWith('/jobs/')) {
      const slug = pathname.replace('/jobs/', '');
      return (
        <JobDetailPage
          slug={slug}
          onBack={() => navigate('/jobs')}
          onSelectJob={(s) => navigate(`/jobs/${s}`)}
          onNavigate={navigate}
        />
      );
    }

    // 3. All Jobs & Search: /jobs, /search, /categories, /locations
    if (
      pathname === '/jobs' ||
      pathname === '/search' ||
      pathname === '/categories' ||
      pathname.startsWith('/categories/') ||
      pathname === '/locations' ||
      pathname.startsWith('/locations/')
    ) {
      let initialCat = searchParams.get('category') || 'all';
      let initialLoc = searchParams.get('location') || 'all';

      if (pathname.startsWith('/categories/')) {
        initialCat = pathname.replace('/categories/', '');
      } else if (pathname.startsWith('/locations/')) {
        initialLoc = pathname.replace('/locations/', '');
      }

      return (
        <JobsPage
          initialSearch={searchParams.get('q') || ''}
          initialCategory={initialCat}
          initialLocation={initialLoc}
          initialWorkplace={searchParams.get('workplace_type') || 'all'}
          initialEmployment={searchParams.get('employment_type') || 'all'}
          initialFeatured={searchParams.get('featured') || ''}
          onSelectJob={(slug) => navigate(`/jobs/${slug}`)}
          onNavigate={navigate}
        />
      );
    }

    // 4. Employers / Advertise Package
    if (pathname === '/advertise') {
      return <AdvertisePage onNavigate={navigate} />;
    }

    // 5. Submit Advertisement Request Form
    if (pathname === '/advertise/apply') {
      return <AdvertiseApplyPage onNavigate={navigate} />;
    }

    // 6. Track Request
    if (pathname === '/track') {
      return <TrackPage />;
    }

    // 7. Static Pages
    if (pathname === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }
    if (pathname === '/contact') {
      return <ContactPage onNavigate={navigate} />;
    }
    if (pathname === '/privacy-policy') {
      return <PrivacyPolicyPage />;
    }
    if (pathname === '/terms') {
      return <TermsPage />;
    }

    // 8. Custom 404
    return <NotFoundPage onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header currentPath={currentPath} onNavigate={navigate} />
      <main className="flex-1">{renderPublicContent()}</main>
      <Footer onNavigate={navigate} />

      {/* Employer Vacancy Promotion Modal (can be toggled in Admin Panel) */}
      <EmployerAdModal
        isOpen={employerPopupOpen}
        onClose={() => setEmployerPopupOpen(false)}
        onNavigate={navigate}
      />
    </div>
  );
}
