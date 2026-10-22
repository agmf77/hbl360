import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Download,
  Upload,
  FileSpreadsheet,
  Building2,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  FileText,
  BookOpen,
  Filter,
  UserCheck,
  X
} from 'lucide-react';
import { Employee, Loan, UserSession } from '../types';

interface EmployeesViewProps {
  employees: Employee[];
  loans: Loan[];
  currentUser: UserSession;
  onOpenLedger: (loanId: string) => void;
  onRefresh: () => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  loans,
  currentUser,
  onOpenLedger,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [hasLoanFilter, setHasLoanFilter] = useState<'all' | 'with_loan' | 'no_loan'>('all');

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

  // New Employee Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newEmp, setNewEmp] = useState({
    payId: '',
    nameBn: '',
    nameEn: '',
    designation: '',
    department: '',
    presentPbs: 'গাজীপুর পল্লী বিদ্যুৎ সমিতি-২',
    phone: '',
    email: '',
    role: 'employee' as const,
    password: 'password123'
  });

  // Calculate departments
  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

  // Map employee loans (support single and multiple loans per payId)
  const loansByPayId = new Map<string, Loan[]>();
  loans.forEach(loan => {
    const list = loansByPayId.get(loan.payId) || [];
    list.push(loan);
    loansByPayId.set(loan.payId, list);
  });

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.nameBn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.payId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.phone && emp.phone.includes(searchTerm));

    const matchesDept = deptFilter === 'all' || emp.department === deptFilter;

    const empLoans = loansByPayId.get(emp.payId) || [];
    const hasLoan = empLoans.length > 0;
    const matchesLoan =
      hasLoanFilter === 'all' ||
      (hasLoanFilter === 'with_loan' && hasLoan) ||
      (hasLoanFilter === 'no_loan' && !hasLoan);

    return matchesSearch && matchesDept && matchesLoan;
  });

  const handleDownloadTemplate = () => {
    window.location.href = '/api/employees/import-template';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setImportResult(null);

      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64 = (evt.target?.result as string)?.split(',')[1];
        if (!base64) {
          setImportResult({ success: false, message: 'ফাইল রিড করতে ব্যর্থ হয়েছে।' });
          setIsUploading(false);
          return;
        }

        const res = await fetch('/api/employees/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64,
            currentUser: currentUser.nameBn
          })
        });

        const data = await res.json();
        setImportResult(data);
        setIsUploading(false);
        if (data.success) {
          onRefresh();
        }
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploading(false);
      setImportResult({ success: false, message: err.message || 'আপলোড ব্যর্থ হয়েছে।' });
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.payId.trim() || !newEmp.nameBn.trim()) {
      alert('পে-আইডি এবং বাংলা নাম আবশ্যক।');
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEmp,
          currentUser: currentUser.nameBn
        })
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'সংরক্ষণ ব্যর্থ হয়েছে।');
      } else {
        setShowAddModal(false);
        setNewEmp({
          payId: '',
          nameBn: '',
          nameEn: '',
          designation: '',
          department: '',
          presentPbs: 'গাজীপুর পল্লী বিদ্যুৎ সমিতি-২',
          phone: '',
          email: '',
          role: 'employee',
          password: 'password123'
        });
        onRefresh();
      }
    } catch (err: any) {
      alert(err.message || 'ত্রুটি ঘটেছে।');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Users className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-800">কর্মকর্তা / কর্মচারী তালিকা</h1>
          </div>
          <p className="text-xs text-slate-500">
            পল্লী বিদ্যুৎ সমিতির সকল কর্মকর্তা ও কর্মচারীর তথ্য ও গৃহ ঋণ প্রাপ্তির বিবরণী
          </p>
        </div>

        {currentUser.role !== 'employee' && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>এক্সেল ইমপোর্ট</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন কর্মকর্তা/কর্মচারী</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            মোট কর্মকর্তা/কর্মচারী
          </div>
          <div className="text-xl font-bold text-slate-900 font-num mt-1">
            {employees.length} জন
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
            গৃহ ঋণ গ্রহীতা
          </div>
          <div className="text-xl font-bold text-emerald-900 font-num mt-1">
            {loans.length} জন
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            নিজস্ব পবিস ঋণ
          </div>
          <div className="text-xl font-bold text-slate-900 font-num mt-1">
            {loans.filter(l => l.loanSource === 'own').length} জন
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            অন্য পবিস হতে বদলিকৃত
          </div>
          <div className="text-xl font-bold text-amber-800 font-num mt-1">
            {loans.filter(l => l.loanSource === 'other').length} জন
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="পে-আইডি, নাম, পদবী বা ফোন দিয়ে অনুসন্ধান..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          >
            <option value="all">সকল বিভাগ / শাখা</option>
            {departments.map((dept, i) => (
              <option key={i} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Loan Filter */}
          <select
            value={hasLoanFilter}
            onChange={(e) => setHasLoanFilter(e.target.value as any)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          >
            <option value="all">সকল কর্মচারী</option>
            <option value="with_loan">গৃহ ঋণ গ্রহীতা</option>
            <option value="no_loan">ঋণ গ্রহণ করেননি</option>
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">পে-আইডি</th>
                <th className="py-3 px-4">কর্মকর্তা / কর্মচারীর নাম</th>
                <th className="py-3 px-4">পদবী ও বিভাগ</th>
                <th className="py-3 px-4">বর্তমান পবিস</th>
                <th className="py-3 px-4">যোগাযোগ</th>
                <th className="py-3 px-4">গৃহ ঋণ অবস্থা</th>
                <th className="py-3 px-4 text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    কোন কর্মকর্তা বা কর্মচারী পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const empLoans = loansByPayId.get(emp.payId) || [];
                  const totalPrincipal = empLoans.reduce((sum, l) => sum + l.principalBalance, 0);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {emp.payId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{emp.nameBn}</div>
                        {emp.nameEn && (
                          <div className="text-[11px] text-slate-400">{emp.nameEn}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium">{emp.designation}</div>
                        <div className="text-[11px] text-slate-500">{emp.department}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {emp.presentPbs || 'গাজীপুর পবিস-২'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {emp.phone && (
                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{emp.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {empLoans.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 flex-wrap">
                              {empLoans.map((loan) => (
                                <span
                                  key={loan.id}
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"
                                >
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  {loan.loanNo} ({loan.allocationNo || 'বরাদ্দ'})
                                </span>
                              ))}
                            </div>
                            <div className="text-[10px] text-slate-500 font-num">
                              {empLoans.length > 1 ? (
                                <span className="font-semibold text-emerald-900">
                                  মোট আসল স্থিতি ({empLoans.length} টি লোন): ৳{totalPrincipal.toLocaleString()}
                                </span>
                              ) : (
                                <span>আসল স্থিতি: ৳{totalPrincipal.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">কোন ঋণ নেই</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {empLoans.length > 0 ? (
                          <button
                            onClick={() => onOpenLedger(empLoans[0].id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                              empLoans.length > 1
                                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300 font-bold'
                                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                          >
                            <BookOpen className="w-3 h-3" />
                            {empLoans.length > 1 ? 'একীভূত খতিয়ান' : 'খতিয়ান'}
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-700" />
                নতুন কর্মকর্তা/কর্মচারী নিবন্ধন
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">পে-আইডি (Pay ID) *</label>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ 10245"
                    value={newEmp.payId}
                    onChange={(e) => setNewEmp({ ...newEmp, payId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">বাংলা নাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="উদাঃ মোঃ রফিকুল ইসলাম"
                    value={newEmp.nameBn}
                    onChange={(e) => setNewEmp({ ...newEmp, nameBn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">ইংরেজি নাম</label>
                  <input
                    type="text"
                    placeholder="Md. Rafiqul Islam"
                    value={newEmp.nameEn}
                    onChange={(e) => setNewEmp({ ...newEmp, nameEn: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">পদবী</label>
                  <input
                    type="text"
                    placeholder="উদাঃ সহকারী মহাব্যবস্থাপক"
                    value={newEmp.designation}
                    onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">বিভাগ / শাখা</label>
                  <input
                    type="text"
                    placeholder="অর্থ ও হিসাব / প্রশাসন"
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">বর্তমান পবিস</label>
                  <input
                    type="text"
                    value={newEmp.presentPbs}
                    onChange={(e) => setNewEmp({ ...newEmp, presentPbs: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    placeholder="০১৭১১-XXXXXX"
                    value={newEmp.phone}
                    onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">ইমেইল</label>
                  <input
                    type="email"
                    placeholder="user@pbs.gov.bd"
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-semibold"
                >
                  {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'নিবন্ধন সম্পন্ন করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                কর্মকর্তা/কর্মচারী এক্সেল ইমপোর্ট
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">অফিসিয়াল এক্সেল টেমপ্লেট</div>
                  <div className="text-slate-500 text-[11px]">hbl360 স্ট্যান্ডার্ড টেমপ্লেট ডাউনলোড করে তথ্য পূরণ করুন</div>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-medium rounded-lg"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>টেমপ্লেট</span>
                </button>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <label className="cursor-pointer">
                  <span className="font-semibold text-emerald-800 hover:underline">এক্সেল ফাইল (.xlsx) নির্বাচন করুন</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-1">সর্বোচ্চ ১০ এমবি (.xlsx ফরম্যাট)</p>
              </div>

              {isUploading && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg text-center font-medium">
                  ফাইল প্রক্রিয়া ও ইমপোর্ট করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
                </div>
              )}

              {importResult && (
                <div className={`p-3 rounded-lg border ${
                  importResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {importResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{importResult.message}</span>
                  </div>
                  {importResult.importedCount !== undefined && (
                    <div className="text-[11px] mt-1">
                      সফলভাবে যুক্ত হয়েছে: {importResult.importedCount} জন | বাদ পড়েছে: {importResult.skippedCount || 0} জন
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs"
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
