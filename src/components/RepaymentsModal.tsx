import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Coins,
  Check,
  AlertCircle,
  Sparkles,
  Search,
  CalendarRange,
  Calendar,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
  Building2,
  User,
  Hash,
  ChevronDown,
  Info
} from 'lucide-react';
import { Loan } from '../types';

interface RepaymentsModalProps {
  loans: Loan[];
  initialLoanId?: string;
  onClose: () => void;
  onSubmit: (data: {
    loanId: string;
    repaymentMonth: string;
    repaymentDate: string;
    totalAmount: number;
    voucherNo?: string;
    sourceType?: 'payroll' | 'inter_pbs' | 'manual';
    notes?: string;
  }) => Promise<void>;
  onSubmitBatch?: (items: {
    loanId: string;
    repaymentMonth: string;
    repaymentDate: string;
    totalAmount: number;
    voucherNo?: string;
    sourceType?: 'payroll' | 'inter_pbs' | 'manual';
    notes?: string;
  }[]) => Promise<void>;
  isSubmitting: boolean;
}

interface MonthlyItemRow {
  month: string; // YYYY-MM
  amount: number;
  voucherNo: string;
  notes: string;
}

export const RepaymentsModal: React.FC<RepaymentsModalProps> = ({
  loans,
  initialLoanId,
  onClose,
  onSubmit,
  onSubmitBatch,
  isSubmitting
}) => {
  // Mode: Single month or Multi-month batch (Inter-PBS)
  const [mode, setMode] = useState<'single' | 'multi'>('single');

  // Selected Loan State
  const [selectedLoanId, setSelectedLoanId] = useState(initialLoanId || (loans[0]?.id || ''));
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filterSource, setFilterSource] = useState<'all' | 'own' | 'other'>('all');
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Single Month Form State
  const [repaymentMonth, setRepaymentMonth] = useState('2026-10');
  const [repaymentDate, setRepaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [amountStr, setAmountStr] = useState('');
  const [sourceType, setSourceType] = useState<'payroll' | 'inter_pbs' | 'manual'>('payroll');
  const [voucherNo, setVoucherNo] = useState('');
  const [notes, setNotes] = useState('');

  // Multi-Month Form State (Inter-PBS Batch Remittance)
  const [startMonth, setStartMonth] = useState('2026-06');
  const [endMonth, setEndMonth] = useState('2026-09');
  const [multiCommonVoucher, setMultiCommonVoucher] = useState('');
  const [multiCommonDate, setMultiCommonDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyRows, setMonthlyRows] = useState<MonthlyItemRow[]>([]);
  const [batchSourceType] = useState<'inter_pbs'>('inter_pbs');

  const [error, setError] = useState('');

  const selectedLoan = useMemo(() => {
    return loans.find(l => l.id === selectedLoanId);
  }, [loans, selectedLoanId]);

  // Click outside to close loan search combobox
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter loans for search combobox
  const filteredLoans = useMemo(() => {
    return loans.filter(loan => {
      if (filterSource === 'own' && loan.loanSource !== 'own') return false;
      if (filterSource === 'other' && loan.loanSource !== 'other') return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        loan.employeeNameBn.toLowerCase().includes(q) ||
        loan.payId.toLowerCase().includes(q) ||
        loan.loanNo.toLowerCase().includes(q) ||
        (loan.lendingPbs && loan.lendingPbs.toLowerCase().includes(q)) ||
        loan.employeeDesignation.toLowerCase().includes(q)
      );
    });
  }, [loans, filterSource, searchQuery]);

  // When selected loan changes, update defaults
  useEffect(() => {
    if (selectedLoan) {
      setAmountStr(String(selectedLoan.monthlyInstallment || ''));
      if (selectedLoan.loanSource === 'other') {
        setSourceType('inter_pbs');
      } else {
        setSourceType('payroll');
      }
    }
  }, [selectedLoanId, selectedLoan]);

  // Generate helper list of months between startMonth and endMonth
  const generateMonthList = (start: string, end: string): string[] => {
    const list: string[] = [];
    if (!start || !end) return list;
    const [startYear, startM] = start.split('-').map(Number);
    const [endYear, endM] = end.split('-').map(Number);
    if (!startYear || !startM || !endYear || !endM) return list;

    let currYear = startYear;
    let currMonth = startM;

    while (currYear < endYear || (currYear === endYear && currMonth <= endM)) {
      const formatted = `${currYear}-${String(currMonth).padStart(2, '0')}`;
      list.push(formatted);
      currMonth++;
      if (currMonth > 12) {
        currMonth = 1;
        currYear++;
      }
      if (list.length > 24) break; // safety guard
    }
    return list;
  };

  // Synchronize monthlyRows when startMonth, endMonth, or common voucher changes
  useEffect(() => {
    if (mode === 'multi') {
      const monthList = generateMonthList(startMonth, endMonth);
      const defaultInstallment = selectedLoan ? selectedLoan.monthlyInstallment : 15000;

      setMonthlyRows(prev => {
        return monthList.map((m) => {
          const existing = prev.find(p => p.month === m);
          return {
            month: m,
            amount: existing ? existing.amount : defaultInstallment,
            voucherNo: existing?.voucherNo || (multiCommonVoucher ? `${multiCommonVoucher}-${m.slice(5)}` : ''),
            notes: existing?.notes || `${formatBanglaMonthYear(m)} কিস্তি রেমিট্যান্স`
          };
        });
      });
    }
  }, [startMonth, endMonth, selectedLoanId, mode, multiCommonVoucher]);

  // Format YYYY-MM to Bengali readable label
  const formatBanglaMonthYear = (ym: string) => {
    if (!ym) return '';
    const [y, m] = ym.split('-');
    const banglaMonths = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const monthName = banglaMonths[Number(m) - 1] || m;
    const toBn = (num: string) => num.replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[Number(d)]);
    return `${monthName}/${toBn(y)}`;
  };

  // Convert digits to Bengali
  const toBnDigits = (val: string | number) => {
    return String(val).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[Number(d)]);
  };

  // Single Month Calculation (Government Principal-First Rule)
  const enteredAmount = Number(amountStr) || 0;
  let simulatedPrincipalPaid = 0;
  let simulatedInterestPaid = 0;
  let simulatedAdvancePaid = 0;
  let newPrincipalBalance = selectedLoan ? selectedLoan.principalBalance : 0;
  let newInterestBalance = selectedLoan ? selectedLoan.interestBalance : 0;
  let newAdvanceBalance = selectedLoan ? selectedLoan.advanceBalance : 0;

  if (selectedLoan && enteredAmount > 0) {
    let rem = enteredAmount;
    if (newPrincipalBalance > 0) {
      if (rem <= newPrincipalBalance) {
        simulatedPrincipalPaid = rem;
        newPrincipalBalance -= rem;
        rem = 0;
      } else {
        simulatedPrincipalPaid = newPrincipalBalance;
        rem -= newPrincipalBalance;
        newPrincipalBalance = 0;
      }
    }

    if (rem > 0 && newInterestBalance > 0) {
      if (rem <= newInterestBalance) {
        simulatedInterestPaid = rem;
        newInterestBalance -= rem;
        rem = 0;
      } else {
        simulatedInterestPaid = newInterestBalance;
        rem -= newInterestBalance;
        newInterestBalance = 0;
      }
    }

    if (rem > 0) {
      simulatedAdvancePaid = rem;
      newAdvanceBalance += rem;
      rem = 0;
    }
  }

  // Multi-Month Sequential Simulation
  const multiMonthSimulation = useMemo(() => {
    if (!selectedLoan || monthlyRows.length === 0) {
      return {
        rows: [],
        totalRemittance: 0,
        totalPrincipal: 0,
        totalInterest: 0,
        totalAdvance: 0,
        endingPrincipal: selectedLoan?.principalBalance || 0,
        endingInterest: selectedLoan?.interestBalance || 0,
        endingAdvance: selectedLoan?.advanceBalance || 0
      };
    }

    let runningPrincipal = selectedLoan.principalBalance;
    let runningInterest = selectedLoan.interestBalance;
    let runningAdvance = selectedLoan.advanceBalance;

    let sumTotal = 0;
    let sumPrin = 0;
    let sumInt = 0;
    let sumAdv = 0;

    const rowSimulations = monthlyRows.map(row => {
      const amt = Number(row.amount) || 0;
      sumTotal += amt;
      let rem = amt;
      let pPaid = 0;
      let iPaid = 0;
      let aPaid = 0;

      if (runningPrincipal > 0) {
        if (rem <= runningPrincipal) {
          pPaid = rem;
          runningPrincipal -= rem;
          rem = 0;
        } else {
          pPaid = runningPrincipal;
          rem -= runningPrincipal;
          runningPrincipal = 0;
        }
      }

      if (rem > 0 && runningInterest > 0) {
        if (rem <= runningInterest) {
          iPaid = rem;
          runningInterest -= rem;
          rem = 0;
        } else {
          iPaid = runningInterest;
          rem -= runningInterest;
          runningInterest = 0;
        }
      }

      if (rem > 0) {
        aPaid = rem;
        runningAdvance += rem;
        rem = 0;
      }

      sumPrin += pPaid;
      sumInt += iPaid;
      sumAdv += aPaid;

      return {
        ...row,
        principalPaid: pPaid,
        interestPaid: iPaid,
        advancePaid: aPaid,
        endingPrincipal: runningPrincipal,
        endingInterest: runningInterest,
        endingAdvance: runningAdvance
      };
    });

    return {
      rows: rowSimulations,
      totalRemittance: sumTotal,
      totalPrincipal: sumPrin,
      totalInterest: sumInt,
      totalAdvance: sumAdv,
      endingPrincipal: runningPrincipal,
      endingInterest: runningInterest,
      endingAdvance: runningAdvance
    };
  }, [selectedLoan, monthlyRows]);

  // Handle Multi-Month Row Editing
  const handleUpdateRow = (index: number, field: keyof MonthlyItemRow, value: any) => {
    setMonthlyRows(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveRow = (index: number) => {
    setMonthlyRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddNextMonth = () => {
    if (monthlyRows.length === 0) {
      setMonthlyRows([{
        month: '2026-10',
        amount: selectedLoan?.monthlyInstallment || 15000,
        voucherNo: multiCommonVoucher || '',
        notes: 'অক্টোবর/২০২৬ কিস্তি রেমিট্যান্স'
      }]);
      return;
    }
    const lastRow = monthlyRows[monthlyRows.length - 1];
    const [y, m] = lastRow.month.split('-').map(Number);
    let nextY = y;
    let nextM = m + 1;
    if (nextM > 12) {
      nextM = 1;
      nextY++;
    }
    const nextFormatted = `${nextY}-${String(nextM).padStart(2, '0')}`;
    setMonthlyRows(prev => [
      ...prev,
      {
        month: nextFormatted,
        amount: selectedLoan?.monthlyInstallment || 15000,
        voucherNo: multiCommonVoucher ? `${multiCommonVoucher}-${String(nextM).padStart(2, '0')}` : '',
        notes: `${formatBanglaMonthYear(nextFormatted)} কিস্তি রেমিট্যান্স`
      }
    ]);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) {
      setError('দয়া করে ঋণগ্রহীতা ও ঋণ নির্বাচন করুন।');
      return;
    }

    try {
      setError('');

      if (mode === 'single') {
        if (enteredAmount <= 0) {
          setError('সঠিক কিস্তির টাকার পরিমাণ প্রদান করুন।');
          return;
        }

        await onSubmit({
          loanId: selectedLoan.id,
          repaymentMonth,
          repaymentDate,
          totalAmount: enteredAmount,
          voucherNo: voucherNo || undefined,
          sourceType,
          notes: notes || `${repaymentMonth} মাসের নিয়মিত কিস্তি কর্তন`
        });
        onClose();
      } else {
        // Multi-month Batch Mode
        if (monthlyRows.length === 0) {
          setError('কমপক্ষে এক বা একাধিক মাসের কিস্তি যোগ করুন।');
          return;
        }

        const validRows = monthlyRows.filter(r => Number(r.amount) > 0);
        if (validRows.length === 0) {
          setError('কিস্তির টাকার পরিমাণ প্রদান করুন।');
          return;
        }

        const batchItems = validRows.map(r => ({
          loanId: selectedLoan.id,
          repaymentMonth: r.month,
          repaymentDate: multiCommonDate,
          totalAmount: Number(r.amount),
          voucherNo: r.voucherNo || multiCommonVoucher || undefined,
          sourceType: 'inter_pbs' as const,
          notes: r.notes || `${r.month} অন্য পবিস হতে রেমিট্যান্স`
        }));

        if (onSubmitBatch) {
          await onSubmitBatch(batchItems);
        } else {
          // Fallback: Post one by one sequentially
          for (const item of batchItems) {
            await onSubmit(item);
          }
        }
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'কিস্তি সংরক্ষণ ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full overflow-hidden flex flex-col max-h-[92vh] ${mode === 'multi' ? 'max-w-4xl' : 'max-w-xl'}`}>
        
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-800 to-teal-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Coins className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                কিস্তি কর্তন ও রেমিট্যান্স পোস্টিং
              </h3>
              <p className="text-[11px] text-emerald-200">
                বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড (আসল আগে, সুদ পরে সমন্বয় নীতি)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (Single Month vs Multi-Month Inter-PBS Batch) */}
        <div className="px-5 pt-3 pb-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                mode === 'single'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>একক মাস পোস্টিং</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('multi');
                setSourceType('inter_pbs');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                mode === 'multi'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>অন্য পবিসের একসাথে কয়েক মাসের রেমিট্যান্স</span>
              <span className="bg-amber-400 text-amber-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                মাল্টি-মান্থ
              </span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>অন্যান্য পবিস থেকে এককালীন একাধিক মাসের টাকা আসলে মাল্টি-মান্থ ব্যবহার করুন</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. SEARCHABLE LOAN / EMPLOYEE SELECTOR (User Requirement: এখানে সার্চ অপশন প্রয়োজন) */}
          <div className="relative" ref={searchContainerRef}>
            <label className="block font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>ঋণগ্রহীতা কর্মকর্তা/কর্মচারী নির্বাচন করুন *</span>
              </span>
              <span className="text-[11px] font-normal text-slate-500">
                মোট সক্রিয় ঋণ: {toBnDigits(loans.length)} টি
              </span>
            </label>

            {/* Selected Card View with Search Toggle */}
            <div
              onClick={() => setIsSearchOpen(prev => !prev)}
              className="p-3 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl cursor-pointer transition-all shadow-xs flex items-center justify-between gap-3 group"
            >
              {selectedLoan ? (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-xs">
                    {selectedLoan.payId}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span className="truncate">{selectedLoan.employeeNameBn}</span>
                      <span className="text-[10px] font-normal text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {selectedLoan.employeeDesignation}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                      <span>ঋণ নং: <strong className="font-num text-slate-700">{selectedLoan.loanNo}</strong></span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{selectedLoan.lendingPbs}</span>
                      </span>
                      <span>·</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                        selectedLoan.loanSource === 'other'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedLoan.loanSource === 'other' ? 'অন্য পবিস ঋণ (Inter-PBS)' : 'নিজ পবিস ঋণ'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 py-1">একটি ঋণ নির্বাচন করতে এখানে ক্লিক করুন...</div>
              )}

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-emerald-700 font-semibold group-hover:underline flex items-center gap-1">
                  <Search className="w-3.5 h-3.5" />
                  <span>সার্চ / পরিবর্তন</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isSearchOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Interactive Dropdown Search Box */}
            {isSearchOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-white rounded-xl shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in duration-100">
                {/* Search Header */}
                <div className="p-2.5 bg-slate-50 border-b border-slate-200 space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="নাম, পে-আইডি, পদবি, ঋণ নম্বর বা পবিসের নাম দিয়ে সার্চ করুন..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter chips */}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-500 font-medium">ফিল্টার:</span>
                    <button
                      type="button"
                      onClick={() => setFilterSource('all')}
                      className={`px-2 py-0.5 rounded-full ${filterSource === 'all' ? 'bg-slate-800 text-white font-bold' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                    >
                      সব ({loans.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterSource('own')}
                      className={`px-2 py-0.5 rounded-full ${filterSource === 'own' ? 'bg-blue-700 text-white font-bold' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                    >
                      নিজ পবিস ({loans.filter(l => l.loanSource === 'own').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterSource('other')}
                      className={`px-2 py-0.5 rounded-full ${filterSource === 'other' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                    >
                      অন্য পবিস / Inter-PBS ({loans.filter(l => l.loanSource === 'other').length})
                    </button>
                  </div>
                </div>

                {/* Search Results List */}
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {filteredLoans.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">
                      <Search className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                      <p className="font-medium">কোনো ঋণগ্রহীতা বা ঋণ খুঁজে পাওয়া যায়নি।</p>
                      <p className="text-[11px] text-slate-400 mt-1">অন্য কোনো নাম বা পে-আইডি দিয়ে চেষ্টা করুন।</p>
                    </div>
                  ) : (
                    filteredLoans.map(loan => {
                      const isSelected = loan.id === selectedLoanId;
                      return (
                        <div
                          key={loan.id}
                          onClick={() => {
                            setSelectedLoanId(loan.id);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className={`p-2.5 sm:p-3 hover:bg-emerald-50/70 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                            isSelected ? 'bg-emerald-50/90 font-medium' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-bold text-[11px] shrink-0 font-num">
                              {loan.payId}
                            </span>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                <span className="truncate">{loan.employeeNameBn}</span>
                                <span className="text-[10px] text-slate-500 font-normal">({loan.employeeDesignation})</span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span>ঋণ নং: {loan.loanNo}</span>
                                <span>·</span>
                                <span className="truncate">{loan.lendingPbs}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-bold text-emerald-800 font-num text-xs">
                              ৳ {loan.principalBalance.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              কিস্তি: ৳ {loan.monthlyInstallment.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Loan Quick Metrics Banner */}
          {selectedLoan && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-slate-50 to-emerald-50/40 border border-slate-200 grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-[10px] text-slate-500 font-medium">আসল স্থিতি</div>
                <div className="font-bold text-emerald-900 font-num text-xs sm:text-sm">
                  ৳ {selectedLoan.principalBalance.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-medium">সুদ স্থিতি</div>
                <div className="font-bold text-blue-900 font-num text-xs sm:text-sm">
                  ৳ {selectedLoan.interestBalance.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-medium">অগ্রিম জমা</div>
                <div className="font-bold text-purple-900 font-num text-xs sm:text-sm">
                  ৳ {selectedLoan.advanceBalance?.toLocaleString() || '০'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-medium">নির্ধারিত কিস্তি</div>
                <div className="font-bold text-slate-900 font-num text-xs sm:text-sm">
                  ৳ {selectedLoan.monthlyInstallment.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: SINGLE MONTH POSTING (একক মাস পোস্টিং) */}
          {/* ========================================================= */}
          {mode === 'single' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              {/* Month & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">কর্তনের মাস (YYYY-MM) *</label>
                  <input
                    type="month"
                    value={repaymentMonth}
                    onChange={(e) => setRepaymentMonth(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-num"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">কর্তনের/জমার তারিখ *</label>
                  <input
                    type="date"
                    value={repaymentDate}
                    onChange={(e) => setRepaymentDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-num"
                    required
                  />
                </div>
              </div>

              {/* Amount & Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">মোট কিস্তির পরিমাণ (টাকা) *</label>
                  <input
                    type="number"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder="যেমন: ১৫০০০"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-num text-sm font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">কর্তনের উৎস</label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="payroll">মাসিক বেতন হতে কর্তন (Payroll)</option>
                    <option value="inter_pbs">অন্য পবিস রেমিট্যান্স (Inter-PBS)</option>
                    <option value="manual">সরাসরি নগদ/চেক জমা (Manual)</option>
                  </select>
                </div>
              </div>

              {/* Real-time Dynamic Government Rule Settlement Breakdown */}
              {enteredAmount > 0 && selectedLoan && (
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>সরকারি নিয়ম অনুযায়ী তাৎক্ষণিক সমন্বয় প্রিভিউ:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-white border border-emerald-100">
                      <div className="text-slate-500">আসল পরিশোধ:</div>
                      <div className="font-bold text-emerald-800 font-num text-xs">
                        ৳ {simulatedPrincipalPaid.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">নতুন আসল: ৳{newPrincipalBalance.toLocaleString()}</div>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-emerald-100">
                      <div className="text-slate-500">সুদ পরিশোধ:</div>
                      <div className="font-bold text-blue-800 font-num text-xs">
                        ৳ {simulatedInterestPaid.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">নতুন সুদ: ৳{newInterestBalance.toLocaleString()}</div>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-emerald-100">
                      <div className="text-slate-500">অগ্রিম জমা:</div>
                      <div className="font-bold text-purple-800 font-num text-xs">
                        ৳ {simulatedAdvancePaid.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">অগ্রিম স্থিতি: ৳{newAdvanceBalance.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Voucher & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ভাউচার / চেক / রেমিট্যান্স রেফারেন্স (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={voucherNo}
                    onChange={(e) => setVoucherNo(e.target.value)}
                    placeholder="যেমন: VR-2026-10-01 বা BA-2026-09"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-num"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">মন্তব্য / বিবরণ</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="যেমন: অক্টোবর/২৬ কিস্তি কর্তন"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: MULTI-MONTH INTER-PBS BATCH POSTING (User Requirement: অন্য পবিসের রেমিট্যান্স একসাথে কয়েক মাসের তথ্য মাস ভিত্তিক পোস্টিং) */}
          {/* ========================================================= */}
          {mode === 'multi' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              {/* Batch Configuration Panel */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-amber-950 flex items-center gap-2">
                    <CalendarRange className="w-4 h-4 text-amber-700" />
                    <span>অন্য পবিসের এককালীন রেমিট্যান্স তথ্য ও মাসের পরিসর</span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    {toBnDigits(monthlyRows.length)} টি মাস নির্বাচিত
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">শুরুর মাস</label>
                    <input
                      type="month"
                      value={startMonth}
                      onChange={(e) => setStartMonth(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-num text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">শেষের মাস</label>
                    <input
                      type="month"
                      value={endMonth}
                      onChange={(e) => setEndMonth(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-num text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">রেমিট্যান্স জমার তারিখ</label>
                    <input
                      type="date"
                      value={multiCommonDate}
                      onChange={(e) => setMultiCommonDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-num text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">ব্যাংক অ্যাডভাইস / চেক নং</label>
                    <input
                      type="text"
                      value={multiCommonVoucher}
                      onChange={(e) => setMultiCommonVoucher(e.target.value)}
                      placeholder="BA-2026-NRSG বা চেক নং"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-num focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Quick Helper Range Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-600">
                  <span className="font-medium text-slate-500">দ্রুত নির্বাচন:</span>
                  <button
                    type="button"
                    onClick={() => { setStartMonth('2026-07'); setEndMonth('2026-08'); }}
                    className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200"
                  >
                    জুলাই-আগস্ট (২ মাস)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStartMonth('2026-07'); setEndMonth('2026-09'); }}
                    className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200"
                  >
                    ১ম কোয়ার্টার (৩ মাস)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStartMonth('2026-05'); setEndMonth('2026-08'); }}
                    className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200"
                  >
                    মে-আগস্ট (৪ মাস)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStartMonth('2026-05'); setEndMonth('2026-10'); }}
                    className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200"
                  >
                    মে-অক্টোবর (৬ মাস)
                  </button>
                </div>
              </div>

              {/* Month-by-Month Editable Schedule Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-700" />
                    <span>মাস ভিত্তিক কিস্তি কর্তন ও সমন্বয় সিডিউল</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNextMonth}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-bold text-[11px] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>পরবর্তী মাস যোগ করুন</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                        <th className="py-2 px-3 text-center w-10">ক্র.</th>
                        <th className="py-2 px-3">কর্তনের মাস</th>
                        <th className="py-2 px-3">কিস্তির পরিমাণ (টাকা)</th>
                        <th className="py-2 px-3 text-emerald-800">আসল সমন্বয়</th>
                        <th className="py-2 px-3 text-blue-800">সুদ সমন্বয়</th>
                        <th className="py-2 px-3">ভাউচার / চেক রেফারেন্স</th>
                        <th className="py-2 px-3">বিবরণ / নোট</th>
                        <th className="py-2 px-2 text-center w-8">মুছুন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {multiMonthSimulation.rows.map((row, idx) => (
                        <tr key={row.month} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 text-center font-num text-slate-500 font-medium">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <input
                              type="month"
                              value={row.month}
                              onChange={(e) => handleUpdateRow(idx, 'month', e.target.value)}
                              className="px-2 py-1 rounded border border-slate-300 font-num text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <span className="ml-1.5 text-slate-500 text-[10px]">
                              ({formatBanglaMonthYear(row.month)})
                            </span>
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <input
                              type="number"
                              value={row.amount}
                              onChange={(e) => handleUpdateRow(idx, 'amount', Number(e.target.value))}
                              className="w-24 px-2 py-1 rounded border border-slate-300 font-num font-bold text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="py-2 px-3 font-num font-semibold text-emerald-800 whitespace-nowrap">
                            ৳ {row.principalPaid.toLocaleString()}
                          </td>
                          <td className="py-2 px-3 font-num font-semibold text-blue-800 whitespace-nowrap">
                            ৳ {row.interestPaid.toLocaleString()}
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.voucherNo}
                              onChange={(e) => handleUpdateRow(idx, 'voucherNo', e.target.value)}
                              placeholder="ভাউচার/চেক"
                              className="w-28 px-2 py-1 rounded border border-slate-300 font-num text-[11px]"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.notes}
                              onChange={(e) => handleUpdateRow(idx, 'notes', e.target.value)}
                              placeholder="মন্তব্য"
                              className="w-36 px-2 py-1 rounded border border-slate-300 text-[11px]"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(idx)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                              title="বাদ দিন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Batch Grand Totals & Rule Summary Footer */}
                <div className="p-3 bg-emerald-50 border-t border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <div>
                      <span className="text-slate-600">সর্বমোট রেমিট্যান্স: </span>
                      <strong className="font-num text-emerald-950 font-bold text-sm">
                        ৳ {multiMonthSimulation.totalRemittance.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-600">আসল পরিশোধ: </span>
                      <strong className="font-num text-emerald-800 font-bold">
                        ৳ {multiMonthSimulation.totalPrincipal.toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-600">সুদ পরিশোধ: </span>
                      <strong className="font-num text-blue-800 font-bold">
                        ৳ {multiMonthSimulation.totalInterest.toLocaleString()}
                      </strong>
                    </div>
                    {multiMonthSimulation.totalAdvance > 0 && (
                      <div>
                        <span className="text-slate-600">অগ্রিম জমা: </span>
                        <strong className="font-num text-purple-800 font-bold">
                          ৳ {multiMonthSimulation.totalAdvance.toLocaleString()}
                        </strong>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium">
                    অবশিষ্ট আসল স্থিতি: <strong className="font-num text-slate-800">৳ {multiMonthSimulation.endingPrincipal.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>অনলাইন ক্লাউড ডাটাবেজ ও লেজারে তাৎক্ষণিক সমন্বিত হবে</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition-colors"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedLoan}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold shadow-md disabled:opacity-50 flex items-center gap-2 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'পোস্টিং হচ্ছে...'
                    : mode === 'multi'
                    ? `একসাথে ${toBnDigits(monthlyRows.length)} মাসের কিস্তি পোস্টিং করুন`
                    : 'কিস্তি পোস্ট ও ব্যালেন্স সমন্বয়'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
