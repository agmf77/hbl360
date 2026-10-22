import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  PauseCircle, 
  PlayCircle, 
  FileText, 
  Coins, 
  Trash2, 
  Download,
  AlertCircle
} from 'lucide-react';
import { Loan, UserSession } from '../types';

interface LoansViewProps {
  loans: Loan[];
  currentUser: UserSession;
  onOpenAddLoan: () => void;
  onOpenLedger: (loanId: string) => void;
  onOpenRepayment: (loanId: string) => void;
  onToggleStatus: (loanId: string, currentStatus: Loan['status']) => void;
  onDeleteLoan: (loanId: string) => void;
}

export const LoansView: React.FC<LoansViewProps> = ({
  loans,
  currentUser,
  onOpenAddLoan,
  onOpenLedger,
  onOpenRepayment,
  onToggleStatus,
  onDeleteLoan
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'own' | 'other'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'closed'>('all');

  const filtered = loans.filter(l => {
    const matchesSearch = 
      l.employeeNameBn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.payId.includes(searchTerm) ||
      l.loanNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = sourceFilter === 'all' || l.loanSource === sourceFilter;
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesSource && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span>গৃহ নির্মাণ ঋণ রেজিস্টার ও বরাদ্দ লট</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            কর্মকর্তা-কর্মচারীদের ১ম ও ২য় বরাদ্দ, নিজস্ব ও অন্যান্য পবিস হতে বদলিকৃত ঋণের হিসাব
          </p>
        </div>

        {currentUser.role !== 'employee' && (
          <button
            onClick={onOpenAddLoan}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ঋণ মঞ্জুরকরণ</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="নাম, পে-আইডি বা ঋণ নম্বর..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Source Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setSourceFilter('all')}
              className={`py-1 px-2.5 rounded-md font-medium transition-colors ${
                sourceFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              সকল ({loans.length})
            </button>
            <button
              onClick={() => setSourceFilter('own')}
              className={`py-1 px-2.5 rounded-md font-medium transition-colors ${
                sourceFilter === 'own' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              নিজস্ব পবিস
            </button>
            <button
              onClick={() => setSourceFilter('other')}
              className={`py-1 px-2.5 rounded-md font-medium transition-colors ${
                sourceFilter === 'other' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              অন্যান্য পবিস
            </button>
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-medium"
          >
            <option value="all">সকল অবস্থা</option>
            <option value="active">সক্রিয়</option>
            <option value="suspended">স্থগিত</option>
            <option value="closed">বন্ধ/পরিশোধিত</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          মোট প্রদর্শিত: <strong className="text-slate-900 font-num">{filtered.length}</strong> টি
        </div>
      </div>

      {/* Loans Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(loan => (
          <div
            key={loan.id}
            className={`bg-white rounded-2xl border p-5 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between ${
              loan.status === 'suspended' ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200'
            }`}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="font-bold text-slate-900 text-sm leading-tight">
                    {loan.employeeNameBn}
                  </div>
                  <div className="text-xs text-slate-500 font-num mt-0.5">
                    পে-আইডি: {loan.payId} · {loan.employeeDesignation}
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                  loan.status === 'active' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : loan.status === 'suspended'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {loan.status === 'active' ? 'সক্রিয়' : loan.status === 'suspended' ? 'কর্তন স্থগিত' : 'পরিশোধিত'}
                </span>
              </div>

              {/* Loan Badges & Source */}
              <div className="flex items-center gap-2 text-xs mb-3 text-slate-600">
                <span className="font-num font-semibold text-slate-800">{loan.loanNo}</span>
                <span>·</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-[11px]">
                  {loan.allocationNo}
                </span>
                <span>·</span>
                <span className={`text-[11px] font-medium ${loan.loanSource === 'own' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {loan.loanSource === 'own' ? 'নিজস্ব পবিস' : loan.lendingPbs}
                </span>
              </div>

              {/* Balances Box */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs mb-3 font-num">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">অপরিশোধিত আসল</div>
                  <div className="font-bold text-emerald-900 text-sm">
                    ৳ {loan.principalBalance.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans">
                    মঞ্জুরি: ৳{loan.disbursementAmount.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase">ধার্যকৃত সুদ</div>
                  <div className="font-bold text-blue-900 text-sm">
                    ৳ {loan.interestBalance.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 font-sans">
                    {loan.loanSource === 'other' ? 'সুদ মুক্ত' : '৭% সরল সুদ'}
                  </div>
                </div>
              </div>

              {/* Monthly Installment */}
              <div className="text-xs text-slate-600 flex items-center justify-between mb-4">
                <span>মাসিক কর্তন কিস্তি:</span>
                <span className="font-bold text-slate-900 font-num">৳ {loan.monthlyInstallment.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onOpenLedger(loan.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors flex items-center gap-1"
                  title="সম্পূর্ণ খতিয়ান স্টেটমেন্ট দেখুন"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>খতিয়ান</span>
                </button>

                {currentUser.role !== 'employee' && (
                  <button
                    onClick={() => onToggleStatus(loan.id, loan.status)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    title={loan.status === 'suspended' ? 'কিস্তি কর্তন পুনরায় চালু করুন' : 'কিস্তি কর্তন স্থগিত করুন'}
                  >
                    {loan.status === 'suspended' ? (
                      <PlayCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <PauseCircle className="w-4 h-4 text-amber-600" />
                    )}
                  </button>
                )}

                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => onDeleteLoan(loan.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="রিসাইকেল বিনে পাঠান"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {currentUser.role !== 'employee' && (
                <button
                  onClick={() => onOpenRepayment(loan.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-2xs flex items-center gap-1 active:scale-95"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>কিস্তি পোস্ট</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
