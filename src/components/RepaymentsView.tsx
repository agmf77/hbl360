import React, { useState } from 'react';
import { 
  Coins, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  FileSpreadsheet, 
  CheckCircle2,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Repayment, Loan, UserSession } from '../types';

interface RepaymentsViewProps {
  repayments: Repayment[];
  loans: Loan[];
  currentUser: UserSession;
  onOpenNewRepayment: () => void;
  onRunBatchPayroll: () => void;
  onOpenLedger: (loanId: string) => void;
  isProcessing: boolean;
}

export const RepaymentsView: React.FC<RepaymentsViewProps> = ({
  repayments,
  loans,
  currentUser,
  onOpenNewRepayment,
  onRunBatchPayroll,
  onOpenLedger,
  isProcessing
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const filtered = repayments.filter(r => {
    const matchesSearch = 
      r.employeeNameBn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.payId.includes(searchTerm) ||
      r.voucherNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = !selectedMonth || r.repaymentMonth === selectedMonth;
    return matchesSearch && matchesMonth;
  });

  const totalFilteredAmount = filtered.reduce((s, r) => s + r.totalAmount, 0);
  const totalPrincipal = filtered.reduce((s, r) => s + r.principalPaid, 0);
  const totalInterest = filtered.reduce((s, r) => s + r.interestPaid, 0);
  const totalAdvance = filtered.reduce((s, r) => s + r.advancePaid, 0);

  // Available unique months
  const months = Array.from(new Set(repayments.map(r => r.repaymentMonth))).sort().reverse();

  // Export to CSV helper
  const handleExportCsv = () => {
    const headers = ['আইডি', 'কর্মচারী', 'পে-আইডি', 'কর্তন মাস', 'তারিখ', 'ভাউচার', 'মোট কিস্তি', 'আসল পরিশোধ', 'সুদ পরিশোধ', 'অগ্রিম জমা', 'উৎস'];
    const rows = filtered.map(r => [
      r.id,
      r.employeeNameBn,
      r.payId,
      r.repaymentMonth,
      r.repaymentDate,
      r.voucherNo,
      r.totalAmount,
      r.principalPaid,
      r.interestPaid,
      r.advancePaid,
      r.sourceType
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PBS_House_Loan_Repayments_${selectedMonth || 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-600" />
            <span>মাসিক কিস্তি কর্তন ও আদায় রেজিস্টার</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            সরকারি হিসাব নীতি অনুযায়ী আসল স্থিতি সমন্বয়ের পর অবশিষ্ট অর্থ হতে সুদ আদায় রেজিস্টার
          </p>
        </div>

        {currentUser.role !== 'employee' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onRunBatchPayroll}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-colors shadow-2xs"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>ব্যাচ বেতন কর্তন রান</span>
            </button>

            <button
              onClick={onOpenNewRepayment}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>একক কিস্তি পোস্টিং</span>
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-slate-500 mb-1">মোট কর্তন সংখ্যা</div>
          <div className="text-lg font-bold text-slate-900 font-num">{filtered.length} টি</div>
          <div className="text-[11px] text-slate-400 mt-0.5">ফিল্টারকৃত রেকর্ড</div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 shadow-2xs">
          <div className="text-emerald-800 mb-1">মোট আসল পরিশোধ</div>
          <div className="text-lg font-bold text-emerald-900 font-num">৳ {totalPrincipal.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">আসল স্থিতিতে সমন্বিত</div>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 shadow-2xs">
          <div className="text-blue-800 mb-1">মোট সুদ পরিশোধ</div>
          <div className="text-lg font-bold text-blue-900 font-num">৳ {totalInterest.toLocaleString()}</div>
          <div className="text-[11px] text-blue-700 mt-0.5">আসল শূন্যের পর আদায়</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
          <div className="text-slate-700 mb-1">সর্বমোট আদায়কৃত কিস্তি</div>
          <div className="text-lg font-bold text-slate-900 font-num">৳ {totalFilteredAmount.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {totalAdvance > 0 ? `অগ্রিম: ৳${totalAdvance.toLocaleString()}` : 'সকল কিস্তি সমন্বিত'}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="কর্মচারী, পে-আইডি বা ভাউচার..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-num"
          >
            <option value="">সকল মাস</option>
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* CSV Export */}
        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 self-end sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>এক্সেল / CSV এক্সপোর্ট</span>
        </button>
      </div>

      {/* Repayments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">কর্মকর্তা/কর্মচারী</th>
                <th className="py-3 px-3">কর্তন মাস ও তারিখ</th>
                <th className="py-3 px-3">ভাউচার নম্বর</th>
                <th className="py-3 px-3">উৎস</th>
                <th className="py-3 px-3 text-right">মোট কিস্তি</th>
                <th className="py-3 px-3 text-right text-emerald-800">আসল পরিশোধ</th>
                <th className="py-3 px-3 text-right text-blue-800">সুদ পরিশোধ</th>
                <th className="py-3 px-3 text-right">অগ্রিম</th>
                <th className="py-3 px-3 text-center">খতিয়ান</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    কোনো কর্তন রেকর্ড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{r.employeeNameBn}</div>
                      <div className="text-[11px] text-slate-500 font-num">পে-আইডি: {r.payId}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 font-num">{r.repaymentMonth}</div>
                      <div className="text-[10px] text-slate-400 font-num">{r.repaymentDate}</div>
                    </td>
                    <td className="py-3 px-3 font-num text-slate-600">
                      {r.voucherNo}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        r.sourceType === 'payroll' 
                          ? 'bg-slate-100 text-slate-700' 
                          : r.sourceType === 'inter_pbs' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {r.sourceType === 'payroll' ? 'বেতন কর্তন' : r.sourceType === 'inter_pbs' ? 'অন্য পবিস' : 'ম্যানুয়াল'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-num font-bold text-slate-900 text-sm">
                      ৳ {r.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-num font-bold text-emerald-700">
                      ৳ {r.principalPaid.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-num font-semibold text-blue-700">
                      ৳ {r.interestPaid.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-num text-purple-700 font-medium">
                      {r.advancePaid > 0 ? `৳${r.advancePaid.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onOpenLedger(r.loanId)}
                        className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                        title="ঋণ খতিয়ান দেখুন"
                      >
                        <ArrowUpRight className="w-4 h-4" />
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
