import React, { useState, useEffect } from 'react';
import { X, Printer, FileText, Download, Building2 } from 'lucide-react';
import { PbsSettings } from '../types';

interface LedgerModalProps {
  loanId: string;
  settings: PbsSettings;
  onClose: () => void;
}

export const LedgerModal: React.FC<LedgerModalProps> = ({ loanId, settings, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/reports/ledger/${loanId}`);
        const json = await res.json();
        if (json.success) {
          setData(json.ledger);
        }
      } catch (err) {
        console.error('Failed to load ledger:', err);
      } finally {
        setLoading(false);
      }
    };

    if (loanId) {
      fetchLedger();
    }
  }, [loanId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl overflow-hidden my-6 print-card flex flex-col max-h-[92vh]">
        {/* Modal Toolbar (no print) */}
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800 text-xs sm:text-sm">
              গৃহ নির্মাণ ঋণ খতিয়ান স্টেটমেন্ট (Loan Ledger Statement)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>প্রিন্ট / PDF</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-6 text-xs text-slate-900 bg-white">
          {loading ? (
            <div className="py-16 text-center text-slate-500">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span>খতিয়ান লোড হচ্ছে...</span>
            </div>
          ) : !data ? (
            <div className="py-16 text-center text-slate-400">
              খতিয়ান তথ্য পাওয়া যায়নি।
            </div>
          ) : (
            <>
              {/* Document Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 gap-3">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="w-14 h-14 object-contain rounded" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    বাপবিবো
                  </div>
                )}

                <div className="text-center flex-1">
                  <div className="font-bold text-sm md:text-base text-slate-800">{settings.boardNameBn}</div>
                  <div className="font-bold text-base md:text-lg text-slate-950 mt-0.5">{settings.pbsNameBn}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{settings.addressBn} · অর্থ ও হিসাব বিভাগ</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-900 mt-1 bg-emerald-50 inline-block px-3 py-0.5 rounded-md border border-emerald-200">
                    কর্মকর্তা-কর্মচারী গৃহ নির্মাণ ঋণ ব্যক্তিগত খতিয়ান
                  </div>
                </div>

                <div className="w-14 text-right hidden sm:block shrink-0">
                  <span className="text-[9px] text-slate-400 block">স্মারক নং</span>
                  <span className="text-[10px] text-slate-700 font-mono font-semibold">{settings.memoPrefix}</span>
                </div>
              </div>

              {/* Employee & Loan Meta Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">কর্মচারীর নাম:</span>
                  <strong className="text-slate-900 text-sm">{data.employee?.nameBn}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">পে-আইডি ও পদবী:</span>
                  <strong className="text-slate-800 font-num">{data.employee?.payId}</strong>
                  <div className="text-[11px] text-slate-600">{data.employee?.designation}</div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ঋণ নম্বর ও লট:</span>
                  <strong className="text-slate-900 font-num">{data.loan.loanNo}</strong>
                  <div className="text-[11px] text-slate-600">{data.loan.allocationNo}</div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">মঞ্জুরিকৃত আসল ও তারিখ:</span>
                  <strong className="text-slate-900 font-num">৳ {data.loan.disbursementAmount.toLocaleString()}</strong>
                  <div className="text-[10px] text-slate-400 font-num">{data.loan.disbursementDate}</div>
                </div>
              </div>

              {/* Ledger Statement Table */}
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
                    {data.rows.map((row: any, i: number) => (
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

              {/* Closing Balances Box */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900 text-white font-num text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">সমাপনী আসল স্থিতি</span>
                  <div className="text-base font-bold text-emerald-400">
                    ৳ {data.closingPrincipal.toLocaleString()}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">সমাপনী ধার্যকৃত সুদ</span>
                  <div className="text-base font-bold text-blue-400">
                    ৳ {data.closingInterest.toLocaleString()}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">অগ্রিম জমা স্থিতি</span>
                  <div className="text-base font-bold text-purple-400">
                    ৳ {data.closingAdvance.toLocaleString()}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">সর্বমোট প্রদেয় ব্যালেন্স</span>
                  <div className="text-base font-bold text-white">
                    ৳ {data.totalPayable.toLocaleString()}
                  </div>
                </div>
              </div>

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
