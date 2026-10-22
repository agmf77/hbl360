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
  ArrowUpRight,
  Plus,
  Wallet,
  Landmark,
  Calculator,
  Info
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
  onOpenAddLoan?: () => void;
  onRefresh?: () => void;
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
  onOpenAddLoan,
  onRefresh,
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
    <div className="space-y-5">
      {/* Top Header: Dashboard Summary & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            ড্যাশবোর্ড সারসংক্ষেপ
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            কর্মকর্তা-কর্মচারীদের গৃহ নির্মাণ ঋণ ও কিস্তি আদায় পরিস্থিতি
          </p>
        </div>

        {currentUser.role !== 'employee' && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenAddLoan || (() => onNavigate('loans'))}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#065f46] hover:bg-emerald-700 text-white transition-all shadow-2xs active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন গৃহ ঋণ বরাদ্দ</span>
            </button>

            <button
              onClick={onRunBatchPayroll}
              disabled={isProcessing || stats.isPayrollComplete}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-2xs active:scale-95 ${
                stats.isPayrollComplete
                  ? 'bg-blue-900/60 text-blue-200 cursor-default'
                  : 'bg-[#1e40af] hover:bg-blue-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{stats.isPayrollComplete ? 'মাসিক বেতন কর্তন সম্পন্ন' : 'মাসিক বেতন কর্তন রান'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Monthly Action Hub Card (Dark Forest Green) */}
      <div className="bg-[#0b4d3c] rounded-2xl p-5 text-white shadow-md border border-emerald-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-800/80 rounded-xl border border-emerald-700/60">
              <Calendar className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  মাসিক রুটিন কার্যক্রম সহায়ক (Monthly Action Hub)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-800/90 text-emerald-200 border border-emerald-600/50">
                  অক্টোবর ২০২৬
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">
                চলতি মাসের বেতন কিস্তি কর্তন, রেমিট্যান্স এডভাইস ও সুদ প্রভিশন ট্র্যাকার
              </p>
            </div>
          </div>

          <button
            onClick={onRefresh || (() => window.location.reload())}
            className="flex items-center gap-1.5 text-xs text-emerald-200 hover:text-white px-2.5 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-700/50 transition-colors self-start sm:self-auto"
            title="তথ্য রিফ্রেশ করুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>রিফ্রেশ</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Step 1: Payroll Deduction */}
          <div className="bg-emerald-900/40 border border-emerald-700/50 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">১. বেতন কিস্তি কর্তন</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {stats.isPayrollComplete ? 'সম্পন্ন' : 'অপেক্ষমাণ'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80 mb-3">
                {stats.isPayrollComplete
                  ? `সকল ${stats.currentMonthDeductionCount} জন ঋণগ্রহীতার কিস্তি কর্তন সম্পন্ন (মোট আদায়: ৳${stats.currentMonthDeducted.toLocaleString()})`
                  : 'চলতি মাসের বেতন থেকে নিয়মিত কিস্তি কর্তন সম্পন্ন করতে ব্যাচ রান চালান।'}
              </p>
            </div>
            <button
              onClick={onRunBatchPayroll}
              disabled={isProcessing || stats.isPayrollComplete || currentUser.role === 'employee'}
              className="w-full py-2 px-3 bg-white hover:bg-slate-100 text-emerald-950 font-bold rounded-lg text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-75"
            >
              <Coins className="w-3.5 h-3.5 text-emerald-800" />
              <span>ব্যাচ কর্তন রান</span>
            </button>
          </div>

          {/* Step 2: Remittance Bank Advice */}
          <div className="bg-emerald-900/40 border border-emerald-700/50 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">২. অন্য পবিস রেমিট্যান্স</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-600/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  {stats.pendingRemittanceCount > 0 ? `${stats.pendingRemittanceCount}টি পবিস বাকি` : 'সম্পন্ন'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80 mb-3">
                মোট ৳{stats.pendingRemittanceAmount.toLocaleString()} টাকা সংশ্লিষ্ট পবিসে প্রেরণযোগ্য অপেক্ষমাণ
              </p>
            </div>
            <button
              onClick={onOpenNewAdvice}
              className="w-full py-2 px-3 bg-[#7c3aed] hover:bg-purple-700 text-white font-bold rounded-lg text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-white" />
              <span>এক ক্লিকে ব্যাংক অ্যাডভাইস</span>
            </button>
          </div>

          {/* Step 3: Interest Provision */}
          <div className="bg-emerald-900/40 border border-emerald-700/50 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">৩. মাসিক সুদ প্রভিশন</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {stats.isProvisionComplete ? 'সম্পন্ন' : 'বাকি'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80 mb-3">
                {stats.isProvisionComplete
                  ? `চলতি মাসে ${stats.currentMonthProvisionCount}টি নিজস্ব ঋণের সরল সুদ প্রভিশন গণনা সম্পন্ন হয়েছে`
                  : 'নিজস্ব পবিস ঋণে সরল সুদে মাসিক প্রভিশন হিসাব করে লেজারে যোগ করুন'}
              </p>
            </div>
            <button
              onClick={onRunProvisions}
              disabled={isProcessing || stats.isProvisionComplete || currentUser.role === 'employee'}
              className="w-full py-2 px-3 bg-[#d97706] hover:bg-amber-600 text-white font-bold rounded-lg text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-75"
            >
              <TrendingUp className="w-3.5 h-3.5 text-white" />
              <span>সুদ প্রভিশন রান</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Statistics Cards in Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: মোট বিতরণকৃত ঋণ */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="text-xs text-slate-500 font-medium">মোট বিতরণকৃত ঋণ</div>
            <div className="text-xl font-bold text-slate-900 font-num mt-1">
              ৳ {stats.totalDisbursed.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1 font-medium">
              <span>✓</span>
              <span>মঞ্জুরিকৃত ঋণ ({stats.totalLoans} টি)</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: অবশিষ্ট আসল স্থিতি */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="text-xs text-slate-500 font-medium">অবশিষ্ট আসল স্থিতি</div>
            <div className="text-xl font-bold text-blue-900 font-num mt-1">
              ৳ {stats.totalPrincipalBalance.toLocaleString()}
            </div>
            <div className="text-[11px] text-blue-600 mt-1 font-medium">
              আসল আদায় সাপেক্ষ
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <Landmark className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: ধার্যকৃত সুদ স্থিতি */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="text-xs text-slate-500 font-medium">ধার্যকৃত সুদ স্থিতি</div>
            <div className="text-xl font-bold text-amber-700 font-num mt-1">
              ৳ {stats.totalInterestBalance.toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-600 mt-1 font-medium">
              ৮% ও ৭% হারে ধার্যকৃত
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <Calculator className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: অন্য পবিসে প্রেরণযোগ্য */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="text-xs text-slate-500 font-medium">অন্য পবিসে প্রেরণযোগ্য</div>
            <div className="text-xl font-bold text-purple-900 font-num mt-1">
              ৳ {stats.pendingRemittanceAmount.toLocaleString()}
            </div>
            <div className="text-[11px] text-purple-600 mt-1 font-medium">
              অনিষ্পন্ন রেমিট্যান্স
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Chart on Left, Regulations & Quick Rules on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 spans): Fiscal Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">
              অর্থবছর ভিত্তিক ঋণ বিতরণ ও আদায় চিত্র
            </h3>
            <button
              onClick={() => onNavigate('fiscal_year')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>বিস্তারিত বিবরণী →</span>
            </button>
          </div>

          {/* Simple Clean Bar Chart Representation matching screenshot */}
          <div className="h-64 flex flex-col justify-between pt-4">
            <div className="flex-1 flex items-end justify-around gap-4 pb-4 border-b border-slate-200 px-4">
              {/* Year 2023-2024 */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full flex items-end justify-center gap-1.5 h-44">
                  <div className="w-4 sm:w-6 bg-emerald-700 rounded-t-sm h-1" title="বিতরণ: ০"></div>
                  <div className="w-4 sm:w-6 bg-blue-600 rounded-t-sm h-4" title="আদায়: ১,২০,০০০"></div>
                  <div className="w-4 sm:w-6 bg-amber-600 rounded-t-sm h-3" title="সুদ: ৯৬,০০০"></div>
                </div>
                <span className="text-[11px] text-slate-500 font-mono mt-1">2023-2024</span>
              </div>

              {/* Year 2024-2025 */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full flex items-end justify-center gap-1.5 h-44">
                  <div className="w-4 sm:w-6 bg-emerald-700 rounded-t-sm h-1" title="বিতরণ: ০"></div>
                  <div className="w-4 sm:w-6 bg-blue-600 rounded-t-sm h-2" title="আদায়: ৫০,০০০"></div>
                  <div className="w-4 sm:w-6 bg-amber-600 rounded-t-sm h-16" title="সুদ: ৩,৮০,০০০"></div>
                </div>
                <span className="text-[11px] text-slate-500 font-mono mt-1">2024-2025</span>
              </div>

              {/* Year 2025-2026 */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full flex items-end justify-center gap-1.5 h-44">
                  <div className="w-4 sm:w-6 bg-emerald-700 rounded-t-sm h-1" title="বিতরণ: ০"></div>
                  <div className="w-4 sm:w-6 bg-blue-600 rounded-t-sm h-3" title="আদায়: ৮০,০০০"></div>
                  <div className="w-4 sm:w-6 bg-amber-600 rounded-t-sm h-16" title="সুদ: ৩,৫২,০০০"></div>
                </div>
                <span className="text-[11px] text-slate-500 font-mono mt-1">2025-2026</span>
              </div>

              {/* Year 2026-2027 */}
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full flex items-end justify-center gap-1.5 h-44">
                  <div className="w-4 sm:w-6 bg-emerald-700 rounded-t-sm h-2" title="বিতরণ: ০"></div>
                  <div className="w-4 sm:w-6 bg-blue-600 rounded-t-sm h-36" title="আসল আদায়: ২০,৫০,০০০"></div>
                  <div className="w-4 sm:w-6 bg-amber-600 rounded-t-sm h-8" title="সুদ: ১,৬০,০০০"></div>
                </div>
                <span className="text-[11px] text-slate-500 font-mono mt-1 font-bold text-slate-800">2026-2027</span>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-center gap-6 pt-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-emerald-700 rounded-xs"></span>
                <span className="text-slate-600">নতুন ঋণ বিতরণ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-blue-600 rounded-xs"></span>
                <span className="text-slate-600">আসল আদায়</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-amber-600 rounded-xs"></span>
                <span className="text-slate-600">ধার্যকৃত সুদ (প্রভিশন)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 span): জরুরী বিধি ও কার্যাবলী */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3">
              জরুরী বিধি ও কার্যাবলী
            </h3>

            {/* Rule Box */}
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>সুদ ধার্যের সরকারি নীতিমালা (ব্যালেন্সের উপর হিসাব):</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-700 pl-2">
                <li>• ০১-০১-২০২০ এর পূর্বে (ডিসে/২০১৯ পর্যন্ত) অপরিশোধিত ব্যালেন্সে: <strong>৮% সরল সুদ</strong></li>
                <li>• ০১-০১-২০২০ হতে (জানু/২০২০ থেকে) একই ঋণের অপরিশোধিত ব্যালেন্সে: <strong>৭% সরল সুদ</strong></li>
                <li>• বিতরণ তারিখের সাথে হারের সম্পর্ক নেই (ব্যালেন্স ভিত্তিক সময়কালের হারে সুদ)</li>
                <li>• অন্য পবিস হতে গৃহীত ঋণ: সুদ প্রভিশন প্রযোজ্য নয়</li>
                <li>• আদায় বিধি: আগে সম্পূর্ণ আসল, পরে সুদ</li>
              </ul>
            </div>
          </div>

          {/* Quick Action Navigation links */}
          <div className="space-y-2 pt-4">
            <button
              onClick={onRunProvisions}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-700" />
                <span>মাসিক সুদ প্রভিশন রান করুন</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
            </button>

            <button
              onClick={onOpenNewAdvice}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-purple-700" />
                <span>অন্য পবিসের জন্য ব্যাংক অ্যাডভাইস প্রস্তুতকরণ</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
