import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, Printer, BarChart3, BookOpen, Layers } from 'lucide-react';
import { PbsSettings } from '../types';

interface FiscalYearViewProps {
  settings: PbsSettings;
}

export const FiscalYearView: React.FC<FiscalYearViewProps> = ({ settings }) => {
  const [activeReport, setActiveReport] = useState<'comparative' | 'gl14320' | 'gl24250'>('comparative');
  const [data, setData] = useState<any[]>([]);
  const [gl143Data, setGl143Data] = useState<any>(null);
  const [gl242Data, setGl242Data] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/reports/fiscal-year').then(r => r.json()),
      fetch('/api/reports/house-loan-ledger-14320').then(r => r.json()),
      fetch('/api/reports/other-pbs-ledger-24250').then(r => r.json())
    ])
      .then(([fyRes, gl143Res, gl242Res]) => {
        if (fyRes.success) setData(fyRes.fiscalYears);
        if (gl143Res.success) setGl143Data(gl143Res);
        if (gl242Res.success) setGl242Data(gl242Res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExportCsv = () => {
    if (activeReport === 'comparative') {
      const headers = ['অর্থবছর', 'প্রারম্ভিক আসল', 'নতুন বিতরণ', 'আসল আদায়', 'ধার্যকৃত সুদ', 'সমাপনী আসল স্থিতি', 'সমাপনী সুদ স্থিতি', 'সর্বমোট স্থিতি'];
      const rows = data.map(d => [
        d.year,
        d.openingPrincipal,
        d.newDisbursement,
        d.principalRecovery,
        d.interestProvisioned,
        d.closingPrincipal,
        d.closingInterest,
        d.closingTotal
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].map(e => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `PBS_House_Loan_Fiscal_Year_Report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (activeReport === 'gl14320' && gl143Data) {
      const headers = ['ঋণ নং', 'কর্মচারী', 'পে-আইডি', 'বিতরণকৃত আসল', 'অবশিষ্ট আসল স্থিতি'];
      const rows = (gl143Data.loans || []).map((l: any) => [
        l.loanNo,
        l.employeeNameBn,
        l.payId,
        l.disbursementAmount,
        l.principalBalance
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].map(e => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `GL_143.20_House_Loan_Principal_Ledger.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>আর্থিক রিপোর্ট ও হিসাব খতিয়ান (BREB GL Statements)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            জুলাই-জুন অর্থবছর ভিত্তিক তুলনামূলক বিবরণী এবং বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ডের কোড ভিত্তিক খতিয়ান
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>প্রিন্ট / PDF</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>এক্সেল / CSV ডাউনলোড</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 no-print text-xs overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveReport('comparative')}
          className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors shrink-0 ${
            activeReport === 'comparative'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>অর্থবছর ভিত্তিক তুলনামূলক বিবরণী</span>
        </button>

        <button
          onClick={() => setActiveReport('gl14320')}
          className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors shrink-0 ${
            activeReport === 'gl14320'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>কোড ১৪৩.২০ (গৃহ ঋণ আসল হিসাব)</span>
        </button>

        <button
          onClick={() => setActiveReport('gl24250')}
          className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors shrink-0 ${
            activeReport === 'gl24250'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>কোড ২৪২.৫০ (অন্যান্য পবিস রেমিট্যান্স দায় হিসাব)</span>
        </button>
      </div>

      {/* REPORT 1: Comparative Statement */}
      {activeReport === 'comparative' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs print-card w-full">
          <div className="p-6 border-b border-slate-100 hidden print:block text-center">
            <div className="font-bold text-base">{settings.boardNameBn}</div>
            <div className="font-bold text-xl">{settings.pbsNameBn}</div>
            <div className="text-xs text-slate-600">{settings.addressBn} · গৃহ নির্মাণ ঋণ অর্থবছর ভিত্তিক তুলনামূলক বিবরণী</div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[760px] text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">অর্থবছর (জুলাই-জুন)</th>
                  <th className="py-3 px-3 text-right">প্রারম্ভিক আসল স্থিতি</th>
                  <th className="py-3 px-3 text-right">নতুন ঋণ বিতরণ</th>
                  <th className="py-3 px-3 text-right text-emerald-800">আসল আদায়</th>
                  <th className="py-3 px-3 text-right text-blue-800">ধার্যকৃত সুদ</th>
                  <th className="py-3 px-3 text-right">সমাপনী আসল স্থিতি</th>
                  <th className="py-3 px-3 text-right">সমাপনী সুদ স্থিতি</th>
                  <th className="py-3 px-4 text-right font-bold text-slate-900 bg-slate-100/60">সর্বমোট সমাপনী স্থিতি</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-num">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      লোড হচ্ছে...
                    </td>
                  </tr>
                ) : (
                  data.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 font-sans">
                        {row.year}
                        <span className="text-[10px] text-slate-400 block font-normal">{row.label}</span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">
                        ৳ {row.openingPrincipal.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-700">
                        {row.newDisbursement > 0 ? `৳ ${row.newDisbursement.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-800 font-bold">
                        ৳ {row.principalRecovery.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-blue-800 font-semibold">
                        ৳ {row.interestProvisioned.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        ৳ {row.closingPrincipal.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-800">
                        ৳ {row.closingInterest.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-950 bg-slate-50 text-sm">
                        ৳ {row.closingTotal.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 2: GL 143.20 Ledger */}
      {activeReport === 'gl14320' && gl143Data && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-4 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500">হিসাব কোড ও বিবরণ</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">GL 143.20 (গৃহ ঋণ আসল)</div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500">মোট বিতরণকৃত আসল</div>
              <div className="font-bold text-slate-900 font-num text-sm mt-0.5">৳ {gl143Data.totalDisbursed?.toLocaleString()}</div>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-[11px] text-emerald-800">মোট আসল সমন্বয়/আদায়</div>
              <div className="font-bold text-emerald-900 font-num text-sm mt-0.5">৳ {gl143Data.totalRecovered?.toLocaleString()}</div>
            </div>
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
              <div className="text-[11px] text-amber-800">বর্তমান অবশিষ্ট আসল স্থিতি</div>
              <div className="font-bold text-amber-950 font-num text-sm mt-0.5">৳ {gl143Data.currentPrincipalBalance?.toLocaleString()}</div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full min-w-[650px] text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">ঋণ নম্বর</th>
                  <th className="py-2.5 px-3">কর্মচারীর নাম ও পদবি</th>
                  <th className="py-2.5 px-3">পে-আইডি</th>
                  <th className="py-2.5 px-3 text-right">বিতরণকৃত আসল</th>
                  <th className="py-2.5 px-3 text-right font-bold text-emerald-900">অবশিষ্ট আসল স্থিতি</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-num">
                {(gl143Data.loans || []).map((l: any) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{l.loanNo}</td>
                    <td className="py-2.5 px-3 font-sans">{l.employeeNameBn} <span className="text-slate-400">({l.employeeDesignation})</span></td>
                    <td className="py-2.5 px-3">{l.payId}</td>
                    <td className="py-2.5 px-3 text-right">৳ {l.disbursementAmount?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-800">৳ {l.principalBalance?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: GL 242.50 Ledger */}
      {activeReport === 'gl24250' && gl242Data && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-4 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500">হিসাব কোড ও বিবরণ</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">GL 242.50 (অন্য পবিস রেমিট্যান্স)</div>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-[11px] text-emerald-800">মোট কিস্তি আদায়কৃত অর্থ</div>
              <div className="font-bold text-emerald-900 font-num text-sm mt-0.5">৳ {gl242Data.totalCollected?.toLocaleString()}</div>
            </div>
            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-[11px] text-blue-800">ব্যাংক ট্রান্সফারের মাধ্যমে প্রেরিত</div>
              <div className="font-bold text-blue-900 font-num text-sm mt-0.5">৳ {gl242Data.totalRemitted?.toLocaleString()}</div>
            </div>
            <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200">
              <div className="text-[11px] text-purple-800">অনিষ্পন্ন রেমিট্যান্স স্থিতি</div>
              <div className="font-bold text-purple-950 font-num text-sm mt-0.5">৳ {gl242Data.pendingRemittance?.toLocaleString()}</div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full min-w-[650px] text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">অ্যাডভাইস নম্বর</th>
                  <th className="py-2.5 px-3">প্রাপক পবিস</th>
                  <th className="py-2.5 px-3">ব্যাংক হিসাব ও শাখা</th>
                  <th className="py-2.5 px-3">তারিখ</th>
                  <th className="py-2.5 px-3 text-right">অর্থের পরিমাণ</th>
                  <th className="py-2.5 px-3 text-center">অবস্থা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-num">
                {(gl242Data.bankAdvices || []).map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{a.adviceNo}</td>
                    <td className="py-2.5 px-3 font-sans">{a.toPbs}</td>
                    <td className="py-2.5 px-3">{a.bankName}</td>
                    <td className="py-2.5 px-3">{a.adviceDate}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-800">৳ {a.totalAmount?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {a.status === 'dispatched' ? 'প্রেরিত' : a.status === 'settled' ? 'নিষ্পন্ন' : 'প্রস্তুত'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
