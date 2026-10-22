import React, { useState, useMemo } from 'react';
import { X, Calendar, Coins, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Loan, Repayment } from '../types';

interface BatchPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  loans: Loan[];
  repayments: Repayment[];
  isProcessing: boolean;
  onConfirm: (targetMonth: string, deductionDate: string) => Promise<void>;
}

const banglaMonths: Record<string, string> = {
  '01': 'জানুয়ারি',
  '02': 'ফেব্রুয়ারি',
  '03': 'মার্চ',
  '04': 'এপ্রিল',
  '05': 'মে',
  '06': 'জুন',
  '07': 'জুলাই',
  '08': 'আগস্ট',
  '09': 'সেপ্টেম্বর',
  '10': 'অক্টোবর',
  '11': 'নভেম্বর',
  '12': 'ডিসেম্বর'
};

const toBnNumber = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (w) => bnDigits[+w]);
};

export const formatMonthBn = (ym: string): string => {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  const mName = banglaMonths[m] || m;
  const yBn = toBnNumber(y);
  return `${mName}/${yBn}`;
};

// Calculate exact month end date (e.g. 2026-10 -> 2026-10-31, 2026-09 -> 2026-09-30)
export const getMonthEndDate = (ym: string): string => {
  if (!ym) return '';
  const [yearStr, monthStr] = ym.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  if (isNaN(year) || isNaN(month)) return '';
  // Day 0 of next month returns the last day of the target month
  const lastDay = new Date(year, month, 0).getDate();
  const lastDayStr = String(lastDay).padStart(2, '0');
  return `${yearStr}-${String(month).padStart(2, '0')}-${lastDayStr}`;
};

export const BatchPayrollModal: React.FC<BatchPayrollModalProps> = ({
  isOpen,
  onClose,
  loans,
  repayments,
  isProcessing,
  onConfirm
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  // Auto-set posting date to the month end date of the selected month
  const [deductionDate, setDeductionDate] = useState<string>(() => getMonthEndDate('2026-10'));
  const [confirmedCheck, setConfirmedCheck] = useState<boolean>(true);

  // Automatically update posting date to month end date when user selects or changes month
  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
    const monthEnd = getMonthEndDate(newMonth);
    if (monthEnd) {
      setDeductionDate(monthEnd);
    }
  };

  // Active loans eligible for payroll deduction
  const activeLoans = useMemo(() => {
    return loans.filter(
      l => l.status === 'active' && (l.principalBalance > 0 || l.interestBalance > 0)
    );
  }, [loans]);

  // Loans that already have repayment in selectedMonth
  const alreadyDeductedLoanIds = useMemo(() => {
    return new Set(
      repayments
        .filter(r => r.repaymentMonth === selectedMonth)
        .map(r => r.loanId)
    );
  }, [repayments, selectedMonth]);

  // Loans that will be processed in this batch run
  const pendingLoans = useMemo(() => {
    return activeLoans.filter(l => !alreadyDeductedLoanIds.has(l.id));
  }, [activeLoans, alreadyDeductedLoanIds]);

  const totalBatchAmount = useMemo(() => {
    return pendingLoans.reduce((sum, l) => sum + (l.monthlyInstallment || 0), 0);
  }, [pendingLoans]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMonth) return;
    await onConfirm(selectedMonth, deductionDate);
  };

  // Month presets
  const monthPresets = [
    { value: '2026-09', label: 'সেপ্টেম্বর/২০২৬' },
    { value: '2026-10', label: 'অক্টোবর/২০২৬ (চলতি মাস)' },
    { value: '2026-11', label: 'নভেম্বর/২০২৬' },
    { value: '2026-12', label: 'ডিসেম্বর/২০২৬' },
    { value: '2027-01', label: 'জানুয়ারি/২০২৭' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-300 w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header - High Contrast */}
        <div className="px-5 py-4 border-b-2 border-slate-200 flex items-center justify-between bg-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-950 text-base">
                ব্যাচ কিস্তি কর্তন রান কনফার্মেশন
              </h3>
              <p className="text-xs font-semibold text-slate-700">
                মাসিক বেতন বিল হতে কর্মকর্তা-কর্মচারীদের ঋণ কিস্তি স্বয়ংক্রিয় কর্তন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-200 transition-colors border border-transparent hover:border-slate-300"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Confirmation Message Highlight Box - Crisp Dark Text on Warm Light Background */}
          <div className="p-4 rounded-xl bg-amber-100 border-2 border-amber-400 text-amber-950 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="font-black text-xs sm:text-sm">
                কোন মাস পর্যন্ত ব্যাচ কর্তন রান করতে চান তা নিশ্চিত করুন:
              </span>
            </div>
            <p className="text-xs font-medium text-amber-950 leading-relaxed pl-6">
              নির্বাচিত মাস পর্যন্ত সকল সক্রিয় ঋণ হিসাবের নিয়মিত মাসিক কিস্তি হিসাবভুক্ত হবে এবং প্রত্যেকের ব্যক্তিগত খতিয়ানে (Ledger) আসল সমন্বয় অগ্রাধিকার নীতিতে পোস্টিং সম্পন্ন হবে।
            </p>
          </div>

          {/* Month Selector - High Contrast */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-extrabold text-slate-950 text-xs sm:text-sm">
                কর্তন মাস নির্বাচন (Deduction Month):
              </label>
              <span className="text-xs font-black text-emerald-950 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-400">
                {formatMonthBn(selectedMonth)} মাস পর্যন্ত
              </span>
            </div>

            {/* Quick Month Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2.5">
              {monthPresets.map(preset => {
                const isSelected = selectedMonth === preset.value;
                return (
                  <button
                    type="button"
                    key={preset.value}
                    onClick={() => handleMonthChange(preset.value)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border-2 text-left transition-all shadow-2xs ${
                      isSelected
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs ring-2 ring-emerald-500/40'
                        : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Month Picker */}
            <div className="flex items-center gap-2">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 font-num font-bold text-slate-950 bg-white text-xs focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                required
              />
            </div>
          </div>

          {/* Posting Date - Auto Month End Date */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-extrabold text-slate-950 text-xs sm:text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>ভাউচার / পোস্টিং তারিখ (Posting Date):</span>
              </label>
              <span className="text-[11px] font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300 font-sans">
                মাসের শেষ তারিখ (Month End Date)
              </span>
            </div>
            <input
              type="date"
              value={deductionDate}
              onChange={(e) => setDeductionDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 border-slate-300 font-num font-bold text-slate-950 bg-white text-xs focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
              required
            />
            <div className="text-[11px] text-slate-600 mt-1 font-sans">
              * নির্বাচিত মাসের সমাপনী তারিখ স্বয়ংক্রিয়ভাবে সেট হয়েছে ({deductionDate})
            </div>
          </div>

          {/* Batch Summary Preview Box - High Contrast */}
          <div className="p-4 rounded-xl bg-slate-50 border-2 border-slate-300 space-y-2.5">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
              ব্যাচ কর্তন সারসংক্ষেপ ({formatMonthBn(selectedMonth)}):
            </span>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-white p-3 rounded-lg border-2 border-slate-200 shadow-2xs">
                <span className="text-slate-700 block text-xs font-bold">মোট সক্রিয় ঋণ</span>
                <strong className="text-slate-950 font-num font-black text-base">{activeLoans.length} টি</strong>
              </div>

              <div className="bg-white p-3 rounded-lg border-2 border-slate-200 shadow-2xs">
                <span className="text-slate-700 block text-xs font-bold">এই রানে কর্তনযোগ্য</span>
                <strong className="text-emerald-900 font-num font-black text-base">
                  {pendingLoans.length} টি ঋণ
                </strong>
                {alreadyDeductedLoanIds.size > 0 && (
                  <div className="text-[11px] text-slate-600 font-medium">
                    ({alreadyDeductedLoanIds.size} টি ইতিমধ্যে কর্তিত)
                  </div>
                )}
              </div>
            </div>

            <div className="bg-emerald-100/90 p-3 rounded-lg border-2 border-emerald-400 text-emerald-950 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-emerald-950 font-black block text-xs">মোট আনুমানিক কিস্তি আদায়:</span>
                <span className="text-[11px] text-emerald-900 font-medium font-sans">
                  {formatMonthBn(selectedMonth)} মাসের নিয়মিত মাসিক কর্তন
                </span>
              </div>
              <div className="text-lg sm:text-xl font-black text-emerald-950 font-num">
                ৳ {totalBatchAmount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Confirmation Checkbox - High Contrast */}
          <label className="flex items-start gap-2.5 cursor-pointer pt-1 select-none">
            <input
              type="checkbox"
              checked={confirmedCheck}
              onChange={(e) => setConfirmedCheck(e.target.checked)}
              className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4 border-2 border-slate-400 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-950 leading-relaxed">
              আমি নিশ্চিত করছি যে কর্মকর্তা-কর্মচারীদের <strong>{formatMonthBn(selectedMonth)}</strong> মাস পর্যন্ত নিয়মিত গৃহ ঋণ কিস্তি কর্তন রান করা হবে।
            </span>
          </label>

          {/* Actions */}
          <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl border-2 border-slate-300 hover:bg-slate-100 text-slate-900 font-bold text-xs transition-colors shadow-2xs"
            >
              বাতিল
            </button>

            <button
              type="submit"
              disabled={isProcessing || !confirmedCheck || pendingLoans.length === 0}
              className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 disabled:text-slate-500 text-white font-black text-xs transition-all shadow-xs flex items-center gap-2 active:scale-95 disabled:active:scale-100 border border-emerald-950"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>ব্যাচ রান প্রসেস হচ্ছে...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>হ্যাঁ, {formatMonthBn(selectedMonth)} পর্যন্ত কর্তন রান করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
