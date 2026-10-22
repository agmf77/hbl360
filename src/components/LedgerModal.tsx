import React, { useState, useEffect } from 'react';
import { X, Printer, FileText, Download, Layers, ShieldCheck, Building2, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { Loan, PbsSettings } from '../types';

interface LedgerModalProps {
  loanId: string;
  loans?: Loan[];
  settings: PbsSettings;
  onClose: () => void;
}

interface LedgerRow {
  date: string;
  month: string;
  description: string;
  voucherNo?: string;
  debitPrincipal: number;
  debitInterest: number;
  creditPrincipal: number;
  creditInterest: number;
  runningPrincipal: number;
  runningInterest: number;
  totalBalance: number;
}

interface LoanLedgerItem {
  loan: Loan;
  rows: LedgerRow[];
  subTotal: {
    totalDebitPrincipal: number;
    totalDebitInterest: number;
    totalCreditPrincipal: number;
    totalCreditInterest: number;
    closingPrincipal: number;
    closingInterest: number;
    closingAdvance: number;
    totalPayable: number;
  };
  closingPrincipal: number;
  closingInterest: number;
  closingAdvance: number;
  totalPayable: number;
}

interface ConsolidatedLedgerData {
  employee: any;
  loans: Loan[];
  ledgers: LoanLedgerItem[];
  grandTotal: {
    totalDisbursed: number;
    totalDebitPrincipal: number;
    totalDebitInterest: number;
    totalCreditPrincipal: number;
    totalCreditInterest: number;
    closingPrincipal: number;
    closingInterest: number;
    closingAdvance: number;
    totalPayable: number;
  };
}

export const LedgerModal: React.FC<LedgerModalProps> = ({ loanId, loans = [], settings, onClose }) => {
  // Find initial loan from loans prop if available
  const initialLoan = loans.find(l => l.id === loanId);
  const initialPayId = initialLoan?.payId;

  // State
  const [selectedPayId, setSelectedPayId] = useState<string | null>(initialPayId || null);
  const [consolidatedData, setConsolidatedData] = useState<ConsolidatedLedgerData | null>(null);
  const [singleLoanData, setSingleLoanData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('consolidated'); // 'consolidated' or loanId
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMultipleLoans, setHasMultipleLoans] = useState<boolean>(false);

  // Fetch ledger data
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);

        // First fetch single loan ledger to know employee Pay ID and sibling loans
        const singleRes = await fetch(`/api/reports/ledger/${loanId}`);
        const singleJson = await singleRes.json();

        if (!singleJson.success) {
          throw new Error(singleJson.message || 'খতিয়ান পাওয়া যায়নি');
        }

        const currentPayId = singleJson.ledger.loan.payId;
        const siblingLoansCount = singleJson.siblingLoansCount || (singleJson.siblingLoans?.length ?? 1);
        const isMulti = siblingLoansCount > 1;

        if (!isMounted) return;

        setSingleLoanData(singleJson.ledger);
        setSelectedPayId(currentPayId);
        setHasMultipleLoans(isMulti);

        if (isMulti) {
          // Fetch consolidated multi-loan ledger with Excel-like subtotals
          const multiRes = await fetch(`/api/reports/employee-ledger/${currentPayId}`);
          const multiJson = await multiRes.json();
          if (multiJson.success && isMounted) {
            setConsolidatedData(multiJson);
            setActiveTab('consolidated');
          }
        } else {
          setActiveTab(loanId);
        }
      } catch (err) {
        console.error('Failed to load ledger:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (loanId) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [loanId]);

  const handlePrint = () => {
    window.print();
  };

  // Export to Excel-compatible CSV format with UTF-8 BOM
  const handleExportExcel = () => {
    if (!consolidatedData && !singleLoanData) return;

    let csvContent = '\uFEFF'; // UTF-8 BOM for Bengali in Excel

    if (activeTab === 'consolidated' && consolidatedData) {
      const emp = consolidatedData.employee;
      // Header info
      csvContent += `"${settings.boardNameBn}"\n`;
      csvContent += `"${settings.pbsNameBn} - অর্থ ও হিসাব বিভাগ"\n`;
      csvContent += `"কর্মকর্তা-কর্মচারী বহুমাত্রিক গৃহ ঋণ একীভূত খতিয়ান বিবরণী (Consolidated Loan Statement)"\n\n`;

      csvContent += `"কর্মচারীর নাম:","${emp.nameBn}","পে-আইডি:","${emp.payId}","পদবী:","${emp.designation}"\n`;
      csvContent += `"মোট সক্রিয় ঋণ:","${consolidatedData.loans.length} টি","সর্বমোট বকেয়া দেনা:","৳ ${consolidatedData.grandTotal.totalPayable.toLocaleString()}"\n\n`;

      // Table Header
      csvContent += `"তারিখ","বিবরণ ও ভাউচার নং","ডেবিট: আসল (৳)","ডেবিট: ধার্যকৃত সুদ (৳)","ক্রেডিট: আসল আদায় (৳)","ক্রেডিট: সুদ আদায় (৳)","চলতি আসল স্থিতি (৳)","চলতি সুদ স্থিতি (৳)","সর্বমোট স্থিতি (৳)"\n`;

      // Each Loan Block
      consolidatedData.ledgers.forEach((ledgerItem, idx) => {
        const l = ledgerItem.loan;
        csvContent += `\n"--- ঋণ হিসাব ${idx + 1}: ${l.loanNo} (${l.allocationNo || 'বরাদ্দ'}) ---","মঞ্জুরিকৃত আসল: ৳${l.disbursementAmount}","","","","","","",""\n`;

        ledgerItem.rows.forEach(r => {
          const desc = r.voucherNo ? `${r.description} (ভাউচার: ${r.voucherNo})` : r.description;
          csvContent += `"${r.date}","${desc.replace(/"/g, '""')}","${r.debitPrincipal || 0}","${r.debitInterest || 0}","${r.creditPrincipal || 0}","${r.creditInterest || 0}","${r.runningPrincipal}","${r.runningInterest}","${r.totalBalance}"\n`;
        });

        // Excel Subtotal Row
        const st = ledgerItem.subTotal;
        csvContent += `"উপ-মোট (Sub-Total): ${l.loanNo} (${l.allocationNo || 'বরাদ্দ'})","","${st.totalDebitPrincipal}","${st.totalDebitInterest}","${st.totalCreditPrincipal}","${st.totalCreditInterest}","${st.closingPrincipal}","${st.closingInterest}","${st.totalPayable}"\n`;
      });

      // Grand Total Row
      const gt = consolidatedData.grandTotal;
      csvContent += `\n"★ সর্বমোট গ্র্যান্ড টোটাল (Grand Total)","পে-আইডি: ${emp.payId} এর সকল ঋণ","${gt.totalDebitPrincipal}","${gt.totalDebitInterest}","${gt.totalCreditPrincipal}","${gt.totalCreditInterest}","${gt.closingPrincipal}","${gt.closingInterest}","${gt.totalPayable}"\n`;
    } else {
      // Single loan export
      const d = activeTab === 'consolidated' ? singleLoanData : (consolidatedData?.ledgers.find(item => item.loan.id === activeTab) || singleLoanData);
      if (!d) return;

      csvContent += `"${settings.boardNameBn}"\n`;
      csvContent += `"${settings.pbsNameBn} - গৃহ নির্মাণ ঋণ খতিয়ান"\n`;
      csvContent += `"কর্মচারীর নাম:","${d.employee?.nameBn}","পে-আইডি:","${d.employee?.payId}","ঋণ নং:","${d.loan?.loanNo}"\n\n`;

      csvContent += `"তারিখ","বিবরণ ও ভাউচার নং","ডেবিট: আসল (৳)","ডেবিট: ধার্যকৃত সুদ (৳)","ক্রেডিট: আসল আদায় (৳)","ক্রেডিট: সুদ আদায় (৳)","চলতি আসল স্থিতি (৳)","চলতি সুদ স্থিতি (৳)","সর্বমোট স্থিতি (৳)"\n`;

      d.rows.forEach((r: LedgerRow) => {
        const desc = r.voucherNo ? `${r.description} (ভাউচার: ${r.voucherNo})` : r.description;
        csvContent += `"${r.date}","${desc.replace(/"/g, '""')}","${r.debitPrincipal || 0}","${r.debitInterest || 0}","${r.creditPrincipal || 0}","${r.creditInterest || 0}","${r.runningPrincipal}","${r.runningInterest}","${r.totalBalance}"\n`;
      });

      csvContent += `\n"সমাপনী স্থিতি","","","","","","${d.closingPrincipal}","${d.closingInterest}","${d.totalPayable}"\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `Loan_Ledger_${selectedPayId || 'Statement'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Determine current active ledger view item
  const selectedIndividualLedger = activeTab !== 'consolidated' && consolidatedData
    ? consolidatedData.ledgers.find(l => l.loan.id === activeTab)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-5xl overflow-hidden my-4 print-card flex flex-col max-h-[95vh]">
        {/* Modal Toolbar (no print) */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50 no-print shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                <span>গৃহ নির্মাণ ঋণ খতিয়ান স্টেটমেন্ট</span>
                {hasMultipleLoans && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    একাধিক ঋণ (Multi-Loan Subtotals)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                পে-আইডি: {selectedPayId} {consolidatedData?.employee?.nameBn ? `• ${consolidatedData.employee.nameBn}` : ''}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              title="এক্সেল শিট আকারে ডাউনলোড করুন"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">এক্সেল ডাউনলোড</span>
              <span className="sm:hidden">Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs (Only if multiple loans exist for this employee) */}
        {hasMultipleLoans && consolidatedData && (
          <div className="px-4 sm:px-6 py-2 bg-slate-100/90 border-b border-slate-200 no-print flex items-center gap-2 overflow-x-auto text-xs shrink-0">
            <span className="text-[11px] font-semibold text-slate-600 shrink-0 flex items-center gap-1 mr-1">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              ভিউ নির্বাচন:
            </span>

            {/* Consolidated Multi-Loan Tab */}
            <button
              onClick={() => setActiveTab('consolidated')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'consolidated'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <span>📊 একীভূত খতিয়ান (সব লোন ও সাব-টোটাল)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'consolidated' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'
              }`}>
                {consolidatedData.loans.length} টি লোন
              </span>
            </button>

            {/* Individual Loan Tabs */}
            {consolidatedData.ledgers.map((item, idx) => (
              <button
                key={item.loan.id}
                onClick={() => setActiveTab(item.loan.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
                  activeTab === item.loan.id
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                <span>{item.loan.allocationNo || `${idx + 1}ম বরাদ্দ`}:</span>
                <span className="ml-1 font-num font-semibold">{item.loan.loanNo}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main Document Content */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-6 text-xs text-slate-900 bg-white flex-1">
          {loading ? (
            <div className="py-20 text-center text-slate-500">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <span className="font-semibold text-sm">খতিয়ান ও হিসাব সমন্বয় লোড হচ্ছে...</span>
            </div>
          ) : !singleLoanData && !consolidatedData ? (
            <div className="py-20 text-center text-slate-400">
              খতিয়ান সংক্রান্ত কোনো তথ্য পাওয়া যায়নি।
            </div>
          ) : (
            <>
              {/* Document Header (Letterhead) */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 gap-3">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-14 h-14 object-contain rounded" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    বাপবিবো
                  </div>
                )}

                <div className="text-center flex-1">
                  <div className="font-bold text-sm md:text-base text-slate-800">{settings.boardNameBn}</div>
                  <div className="font-bold text-base md:text-lg text-slate-950 mt-0.5">{settings.pbsNameBn}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{settings.addressBn} · অর্থ ও হিসাব বিভাগ</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-950 mt-1.5 bg-emerald-50 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-md border border-emerald-200 shadow-2xs">
                    <span>
                      {activeTab === 'consolidated'
                        ? 'কর্মকর্তা-কর্মচারী বহুমাত্রিক গৃহ ঋণ একীভূত খতিয়ান বিবরণী (Consolidated Multi-Loan Statement)'
                        : 'কর্মকর্তা-কর্মচারী গৃহ নির্মাণ ঋণ ব্যক্তিগত খতিয়ান'}
                    </span>
                  </div>
                </div>

                <div className="w-16 text-right hidden sm:block shrink-0">
                  <span className="text-[9px] text-slate-400 block font-medium">স্মারক নং</span>
                  <span className="text-[10px] text-slate-700 font-mono font-semibold">{settings.memoPrefix}</span>
                </div>
              </div>

              {/* Employee & Loan Meta Box */}
              {activeTab === 'consolidated' && consolidatedData ? (
                // Consolidated Metadata Box
                <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">কর্মকর্তা/কর্মচারীর নাম:</span>
                      <strong className="text-slate-900 text-sm">{consolidatedData.employee?.nameBn}</strong>
                      <div className="text-[11px] text-slate-500">{consolidatedData.employee?.department}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">পে-আইডি ও পদবী:</span>
                      <strong className="text-slate-800 font-num text-sm">{consolidatedData.employee?.payId}</strong>
                      <div className="text-[11px] text-slate-600">{consolidatedData.employee?.designation}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">ঋণের বিবরণ ও সংখ্যা:</span>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-slate-900 text-sm font-num">{consolidatedData.loans.length} টি ঋণ হিসাব</strong>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-medium">
                        {consolidatedData.loans.map(l => l.allocationNo || 'বরাদ্দ').join(' + ')}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] font-medium">সর্বমোট মঞ্জুরিকৃত আসল:</span>
                      <strong className="text-emerald-950 font-num text-sm">
                        ৳ {consolidatedData.grandTotal.totalDisbursed.toLocaleString()}
                      </strong>
                      <div className="text-[10px] text-slate-500">
                        মোট প্রদেয়: ৳ {consolidatedData.grandTotal.totalPayable.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Notice banner for multi-loan */}
                  <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>
                        এই পে-আইডির বিপরীতে এক্সেলে প্রস্তুতকৃত খতিয়ানের ন্যায় নিচে প্রতিটি বরাদ্দের সাব-টোটাল (Sub-Total) এবং সর্বমোট (Grand Total) সন্নিবেশ করা হয়েছে।
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">Excel Mode: Active</span>
                  </div>
                </div>
              ) : (
                // Single Loan Metadata Box
                (() => {
                  const currentItem = selectedIndividualLedger || singleLoanData;
                  if (!currentItem) return null;
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">কর্মচারীর নাম:</span>
                        <strong className="text-slate-900 text-sm">{currentItem.employee?.nameBn}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">পে-আইডি ও পদবী:</span>
                        <strong className="text-slate-800 font-num">{currentItem.employee?.payId}</strong>
                        <div className="text-[11px] text-slate-600">{currentItem.employee?.designation}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">ঋণ নম্বর ও লট:</span>
                        <strong className="text-slate-900 font-num">{currentItem.loan.loanNo}</strong>
                        <div className="text-[11px] text-slate-600">{currentItem.loan.allocationNo || '১ম বরাদ্দ'}</div>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">মঞ্জুরিকৃত আসল ও তারিখ:</span>
                        <strong className="text-slate-900 font-num">৳ {currentItem.loan.disbursementAmount.toLocaleString()}</strong>
                        <div className="text-[10px] text-slate-400 font-num">{currentItem.loan.disbursementDate}</div>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Ledger Statement Table */}
              {activeTab === 'consolidated' && consolidatedData ? (
                // CONSOLIDATED MULTI-LOAN TABLE WITH EXCEL-STYLE SUB-TOTALS & GRAND TOTAL
                <div className="overflow-x-auto border border-slate-300 rounded-xl shadow-2xs">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-700 sticky top-0 z-10">
                      <tr>
                        <th rowSpan={2} className="p-2 border-r border-slate-300 text-center w-24">তারিখ</th>
                        <th rowSpan={2} className="p-2 border-r border-slate-300">বিবরণ ও ভাউচার নং</th>
                        <th colSpan={2} className="p-1.5 border-r border-slate-300 text-center bg-slate-200/80">
                          ডেবিট (বিতরণ / সুদ প্রভিশন)
                        </th>
                        <th colSpan={2} className="p-1.5 border-r border-slate-300 text-center bg-emerald-100/80">
                          ক্রেডিট (কিস্তি পরিশোধ)
                        </th>
                        <th colSpan={3} className="p-1.5 text-center bg-blue-100/80">
                          চলতি স্থিতি (Balance)
                        </th>
                      </tr>
                      <tr className="border-t border-slate-300 text-[10px]">
                        <th className="p-1.5 border-r border-slate-300 text-right w-24">আসল</th>
                        <th className="p-1.5 border-r border-slate-300 text-right w-20">সুদ</th>
                        <th className="p-1.5 border-r border-slate-300 text-right w-24">আসল</th>
                        <th className="p-1.5 border-r border-slate-300 text-right w-20">সুদ</th>
                        <th className="p-1.5 border-r border-slate-300 text-right font-bold text-emerald-950 w-24">আসল স্থিতি</th>
                        <th className="p-1.5 border-r border-slate-300 text-right font-bold text-blue-950 w-22">সুদ স্থিতি</th>
                        <th className="p-1.5 text-right font-bold text-slate-950 w-26 bg-slate-200/60">মোট স্থিতি</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200 font-num">
                      {consolidatedData.ledgers.map((ledgerItem, loanIndex) => {
                        const l = ledgerItem.loan;
                        const st = ledgerItem.subTotal;

                        return (
                          <React.Fragment key={l.id}>
                            {/* Excel Group Header for this Loan */}
                            <tr className="bg-slate-800 text-white font-semibold">
                              <td colSpan={9} className="px-3 py-2 text-xs">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                                      {loanIndex + 1}
                                    </span>
                                    <span className="font-bold text-emerald-300">ঋণ হিসাব: {l.loanNo}</span>
                                    <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-200 text-[10px]">
                                      {l.allocationNo || '১ম বরাদ্দ'}
                                    </span>
                                    <span className="text-slate-300 text-[11px] hidden sm:inline">
                                      (উৎস: {l.lendingPbs} · {l.loanSource === 'other' ? 'অন্য পবিস' : 'নিজস্ব ঋণ'})
                                    </span>
                                  </div>
                                  <div className="text-xs text-slate-200 font-num">
                                    মঞ্জুরিকৃত আসল: <strong className="text-white">৳ {l.disbursementAmount.toLocaleString()}</strong> · তারিখ: {l.disbursementDate}
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* Transaction Rows for this Loan */}
                            {ledgerItem.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                                <td className="p-2 border-r border-slate-300 text-center font-num text-[11px]">
                                  {row.date}
                                </td>
                                <td className="p-2 border-r border-slate-300 font-sans text-xs">
                                  <div className="font-medium text-slate-800">{row.description}</div>
                                  {row.voucherNo && (
                                    <div className="text-[10px] text-slate-400 font-num">
                                      ভাউচার নং: {row.voucherNo}
                                    </div>
                                  )}
                                </td>
                                <td className="p-2 border-r border-slate-300 text-right">
                                  {row.debitPrincipal > 0 ? `৳${row.debitPrincipal.toLocaleString()}` : '-'}
                                </td>
                                <td className="p-2 border-r border-slate-300 text-right">
                                  {row.debitInterest > 0 ? `৳${row.debitInterest.toLocaleString()}` : '-'}
                                </td>
                                <td className="p-2 border-r border-slate-300 text-right text-emerald-800 font-medium">
                                  {row.creditPrincipal > 0 ? `৳${row.creditPrincipal.toLocaleString()}` : '-'}
                                </td>
                                <td className="p-2 border-r border-slate-300 text-right text-blue-800 font-medium">
                                  {row.creditInterest > 0 ? `৳${row.creditInterest.toLocaleString()}` : '-'}
                                </td>
                                <td className="p-2 border-r border-slate-300 text-right font-bold text-emerald-900">
                                  ৳ {row.runningPrincipal.toLocaleString()}
                                </td>
                                <td className="p-2 border-r border-slate-300 text-right font-bold text-blue-900">
                                  ৳ {row.runningInterest.toLocaleString()}
                                </td>
                                <td className="p-2 text-right font-bold text-slate-950 bg-slate-50/70">
                                  ৳ {row.totalBalance.toLocaleString()}
                                </td>
                              </tr>
                            ))}

                            {/* EXCEL SUB-TOTAL ROW (উপ-মোট) */}
                            <tr className="bg-amber-100/90 text-amber-950 font-bold border-t-2 border-b-2 border-amber-300 font-num">
                              <td colSpan={2} className="p-2.5 border-r border-amber-300 font-sans text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                                    Sub-Total
                                  </span>
                                  <span>উপ-মোট: ঋণ নং {l.loanNo} ({l.allocationNo || 'বরাদ্দ'})</span>
                                </div>
                              </td>
                              <td className="p-2 border-r border-amber-300 text-right">
                                ৳ {st.totalDebitPrincipal.toLocaleString()}
                              </td>
                              <td className="p-2 border-r border-amber-300 text-right">
                                ৳ {st.totalDebitInterest.toLocaleString()}
                              </td>
                              <td className="p-2 border-r border-amber-300 text-right text-emerald-900">
                                ৳ {st.totalCreditPrincipal.toLocaleString()}
                              </td>
                              <td className="p-2 border-r border-amber-300 text-right text-blue-900">
                                ৳ {st.totalCreditInterest.toLocaleString()}
                              </td>
                              <td className="p-2 border-r border-amber-300 text-right text-emerald-950 font-extrabold">
                                ৳ {st.closingPrincipal.toLocaleString()}
                              </td>
                              <td className="p-2 border-r border-amber-300 text-right text-blue-950 font-extrabold">
                                ৳ {st.closingInterest.toLocaleString()}
                              </td>
                              <td className="p-2 text-right text-slate-950 font-extrabold bg-amber-200/60">
                                ৳ {st.totalPayable.toLocaleString()}
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })}

                      {/* EXCEL GRAND TOTAL ROW (সর্বমোট গ্র্যান্ড টোটাল) */}
                      <tr className="bg-slate-900 text-white font-extrabold border-t-2 border-b-4 border-double border-slate-700 text-xs font-num print:bg-slate-800 print:text-white">
                        <td colSpan={2} className="p-3 border-r border-slate-700 font-sans">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                              Grand Total
                            </span>
                            <span className="text-sm font-bold text-amber-300">
                              ★ সর্বমোট গ্র্যান্ড টোটাল (পে-আইডি: {consolidatedData.employee?.payId} এর সকল ঋণ)
                            </span>
                          </div>
                        </td>
                        <td className="p-2.5 border-r border-slate-700 text-right text-slate-100">
                          ৳ {consolidatedData.grandTotal.totalDebitPrincipal.toLocaleString()}
                        </td>
                        <td className="p-2.5 border-r border-slate-700 text-right text-slate-100">
                          ৳ {consolidatedData.grandTotal.totalDebitInterest.toLocaleString()}
                        </td>
                        <td className="p-2.5 border-r border-slate-700 text-right text-emerald-300">
                          ৳ {consolidatedData.grandTotal.totalCreditPrincipal.toLocaleString()}
                        </td>
                        <td className="p-2.5 border-r border-slate-700 text-right text-blue-300">
                          ৳ {consolidatedData.grandTotal.totalCreditInterest.toLocaleString()}
                        </td>
                        <td className="p-2.5 border-r border-slate-700 text-right text-emerald-400 text-sm font-black">
                          ৳ {consolidatedData.grandTotal.closingPrincipal.toLocaleString()}
                        </td>
                        <td className="p-2.5 border-r border-slate-700 text-right text-blue-400 text-sm font-black">
                          ৳ {consolidatedData.grandTotal.closingInterest.toLocaleString()}
                        </td>
                        <td className="p-2.5 text-right text-amber-300 text-sm font-black bg-slate-950">
                          ৳ {consolidatedData.grandTotal.totalPayable.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                // SINGLE LOAN TABLE
                (() => {
                  const currentItem = selectedIndividualLedger || singleLoanData;
                  if (!currentItem) return null;
                  return (
                    <div className="overflow-x-auto border border-slate-300 rounded-lg">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-700">
                          <tr>
                            <th rowSpan={2} className="p-2 border-r border-slate-300 text-center">তারিখ</th>
                            <th rowSpan={2} className="p-2 border-r border-slate-300">বিবরণ ও ভাউচার</th>
                            <th colSpan={2} className="p-1.5 border-r border-slate-300 text-center bg-slate-200/70">
                              ডেবিট (বিতরণ/সুদ)
                            </th>
                            <th colSpan={2} className="p-1.5 border-r border-slate-300 text-center bg-emerald-100/70">
                              ক্রেডিট (পরিশোধ)
                            </th>
                            <th colSpan={3} className="p-1.5 text-center bg-blue-100/70">
                              চলতি স্থিতি (Balance)
                            </th>
                          </tr>
                          <tr className="border-t border-slate-200 text-[10px]">
                            <th className="p-1.5 border-r border-slate-300 text-right">আসল</th>
                            <th className="p-1.5 border-r border-slate-300 text-right">সুদ</th>
                            <th className="p-1.5 border-r border-slate-300 text-right">আসল</th>
                            <th className="p-1.5 border-r border-slate-300 text-right">সুদ</th>
                            <th className="p-1.5 border-r border-slate-300 text-right font-bold text-emerald-950">আসল স্থিতি</th>
                            <th className="p-1.5 border-r border-slate-300 text-right font-bold text-blue-950">সুদ স্থিতি</th>
                            <th className="p-1.5 text-right font-bold text-slate-950">সর্বমোট</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-num">
                          {currentItem.rows.map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="p-2 border-r border-slate-300 text-center">{row.date}</td>
                              <td className="p-2 border-r border-slate-300 font-sans">
                                <div>{row.description}</div>
                                {row.voucherNo && (
                                  <div className="text-[10px] text-slate-400 font-num">ভাউচার: {row.voucherNo}</div>
                                )}
                              </td>
                              <td className="p-2 border-r border-slate-300 text-right">
                                {row.debitPrincipal > 0 ? `৳${row.debitPrincipal.toLocaleString()}` : '-'}
                              </td>
                              <td className="p-2 border-r border-slate-300 text-right">
                                {row.debitInterest > 0 ? `৳${row.debitInterest.toLocaleString()}` : '-'}
                              </td>
                              <td className="p-2 border-r border-slate-300 text-right text-emerald-800 font-medium">
                                {row.creditPrincipal > 0 ? `৳${row.creditPrincipal.toLocaleString()}` : '-'}
                              </td>
                              <td className="p-2 border-r border-slate-300 text-right text-blue-800 font-medium">
                                {row.creditInterest > 0 ? `৳${row.creditInterest.toLocaleString()}` : '-'}
                              </td>
                              <td className="p-2 border-r border-slate-300 text-right font-bold text-emerald-900">
                                ৳ {row.runningPrincipal.toLocaleString()}
                              </td>
                              <td className="p-2 border-r border-slate-300 text-right font-bold text-blue-900">
                                ৳ {row.runningInterest.toLocaleString()}
                              </td>
                              <td className="p-2 text-right font-bold text-slate-950 bg-slate-50/60">
                                ৳ {row.totalBalance.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()
              )}

              {/* Closing Balances Box (Excel Summary Cards) */}
              {activeTab === 'consolidated' && consolidatedData ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900 text-white font-num text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-sans">সর্বমোট সমাপনী আসল স্থিতি</span>
                    <div className="text-base font-bold text-emerald-400">
                      ৳ {consolidatedData.grandTotal.closingPrincipal.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                      আদায়কৃত আসল: ৳ {consolidatedData.grandTotal.totalCreditPrincipal.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-sans">সর্বমোট সমাপনী ধার্যকৃত সুদ</span>
                    <div className="text-base font-bold text-blue-400">
                      ৳ {consolidatedData.grandTotal.closingInterest.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                      পরিশোধিত সুদ: ৳ {consolidatedData.grandTotal.totalCreditInterest.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-sans">অগ্রিম জমা স্থিতি</span>
                    <div className="text-base font-bold text-purple-400">
                      ৳ {consolidatedData.grandTotal.closingAdvance.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">অতিরিক্ত কর্তন সঞ্চয়</div>
                  </div>

                  <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                    <span className="text-amber-400 block text-[10px] uppercase font-sans font-bold">
                      সর্বমোট একীভূত বকেয়া দেনা
                    </span>
                    <div className="text-lg font-black text-white">
                      ৳ {consolidatedData.grandTotal.totalPayable.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-300 font-sans">
                      ({consolidatedData.loans.length} টি ঋণের আসল + সুদ)
                    </div>
                  </div>
                </div>
              ) : (
                (() => {
                  const currentItem = selectedIndividualLedger || singleLoanData;
                  if (!currentItem) return null;
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900 text-white font-num text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-sans">সমাপনী আসল স্থিতি</span>
                        <div className="text-base font-bold text-emerald-400">
                          ৳ {currentItem.closingPrincipal.toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-sans">সমাপনী ধার্যকৃত সুদ</span>
                        <div className="text-base font-bold text-blue-400">
                          ৳ {currentItem.closingInterest.toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-sans">অগ্রিম জমা স্থিতি</span>
                        <div className="text-base font-bold text-purple-400">
                          ৳ {currentItem.closingAdvance.toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-sans">সর্বমোট প্রদেয় ব্যালেন্স</span>
                        <div className="text-base font-bold text-white">
                          ৳ {currentItem.totalPayable.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Signatures */}
              <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="font-bold border-t border-slate-400 pt-1">হিসাব সহকারী / ক্যাশিয়ার</div>
                  <div className="text-[10px] text-slate-500">অর্থ ও হিসাব শাখা</div>
                </div>
                <div>
                  <div className="font-bold border-t border-slate-400 pt-1">{settings.agmFinanceName}</div>
                  <div className="text-[10px] text-slate-500">এজিএম (অর্থ-হিসাব)</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
