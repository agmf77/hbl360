import React, { useState, useEffect } from 'react';
import { Search, X, Building2, Coins, UserCircle2, ArrowRight } from 'lucide-react';
import { Loan, Employee, Repayment } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  loans: Loan[];
  employees: Employee[];
  repayments: Repayment[];
  onSelectLoan: (loanId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  loans,
  employees,
  repayments,
  onSelectLoan
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedLoans = q ? loans.filter(l => 
    l.loanNo.toLowerCase().includes(q) ||
    l.employeeNameBn.toLowerCase().includes(q) ||
    l.payId.includes(q)
  ) : [];

  const matchedEmployees = q ? employees.filter(e => 
    e.nameBn.toLowerCase().includes(q) ||
    e.nameEn.toLowerCase().includes(q) ||
    e.payId.includes(q) ||
    e.designation.toLowerCase().includes(q)
  ) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-xl overflow-hidden flex flex-col">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="পে-আইডি, কর্মচারীর নাম, বা ঋণ নম্বর লিখুন (যেমন: 0101, রফিকুল, HL)..."
            className="w-full text-sm bg-transparent outline-none text-slate-900 placeholder:text-slate-400 font-medium"
          />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-4 text-xs">
          {!q ? (
            <div className="py-8 text-center text-slate-400">
              অনুসন্ধানের জন্য পে-আইডি, কর্মচারীর নাম বা ঋণ নম্বর টাইপ করুন।
            </div>
          ) : (
            <>
              {matchedLoans.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    গৃহ ঋণসমূহ ({matchedLoans.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchedLoans.map(l => (
                      <div
                        key={l.id}
                        onClick={() => {
                          onSelectLoan(l.id);
                          onClose();
                        }}
                        className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{l.employeeNameBn} (পে-আইডি: {l.payId})</div>
                          <div className="text-[11px] text-slate-500 font-num">
                            ঋণ নং {l.loanNo} · {l.allocationNo} · আসল স্থিতি: ৳{l.principalBalance.toLocaleString()}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-emerald-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedEmployees.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    কর্মকর্তা ও কর্মচারী ({matchedEmployees.length})
                  </div>
                  <div className="space-y-1.5">
                    {matchedEmployees.map(e => (
                      <div
                        key={e.id}
                        className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <UserCircle2 className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="font-semibold text-slate-900">{e.nameBn} ({e.nameEn})</div>
                            <div className="text-[11px] text-slate-500 font-num">
                              পে-আইডি: {e.payId} · {e.designation} ({e.department})
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {matchedLoans.length === 0 && matchedEmployees.length === 0 && (
                <div className="py-8 text-center text-slate-400">
                  "{query}" এর সাথে মিলে এমন কোনো রেকর্ড পাওয়া যায়নি।
                </div>
              )}
            </>
          )}
        </div>

        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between">
          <span>Esc চাপলে বন্ধ হবে</span>
          <span className="font-num">পবিস গৃহ ঋণ ব্যবস্থাপনা সিস্টেম</span>
        </div>
      </div>
    </div>
  );
};
