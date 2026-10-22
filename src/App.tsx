import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, 
  Coins, 
  TrendingUp, 
  Send, 
  BarChart3, 
  Trash2, 
  ShieldCheck, 
  Settings, 
  UserCircle2, 
  Layers,
  Sparkles
} from 'lucide-react';
import { useRealtime } from './hooks/useRealtime';
import { 
  UserSession, 
  DashboardStats, 
  Loan, 
  Employee, 
  Repayment, 
  Provision, 
  BankAdvice, 
  DemandNotice, 
  RecycleItem, 
  PbsSettings 
} from './types';

// Firebase
import { auth, onAuthStateChanged, testFirestoreConnection } from './firebase';
import { FirestoreSyncService } from './services/firestoreSync';
import { User as FirebaseUser } from 'firebase/auth';

// Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LiveTicker } from './components/LiveTicker';
import { DashboardView } from './components/DashboardView';
import { EmployeesView } from './components/EmployeesView';
import { LoansView } from './components/LoansView';
import { AddLoanModal } from './components/AddLoanModal';
import { RepaymentsView } from './components/RepaymentsView';
import { RepaymentsModal } from './components/RepaymentsModal';
import { ProvisionsView } from './components/ProvisionsView';
import { TransferredLoansView } from './components/TransferredLoansView';
import { RemittancesView } from './components/RemittancesView';
import { LedgerModal } from './components/LedgerModal';
import { FiscalYearView } from './components/FiscalYearView';
import { EmployeePortalView } from './components/EmployeePortalView';
import { RecycleBinView } from './components/RecycleBinView';
import { AuditLogView } from './components/AuditLogView';
import { SettingsView } from './components/SettingsView';
import { SearchModal } from './components/SearchModal';
import { PbsSelectorModal, PbsListItem } from './components/PbsSelectorModal';

export default function App() {
  // Current logged in role
  const [currentUser, setCurrentUser] = useState<UserSession>({
    id: 'accounts',
    payId: 'accounts',
    nameBn: 'হিসাব শাখা (অর্থ বিভাগ)',
    nameEn: 'Accounts Division',
    role: 'accounts',
    designation: 'হিসাব কর্মকর্তা',
    department: 'অর্থ ও হিসাব শাখা'
  });

  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [isFirestoreReady, setIsFirestoreReady] = useState(false);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // 80 PBS Directory State
  const [pbsList, setPbsList] = useState<PbsListItem[]>([]);
  const [pbsSelectorOpen, setPbsSelectorOpen] = useState<boolean>(false);

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [provisions, setProvisions] = useState<Provision[]>([]);
  const [bankAdvices, setBankAdvices] = useState<BankAdvice[]>([]);
  const [demandNotices, setDemandNotices] = useState<DemandNotice[]>([]);
  const [recycleItems, setRecycleItems] = useState<RecycleItem[]>([]);
  const [settings, setSettings] = useState<PbsSettings>({
    pbsCode: 'gazipur-2',
    pbsNameBn: 'গাজীপুর পল্লী বিদ্যুৎ সমিতি-২',
    pbsNameEn: 'Gazipur Palli Bidyut Samity-2',
    boardNameBn: 'বাংলাদেশ পল্লী বিদ্যুতায়ন বোর্ড',
    boardNameEn: 'Bangladesh Rural Electrification Board',
    memoPrefix: '২৭.১২.৩৩০০.৫৪২.০১.০২৪',
    addressBn: 'রাজেন্দ্রপুর, গাজীপুর',
    addressEn: 'Rajendrapur, Gazipur',
    phone: '০২-৯২৬৩২২২',
    email: 'gazipurpbs2@gmail.com',
    website: 'pbs2.gazipur.gov.bd',
    bankNameBn: 'জনতা ব্যাংক পিএলসি, রাজেন্দ্রপুর শাখা',
    accountNo: '৩৩০২-০৫১২০৩-৭',
    routingNo: '১৩৫২৬০৮৮৯',
    agmFinanceName: 'নাজমুন নাহার',
    dgmName: 'প্রকৌশলী মো: রফিকুল ইসলাম',
    gmName: 'প্রকৌশলী এ. কে. এম. সামসুল আলম',
    logoUrl: '',
    customPassword: 'pbs123',
    taglineBn: 'আলোর ফেরিওয়ালা — ঘরে ঘরে বিদ্যুৎ',
    letterheadTheme: 'standard'
  });

  // Modals
  const [selectedLedgerLoanId, setSelectedLedgerLoanId] = useState<string | null>(null);
  const [repaymentModalOpen, setRepaymentModalOpen] = useState(false);
  const [repaymentModalLoanId, setRepaymentModalLoanId] = useState<string | undefined>(undefined);
  const [addLoanModalOpen, setAddLoanModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Fetch initial data from local server
  const refreshAllData = useCallback(async () => {
    try {
      const [
        statsRes,
        loansRes,
        employeesRes,
        repaymentsRes,
        provisionsRes,
        advicesRes,
        settingsRes,
        recycleRes,
        noticesRes,
        pbsListRes
      ] = await Promise.all([
        fetch('/api/dashboard/stats').then(r => r.json()),
        fetch('/api/loans').then(r => r.json()),
        fetch('/api/employees').then(r => r.json()),
        fetch('/api/repayments').then(r => r.json()),
        fetch('/api/provisions').then(r => r.json()),
        fetch('/api/remittances').then(r => r.json()),
        fetch('/api/settings').then(r => r.json()),
        fetch('/api/recyclebin').then(r => r.json()),
        fetch('/api/demand-notices').then(r => r.json()),
        fetch('/api/pbs/list').then(r => r.json())
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (loansRes.success) setLoans(loansRes.loans);
      if (employeesRes.success) setEmployees(employeesRes.employees);
      if (repaymentsRes.success) setRepayments(repaymentsRes.repayments);
      if (provisionsRes.success) setProvisions(provisionsRes.provisions);
      if (advicesRes.success) setBankAdvices(advicesRes.bankAdvices);
      if (settingsRes.success) setSettings(settingsRes.settings);
      if (recycleRes.success) setRecycleItems(recycleRes.items);
      if (noticesRes.success) setDemandNotices(noticesRes.demandNotices);
      if (pbsListRes.success) setPbsList(pbsListRes.pbsList);

      // Seed Firestore if empty
      if (loansRes.success && employeesRes.success && settingsRes.success) {
        FirestoreSyncService.seedIfEmpty({
          loans: loansRes.loans,
          employees: employeesRes.employees,
          settings: settingsRes.settings
        });
      }
    } catch (err) {
      console.error('Data refresh error:', err);
    }
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        try {
          const profile = await FirestoreSyncService.syncUserProfile(user);
          setCurrentUser(profile);
          setIsFirestoreReady(true);
        } catch (err) {
          console.error('Failed to sync Firestore profile:', err);
        }
      } else {
        setIsFirestoreReady(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time WebSocket hook
  const { isConnected, latencyMs, activeUsers, liveEvents } = useRealtime({
    enableSound: soundEnabled,
    onEvent: () => {
      refreshAllData();
    }
  });

  useEffect(() => {
    refreshAllData();
    testFirestoreConnection();
  }, [refreshAllData]);

  // Handle Role Switch
  const handleRoleChange = async (role: 'admin' | 'accounts' | 'employee', payId?: string) => {
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, payId })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        if (role === 'employee') {
          setActiveTab('employee_portal');
        } else {
          setActiveTab('dashboard');
        }
      }
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  // Run Batch Payroll Deduction
  const handleRunBatchPayroll = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch('/api/repayments/batch-payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: '2026-10',
          date: new Date().toISOString().split('T')[0],
          currentUser: currentUser.nameBn
        })
      });
      const data = await res.json();
      if (data.success) {
        // Also persist each repayment to Firestore
        if (data.repayments && Array.isArray(data.repayments)) {
          for (const rep of data.repayments) {
            const loan = loans.find(l => l.id === rep.loanId);
            if (loan) {
              const updatedLoan = {
                ...loan,
                principalBalance: Math.max(0, loan.principalBalance - rep.principalPaid),
                interestBalance: Math.max(0, loan.interestBalance - rep.interestPaid),
                advanceBalance: loan.advanceBalance + rep.advancePaid,
                updatedAt: new Date().toISOString()
              };
              FirestoreSyncService.saveRepayment(rep, updatedLoan).catch(console.warn);
            }
          }
        }
        await refreshAllData();
      } else {
        alert(data.message || 'ব্যাচ কিস্তি কর্তন ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      alert(err.message || 'অনুরোধ ব্যর্থ হয়েছে।');
    } finally {
      setIsProcessing(false);
    }
  };

  // Run Monthly Provisions
  const handleRunProvisions = async (month = '2026-10') => {
    try {
      setIsProcessing(true);
      const res = await fetch('/api/provisions/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month,
          currentUser: currentUser.nameBn
        })
      });
      const data = await res.json();
      if (data.success) {
        if (data.provisions && Array.isArray(data.provisions)) {
          for (const prov of data.provisions) {
            FirestoreSyncService.saveProvision(prov).catch(console.warn);
          }
        }
        await refreshAllData();
      } else {
        alert(data.message || 'সুদ প্রভিশন ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      alert(err.message || 'অনুরোধ ব্যর্থ হয়েছে।');
    } finally {
      setIsProcessing(false);
    }
  };

  // Post Single Repayment
  const handlePostRepayment = async (data: any) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/repayments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          currentUser: currentUser.nameBn
        })
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message);
      }

      // Sync to Firestore
      if (json.repayment && json.updatedLoan) {
        FirestoreSyncService.saveRepayment(json.repayment, json.updatedLoan).catch(console.warn);
      }

      await refreshAllData();
    } finally {
      setIsProcessing(false);
    }
  };

  // Post Multi-Month Inter-PBS Batch Repayments
  const handlePostMultiRepayments = async (items: any[]) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/repayments/batch-multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          currentUser: currentUser.nameBn
        })
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message);
      }

      // Sync to Firestore
      if (json.repayments && json.updatedLoan) {
        FirestoreSyncService.saveMultiRepayments(json.repayments, json.updatedLoan).catch(console.warn);
      }

      await refreshAllData();
    } finally {
      setIsProcessing(false);
    }
  };

  // Create Loan
  const handleCreateLoan = async (loanData: any) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...loanData,
          currentUser: currentUser.nameBn
        })
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message);
      }

      // Sync to Firestore
      if (json.loan) {
        FirestoreSyncService.saveLoan(json.loan).catch(console.warn);
      }

      await refreshAllData();
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle Loan Status
  const handleToggleLoanStatus = async (loanId: string, currentStatus: Loan['status']) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await fetch(`/api/loans/${loanId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, currentUser: currentUser.nameBn })
      });
      const data = await res.json();
      if (data.success) {
        if (data.loan) {
          FirestoreSyncService.saveLoan(data.loan).catch(console.warn);
        }
        await refreshAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Loan
  const handleDeleteLoan = async (loanId: string) => {
    if (!confirm('আপনি কি এই ঋণটি রিসাইকেল বিনে পাঠাতে চান? পরবর্তীতে যেকোনো সময় এটি পুনরুদ্ধার করা যাবে।')) return;
    try {
      const res = await fetch(`/api/loans/${loanId}?user=${currentUser.nameBn}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        await refreshAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Bank Advice
  const handleCreateBankAdvice = async (adviceData: any) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/remittances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...adviceData,
          currentUser: currentUser.nameBn
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      if (json.bankAdvice) {
        FirestoreSyncService.saveBankAdvice(json.bankAdvice).catch(console.warn);
      }

      await refreshAllData();
    } finally {
      setIsProcessing(false);
    }
  };

  // Update Bank Advice Status
  const handleUpdateBankAdviceStatus = async (id: string, status: BankAdvice['status']) => {
    try {
      const res = await fetch(`/api/remittances/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, currentUser: currentUser.nameBn })
      });
      const json = await res.json();
      if (json.success) {
        if (json.bankAdvice) {
          FirestoreSyncService.saveBankAdvice(json.bankAdvice).catch(console.warn);
        }
        await refreshAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Demand Notice
  const handleCreateDemandNotice = async (noticeData: any) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/demand-notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...noticeData,
          currentUser: currentUser.nameBn
        })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      await refreshAllData();
    } finally {
      setIsProcessing(false);
    }
  };

  // Restore from Recycle Bin
  const handleRestoreRecycleItem = async (id: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/recyclebin/restore/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUser: currentUser.nameBn })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      await refreshAllData();
    } finally {
      setIsProcessing(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (newSettings: Partial<PbsSettings>) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSettings,
          currentUser: currentUser.nameBn
        })
      });
      const json = await res.json();
      if (json.success) {
        setSettings(json.settings);
        FirestoreSyncService.saveSettings(json.settings).catch(console.warn);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Switch Active PBS
  const handleSelectPbs = async (pbsCode: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/pbs/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pbsCode,
          currentUser: currentUser.nameBn
        })
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        FirestoreSyncService.saveSettings(data.settings).catch(console.warn);
        await refreshAllData();
      } else {
        alert(data.message || 'পবিস পরিবর্তন ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      alert(err.message || 'পবিস পরিবর্তন ব্যর্থ হয়েছে।');
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger Live Test Simulation
  const handleSimulateTest = async () => {
    setIsSimulating(true);
    try {
      await fetch('/api/realtime/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'repayment',
          currentUser: `${currentUser.nameBn} (Live Test)`
        })
      });
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Left Collapsible Sidebar matching uploaded screenshot */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        transferredCount={loans.filter(l => l.loanSource === 'other').length}
        pendingRemittanceCount={stats?.pendingRemittanceCount || 0}
        recycleCount={recycleItems.length}
        dbFileName="database/pbs_house_loan.db"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          currentRole={currentUser}
          authUser={authUser}
          onRoleChange={handleRoleChange}
          employees={employees}
          settings={settings}
          isConnected={isConnected}
          latencyMs={latencyMs}
          activeUsers={activeUsers}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onSimulateTest={handleSimulateTest}
          isSimulating={isSimulating}
          onSearchOpen={() => setSearchModalOpen(true)}
          onPrintScreen={() => window.print()}
          isFirestoreReady={isFirestoreReady}
          onOpenPbsSelector={() => setPbsSelectorOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Realtime Live Ticker Bar */}
        <LiveTicker
          events={liveEvents}
          onOpenFeed={() => setActiveTab('dashboard')}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto w-full px-4 sm:px-6 py-5">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              loans={loans}
              liveEvents={liveEvents}
              currentUser={currentUser}
              onNavigate={setActiveTab}
              onRunBatchPayroll={handleRunBatchPayroll}
              onRunProvisions={() => handleRunProvisions('2026-10')}
              onOpenNewAdvice={() => setActiveTab('remittances')}
              onSimulateTest={handleSimulateTest}
              onOpenAddLoan={() => setAddLoanModalOpen(true)}
              onRefresh={refreshAllData}
              isProcessing={isProcessing}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeesView
              employees={employees}
              loans={loans}
              currentUser={currentUser}
              onOpenLedger={(loanId) => setSelectedLedgerLoanId(loanId)}
              onRefresh={refreshAllData}
            />
          )}

          {activeTab === 'loans' && (
            <LoansView
              loans={loans}
              currentUser={currentUser}
              onOpenAddLoan={() => setAddLoanModalOpen(true)}
              onOpenLedger={(loanId) => setSelectedLedgerLoanId(loanId)}
              onOpenRepayment={(loanId) => {
                setRepaymentModalLoanId(loanId);
                setRepaymentModalOpen(true);
              }}
              onToggleStatus={handleToggleLoanStatus}
              onDeleteLoan={handleDeleteLoan}
              onRefresh={refreshAllData}
            />
          )}

          {activeTab === 'repayments' && (
            <RepaymentsView
              repayments={repayments}
              loans={loans}
              currentUser={currentUser}
              onOpenNewRepayment={() => {
                setRepaymentModalLoanId(undefined);
                setRepaymentModalOpen(true);
              }}
              onRunBatchPayroll={handleRunBatchPayroll}
              onOpenLedger={(loanId) => setSelectedLedgerLoanId(loanId)}
              isProcessing={isProcessing}
            />
          )}

          {activeTab === 'provisions' && (
            <ProvisionsView
              provisions={provisions}
              loans={loans}
              currentUser={currentUser}
              onRunProvisions={handleRunProvisions}
              isProcessing={isProcessing}
            />
          )}

          {activeTab === 'transferred' && (
            <TransferredLoansView
              loans={loans}
              demandNotices={demandNotices}
              settings={settings}
              currentUser={currentUser}
              onCreateDemandNotice={handleCreateDemandNotice}
              onOpenLedger={(loanId) => setSelectedLedgerLoanId(loanId)}
              onOpenRepayment={(loanId) => {
                setRepaymentModalLoanId(loanId);
                setRepaymentModalOpen(true);
              }}
              isProcessing={isProcessing}
            />
          )}

          {(activeTab === 'remittances' || activeTab === 'advices') && (
            <RemittancesView
              bankAdvices={bankAdvices}
              loans={loans}
              repayments={repayments}
              settings={settings}
              currentUser={currentUser}
              onCreateAdvice={handleCreateBankAdvice}
              onUpdateStatus={handleUpdateBankAdviceStatus}
              isProcessing={isProcessing}
            />
          )}

          {activeTab === 'fiscal_year' && (
            <FiscalYearView settings={settings} />
          )}

          {activeTab === 'employee_portal' && (
            <EmployeePortalView
              currentUser={currentUser}
              loans={loans}
              repayments={repayments}
              onOpenLedger={(loanId) => setSelectedLedgerLoanId(loanId)}
            />
          )}

          {activeTab === 'recycle_bin' && (
            <RecycleBinView
              items={recycleItems}
              currentUser={currentUser}
              onRestore={handleRestoreRecycleItem}
              isProcessing={isProcessing}
            />
          )}

          {activeTab === 'audit_logs' && (
            <AuditLogView />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              currentUser={currentUser}
              onSaveSettings={handleSaveSettings}
              isProcessing={isProcessing}
              onOpenPbsSelector={() => setPbsSelectorOpen(true)}
              pbsList={pbsList}
            />
          )}

          {/* Integrated Footer at bottom of scrollable content */}
          <footer className="bg-white border-t border-slate-200 py-3.5 px-4 sm:px-6 text-xs text-slate-500 no-print mt-8 rounded-xl shadow-2xs">
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
              <div>
                © {new Date().getFullYear()} {settings.boardNameBn} · <span className="font-semibold text-slate-700">{settings.pbsNameBn}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3 text-[11px]">
                <span>অর্থ ও হিসাব বিভাগ</span>
                <span>·</span>
                <span className="text-emerald-700 font-medium">Firestore ক্লাউড পারসিস্টেন্স সক্রিয়</span>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Modals */}
      <PbsSelectorModal
        isOpen={pbsSelectorOpen}
        onClose={() => setPbsSelectorOpen(false)}
        pbsList={pbsList}
        currentPbsCode={settings.pbsCode || 'gazipur-2'}
        onSelectPbs={handleSelectPbs}
        isProcessing={isProcessing}
      />

      {selectedLedgerLoanId && (
        <LedgerModal
          loanId={selectedLedgerLoanId}
          settings={settings}
          onClose={() => setSelectedLedgerLoanId(null)}
        />
      )}

      {repaymentModalOpen && (
        <RepaymentsModal
          loans={loans}
          initialLoanId={repaymentModalLoanId}
          onClose={() => setRepaymentModalOpen(false)}
          onSubmit={handlePostRepayment}
          onSubmitBatch={handlePostMultiRepayments}
          isSubmitting={isProcessing}
        />
      )}

      {addLoanModalOpen && (
        <AddLoanModal
          employees={employees}
          pbsName={settings.pbsNameBn}
          onClose={() => setAddLoanModalOpen(false)}
          onSubmit={handleCreateLoan}
          isSubmitting={isProcessing}
        />
      )}

      {searchModalOpen && (
        <SearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          loans={loans}
          employees={employees}
          repayments={repayments}
          onSelectLoan={(loanId) => {
            setSelectedLedgerLoanId(loanId);
          }}
        />
      )}
    </div>
  );
}
