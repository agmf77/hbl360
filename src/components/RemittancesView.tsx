import React, { useState, useMemo } from 'react';
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
  AlertCircle,
  RefreshCw,
  Trash2,
  ChevronDown
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
  onDeleteAdvice?: (id: string) => Promise<void>;
  onRefresh?: () => void;
  isProcessing: boolean;
}

// Helper to convert English numerals to Bengali
export const toBnNumber = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const str = typeof num === 'number' ? num.toLocaleString('en-US') : String(num);
  return str.replace(/[0-9]/g, (w) => bnDigits[+w]);
};

export const RemittancesView: React.FC<RemittancesViewProps> = ({
  bankAdvices = [],
  loans = [],
  repayments = [],
  settings,
  currentUser,
  onCreateAdvice,
  onUpdateStatus,
  onDeleteAdvice,
  onRefresh,
  isProcessing
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewAdvice, setPreviewAdvice] = useState<BankAdvice | null>(null);

  // Pagination state matching screenshot
  const [pageSize, setPageSize] = useState<number>(4);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Form State for creating new advice
  const [targetPbs, setTargetPbs] = useState('কুমিল্লা পল্লী বিদ্যুৎ সমিতি-১');
  const [bankName, setBankName] = useState('জনতা ব্যাংক পিএলসি, চান্দিনা শাখা');
  const [accountNo, setAccountNo] = useState('২৪০০-১১৯২০২-৭');
  const [routingNo, setRoutingNo] = useState('১৩৫২৬০৭৭৮');
  const [monthDescInput, setMonthDescInput] = useState('অক্টোবর/২০২৬ মাস');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Eligible transferred loans with other PBS
  const transferredLoans = loans.filter(l => l.loanSource === 'other');
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({});

  const handleOpenCreate = () => {
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
        monthDescription: monthDescInput,
        employeeCount: items.length,
        items,
        notes
      });
      setShowCreateModal(false);
    } catch (err: any) {
      setError(err.message || 'ব্যাংক অ্যাডভাইস তৈরি ব্যর্থ হয়েছে।');
    }
  };

  const handleDelete = async (id: string) => {
    if (onDeleteAdvice) {
      await onDeleteAdvice(id);
    } else {
      if (!confirm('আপনি কি এই প্রস্তুতকৃত ব্যাংক অ্যাডভাইসটি বাতিল করতে চান?')) return;
      try {
        const res = await fetch(`/api/remittances/${id}?user=${currentUser.nameBn}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.success && onRefresh) {
          onRefresh();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to determine the Month display text
  const getMonthDisplayText = (adv: BankAdvice): string => {
    if (adv.monthDescription) return adv.monthDescription;
    if (adv.items && adv.items.length > 0) {
      const distinctMonths = Array.from(new Set(adv.items.map(i => i.installmentMonth)));
      if (distinctMonths.length === 1) {
        return `${distinctMonths[0]} মাস`;
      } else if (distinctMonths.length > 1) {
        return `${distinctMonths[0]} হতে ${distinctMonths[distinctMonths.length - 1]} পর্যন্ত (${toBnNumber(distinctMonths.length)} মাস)`;
      }
    }
    return 'অক্টোবর/২০২৬ মাস';
  };

  // Helper to determine employee count
  const getEmployeeCount = (adv: BankAdvice): number => {
    if (adv.employeeCount) return adv.employeeCount;
    if (adv.items && adv.items.length > 0) {
      return new Set(adv.items.map(i => i.payId)).size || adv.items.length;
    }
    return 1;
  };

  // Filter non-deleted bank advices
  const nonDeletedAdvices = useMemo(() => {
    return bankAdvices.filter(b => !b.isDeleted);
  }, [bankAdvices]);

  // Pagination calculation
  const totalCount = nonDeletedAdvices.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAdvices = nonDeletedAdvices.slice(startIndex, endIndex);

  return (
    <div className="space-y-5">
      {/* Page Header (Exactly matching reference screenshot image_e1893524.png) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            প্রস্তুতকৃত ব্যাংক অ্যাডভাইস ও সরকারি পত্রসমূহ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            তৈরি করা ব্যাংক অ্যাডভাইস ও পবিসে প্রেরিত সরকারি পত্র দেখুন, প্রিন্ট করুন বা বাতিল করুন
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {currentUser.role !== 'employee' && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন ব্যাংক অ্যাডভাইস</span>
            </button>
          )}

          <button
            onClick={() => onRefresh && onRefresh()}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>রিফ্রেশ</span>
          </button>
        </div>
      </div>

      {/* Main Table Container (Exact columns, layout, and styling matching image_e1893524.png) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[840px] border-collapse">
            <thead className="bg-white border-b border-slate-200 text-slate-700 font-bold">
              <tr>
                <th className="py-3.5 px-4 font-semibold text-slate-700">অ্যাডভাইস নং ও তারিখ</th>
                <th className="py-3.5 px-3 font-semibold text-slate-700">স্মারক নং (Memo No)</th>
                <th className="py-3.5 px-3 font-semibold text-slate-700">প্রাপক পবিস</th>
                <th className="py-3.5 px-3 font-semibold text-slate-700">মাস</th>
                <th className="py-3.5 px-3 font-semibold text-slate-700 text-center">কর্মচারী সংখ্যা</th>
                <th className="py-3.5 px-3 font-semibold text-slate-700 text-center">সর্বমোট টাকা</th>
                <th className="py-3.5 px-4 font-semibold text-slate-700 text-center">প্রিন্ট / পত্র দেখুন</th>
                <th className="py-3.5 px-3 font-semibold text-slate-700 text-center">অ্যাকশন</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedAdvices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    কোনো প্রস্তুতকৃত ব্যাংক অ্যাডভাইস পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                paginatedAdvices.map((adv) => {
                  const empCount = getEmployeeCount(adv);
                  const monthText = getMonthDisplayText(adv);

                  return (
                    <tr key={adv.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* অ্যাডভাইস নং ও তারিখ */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#5b21b6] font-mono text-xs tracking-tight">
                          {adv.adviceNo}
                        </div>
                        <div className="text-[11px] text-slate-400 font-num mt-0.5">
                          {toBnNumber(adv.adviceDate)}
                        </div>
                      </td>

                      {/* স্মারক নং (Memo No) */}
                      <td className="py-3.5 px-3">
                        <div className="text-xs text-slate-700 font-num">
                          {adv.memoNo}
                        </div>
                      </td>

                      {/* প্রাপক পবিস */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-800 text-xs">
                          {adv.toPbs}
                        </div>
                      </td>

                      {/* মাস */}
                      <td className="py-3.5 px-3">
                        <div className="text-xs text-slate-700">
                          {monthText}
                        </div>
                      </td>

                      {/* কর্মচারী সংখ্যা */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="font-bold text-slate-800 text-xs">
                          {toBnNumber(empCount)} জন
                        </div>
                      </td>

                      {/* সর্বমোট টাকা */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="font-bold text-slate-900 font-num text-xs">
                          {toBnNumber(adv.totalAmount)}
                        </div>
                      </td>

                      {/* প্রিন্ট / পত্র দেখুন */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setPreviewAdvice(adv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ecfdf5] hover:bg-emerald-100 text-[#065f46] font-semibold text-xs border border-emerald-200/80 transition-colors shadow-2xs"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-600" />
                          <span>পত্র / অ্যাডভাইস</span>
                        </button>
                      </td>

                      {/* অ্যাকশন */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => handleDelete(adv.id)}
                          title="অ্যাডভাইস বাতিল করুন"
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination Bar (Matching image_e1893524.png) */}
        <div className="px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 bg-white">
          {/* Left: Page Size Selector & Count */}
          <div className="flex items-center gap-2 text-xs">
            <span>প্রতি পৃষ্ঠায়:</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="appearance-none pl-2.5 pr-7 py-1 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
              >
                <option value={4}>সর্বশেষ ৪</option>
                <option value={10}>সর্বশেষ ১০</option>
                <option value={20}>সর্বশেষ ২০</option>
                <option value={50}>সর্বশেষ ৫০</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
            <span className="text-slate-500 font-num">
              {totalCount > 0 ? (
                <>
                  {toBnNumber(startIndex + 1)}-{toBnNumber(Math.min(endIndex, totalCount))} / {toBnNumber(totalCount)} টি অ্যাডভাইস
                </>
              ) : (
                '০ টি অ্যাডভাইস'
              )}
            </span>
          </div>

          {/* Right: Previous / Page Number / Next */}
          <div className="flex items-center gap-2 text-xs font-medium">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validCurrentPage <= 1}
              className="px-3 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors"
            >
              আগের
            </button>

            <span className="px-2 font-num text-slate-700 font-medium">
              পৃষ্ঠা {toBnNumber(validCurrentPage)} / {toBnNumber(totalPages)}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validCurrentPage >= totalPages}
              className="px-3 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors"
            >
              পরের
            </button>
          </div>
        </div>
      </div>

      {/* Official Bank Advice Letter Preview & Print Modal */}
      {previewAdvice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl overflow-hidden my-4 print-card flex flex-col max-h-[92vh]">
            {/* Modal Toolbar (no-print) */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800 text-xs sm:text-sm">
                  সরকারি পত্র ও ব্যাংক ট্রান্সফার অ্যাডভাইস ({previewAdvice.adviceNo})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-2xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট / PDF</span>
                </button>
                <button
                  onClick={() => setPreviewAdvice(null)}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Official Letterhead & Letter Body */}
            <div className="p-6 sm:p-10 overflow-y-auto space-y-6 text-xs text-slate-900 bg-white font-sans">
              {/* BREB & PBS Letterhead */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 gap-4">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-14 h-14 object-contain rounded" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    বাপবিবো
                  </div>
                )}
                <div className="text-center flex-1">
                  <div className="font-bold text-sm sm:text-base text-slate-900">
                    {settings.boardNameBn}
                  </div>
                  <div className="font-bold text-base sm:text-lg text-slate-950 mt-0.5">
                    {previewAdvice.fromPbs || settings.pbsNameBn}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {settings.addressBn} · ফোন: {settings.phone} · ইমেইল: {settings.email}
                  </div>
                  <div className="text-[11px] text-emerald-800 font-semibold mt-1">
                    অর্থ ও হিসাব বিভাগ · ব্যাংক ট্রান্সফার শাখা
                  </div>
                </div>
                <div className="w-16 text-right hidden sm:block shrink-0">
                  <span className="text-[10px] text-slate-400 block font-medium">স্মারক কোড</span>
                  <span className="text-xs font-mono font-bold text-slate-700">{settings.memoPrefix}</span>
                </div>
              </div>

              {/* Memo & Date Row */}
              <div className="flex justify-between items-center text-xs pt-1 font-semibold border-b border-slate-100 pb-2">
                <div>স্মারক নং: <span className="font-num text-slate-900 font-bold">{previewAdvice.memoNo}</span></div>
                <div>তারিখ: <span className="font-num text-slate-900">{toBnNumber(previewAdvice.adviceDate)}</span> খ্রি.</div>
              </div>

              {/* Addressee */}
              <div className="text-xs space-y-0.5 text-slate-800">
                <div>বরাবর,</div>
                <div className="font-bold">ব্যবস্থাপক</div>
                <div>{previewAdvice.bankName}</div>
                <div className="text-slate-500">বিষয়: ব্যাংক ট্রান্সফার / BEFTN মূলে গৃহ ঋণ কিস্তি কর্তনের অর্থ প্রেরণ।</div>
              </div>

              {/* Subject */}
              <div className="text-xs font-bold pt-2 pb-2 border-y border-slate-200 text-slate-900 bg-slate-50/50 px-2 rounded">
                বিষয়: কর্মকর্তা-কর্মচারীদের গৃহ নির্মাণ ঋণের কিস্তি কর্তনের অর্থ BEFTN / ব্যাংক ট্রান্সফার মূলে <span className="underline decoration-slate-400">{previewAdvice.toPbs}</span> এর অনুকূলে প্রেরণ প্রসঙ্গে।
              </div>

              {/* Body */}
              <p className="text-xs leading-relaxed text-justify text-slate-800">
                মহোদয়,<br />
                উপর্যুক্ত বিষয়ের প্রেক্ষিতে জানানো যাচ্ছে যে, <strong>{previewAdvice.toPbs}</strong> হতে গৃহ নির্মাণ ঋণ গ্রহণপূর্বক বর্তমানে অত্র সমিতিতে কর্মরত কর্মকর্তা/কর্মচারীর {getMonthDisplayText(previewAdvice)} এর বেতন হতে কর্তিত কিস্তির সর্বমোট <strong className="font-num">৳ {previewAdvice.totalAmount.toLocaleString()}</strong> ({previewAdvice.amountInWordsBn}) সংশ্লিষ্ট সমিতির ব্যাংক হিসাবে প্রেরণের নিমিত্তে নিম্নে উল্লেখিত হিসাব নম্বরে ব্যাংক ট্রান্সফার / BEFTN করার জন্য অনুরোধ করা হলো:
              </p>

              {/* Account Details Box */}
              <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 text-xs space-y-1.5">
                <div><strong>প্রাপক পবিসের নাম:</strong> <span className="text-slate-900 font-semibold">{previewAdvice.toPbs}</span></div>
                <div><strong>প্রাপকের ব্যাংকের নাম ও শাখা:</strong> {previewAdvice.bankName}</div>
                <div><strong>হিসাব নম্বর:</strong> <span className="font-num font-bold text-slate-900">{previewAdvice.accountNo}</span></div>
                <div><strong>রাউটিং নম্বর:</strong> <span className="font-num font-bold text-slate-900">{previewAdvice.routingNo}</span></div>
                <div><strong>মোট টাকার পরিমাণ:</strong> <span className="font-num font-bold text-emerald-900">৳ {previewAdvice.totalAmount.toLocaleString()}</span> ({previewAdvice.amountInWordsBn})</div>
              </div>

              {/* Enclosed Table of Deductions */}
              <div>
                <div className="text-xs font-bold mb-2 text-slate-800">সংযুক্ত কর্মকর্তা/কর্মচারীদের কিস্তি কর্তন বিবরণী:</div>
                <table className="w-full text-xs text-left border border-slate-300 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-700">
                    <tr>
                      <th className="p-2 border-r border-slate-300 text-center w-12">ক্রমিক</th>
                      <th className="p-2 border-r border-slate-300">কর্মচারীর নাম ও পদবী</th>
                      <th className="p-2 border-r border-slate-300 text-center w-24">পে-আইডি</th>
                      <th className="p-2 border-r border-slate-300 text-center">কিস্তির মাস</th>
                      <th className="p-2 text-right w-28">টাকার পরিমাণ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-num">
                    {previewAdvice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 border-r border-slate-300 text-center">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-300 font-sans font-medium text-slate-900">{item.employeeNameBn}</td>
                        <td className="p-2 border-r border-slate-300 text-center">{item.payId}</td>
                        <td className="p-2 border-r border-slate-300 text-center font-sans">{item.installmentMonth}</td>
                        <td className="p-2 text-right font-bold text-slate-900">৳ {item.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100 font-bold">
                      <td colSpan={4} className="p-2 text-right border-r border-slate-300 font-sans text-slate-800">
                        সর্বমোট প্রদেয় টাকা:
                      </td>
                      <td className="p-2 text-right text-emerald-950 font-bold">
                        ৳ {previewAdvice.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures Block (AGM Finance, DGM, GM) */}
              <div className="pt-12 grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="font-bold border-t border-slate-400 pt-1 text-slate-900">{previewAdvice.agmFinanceName}</div>
                  <div className="text-[11px] text-slate-600">এজিএম (অর্থ-হিসাব)</div>
                  <div className="text-[10px] text-slate-400">{previewAdvice.fromPbs || settings.pbsNameBn}</div>
                </div>

                <div>
                  <div className="font-bold border-t border-slate-400 pt-1 text-slate-900">{previewAdvice.dgmName}</div>
                  <div className="text-[11px] text-slate-600">ডিজিএম (প্রশাসন/সদর)</div>
                  <div className="text-[10px] text-slate-400">{previewAdvice.fromPbs || settings.pbsNameBn}</div>
                </div>

                <div>
                  <div className="font-bold border-t border-slate-400 pt-1 text-slate-900">{previewAdvice.gmName}</div>
                  <div className="text-[11px] text-slate-600">জেনারেল ম্যানেজার</div>
                  <div className="text-[10px] text-slate-400">{previewAdvice.fromPbs || settings.pbsNameBn}</div>
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
                নতুন ব্যাংক অ্যাডভাইস ও সরকারি পত্র প্রস্তুত
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
                  placeholder="উদা: কুমিল্লা পল্লী বিদ্যুৎ সমিতি-১ বা সকল পবিস"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">কর্তন মাসের বিবরণ</label>
                <input
                  type="text"
                  value={monthDescInput}
                  onChange={(e) => setMonthDescInput(e.target.value)}
                  placeholder="উদা: অক্টোবর/২০২৬ মাস বা অক্টোবর হতে নভেম্বর পর্যন্ত (২ মাস)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">প্রাপকের ব্যাংক ও শাখা</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">প্রাপকের ব্যাংক হিসাব নং</label>
                  <input
                    type="text"
                    value={accountNo}
                    onChange={(e) => setAccountNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-num text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ব্যাংক রাউটিং নম্বর</label>
                <input
                  type="text"
                  value={routingNo}
                  onChange={(e) => setRoutingNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-num text-xs"
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">মন্তব্য (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="ব্যাংক অ্যাডভাইসের বিশেষ দ্রষ্টব্য..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs"
                >
                  {isProcessing ? 'প্রস্তুত হচ্ছে...' : 'অ্যাডভাইস প্রস্তুত সম্পন্ন করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
