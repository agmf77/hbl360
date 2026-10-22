import React from 'react';
import { Trash2, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { RecycleItem, UserSession } from '../types';

interface RecycleBinViewProps {
  items: RecycleItem[];
  currentUser: UserSession;
  onRestore: (id: string) => Promise<void>;
  isProcessing: boolean;
}

export const RecycleBinView: React.FC<RecycleBinViewProps> = ({
  items,
  currentUser,
  onRestore,
  isProcessing
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-emerald-600" />
            <span>রিসাইকেল বিন ও ডাটা রিকভারি (Recycle Bin & Instant Restore)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ভুলবশত মুছে ফেলা ঋণ, কর্মচারী বা কিস্তি কর্তন ১ ক্লিকে পুনরুদ্ধার ও ব্যালেন্স পুনঃসমন্বয় সুবিধা
          </p>
        </div>

        <div className="text-xs text-slate-500 font-num">
          বিনে সংরক্ষিত রেকর্ড: <strong className="text-slate-900">{items.length}</strong> টি
        </div>
      </div>

      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <strong>স্বয়ংক্রিয় ব্যালেন্স পুনঃসমন্বয় (Auto-Reconciliation):</strong> কোনো কিস্তি কর্তন বা সুদ প্রভিশন রিস্টোর করা হলে সিস্টেম সংশ্লিষ্ট ঋণের আসল ও সুদ স্থিতি পুনরায় নির্ভুলভাবে সমন্বয় করে। কোনো তথ্য স্থায়ীভাবে বিলুপ্ত হয় না।
        </div>
      </div>

      {/* Recycle Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">আইটেমের শিরোনাম ও বিবরণ</th>
                <th className="py-3 px-3">রেকর্ডের ধরন</th>
                <th className="py-3 px-3">মুছে ফেলার তারিখ ও সময়</th>
                <th className="py-3 px-3">ব্যবহারকারী</th>
                <th className="py-3 px-4 text-center">পুনরুদ্ধার</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    রিসাইকেল বিনে কোনো রেকর্ড নেই। ডাটাবেজ সম্পূর্ণ পরিচ্ছন্ন।
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.title}</div>
                      <div className="text-[11px] text-slate-500">{item.details}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
                        {item.entityType === 'loan' ? 'গৃহ ঋণ' : item.entityType === 'repayment' ? 'কিস্তি কর্তন' : item.entityType === 'employee' ? 'কর্মচারী' : 'ব্যাংক অ্যাডভাইস'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-num text-[11px]">
                      {new Date(item.deletedAt).toLocaleString('bn-BD')}
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {item.deletedBy}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onRestore(item.id)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1 mx-auto active:scale-95 shadow-2xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>পুনরুদ্ধার করুন</span>
                      </button>
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
