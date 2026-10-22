import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  Plus, 
  Printer, 
  Send, 
  AlertTriangle, 
  Coins, 
  Calendar, 
  X,
  CheckCircle2
} from 'lucide-react';
import { Loan, DemandNotice, PbsSettings, UserSession } from '../types';

interface TransferredLoansViewProps {
  loans: Loan[];
  demandNotices: DemandNotice[];
  settings: PbsSettings;
  currentUser: UserSession;
  onCreateDemandNotice: (data: any) => Promise<void>;
  onOpenLedger: (loanId: string) => void;
  onOpenRepayment: (loanId: string) => void;
  isProcessing: boolean;
}

export const TransferredLoansView: React.FC<TransferredLoansViewProps> = ({
  loans,
  demandNotices,
  settings,
  currentUser,
  onCreateDemandNotice,
  onOpenLedger,
  onOpenRepayment,
  isProcessing
}) => {
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [previewNotice, setPreviewNotice] = useState<DemandNotice | null>(null);

  const [targetPbs, setTargetPbs] = useState('ঢাকা পল্লী বিদ্যুৎ সমিতি-১');
  const [notes, setNotes] = useState('');

  const transferredLoans = loans.filter(l => l.loanSource === 'other');

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    const noticeEmployees = transferredLoans.map(l => ({
      payId: l.payId,
      nameBn: l.employeeNameBn,
      designation: l.employeeDesignation,
      loanNo: l.loanNo,
      monthlyInstallment: l.monthlyInstallment,
      dueMonthsCount: 1,
      totalDue: l.monthlyInstallment
    }));

    await onCreateDemandNotice({
      targetPbs,
      overdueMonths: ['2026-10'],
      employees: noticeEmployees,
      notes
    });

    setShowNoticeModal(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span>বদলিকৃত ঋণ ও তাগাদা পত্র (Transferred Loans & Demand Notices)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            অন্যান্য পবিস হতে বদলিকৃত কর্মকর্তা-কর্মচারীদের ঋণ কিস্তি আদায় এবং বকেয়ার বিপরীতে তাগাদা পত্র প্রস্তুতকরণ
          </p>
        </div>

        {currentUser.role !== 'employee' && (
          <button
            onClick={() => setShowNoticeModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs self-start sm:self-auto"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>সম্মিলিত তাগাদা পত্র প্রস্তুতকরণ</span>
          </button>
        )}
      </div>

      {/* Policy Box */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-3 no-print">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>ইন্টার-পবিস ঋণ হিসাব নীতিমালা:</strong> অন্যান্য পবিস হতে মঞ্জুরকৃত ঋণ অত্র সমিতিতে কর্তন করা হলে, তা কোনো সুদ প্রভিশন ছাড়াই সম্পূর্ণ অর্থ সংশ্লিষ্ট ঋণপ্রদানকারী পবিসে ব্যাংক ট্রান্সফার অ্যাডভাইস মূলে প্রেরণ করা হয়। অত্র সমিতি হতে কোনো কর্মচারী অন্য পবিসে বদলি হলে উক্ত পবিস বরাবর তাগাদা পত্র প্রেরণ করা হয়।
        </div>
      </div>

      {/* Transferred Loans Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
        {transferredLoans.map(loan => (
          <div key={loan.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{loan.employeeNameBn}</h3>
                <div className="text-xs text-slate-500 font-num">
                  পে-আইডি: {loan.payId} · {loan.employeeDesignation}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                অন্যান্য পবিসের ঋণ
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs font-num">
              <div>
                <div className="text-[10px] text-slate-500 uppercase">ঋণপ্রদানকারী পবিস</div>
                <div className="font-bold text-slate-900 font-sans">{loan.lendingPbs}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase">ঋণ নম্বর</div>
                <div className="font-bold text-slate-800">{loan.loanNo}</div>
              </div>
              <div className="pt-1">
                <div className="text-[10px] text-slate-500 uppercase">বাকি আসল স্থিতি</div>
                <div className="font-bold text-emerald-900 text-sm">৳ {loan.principalBalance.toLocaleString()}</div>
              </div>
              <div className="pt-1">
                <div className="text-[10px] text-slate-500 uppercase">মাসিক কিস্তির হার</div>
                <div className="font-bold text-slate-900 text-sm">৳ {loan.monthlyInstallment.toLocaleString()}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => onOpenLedger(loan.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
              >
                খতিয়ান দেখুন
              </button>

              {currentUser.role !== 'employee' && (
                <button
                  onClick={() => onOpenRepayment(loan.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>কিস্তি পোস্ট করুন</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Demand Notices History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs no-print">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
            প্রস্তুতকৃত তাগাদা পত্র রেজিস্টার
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">তাগাদা পত্র নং ও স্মারক</th>
                <th className="py-2.5 px-3">প্রাপক পবিস</th>
                <th className="py-2.5 px-3">তারিখ</th>
                <th className="py-2.5 px-3 text-right">বকেয়া টাকা</th>
                <th className="py-2.5 px-3 text-center">কর্মচারী সংখ্যা</th>
                <th className="py-2.5 px-3 text-center">চিঠি দেখুন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {demandNotices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    কোনো তাগাদা পত্র প্রস্তুত করা হয়নি।
                  </td>
                </tr>
              ) : (
                demandNotices.map(dn => (
                  <tr key={dn.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-slate-900 font-num">{dn.noticeNo}</div>
                      <div className="text-[11px] text-slate-500 font-num">স্মারক: {dn.memoNo}</div>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {dn.targetPbs}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-num">
                      {dn.noticeDate}
                    </td>
                    <td className="py-2.5 px-3 text-right font-num font-bold text-slate-900">
                      ৳ {dn.totalOverdueAmount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center font-num">
                      {dn.employees.length} জন
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setPreviewNotice(dn)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs"
                      >
                        প্রিন্ট ভিউ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Demand Notice Official Printable Preview Modal */}
      {previewNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-3xl overflow-hidden my-6 print-card">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print">
              <span className="font-bold text-xs text-slate-700">অফিসিয়াল তাগাদা পত্র</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট / PDF</span>
                </button>
                <button onClick={() => setPreviewNotice(null)} className="p-1 rounded-lg hover:bg-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-8 sm:p-12 space-y-6 text-slate-900 text-sm leading-relaxed bg-white">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 gap-4">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="PBS Logo" className="w-16 h-16 object-contain rounded shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    বাপবিবো
                  </div>
                )}
                <div className="text-center flex-1">
                  <div className="font-bold text-base sm:text-lg">{settings.boardNameBn}</div>
                  <div className="font-bold text-lg sm:text-xl text-slate-950 mt-0.5">{settings.pbsNameBn}</div>
                  <div className="text-xs text-slate-600 mt-1">{settings.addressBn} · ফোন: {settings.phone} · ইমেইল: {settings.email}</div>
                </div>
                <div className="w-16 text-right hidden sm:block shrink-0">
                  <span className="text-[10px] text-slate-400 block font-mono">স্মারক</span>
                  <span className="text-xs font-mono font-bold text-slate-700">{settings.memoPrefix}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold">
                <div>স্মারক নং: <span className="font-num">{previewNotice.memoNo}</span></div>
                <div>তারিখ: <span className="font-num">{previewNotice.noticeDate}</span> খ্রি.</div>
              </div>

              <div className="text-xs space-y-0.5">
                <div>বরাবর,</div>
                <div className="font-bold">জেনারেল ম্যানেজার</div>
                <div>{previewNotice.targetPbs}</div>
              </div>

              <div className="text-xs font-bold pt-1 pb-1 border-y border-slate-200">
                বিষয়: গৃহ নির্মাণ ঋণের বকেয়া কিস্তির অর্থ কর্তনপূর্বক অত্র সমিতিতে প্রেরণ সংক্রান্ত তাগাদা পত্র।
              </div>

              <p className="text-xs leading-relaxed text-justify">
                মহোদয়,<br />
                উপর্যুক্ত বিষয়ের প্রেক্ষিতে জানানো যাচ্ছে যে, {settings.pbsNameBn} হতে গৃহ নির্মাণ ঋণ গ্রহণপূর্বক বর্তমানে আপনার সমিতিতে কর্মরত নিম্নে উল্লেখিত কর্মকর্তা/কর্মচারীর মাসিক বেতন হতে কিস্তি কর্তন করে অত্র সমিতিতে প্রেরণের জন্য অনুরোধ করা যাচ্ছে:
              </p>

              <table className="w-full text-xs text-left border border-slate-300">
                <thead className="bg-slate-100 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300">ক্রমিক</th>
                    <th className="p-2 border-r border-slate-300">কর্মচারীর নাম ও পদবী</th>
                    <th className="p-2 border-r border-slate-300 text-center">পে-আইডি</th>
                    <th className="p-2 border-r border-slate-300">ঋণ নম্বর</th>
                    <th className="p-2 text-right">বকেয়া কিস্তি (টাকা)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-num">
                  {previewNotice.employees.map((emp, i) => (
                    <tr key={i}>
                      <td className="p-2 border-r border-slate-300 text-center">{i + 1}</td>
                      <td className="p-2 border-r border-slate-300 font-sans font-medium">{emp.nameBn} ({emp.designation})</td>
                      <td className="p-2 border-r border-slate-300 text-center">{emp.payId}</td>
                      <td className="p-2 border-r border-slate-300">{emp.loanNo}</td>
                      <td className="p-2 text-right font-bold">৳ {emp.totalDue.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={4} className="p-2 text-right border-r border-slate-300 font-sans">সর্বমোট বকেয়া:</td>
                    <td className="p-2 text-right text-emerald-950 font-bold">৳ {previewNotice.totalOverdueAmount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="font-bold border-t border-slate-400 pt-1">{settings.agmFinanceName}</div>
                  <div className="text-[11px] text-slate-600">এজিএম (অর্থ-হিসাব)</div>
                  <div className="text-[10px] text-slate-400">{settings.pbsNameBn}</div>
                </div>
                <div>
                  <div className="font-bold border-t border-slate-400 pt-1">{settings.gmName}</div>
                  <div className="text-[11px] text-slate-600">জেনারেল ম্যানেজার</div>
                  <div className="text-[10px] text-slate-400">{settings.pbsNameBn}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">সম্মিলিত তাগাদা পত্র তৈরি করুন</h3>
              <button onClick={() => setShowNoticeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNotice} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">প্রাপক পবিসের নাম *</label>
                <input
                  type="text"
                  value={targetPbs}
                  onChange={(e) => setTargetPbs(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">বিশেষ মন্তব্য (ঐচ্ছিক)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="চিঠির জন্য কোনো বিশেষ নোট..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 h-20"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isProcessing ? 'তৈরি হচ্ছে...' : 'তাগাদা পত্র প্রস্তুত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
