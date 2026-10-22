import React from 'react';
import { UserSession, Loan, Repayment } from '../types';
import { UserCircle2, Coins, FileText, CheckCircle2, Calendar, Building2 } from 'lucide-react';

interface EmployeePortalViewProps {
  currentUser: UserSession;
  loans: Loan[];
  repayments: Repayment[];
  onOpenLedger: (loanId: string) => void;
}

export const EmployeePortalView: React.FC<EmployeePortalViewProps> = ({
  currentUser,
  loans,
  repayments,
  onOpenLedger
}) => {
  const myLoans = loans.filter(l => l.payId === currentUser.payId);
  const myRepayments = repayments.filter(r => r.payId === currentUser.payId);

  const totalPrincipal = myLoans.reduce((s, l) => s + l.principalBalance, 0);
  const totalInterest = myLoans.reduce((s, l) => s + l.interestBalance, 0);
  const totalInstallment = myLoans.reduce((s, l) => s + l.monthlyInstallment, 0);

  return (
    <div className="space-y-6">
      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 p-6 rounded-2xl text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white text-2xl font-bold border border-white/20">
            {currentUser.nameBn.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                কর্মকর্তা/কর্মচারী সেলফ-সার্ভিস পোর্টাল
              </span>
              <span className="text-slate-400 text-xs font-num">পে-আইডি: {currentUser.payId}</span>
            </div>
            <h2 className="text-xl font-bold mt-1">{currentUser.nameBn}</h2>
            <p className="text-xs text-slate-300">
              {currentUser.designation} · {currentUser.department} ({currentUser.presentPbs || 'নরসিংদী পবিস-১'})
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-right">
          <div className="text-[11px] text-slate-300">মাসিক বেতন হতে প্রদেয় কিস্তি</div>
          <div className="text-xl font-bold text-emerald-300 font-num">৳ {totalInstallment.toLocaleString()}</div>
        </div>
      </div>

      {/* Balances Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 mb-1">মোট অবশিষ্ট আসল স্থিতি</div>
          <div className="text-2xl font-bold text-emerald-900 font-num">
            ৳ {totalPrincipal.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            আগে আসল পরিশোধের নিয়ম প্রযোজ্য
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 mb-1">মোট ধার্যকৃত সুদ স্থিতি</div>
          <div className="text-2xl font-bold text-blue-900 font-num">
            ৳ {totalInterest.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            আসল শূন্যের পর কিস্তি হতে সমন্বয় হবে
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 mb-1">সর্বমোট প্রদেয় ঋণ ব্যালেন্স</div>
          <div className="text-2xl font-bold text-slate-900 font-num">
            ৳ {(totalPrincipal + totalInterest).toLocaleString()}
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">
            মোট সক্রিয় ঋণ: {myLoans.length} টি
          </div>
        </div>
      </div>

      {/* My Loans Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>আমার গৃহ নির্মাণ ঋণসমূহ (My Loans)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myLoans.map(loan => (
            <div key={loan.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-slate-900 text-sm font-num">{loan.loanNo}</div>
                  <div className="text-xs text-slate-500">
                    {loan.allocationNo} · {loan.loanSource === 'own' ? 'নিজস্ব পবিস' : loan.lendingPbs}
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  {loan.status === 'active' ? 'সক্রিয়' : 'বন্ধ'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs font-num">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">মঞ্জুরিকৃত আসল</div>
                  <div className="font-semibold text-slate-800">৳ {loan.disbursementAmount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">মাসিক কিস্তি</div>
                  <div className="font-semibold text-slate-800">৳ {loan.monthlyInstallment.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">বর্তমান আসল স্থিতি</div>
                  <div className="font-bold text-emerald-900 text-sm">৳ {loan.principalBalance.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">বর্তমান সুদ স্থিতি</div>
                  <div className="font-bold text-blue-900 text-sm">৳ {loan.interestBalance.toLocaleString()}</div>
                </div>
              </div>

              <button
                onClick={() => onOpenLedger(loan.id)}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>ব্যক্তিগত ঋণ খতিয়ান স্টেটমেন্ট প্রিন্ট করুন</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* My Repayment History */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
            আমার সাম্প্রতিক কিস্তি কর্তন হিস্ট্রি
          </h3>
          <span className="text-xs text-slate-500 font-num">
            মোট কর্তন: {myRepayments.length} বার
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 font-sans">
              <tr>
                <th className="py-2.5 px-4">কর্তন মাস</th>
                <th className="py-2.5 px-3">তারিখ ও ভাউচার</th>
                <th className="py-2.5 px-3 text-right">মোট কর্তিত কিস্তি</th>
                <th className="py-2.5 px-3 text-right text-emerald-800">আসল সমন্বয়</th>
                <th className="py-2.5 px-3 text-right text-blue-800">সুদ সমন্বয়</th>
                <th className="py-2.5 px-3 text-right">অগ্রিম জমা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-num">
              {myRepayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                    কোনো কর্তন হিস্ট্রি নেই।
                  </td>
                </tr>
              ) : (
                myRepayments.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-900">{r.repaymentMonth}</td>
                    <td className="py-2.5 px-3">
                      <div>{r.repaymentDate}</div>
                      <div className="text-[10px] text-slate-400">{r.voucherNo}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ৳ {r.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                      ৳ {r.principalPaid.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-blue-700">
                      ৳ {r.interestPaid.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-purple-700">
                      {r.advancePaid > 0 ? `৳ ${r.advancePaid.toLocaleString()}` : '-'}
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
