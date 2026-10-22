import React, { useState } from 'react';
import { 
  Building2, 
  Coins, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Calendar, 
  Send, 
  FileText, 
  RotateCcw, 
  ShieldAlert, 
  Check, 
  AlertTriangle,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { DashboardStats, LiveEventItem, UserSession, Loan } from '../types';

interface DashboardViewProps {
  stats: DashboardStats | null;
  loans: Loan[];
  liveEvents: LiveEventItem[];
  currentUser: UserSession;
  onNavigate: (tab: string) => void;
  onRunBatchPayroll: () => void;
  onRunProvisions: () => void;
  onOpenNewAdvice: () => void;
  onSimulateTest: () => void;
  isProcessing: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  loans,
  liveEvents,
  currentUser,
  onNavigate,
  onRunBatchPayroll,
  onRunProvisions,
  onOpenNewAdvice,
  onSimulateTest,
  isProcessing
}) => {
  const [feedFilter, setFeedFilter] = useState<'all' | 'repayment' | 'provision' | 'system'>('all');

  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p>লাইভ ড্যাশবোর্ড তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  const filteredEvents = liveEvents.filter(e => {
    if (feedFilter === 'all') return true;
    if (feedFilter === 'repayment') return e.type.includes('repayment');
    if (feedFilter === 'provision') return e.type.includes('provision');
    return !e.type.includes('repayment') && !e.type.includes('provision');
  });

  return (
    <div className="space-y-6">
      {/* Welcome & Role Context Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-2xl text-white shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              রিয়েলটাইম মনিটরিং কনসোল
            </span>
            <span className="text-slate-400 text-xs font-num">
              চলতি কার্যকাল: {stats.currentMonth} (অক্টোবর ২০২৬)
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            স্বাগতম, {currentUser.nameBn}
          </h2>
          <p className="text-slate-300 text-xs md:text-sm mt-0.5">
            {currentUser.designation} · {currentUser.department}
          </p>
        </div>

        {/* Quick Action Buttons for Accounts & Admin */}
        {currentUser.role !== 'employee' && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onRunBatchPayroll}
              disabled={isProcessing || stats.isPayrollComplete}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                stats.isPayrollComplete
                  ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 cursor-default'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold active:scale-95'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>{stats.isPayrollComplete ? 'চলতি মাসের কর্তন সম্পন্ন' : 'অক্টোবর/২৬ ব্যাচ কর্তন রান'}</span>
            </button>

            <button
              onClick={onRunProvisions}
              disabled={isProcessing || stats.isProvisionComplete}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border shadow-sm ${
                stats.isProvisionComplete
                  ? 'bg-slate-800 text-slate-400 border-slate-700 cursor-default'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600 active:scale-95'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>{stats.isProvisionComplete ? 'সুদ প্রভিশন সম্পন্ন' : '৭% সুদ প্রভিশন রান'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Disbursed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            মোট ঋণ বিতরণ
          </div>
          <div className="text-lg md:text-xl font-bold text-slate-900 font-num">
            ৳ {stats.totalDisbursed.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>সক্রিয় ঋণ: {stats.totalLoans} টি</span>
            <span className="text-emerald-600 font-semibold">{stats.ownLoansCount} নিজস্ব</span>
          </div>
        </div>

        {/* Outstanding Principal */}
        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-2xs">
          <div className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>অপরিশোধিত আসল স্থিতি</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-lg md:text-xl font-bold text-emerald-900 font-num">
            ৳ {stats.totalPrincipalBalance.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">
            আসল আদায় হার: <strong className="font-num">{stats.recoveryRatePercent}%</strong>
          </div>
        </div>

        {/* Provisioned Interest Balance */}
        <div className="bg-white p-4 rounded-xl border border-blue-100 bg-blue-50/20 shadow-2xs">
          <div className="text-[11px] font-medium text-blue-800 uppercase tracking-wider mb-1">
            ধার্যকৃত সুদ স্থিতি
          </div>
          <div className="text-lg md:text-xl font-bold text-blue-900 font-num">
            ৳ {stats.totalInterestBalance.toLocaleString()}
          </div>
          <div className="text-[11px] text-blue-700 mt-1">
            ৮% (২০১৯ পর্যন্ত) / ৭% (২০২০+)
          </div>
        </div>

        {/* Total Outstanding Payable */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            মোট প্রদেয় স্থিতি (আসল+সুদ)
          </div>
          <div className="text-lg md:text-xl font-bold text-slate-900 font-num">
            ৳ {stats.totalOutstanding.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            অগ্রিম জমা স্থিতি: <strong className="font-num">৳ {stats.totalAdvanceBalance.toLocaleString()}</strong>
          </div>
        </div>

        {/* Total Collected / Recovered */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            মোট আদায়কৃত কিস্তি
          </div>
          <div className="text-lg md:text-xl font-bold text-slate-900 font-num">
            ৳ {stats.totalCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            আসল: ৳{stats.totalPrincipalCollected.toLocaleString()}
          </div>
        </div>

        {/* Pending Remittance */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-2xs">
          <div className="text-[11px] font-medium text-amber-900 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>অন্য পবিস রেমিট্যান্স</span>
            {stats.pendingRemittanceAmount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            )}
          </div>
          <div className="text-lg md:text-xl font-bold text-amber-950 font-num">
            ৳ {stats.pendingRemittanceAmount.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-800 mt-1 flex items-center justify-between">
            <span>অপেক্ষমাণ: {stats.pendingRemittanceCount} টি</span>
            <button
              onClick={() => onNavigate('remittances')}
              className="text-amber-900 font-semibold underline hover:text-amber-700"
            >
              ব্যাংক চিঠি
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Routine Assistant (মাসিক রুটিন কার্যক্রম সহায়ক - অক্টোবর ২০২৬) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>মাসিক রুটিন কার্যক্রম সহায়ক — অক্টোবর ২০২৬</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড ও পবিস হিসাব বিধিমালা অনুযায়ী প্রতি মাসের রুটিন হিসাব
            </p>
          </div>
          <div className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 self-start sm:self-auto">
            মাসিক কিস্তি প্রদেয়: <span className="font-num font-bold text-slate-900">৳ {stats.monthlyPayrollDue.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: Payroll Deduction */}
          <div className={`p-4 rounded-xl border transition-all ${
            stats.isPayrollComplete
              ? 'bg-emerald-50/50 border-emerald-200'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-[10px]">১</span>
                বেতন হতে কিস্তি কর্তন
              </span>
              {stats.isPayrollComplete ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> সম্পন্ন
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                  <Clock className="w-3.5 h-3.5" /> অপেক্ষমাণ
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 mb-3">
              {stats.isPayrollComplete
                ? `অক্টোবর/২৬ এর সকল ${stats.currentMonthDeductionCount} টি ঋণের কিস্তি (৳${stats.currentMonthDeducted.toLocaleString()}) কর্তন হয়েছে।`
                : 'চলতি মাসের বেতন থেকে নিয়মিত কিস্তি কর্তন সম্পন্ন করতে ব্যাচ রান চালান।'}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={onRunBatchPayroll}
                disabled={isProcessing || stats.isPayrollComplete || currentUser.role === 'employee'}
                className={`w-full py-1.5 px-3 text-xs font-medium rounded-lg text-center transition-colors ${
                  stats.isPayrollComplete
                    ? 'bg-emerald-100 text-emerald-800 cursor-default'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs font-semibold'
                }`}
              >
                {stats.isPayrollComplete ? 'কর্তন যাচাইকৃত' : 'এক ক্লিকে ব্যাচ কর্তন চালান'}
              </button>
            </div>
          </div>

          {/* Step 2: Monthly Interest Provision */}
          <div className={`p-4 rounded-xl border transition-all ${
            stats.isProvisionComplete
              ? 'bg-emerald-50/50 border-emerald-200'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-[10px]">২</span>
                সরল সুদ প্রভিশন (৭%)
              </span>
              {stats.isProvisionComplete ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> সম্পন্ন
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                  <Clock className="w-3.5 h-3.5" /> প্রভিশন বাকি
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 mb-3">
              {stats.isProvisionComplete
                ? `চলতি মাসে ${stats.currentMonthProvisionCount} টি নিজস্ব ঋণে মোট ৳${stats.currentMonthProvisionInterest.toLocaleString()} সুদ ধার্যকৃত।`
                : 'নিজস্ব পবিস লোনে ৭% সরল সুদে মাসিক সুদ প্রভিশন গণনা করে লেজারে পোস্ট করুন।'}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={onRunProvisions}
                disabled={isProcessing || stats.isProvisionComplete || currentUser.role === 'employee'}
                className={`w-full py-1.5 px-3 text-xs font-medium rounded-lg text-center transition-colors ${
                  stats.isProvisionComplete
                    ? 'bg-emerald-100 text-emerald-800 cursor-default'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs font-semibold'
                }`}
              >
                {stats.isProvisionComplete ? 'প্রভিশন সমাপ্ত' : 'সুদ প্রভিশন চালান'}
              </button>
            </div>
          </div>

          {/* Step 3: Inter-PBS Remittance */}
          <div className="p-4 rounded-xl border bg-slate-50 border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-[10px]">৩</span>
                ব্যাংক অ্যাডভাইস ও রেমিট্যান্স
              </span>
              {stats.pendingRemittanceAmount === 0 ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> নিষ্পন্ন
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                  <Clock className="w-3.5 h-3.5" /> {stats.pendingRemittanceCount} টি বাকি
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 mb-3">
              অন্য পবিসের ঋণের কর্তিত অর্থ (৳{stats.pendingRemittanceAmount.toLocaleString()}) প্রেরণের জন্য ব্যাংক অ্যাডভাইস ও সরকারি পত্র প্রস্তুত করুন।
            </p>

            <button
              onClick={onOpenNewAdvice}
              disabled={currentUser.role === 'employee'}
              className="w-full py-1.5 px-3 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white shadow-2xs transition-colors flex items-center justify-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ব্যাংক অ্যাডভাইস প্রস্তুত করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Portfolio Composition & Real-time Live Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Active Loans Quick Overview & Government Rule Note */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Loans Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  চলতি ঋণ হিসাব সারসংক্ষেপ
                </h3>
                <p className="text-xs text-slate-500">
                  আসল আগে পরিশোধ ও সরল সুদ নীতিতে চলমান ঋণসমূহ
                </p>
              </div>
              <button
                onClick={() => onNavigate('loans')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>সকল ঋণ ({loans.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">ঋণ নং ও কর্মচারী</th>
                    <th className="py-2.5 px-3">উৎস ও লট</th>
                    <th className="py-2.5 px-3 text-right">আসল স্থিতি</th>
                    <th className="py-2.5 px-3 text-right">সুদ স্থিতি</th>
                    <th className="py-2.5 px-3 text-right">মাসিক কিস্তি</th>
                    <th className="py-2.5 px-3 text-center">অবস্থা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans.slice(0, 5).map(loan => (
                    <tr key={loan.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{loan.employeeNameBn}</div>
                        <div className="text-[11px] text-slate-500 font-num">{loan.loanNo} (পে-আইডি: {loan.payId})</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-700">
                          {loan.loanSource === 'own' ? 'নিজস্ব পবিস' : loan.lendingPbs}
                        </div>
                        <div className="text-[10px] text-slate-400">{loan.allocationNo}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-num font-bold text-emerald-900">
                        ৳ {loan.principalBalance.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-num font-medium text-blue-900">
                        ৳ {loan.interestBalance.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-num font-medium text-slate-700">
                        ৳ {loan.monthlyInstallment.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          loan.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-800'
                            : loan.status === 'suspended'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {loan.status === 'active' ? 'সক্রিয়' : loan.status === 'suspended' ? 'স্থগিত' : 'বন্ধ'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Core Government Accounting Policy Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80">
            <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wide mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড গৃহ নির্মাণ ঋণ হিসাব নীতিসমূহ</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700 mt-2">
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>আসল আগে পরিশোধ নীতি:</strong> প্রতি মাসের বেতন কর্তনের অর্থ প্রথমে আসল স্থিতির সাথে সমন্বয় হয়। আসল সম্পূর্ণ শূন্য হলে সুদ আদায় শুরু হয়।
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>সুদ প্রভিশন বিধি:</strong> ডিসেম্বর ২০১৯ পর্যন্ত অপরিশোধিত মাসভিত্তিক আসলের উপর ৮% এবং জানুয়ারি ২০২০ হতে ৭% হারে সরল সুদ ধার্য হয়।
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>অন্য পবিসের ঋণ:</strong> বদলিকৃত অন্য পবিস হতে গ্রহণকৃত লোনের উপর বর্তমান পবিসে সুদ প্রভিশন প্রয়োজন হয় না।
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                <span>
                  <strong>অগ্রিম জমা হিসাব:</strong> আসল ও সুদ পরিশোধের পর অতিরিক্ত কর্তিত অর্থ অগ্রিম জমা হিসেবে পৃথক থাকে; ব্যালেন্স কখনো ঋণাত্মক হয় না।
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Real-time Live Event Stream & Activity Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>লাইভ ইভেন্ট ও অ্যাক্টিভিটি স্ট্রিম</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                সার্ভার ও সকল ক্লায়েন্ট থেকে রিয়েলটাইম আপডেট
              </p>
            </div>
            <button
              onClick={onSimulateTest}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 px-2 py-1 rounded bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              title="রিয়েলটাইম ব্রডকাস্ট টেস্ট করতে ক্লিক করুন"
            >
              টেস্ট পিং
            </button>
          </div>

          {/* Event Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs mb-3">
            <button
              onClick={() => setFeedFilter('all')}
              className={`flex-1 py-1 px-2 rounded-md font-medium transition-colors ${
                feedFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              সকল ({liveEvents.length})
            </button>
            <button
              onClick={() => setFeedFilter('repayment')}
              className={`flex-1 py-1 px-2 rounded-md font-medium transition-colors ${
                feedFilter === 'repayment' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              কিস্তি
            </button>
            <button
              onClick={() => setFeedFilter('provision')}
              className={`flex-1 py-1 px-2 rounded-md font-medium transition-colors ${
                feedFilter === 'provision' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              সুদ
            </button>
          </div>

          {/* Live Scrollable Feed */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                কোনো ইভেন্ট নেই। নতুন কিস্তি কর্তন বা সুদ প্রভিশন করলে এখানে লাইভ দেখাবে।
              </div>
            ) : (
              filteredEvents.map(event => (
                <div
                  key={event.id}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{event.title}</span>
                    <span className="text-[10px] text-slate-400 font-num">{event.timestamp}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {event.details}
                  </p>
                  {event.sourceUser && (
                    <div className="text-[10px] text-emerald-700 font-medium pt-0.5">
                      ব্যবহারকারী: {event.sourceUser}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
