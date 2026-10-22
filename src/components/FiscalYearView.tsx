import React, { useState, useEffect } from 'react';
import { TrendingUp, Download, Printer, BarChart3 } from 'lucide-react';
import { PbsSettings } from '../types';

interface FiscalYearViewProps {
  settings: PbsSettings;
}

export const FiscalYearView: React.FC<FiscalYearViewProps> = ({ settings }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/fiscal-year')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setData(json.fiscalYears);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExportCsv = () => {
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs no-print">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>অর্থবছর ভিত্তিক তুলনামূলক বিবরণী (Fiscal Year Comparative Statement)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            জুলাই-জুন অর্থবছর ভিত্তিক প্রারম্ভিক স্থিতি, বিতরণ, আদায়, সুদ প্রভিশন ও সমাপনী স্থিতির নিরীক্ষিত বিবরণী
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

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs print-card">
        <div className="p-6 border-b border-slate-100 hidden print:block text-center">
          <div className="font-bold text-base">{settings.boardNameBn}</div>
          <div className="font-bold text-xl">{settings.pbsNameBn}</div>
          <div className="text-xs text-slate-600">{settings.addressBn} · গৃহ নির্মাণ ঋণ অর্থবছর ভিত্তিক তুলনামূলক বিবরণী</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
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
    </div>
  );
};
