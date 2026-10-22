import React, { useState } from 'react';
import { 
  Send, 
  Plus, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Eye, 
  X,
  AlertCircle
} from 'lucide-react';
import { BankAdvice, Loan, Repayment, PbsSettings, UserSession } from '../types';

interface RemittancesViewProps {
  bankAdvices: BankAdvice[];
  loans: Loan[];
  repayments: Repayment[];
  settings: PbsSettings;
  currentUser: UserSession;
  onCreateAdvice: (data: any) => Promise<void>;
  onUpdateStatus: (id: string, status: BankAdvice['status']) => void;
  isProcessing: boolean;
}

export const RemittancesView: React.FC<RemittancesViewProps> = ({
  bankAdvices,
  loans,
  repayments,
  settings,
  currentUser,
  onCreateAdvice,
  onUpdateStatus,
  isProcessing
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewAdvice, setPreviewAdvice] = useState<BankAdvice | null>(null);

  // Form State
  const [targetPbs, setTargetPbs] = useState('ঢাকা পল্লী বিদ্যুৎ সমিতি-১');
  const [bankName, setBankName] = useState('জনতা ব্যাংক পিএলসি, মাধবদী শাখা');
  const [accountNo, setAccountNo] = useState('২৪০০-১১৯২০২-৭');
  const [routingNo, setRoutingNo] = useState('১৩৫২৬০৭৭৮');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Find transferred loans with other PBS
  const transferredLoans = loans.filter(l => l.loanSource === 'other');

  // Items to include in new advice
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({});

  const handleOpenCreate = () => {
    // Select latest pending inter_pbs repayment by default
    const preselected: { [key: string]: boolean } = {};
    repayments.filter(r => r.sourceType === 'inter_pbs').slice(0, 3).forEach(r => {
      preselected[`${r.loanId}-${r.repaymentMonth}`] = true;
    });
    setSelectedItems(preselected);
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const items = [];
    for (const key of Object.keys(selectedItems)) {
      if (selectedItems[key]) {
        const [loanId, month] = key.split('-');
        const loan = loans.find(l => l.id === loanId);
        if (loan) {
          items.push({
            loanId: loan.id,
            employeeId: loan.employeeId,
            payId: loan.payId,
            employeeNameBn: loan.employeeNameBn,
            installmentMonth: month || '2026-10',
            amount: loan.monthlyInstallment
          });
        }
      }
    }

    if (items.length === 0) {
      setError('দয়া করে অন্তত একজন কর্মচারীর কিস্তি নির্বাচন করুন।');
      return;
    }

    try {
      setError('');
      await onCreateAdvice({
        toPbs: targetPbs,
        bankName,
        accountNo,
        routingNo,
        items,
        notes
      });
      setShowCreateModal(false);
    } catch (err: any) {
      setError(err.message || 'ব্যাংক অ্যাডভাইস তৈরি ব্যর্থ হয়েছে।');
    }
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
            <Send className="w-5 h-5 text-emerald-600" />
            <span>ইন্টার-পবিস রেমিট্যান্স ও ব্যাংক অ্যাডভাইস</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            অন্যান্য পবিস হতে বদলিকৃত কর্মকর্তা-কর্মচারীদের কর্তিত কিস্তির অর্থ ব্যাংক ট্রান্সফার অ্যাডভাইস ও সরকারি পত্র
          </p>
        </div>

        {currentUser.role !== 'employee' && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs active:scale-95 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ব্যাংক অ্যাডভাইস প্রস্তুতকরণ</span>
          </button>
        )}
      </div>

      {/* Advices List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">অ্যাডভাইস ও স্মারক নং</th>
                <th className="py-3 px-3">প্রেরক ও প্রাপক পবিস</th>
                <th className="py-3 px-3">ব্যাংক ও হিসাব নং</th>
                <th className="py-3 px-3 text-right">মোট টাকা</th>
                <th className="py-3 px-3 text-center">স্থিতি</th>
                <th className="py-3 px-3 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bankAdvices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    কোনো ব্যাংক অ্যাডভাইস তৈরি করা হয়নি।
                  </td>
                </tr>
              ) : (
                bankAdvices.map(adv => (
                  <tr key={adv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-num">{adv.adviceNo}</div>
                      <div className="text-[11px] text-slate-500 font-num">স্মারক: {adv.memoNo}</div>
                      <div className="text-[10px] text-slate-400 font-num">তারিখ: {adv.adviceDate}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{adv.toPbs}</div>
                      <div className="text-[11px] text-slate-500">প্রেরক: {adv.fromPbs}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">{adv.bankName}</div>
                      <div className="text-[11px] text-slate-500 font-num">হিসাব: {adv.accountNo} (রাউটিং: {adv.routingNo})</div>
                    </td>
                    <td className="py-3 px-3 text-right font-num font-bold text-slate-900 text-sm">
                      ৳ {adv.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        adv.status === 'acknowledged'
                          ? 'bg-emerald-100 text-emerald-800'
                          : adv.status === 'dispatched'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {adv.status === 'acknowledged' ? 'প্রাপ্তি নিশ্চিত' : adv.status === 'dispatched' ? 'প্রেরিত' : 'খসড়া'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setPreviewAdvice(adv)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1"
                          title="অফিসিয়াল চিঠি ও ব্যাংক অ্যাডভাইস প্রিভিউ ও প্রিন্ট"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>চিঠি দেখুন</span>
                        </button>

                        {currentUser.role !== 'employee' && adv.status === 'draft' && (
                          <button
                            onClick={() => onUpdateStatus(adv.id, 'dispatched')}
                            className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-[11px] transition-colors"
                          >
                            প্রেরণ চিহ্নিত করুন
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Printable Bank Advice Document Preview */}
      {previewAdvice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-3xl overflow-hidden my-6 print-card">
            {/* Top Toolbar (no print) */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print">
              <span className="font-bold text-xs text-slate-700">
                অফিসিয়াল ব্যাংক অ্যাডভাইস ও সরকারি অবহিতকরণ পত্র
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট / PDF সংরক্ষণ</span>
                </button>
                <button
                  onClick={() => setPreviewAdvice(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Official Letterhead & Document Content */}
            <div className="p-8 sm:p-12 space-y-6 text-slate-900 text-sm leading-relaxed bg-white">
              {/* Letterhead */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 gap-4">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="PBS Logo" className="w-16 h-16 object-contain rounded shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    বাপবিবো
                  </div>
                )}
                <div className="text-center flex-1">
                  <div className="font-bold text-base sm:text-lg text-slate-900">
                    {settings.boardNameBn}
                  </div>
                  <div className="font-bold text-lg sm:text-xl text-slate-950 mt-0.5">
                    {previewAdvice.fromPbs}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {settings.addressBn} · ফোন: {settings.phone} · ইমেইল: {settings.email}
                  </div>
                </div>
                <div className="w-16 text-right hidden sm:block shrink-0">
                  <span className="text-[10px] text-slate-400 block">স্মারক কোড</span>
                  <span className="text-xs font-mono font-bold text-slate-700">{settings.memoPrefix}</span>
                </div>
              </div>

              {/* Memo & Date */}
              <div className="flex justify-between items-center text-xs pt-1 font-semibold">
                <div>স্মারক নং: <span className="font-num">{previewAdvice.memoNo}</span></div>
                <div>তারিখ: <span className="font-num">{previewAdvice.adviceDate}</span> খ্রি.</div>
              </div>

              {/* Addressee */}
              <div className="text-xs space-y-0.5">
                <div>বরাবর,</div>
                <div className="font-bold">ব্যবস্থাপক</div>
                <div>{previewAdvice.bankName}</div>
              </div>

              {/* Subject */}
              <div className="text-xs font-bold pt-1 pb-1 border-y border-slate-200">
                বিষয়: গৃহ নির্মাণ ঋণের কিস্তি কর্তনের অর্থ BEFTN / ব্যাংক ট্রান্সফার মূলে <span className="underline">{previewAdvice.toPbs}</span> এর অনুকূলে প্রেরণ প্রসঙ্গে।
              </div>

              {/* Body */}
              <p className="text-xs leading-relaxed text-justify">
                মহোদয়,<br />
                উপর্যুক্ত বিষয়ের প্রেক্ষিতে জানানো যাচ্ছে যে, {previewAdvice.toPbs} হতে গৃহ নির্মাণ ঋণ গ্রহণপূর্বক বর্তমানে অত্র সমিতিতে কর্মরত কর্মকর্তা/কর্মচারীর সেপ্টেম্বর/অক্টোবর ২০২৬ মাসের বেতন হতে কর্তিত কিস্তির সর্বমোট <strong className="font-num">৳ {previewAdvice.totalAmount.toLocaleString()}</strong> ({previewAdvice.amountInWordsBn}) সংশ্লিষ্ট পবিসের ব্যাংক হিসাবে প্রেরণের নিমিত্তে নিম্নে উল্লেখিত হিসাব নম্বরে ব্যাংক ট্রান্সফার / BEFTN করার জন্য অনুরোধ করা হলো:
              </p>

              {/* Account Details Box */}
              <div className="p-3.5 rounded-lg border border-slate-300 bg-slate-50 text-xs space-y-1">
                <div><strong>প্রাপক পবিসের নাম:</strong> {previewAdvice.toPbs}</div>
                <div><strong>ব্যাংকের নাম ও শাখা:</strong> {previewAdvice.bankName}</div>
                <div><strong>হিসাব নম্বর:</strong> <span className="font-num font-bold">{previewAdvice.accountNo}</span></div>
                <div><strong>রাউটিং নম্বর:</strong> <span className="font-num font-bold">{previewAdvice.routingNo}</span></div>
                <div><strong>মোট টাকার পরিমাণ:</strong> <span className="font-num font-bold">৳ {previewAdvice.totalAmount.toLocaleString()}</span> ({previewAdvice.amountInWordsBn})</div>
              </div>

              {/* Enclosed Table of Deductions */}
              <div>
                <div className="text-xs font-bold mb-2">সংযুক্ত কর্মকর্তা/কর্মচারীদের কিস্তি কর্তন বিবরণী:</div>
                <table className="w-full text-xs text-left border border-slate-300">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">ক্রমিক</th>
                      <th className="p-2 border-r border-slate-300">কর্মচারীর নাম ও পদবী</th>
                      <th className="p-2 border-r border-slate-300 text-center">পে-আইডি</th>
                      <th className="p-2 border-r border-slate-300 text-center">কিস্তির মাস</th>
                      <th className="p-2 text-right">টাকার পরিমাণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-num">
                    {previewAdvice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border-r border-slate-300 text-center">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-300 font-sans font-medium">{item.employeeNameBn}</td>
                        <td className="p-2 border-r border-slate-300 text-center">{item.payId}</td>
                        <td className="p-2 border-r border-slate-300 text-center font-sans">{item.installmentMonth}</td>
                        <td className="p-2 text-right font-bold">৳ {item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={4} className="p-2 text-right border-r border-slate-300 font-sans">সর্বমোট টাকা:</td>
                      <td className="p-2 text-right text-emerald-950 font-bold">৳ {previewAdvice.totalAmount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures Block (AGM Finance, DGM, GM) */}
              <div className="pt-12 grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="font-bold border-t border-slate-400 pt-1">{previewAdvice.agmFinanceName}</div>
                  <div className="text-[11px] text-slate-600">এজিএম (অর্থ-হিসাব)</div>
                  <div className="text-[10px] text-slate-400">{previewAdvice.fromPbs}</div>
                </div>

                <div>
                  <div className="font-bold border-t border-slate-400 pt-1">{previewAdvice.dgmName}</div>
                  <div className="text-[11px] text-slate-600">ডিজিএম (প্রশাসন/সদর)</div>
                  <div className="text-[10px] text-slate-400">{previewAdvice.fromPbs}</div>
                </div>

                <div>
                  <div className="font-bold border-t border-slate-400 pt-1">{previewAdvice.gmName}</div>
                  <div className="text-[11px] text-slate-600">জেনারেল ম্যানেজার</div>
                  <div className="text-[10px] text-slate-400">{previewAdvice.fromPbs}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Advice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm md:text-base">
                নতুন ব্যাংক অ্যাডভাইস ও সরকারি চিঠি প্রস্তুত
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                  {error}
                </div>
              )}

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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">প্রাপকের ব্যাংক ও শাখা</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">প্রাপকের ব্যাংক হিসাব নং</label>
                  <input
                    type="text"
                    value={accountNo}
                    onChange={(e) => setAccountNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-num"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ব্যাংক রাউটিং নম্বর</label>
                <input
                  type="text"
                  value={routingNo}
                  onChange={(e) => setRoutingNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-num"
                />
              </div>

              {/* Eligible Transferred Deductions */}
              <div>
                <label className="block font-semibold text-slate-700 mb-2">
                  অ্যাডভাইসে অন্তর্ভুক্ত করার জন্য কর্মকর্তা/কর্মচারীর কিস্তি নির্বাচন করুন:
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 p-2 rounded-xl">
                  {transferredLoans.map(loan => {
                    const key = `${loan.id}-2026-10`;
                    const isChecked = !!selectedItems[key];

                    return (
                      <label key={loan.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => setSelectedItems({ ...selectedItems, [key]: e.target.checked })}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">{loan.employeeNameBn} ({loan.payId})</div>
                            <div className="text-[11px] text-slate-500">{loan.lendingPbs} · ঋণ নং {loan.loanNo}</div>
                          </div>
                        </div>
                        <div className="font-num font-bold text-slate-900">
                          ৳ {loan.monthlyInstallment.toLocaleString()}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isProcessing ? 'তৈরি হচ্ছে...' : 'অ্যাডভাইস প্রস্তুত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
