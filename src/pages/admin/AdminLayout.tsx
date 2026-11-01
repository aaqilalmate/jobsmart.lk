import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Inbox,
  Palette,
  Users,
  ShieldAlert,
  MessageSquare,
  LogOut,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { AdminUser } from '../../types';

interface AdminLayoutProps {
  user: AdminUser;
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  onChangePasswordClick: () => void;
  onNavigatePublic: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  user,
  currentTab,
  onSelectTab,
  onLogout,
  onChangePasswordClick,
  onNavigatePublic,
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'jobs', label: 'Job Vacancies', icon: Briefcase },
    { id: 'requests', label: 'Advertisement Requests', icon: Inbox },
    { id: 'messages', label: 'Contact Messages', icon: MessageSquare },
    ...(user.role === 'super_admin'
      ? [{ id: 'users', label: 'Admin Accounts', icon: Users }]
      : []),
    { id: 'activity', label: 'Audit Activity Logs', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <img
            src="/assets/aistudio/45258159-573a-4607-97d8-833700daca85_ba489a17.jpg"
            alt="Logo"
            className="w-7 h-7 rounded-full object-cover"
          />
          <span className="font-bold text-sm tracking-tight">Jobsmart Admin</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileSidebarOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between border-r border-slate-800`}
      >
        <div className="p-5 space-y-6">
          
          {/* Brand & User Badge */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
            <img
              src="/assets/aistudio/45258159-573a-4607-97d8-833700daca85_ba489a17.jpg"
              alt="Logo"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30"
            />
            <div>
              <div className="text-sm font-bold text-white tracking-tight">Jobsmart.lk</div>
              <div className="text-[11px] font-mono text-blue-400 font-medium">Administration</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 text-xs font-semibold">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-left ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

        </div>

        {/* Sidebar Bottom: Account info & Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
          <div className="px-2 py-1">
            <div className="text-xs font-bold text-white truncate">{user.full_name}</div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
              <span className="font-mono">@{user.username}</span>
              <span className="uppercase text-[9px] font-bold text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded">
                {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
          </div>

          <div className="space-y-1 pt-1 text-xs">
            <button
              onClick={onChangePasswordClick}
              className="w-full flex items-center gap-2 text-slate-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-left"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </button>

            <button
              onClick={() => onNavigatePublic('/')}
              className="w-full flex items-center gap-2 text-slate-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-left"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Site</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 px-2 py-1.5 rounded-lg hover:bg-red-950/40 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

    </div>
  );
};
