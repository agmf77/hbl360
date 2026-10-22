import React, { useState } from 'react';
import { 
  Building2, 
  Wifi, 
  WifiOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  UserCircle2, 
  Search, 
  Printer, 
  RefreshCw,
  LogOut,
  LogIn,
  Database
} from 'lucide-react';
import { UserSession, PbsSettings, Employee } from '../types';
import { auth, signInWithGoogle, logOut } from '../firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  currentRole: UserSession;
  authUser: FirebaseUser | null;
  onRoleChange: (role: 'admin' | 'accounts' | 'employee', payId?: string) => void;
  employees: Employee[];
  settings: PbsSettings;
  isConnected: boolean;
  latencyMs: number | null;
  activeUsers: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSimulateTest: () => void;
  isSimulating: boolean;
  onSearchOpen: () => void;
  onPrintScreen: () => void;
  isFirestoreReady: boolean;
  onOpenPbsSelector?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  authUser,
  onRoleChange,
  employees,
  settings,
  isConnected,
  latencyMs,
  activeUsers,
  soundEnabled,
  onToggleSound,
  onSimulateTest,
  isSimulating,
  onSearchOpen,
  onPrintScreen,
  isFirestoreReady,
  onOpenPbsSelector
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google Login Error:', err);
      alert(err.message || 'গুগল সাইন-ইন সম্পন্ন করা যায়নি।');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error('Logout Error:', err);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs no-print">
      {/* Top Banner: Official National Emblem & PBS Identity */}
      <div className="bg-slate-900 text-slate-100 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
          <span className="font-medium text-emerald-300">{settings.boardNameBn}</span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-300 font-bold">{settings.pbsNameBn}</span>
          {onOpenPbsSelector && (
            <button
              onClick={onOpenPbsSelector}
              className="ml-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 shadow-2xs"
              title="৮০টি পল্লী বিদ্যুৎ সমিতির তালিকা ও পরিবর্তন"
            >
              <Building2 className="w-3 h-3" />
              <span>৮০টি পবিস নির্বাচন</span>
            </button>
          )}
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 hidden sm:inline">স্মারক প্রারম্ভ: {settings.memoPrefix}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Cloud Firestore Status */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
            <Database className={`w-3.5 h-3.5 ${isFirestoreReady ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>Firestore ক্লাউড</span>
          </div>

          {/* Real-time Status Badge */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 px-2 py-0.5 rounded-md border border-slate-700">
            {isConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">লাইভ রিয়েলটাইম</span>
                {latencyMs !== null && (
                  <span className="text-slate-400 font-num">({latencyMs}ms)</span>
                )}
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 font-medium">সংযোগের চেষ্টা...</span>
              </>
            )}
          </div>

          {/* Active Online Users Counter */}
          <div className="flex items-center gap-1 text-slate-300 font-num">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>{activeUsers} জন লাইভ</span>
          </div>

          {/* Sound Toggle */}
          <button 
            onClick={onToggleSound}
            title={soundEnabled ? "শব্দ সংকেত চালু (ক্লিক করে বন্ধ করুন)" : "শব্দ সংকেত বন্ধ (ক্লিক করে চালু করুন)"}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Title with Custom PBS Logo */}
        <div className="flex items-center gap-3">
          {settings.logoUrl ? (
            <img 
              src={settings.logoUrl} 
              alt={settings.pbsNameBn} 
              className="w-11 h-11 rounded-xl object-contain border border-slate-200 bg-white p-0.5 shadow-xs" 
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-xs font-bold text-lg">
              ঋ
            </div>
          )}
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug flex items-center gap-2">
              <span>{settings.pbsNameBn}</span>
              <span className="text-xs font-normal text-slate-500 hidden md:inline">— গৃহ ঋণ ব্যবস্থাপনা</span>
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span className="font-medium text-emerald-800">{settings.boardNameBn}</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600 hidden sm:inline">{settings.addressBn}</span>
              <span className="text-slate-300 hidden sm:inline">·</span>
              <span className="text-emerald-700 font-medium">Google Auth ও ক্লাউড ডেটাবেজ</span>
            </p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          {/* 80 PBS Switcher Button */}
          {onOpenPbsSelector && (
            <button
              onClick={onOpenPbsSelector}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs active:scale-95"
              title="৮০টি পল্লী বিদ্যুৎ সমিতির তালিকা ব্রাউজ করুন ও সক্রিয় সমিতি পরিবর্তন করুন"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">৮০টি পবিস</span>
              <span className="sm:hidden">পবিস</span>
            </button>
          )}

          {/* Live Simulation Test Button */}
          <button
            onClick={onSimulateTest}
            disabled={isSimulating}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-2xs active:scale-95 disabled:opacity-50"
            title="অন্যান্য ডিভাইসে লাইভ রিয়েলটাইম আপডেট পরীক্ষা করার জন্য একটি টেস্ট কিস্তি পোস্টিং সিগন্যাল পাঠান"
          >
            <Sparkles className={`w-3.5 h-3.5 text-emerald-600 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'পাঠানো হচ্ছে...' : 'রিয়েলটাইম টেস্ট পিং'}</span>
          </button>

          {/* Quick Search */}
          <button
            onClick={onSearchOpen}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors border border-slate-200"
            title="দ্রুত অনুসন্ধান করুন (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">অনুসন্ধান (Ctrl+K)</span>
          </button>

          {/* Print Screen */}
          <button
            onClick={onPrintScreen}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="বর্তমান পৃষ্ঠা প্রিন্ট করুন"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Google Auth & Firebase User Button */}
          {authUser ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              {authUser.photoURL ? (
                <img 
                  src={authUser.photoURL} 
                  alt={authUser.displayName || 'User'} 
                  className="w-7 h-7 rounded-full border border-slate-300 object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  {(authUser.displayName || authUser.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left hidden lg:block">
                <span className="font-semibold text-xs block leading-tight truncate max-w-[120px]">
                  {authUser.displayName || authUser.email}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">Google ভেরিফায়েড</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Google সাইন-আউট"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all shadow-2xs active:scale-95 disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{authLoading ? 'লগইন...' : 'Google সাইন-ইন'}</span>
            </button>
          )}

          {/* Role & User Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-800 hover:border-slate-400 transition-all shadow-2xs"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                {currentRole.role === 'admin' ? 'A' : currentRole.role === 'accounts' ? 'H' : 'E'}
              </div>
              <div className="text-left hidden sm:block">
                <span className="font-semibold block leading-tight">{currentRole.nameBn}</span>
                <span className="text-[10px] text-slate-500 capitalize">{currentRole.designation}</span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showRoleMenu && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setShowRoleMenu(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  ব্যবহারকারীর ভূমিকা পরিবর্তন (Role Switcher)
                </div>

                {/* Admin */}
                <button
                  onClick={() => onRoleChange('admin')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors ${currentRole.role === 'admin' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-700'}`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="font-medium">সিস্টেম অ্যাডমিনিস্ট্রেটর (Admin)</div>
                    <div className="text-[10px] text-slate-500">সম্পূর্ণ কন্ট্রোল, অডিট লগ ও সেটিংস</div>
                  </div>
                </button>

                {/* Accounts */}
                <button
                  onClick={() => onRoleChange('accounts')}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors ${currentRole.role === 'accounts' ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-700'}`}
                >
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-medium">হিসাব শাখা / অর্থ বিভাগ (Accounts)</div>
                    <div className="text-[10px] text-slate-500">ঋণ মঞ্জুর, কর্তন, সুদ প্রভিশন ও ব্যাংক চিঠি</div>
                  </div>
                </button>

                <div className="px-3 py-1.5 border-t border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  কর্মচারী সেলফ-সার্ভিস লগইন
                </div>

                {/* Employee choices */}
                {employees.filter(e => e.role === 'employee').map(emp => (
                  <button
                    key={emp.id}
                    onClick={() => onRoleChange('employee', emp.payId)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors ${currentRole.payId === emp.payId ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-700'}`}
                  >
                    <UserCircle2 className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium">{emp.nameBn} ({emp.payId})</div>
                      <div className="text-[10px] text-slate-500">{emp.designation} · {emp.presentPbs}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
