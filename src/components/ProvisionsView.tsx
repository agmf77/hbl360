import React, { useState } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Coins
} from 'lucide-react';
import { Provision, Loan, UserSession } from '../types';

interface ProvisionsViewProps {
  provisions: Provision[];
  loans: Loan[];
  currentUser: UserSession;
  onRunProvisions: (month: string) => Promise<void>;
  isProcessing: boolean;
}

export const ProvisionsView: React.FC<ProvisionsViewProps> = ({
  provisions,
  loans,
  currentUser,
  onRunProvisions,
  isProcessing
}) => {
  const [targetMonth, setTargetMonth] = useState('2026-10');
  const [successMsg, setSuccessMsg] = useState('');

  // Determine provision rate
  const isPre2020 = targetMonth <= '2019-12';
  const currentRate = isPre2020 ? 8 : 7;

  // Filter eligible loans for provision:
  // Must be Own PBS (Other PBS are exempt!) and have principalBalance > 0 and be active
  const eligibleLoans = loans.filter(
    l => l.loanSource === 'own' && l.status === 'active' && l.principalBalance > 0
  );

  // Check which loans are already provisioned for selected month
  const alreadyProvisionedLoanIds = new Set(
    provisions.filter(p => p.provisionMonth === targetMonth).map(p => p.loanId)
  );

  const pendingLoans = eligibleLoans.filter(l => !alreadyProvisionedLoanIds.has(l.id));

  const totalEstimatedInterest = pendingLoans.reduce((sum, l) => {
    return sum + Math.round((l.principalBalance * (currentRate / 100)) / 12);
  }, 0);

  const handleRun = async () => {
    try {
      setSuccessMsg('');
      await onRunProvisions(targetMonth);
      setSuccessMsg(`${targetMonth} মাসের সুদ প্রভিশন সফলভাবে সম্পন্ন হয়েছে!`);
    } catch (err: any) {
      alert(err.message || 'প্রভিশন রান ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>মাসিক সরল সুদ প্রভিশন মডিউল</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ডিসেম্বর ২০১৯ পর্যন্ত ৮% এবং জানুয়ারি ২০২০ হতে ৭% হারে অপরিশোধিত আসলের উপর সরল সুদ হিসাব
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="month"
            value={targetMonth}
            onChange={(e) => setTargetMonth(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-num font-bold bg-white"
          />

          {currentUser.role !== 'employee' && (
            <button
              onClick={handleRun}
              disabled={isProcessing || pendingLoans.length === 0}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-2xs ${
                pendingLoans.length === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{pendingLoans.length === 0 ? 'প্রভিশন সমাপ্ত' : 'সুদ প্রভিশন চালান'}</span>
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Rules & Exemption Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs">
          <div className="font-bold text-emerald-950 mb-1 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>প্রযোজ্য সুদের হার: {currentRate}% সরল সুদ</span>
          </div>
          <p className="text-emerald-800 leading-relaxed">
            {targetMonth >= '2020-01' 
              ? '০১ জানুয়ারি ২০২০ থেকে প্রযোজ্য ৭% সরল সুদে মাসিক হিসাব: (আসল স্থিতি × ৭%) ÷ ১২' 
              : '৩১ ডিসেম্বর ২০১৯ পর্যন্ত ৮% সরল সুদে মাসিক হিসাব: (আসল স্থিতি × ৮%) ÷ ১২'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs">
          <div className="font-bold text-blue-950 mb-1 flex items-center gap-1">
            <Coins className="w-4 h-4 text-blue-700" />
            <span>অন্য পবিসের ঋণ সুদ মুক্ত</span>
          </div>
          <p className="text-blue-800 leading-relaxed">
            সরকারি বিধিমালা: <em>"অন্য পবিস থেকে গ্রহণকৃত লোনের উপর সুদ প্রভিশন প্রয়োজন নাই।"</em> সিস্টেম স্বয়ংক্রিয়ভাবে এই ঋণগুলোকে অব্যাহতি প্রদান করেছে।
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="font-bold text-slate-800 mb-1">
            {targetMonth} এর স্থিতি সারসংক্ষেপ
          </div>
          <div className="text-slate-600">
            বাকি লোন: <strong className="font-num text-slate-900">{pendingLoans.length} টি</strong> · 
            মোট সম্ভাব্য সুদ: <strong className="font-num text-emerald-800">৳ {totalEstimatedInterest.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Preview Table for Selected Month */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
            {targetMonth} মাসের যোগ্য ঋণ ও সম্ভাব্য মাসিক সুদ তালিকা ({currentRate}%)
          </h3>
          <span className="text-xs text-slate-500 font-num">
            মোট যোগ্য ঋণ: {eligibleLoans.length} টি
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">কর্মচারী ও ঋণ নং</th>
                <th className="py-2.5 px-3">ঋণের উৎস</th>
                <th className="py-2.5 px-3 text-right">অপরিশোধিত আসল স্থিতি</th>
                <th className="py-2.5 px-3 text-center">হার</th>
                <th className="py-2.5 px-3 text-right">মাসিক ধার্যযোগ্য সুদ</th>
                <th className="py-2.5 px-3 text-center">অবস্থা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eligibleLoans.map(l => {
                const isPosted = alreadyProvisionedLoanIds.has(l.id);
                const estimatedInterest = Math.round((l.principalBalance * (currentRate / 100)) / 12);

                return (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900">{l.employeeNameBn}</div>
                      <div className="text-[11px] text-slate-500 font-num">{l.loanNo} (পে-আইডি: {l.payId})</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-emerald-700 font-medium">নিজস্ব পবিস</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-num font-bold text-slate-900">
                      ৳ {l.principalBalance.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center font-num font-semibold text-slate-700">
                      {currentRate}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-num font-bold text-blue-900">
                      ৳ {estimatedInterest.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isPosted ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          পোস্ট সম্পন্ন
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                          প্রভিশন বাকি
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision History Log */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
            পূর্বে ধার্যকৃত সুদ প্রভিশন হিস্ট্রি
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">প্রভিশন মাস</th>
                <th className="py-2.5 px-3">কর্মচারী ও ঋণ নং</th>
                <th className="py-2.5 px-3 text-right">আসল ভিত্তি</th>
                <th className="py-2.5 px-3 text-center">হার</th>
                <th className="py-2.5 px-3 text-right">ধার্যকৃত সুদের পরিমাণ</th>
                <th className="py-2.5 px-3 text-center">তারিখ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {provisions.slice(0, 10).map(p => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-semibold font-num text-slate-900">
                    {p.provisionMonth}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-medium text-slate-800">{p.employeeNameBn}</span>
                    <span className="text-[11px] text-slate-500 font-num"> ({p.loanNo})</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-num text-slate-700">
                    ৳ {p.principalAmount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center font-num text-slate-600">
                    {p.interestRate}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-num font-bold text-blue-900">
                    ৳ {p.monthlyInterestAmount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-400 font-num text-[11px]">
                    {p.createdAt.split('T')[0]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
