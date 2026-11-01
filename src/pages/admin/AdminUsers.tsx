import React, { useState, useEffect } from 'react';
import { Users, UserPlus, KeyRound, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { AdminUser } from '../../types';
import { apiClient } from '../../lib/api';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New user form
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'admin',
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAdminUsers();
      if (data) {
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await apiClient.createAdminUser(newUser);
      if (!res.success) throw new Error(res.error || 'Failed to create user');
      setShowCreate(false);
      setNewUser({ username: '', email: '', full_name: '', password: '', role: 'admin' });
      loadUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (userId: string) => {
    const newPass = prompt('Enter temporary password for this user (at least 8 chars):');
    if (!newPass || newPass.length < 8) {
      if (newPass) alert('Password must be at least 8 characters.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset_password: newPass }),
      });
      if (res.ok) {
        alert('Password reset successfully. The user will be prompted to change it upon login.');
        loadUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });
      if (res.ok) {
        loadUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Administrator Accounts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Super Admin role required. Manage accounts and access permissions.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>{showCreate ? 'Cancel' : 'Create New Admin'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <form onSubmit={handleCreateUser} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Add New Administrator</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Username</label>
              <input
                type="text"
                required
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
              <input
                type="email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Temporary Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Role</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="admin">Regular Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg"
          >
            Create Account
          </button>
        </form>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Admin Name</th>
              <th className="py-3 px-4">Username & Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900">{u.full_name}</div>
                  {u.must_change_password && (
                    <span className="text-[10px] text-amber-600 font-semibold">
                      Must change password on login
                    </span>
                  )}
                </td>

                <td className="py-3 px-4">
                  <div className="font-mono text-slate-800">@{u.username}</div>
                  <div className="text-[11px] text-slate-400">{u.email}</div>
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    u.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {u.role.replace('_', ' ')}
                  </span>
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {u.is_active ? 'Active' : 'Deactivated'}
                  </span>
                </td>

                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleResetPassword(u.id)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs"
                      title="Reset Password"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(u.id, Boolean(u.is_active))}
                      className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 bg-slate-100 rounded"
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
