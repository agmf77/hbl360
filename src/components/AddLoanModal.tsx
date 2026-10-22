import React, { useState } from 'react';
import { X, Building2, Check, AlertCircle } from 'lucide-react';
import { Employee, LoanSource } from '../types';

interface AddLoanModalProps {
  employees: Employee[];
  pbsName: string;
  onClose: () => void;
  onSubmit: (loanData: any) => Promise<void>;
  isSubmitting: boolean;
}

export const AddLoanModal: React.FC<AddLoanModalProps> = ({
  employees,
  pbsName,
  onClose,
  onSubmit,
  isSubmitting
}) => {
  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
  const [loanNo, setLoanNo] = useState(`HL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`);
  const [loanSource, setLoanSource] = useState<LoanSource>('own');
  const [lendingPbs, setLendingPbs] = useState('ঢাকা পল্লী বিদ্যুৎ সমিতি-১');
  const [allocationNo, setAllocationNo] = useState('১ম বরাদ্দ');
  const [disbursementAmount, setDisbursementAmount] = useState('1500000');
  const [disbursementDate, setDisbursementDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyInstallment, setMonthlyInstallment] = useState('15000');
  const [principalBalance, setPrincipalBalance] = useState('1500000');
  const [interestBalance, setInterestBalance] = useState('0');
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      setError('কর্মকর্তা/কর্মচারী নির্বাচন করুন।');
      return;
    }
    if (!loanNo) {
      setError('ঋণ নম্বর প্রদান করুন।');
      return;
    }

    try {
      setError('');
      await onSubmit({
        employeeId,
        loanNo,
        loanSource,
        lendingPbs: loanSource === 'other' ? lendingPbs : pbsName,
        allocationNo,
        disbursementAmount: Number(disbursementAmount),
        disbursementDate,
        monthlyInstallment: Number(monthlyInstallment),
        principalBalance: Number(principalBalance),
        interestBalance: loanSource === 'other' ? 0 : Number(interestBalance),
        asOfDate
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'ঋণ সংরক্ষণ ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm md:text-base">
              নতুন গৃহ নির্মাণ ঋণ মঞ্জুরকরণ ফরম
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Employee */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">কর্মকর্তা/কর্মচারী নির্বাচন করুন *</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
              required
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.nameBn} (পে-আইডি: {e.payId}) — {e.designation}
                </option>
              ))}
            </select>
          </div>

          {/* Loan No & Allocation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ঋণ নম্বর *</label>
              <input
                type="text"
                value={loanNo}
                onChange={(e) => setLoanNo(e.target.value)}
                placeholder="HL-2026-0101"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-num font-semibold"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">বরাদ্দ / লট নম্বর</label>
              <select
                value={allocationNo}
                onChange={(e) => setAllocationNo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
              >
                <option value="১ম বরাদ্দ">১ম বরাদ্দ</option>
                <option value="২য় বরাদ্দ (সম্প্রসারণ)">২য় বরাদ্দ (সম্প্রসারণ)</option>
                <option value="বিশেষ লট">বিশেষ লট</option>
              </select>
            </div>
          </div>

          {/* Loan Source */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ঋণের উৎস *</label>
              <select
                value={loanSource}
                onChange={(e) => setLoanSource(e.target.value as LoanSource)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
              >
                <option value="own">নিজস্ব পবিস (সুদ প্রযোজ্য)</option>
                <option value="other">অন্যান্য পবিস (সুদ মুক্ত)</option>
              </select>
            </div>
            {loanSource === 'other' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ঋণপ্রদানকারী পবিস *</label>
                <input
                  type="text"
                  value={lendingPbs}
                  onChange={(e) => setLendingPbs(e.target.value)}
                  placeholder="যেমন: ঢাকা পবিস-১"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  required
                />
              </div>
            )}
          </div>

          {/* Disbursement Amount & Monthly Installment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">মোট মঞ্জুরিকৃত আসল (টাকা) *</label>
              <input
                type="number"
                value={disbursementAmount}
                onChange={(e) => {
                  setDisbursementAmount(e.target.value);
                  setPrincipalBalance(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-num font-bold"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">মাসিক কিস্তির হার (টাকা) *</label>
              <input
                type="number"
                value={monthlyInstallment}
                onChange={(e) => setMonthlyInstallment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-num font-bold"
                required
              />
            </div>
          </div>

          {/* Balances */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">প্রারম্ভিক আসল স্থিতি *</label>
              <input
                type="number"
                value={principalBalance}
                onChange={(e) => setPrincipalBalance(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-num font-bold text-emerald-900"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">প্রারম্ভিক সুদ স্থিতি</label>
              <input
                type="number"
                disabled={loanSource === 'other'}
                value={loanSource === 'other' ? '0' : interestBalance}
                onChange={(e) => setInterestBalance(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-num font-bold text-blue-900 disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ঋণ বিতরণের তারিখ</label>
              <input
                type="date"
                value={disbursementDate}
                onChange={(e) => setDisbursementDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-num"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">স্থিতির তারিখ (As of Date)</label>
              <input
                type="date"
                value={asOfDate}
                onChange={(e) => setAsOfDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-num"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'ঋণ সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
