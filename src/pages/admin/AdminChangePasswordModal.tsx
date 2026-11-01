import React, { useState } from 'react';
import { KeyRound, X, AlertCircle } from 'lucide-react';
import { apiClient } from '../../lib/api';

interface AdminChangePasswordModalProps {
  mustChange?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminChangePasswordModal: React.FC<AdminChangePasswordModalProps> = ({
  mustChange = false,
  onClose,
  onSuccess,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.changePassword(currentPassword, newPassword);
      if (!res.success) throw new Error(res.error || 'Failed to update password');

      alert('Password changed successfully.');
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl border border-slate-200">
        
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <KeyRound className="w-5 h-5 text-blue-600" />
            <span>Change Password</span>
          </div>

          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">New Password (Min 8 chars)</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            {!mustChange && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2 rounded-xl disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
