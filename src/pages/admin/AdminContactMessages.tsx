import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import { ContactMessage } from '../../types';
import { apiClient } from '../../lib/api';

export const AdminContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const list = await apiClient.getAdminContactMessages();
      setMessages(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await apiClient.updateAdminContactMessage(id, status);
      loadMessages();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Contact Form Inquiries
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Messages sent through the public contact page.
          </p>
        </div>
        <button
          onClick={loadMessages}
          className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 text-xs text-slate-400">Loading inquiries...</div>
        ) : messages.length > 0 ? (
          messages.map((m) => (
            <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{m.subject}</span>
                  <div className="text-xs text-slate-500">
                    From: <strong className="text-slate-700">{m.full_name}</strong> ({m.email}) {m.phone && `· Tel: ${m.phone}`}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={m.status}
                    onChange={(e) => handleUpdateStatus(m.id, e.target.value)}
                    className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
                  >
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {m.message}
              </p>

              <div className="text-[10px] text-slate-400 font-mono">
                Received: {new Date(m.created_at).toLocaleString('en-GB')}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-xs text-slate-400">
            No contact messages recorded.
          </div>
        )}
      </div>
    </div>
  );
};
