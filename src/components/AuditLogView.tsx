import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Clock, RefreshCw } from 'lucide-react';
import { AuditLog } from '../types';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = () => {
    setLoading(true);
    fetch('/api/audit-logs')
      .then(res => res.json())
      .then(json => {
        if (json.success) setLogs(json.logs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter(l => 
    l.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>সিস্টেম অডিট ট্রেইল ও অ্যাক্টিভিটি লগ (Audit Logs)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            সিস্টেমে ঋণ মঞ্জুর, কিস্তি কর্তন, সুদ প্রভিশন ও রিস্টোরের জন্য ব্যবহারকারী ও টাইমস্ট্যাম্প সহ পূর্ণাঙ্গ নিরীক্ষা লগ
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-700 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ব্যবহারকারী, অ্যাকশন বা সারসংক্ষেপ অনুসন্ধান..."
          className="w-full text-xs outline-none"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">টাইমস্ট্যাম্প</th>
                <th className="py-2.5 px-3 text-center">অ্যাকশন</th>
                <th className="py-2.5 px-3">ব্যবহারকারী ও আইপি</th>
                <th className="py-2.5 px-4">বিস্তারিত সারসংক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    কোনো অডিট লগ পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filtered.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 text-slate-500 font-num text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('bn-BD')}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                        log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                        log.action === 'REPAYMENT' ? 'bg-blue-100 text-blue-800' :
                        log.action === 'PROVISION' ? 'bg-purple-100 text-purple-800' :
                        log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                        log.action === 'RESTORE' ? 'bg-teal-100 text-teal-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-800">{log.user}</span>
                      <span className="text-[10px] text-slate-400 font-num block">{log.ip}</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 leading-relaxed">
                      {log.summary}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
