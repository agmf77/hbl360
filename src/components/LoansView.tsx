import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  PauseCircle, 
  PlayCircle, 
  FileText, 
  Coins, 
  Trash2, 
  Download,
  AlertCircle,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  X
} from 'lucide-react';
import { Loan, UserSession } from '../types';

interface LoansViewProps {
  loans: Loan[];
  currentUser: UserSession;
  onOpenAddLoan: () => void;
  onOpenLedger: (loanId: string) => void;
  onOpenRepayment: (loanId: string) => void;
  onToggleStatus: (loanId: string, currentStatus: Loan['status']) => void;
  onDeleteLoan: (loanId: string) => void;
  onRefresh?: () => void;
}

export const LoansView: React.FC<LoansViewProps> = ({
  loans,
  currentUser,
  onOpenAddLoan,
  onOpenLedger,
  onOpenRepayment,
  onToggleStatus,
  onDeleteLoan,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'own' | 'other'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'closed'>('all');
  
  // Excel Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    importedCount?: number;
    skippedCount?: number;
    errors?: string[];
  } | null>(null);

  const filtered = loans.filter(l => {
    const matchesSearch = 
      l.employeeNameBn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.payId.includes(searchTerm) ||
      l.loanNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = sourceFilter === 'all' || l.loanSource === sourceFilter;
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesSource && matchesStatus;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const res = await fetch('/api/loans/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64,
            currentUser: currentUser.nameBn
          })
        });
        const json = await res.json();
        setImportResult(json);
        if (json.success && onRefresh) {
          onRefresh();
        }
      } catch (err: any) {
        setImportResult({
          success: false,
          message: err.message || 'Excel ফাইল আপলোড ব্যর্থ হয়েছে।'
        });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <span>গৃহ নির্মাণ ঋণ রেজিস্টার ও বরাদ্দ লট</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            কর্মকর্তা-কর্মচারীদের ১ম ও ২য় বরাদ্দ, নিজস্ব ও অন্যান্য পবিস হতে বদলিকৃত ঋণের হিসাব
          </p>
        </div>

        {currentUser.role !== 'employee' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setImportResult(null);
                setShowImportModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200 shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Excel আমদানি (Opening Balance)</span>
            </button>

            <button
              onClick={onOpenAddLoan}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs active:scale-95 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ঋণ মঞ্জুরকরণ</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="নাম, পে-আইডি বা ঋণ নম্বর..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Source Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setSourceFilter('all')}
              className={`py-1 px-2.5 rounded-md font-medium transition-colors ${
                sourceFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              সকল ({loans.length})
            </button>
            <button
              onClick={() => setSourceFilter('own')}
              className={`py-1 px-2.5 rounded-md font-medium transition-colors ${
                sourceFilter === 'own' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              নিজস্ব পবিস
            </button>
            <button
              onClick={() => setSourceFilter('other')}
              className={`py-1 px-2.5 rounded-md font-medium transition-colors ${
                sourceFilter === 'other' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              অন্যান্য পবিস
            </button>
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-medium"
          >
            <option value="all">সকল অবস্থা</option>
            <option value="active">সক্রিয়</option>
            <option value="suspended">স্থগিত</option>
            <option value="closed">বন্ধ/পরিশোধিত</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          মোট প্রদর্শিত: <strong className="text-slate-900 font-num">{filtered.length}</strong> টি
        </div>
      </div>

      {/* Loans Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(loan => (
          <div
            key={loan.id}
            className={`bg-white rounded-2xl border p-5 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between ${
              loan.status === 'suspended' ? 'border-amber-200 bg-amber-50/10' : 'border-slate-200'
            }`}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {loan.employeeNameBn}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 font-num">
                      পে-আইডি: {loan.payId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {loan.employeeDesignation}
                  </p>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  loan.status === 'active' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : loan.status === 'suspended'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {loan.status === 'active' ? 'সক্রিয়' : loan.status === 'suspended' ? 'কর্তন স্থগিত' : 'পরিশোধিত'}
                </span>
              </div>

              {/* Loan Details Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs mb-4">
                <div className="p-2.5 rounded-xl bg-slate-50">
                  <div className="text-[10px] text-slate-500">ঋণ নম্বর ও বরাদ্দ</div>
                  <div className="font-bold text-slate-800 font-num truncate">
                    {loan.loanNo}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium">
                    {loan.allocationNo || '১ম বরাদ্দ'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50">
                  <div className="text-[10px] text-slate-500">ঋণের উৎস ও পবিস</div>
                  <div className="font-bold text-slate-800 truncate">
                    {loan.lendingPbs}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {loan.loanSource === 'other' ? 'বদলিকৃত ঋণ' : 'নিজস্ব ঋণ'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                  <div className="text-[10px] text-emerald-800">অবশিষ্ট আসল স্থিতি</div>
                  <div className="font-bold text-emerald-900 font-num text-sm">
                    ৳ {loan.principalBalance.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-700">
                    মূল ঋণ: ৳{loan.disbursementAmount.toLocaleString()}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                  <div className="text-[10px] text-blue-800">সুদ স্থিতি ও কিস্তি</div>
                  <div className="font-bold text-blue-900 font-num text-sm">
                    ৳ {loan.interestBalance.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-600 font-num font-medium">
                    কিস্তি: ৳{loan.monthlyInstallment.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => onOpenLedger(loan.id)}
                className="flex items-center gap-1 text-slate-600 hover:text-emerald-700 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>লেজার দেখুন</span>
              </button>

              {currentUser.role !== 'employee' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleStatus(loan.id, loan.status)}
                    title={loan.status === 'suspended' ? 'কর্তন পুনরায় চালু করুন' : 'সাময়িক স্থগিত করুন'}
                    className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    {loan.status === 'suspended' ? (
                      <PlayCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <PauseCircle className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => onOpenRepayment(loan.id)}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold rounded-lg transition-colors flex items-center gap-1 border border-emerald-200"
                  >
                    <Coins className="w-3.5 h-3.5 text-emerald-600" />
                    <span>কিস্তি</span>
                  </button>

                  <button
                    onClick={() => onDeleteLoan(loan.id)}
                    title="রিসাইকেল বিনে পাঠান"
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Excel Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-900 text-white">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-sm sm:text-base">
                  Excel হতে ঋণ ও Opening Balance আমদানি
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>ধাপ ১: অফিসিয়াল Excel টেমপ্লেট ডাউনলোড করুন</span>
                  <a
                    href="/templates/loan_opening_balance_import_template.xlsx"
                    download="loan_opening_balance_import_template.xlsx"
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>টেমপ্লেট নামান (.xlsx)</span>
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  টেমপ্লেটে কর্মচারীর পে-আইডি, ঋণ নম্বর, বরাদ্দকৃত আসল, বর্তমান আসল ও সুদ স্থিতি, মাসিক কিস্তি এবং opening balance date পূরণ করুন।
                </p>
              </div>

              <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 transition-colors text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="font-bold text-slate-800 mb-1">
                  ধাপ ২: পূরণকৃত Excel (.xlsx) ফাইল নির্বাচন করুন
                </div>
                <input
                  type="file"
                  accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer mt-2"
                />
                {isUploading && (
                  <p className="text-xs text-emerald-700 font-semibold mt-2">ফাইল প্রসেসিং ও ডাটাবেজে সংরক্ষণ হচ্ছে...</p>
                )}
              </div>

              {importResult && (
                <div className={`p-3.5 rounded-xl border ${
                  importResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {importResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span>{importResult.message}</span>
                  </div>
                  {importResult.skippedCount ? (
                    <div className="text-[11px] text-slate-600 mt-1">
                      ইতিপূর্বে বিদ্যমান থাকায় {importResult.skippedCount} টি ঋণ বাদ দেওয়া হয়েছে।
                    </div>
                  ) : null}
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="mt-2 text-[11px] text-red-700 list-disc list-inside">
                      {importResult.errors.slice(0, 3).map((err, i) => (
                        <div key={i}>• {err}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
