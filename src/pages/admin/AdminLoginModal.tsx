import React, { useState } from 'react';
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { AdminUser } from '../../types';

import { apiClient } from '../../lib/api';

interface AdminLoginModalProps {
  onSuccess: (user: AdminUser) => void;
  onCancel: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onSuccess, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.adminLogin(username, password);
      if (!res.success || !res.user) {
        throw new Error(res.error || 'Invalid username or password.');
      }
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or locked out.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-800 space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Jobsmart Admin Portal
          </h1>
          <p className="text-xs text-slate-500">
            Authorized personnel only. Sessions are monitored and encrypted.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-xs text-red-700 flex items-start gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Administrator Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@example.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>


          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium"
          >
            ← Return to Public Website
          </button>
        </div>

      </div>
    </div>
  );
};
