import React, { useState } from 'react';
import { 
  Building2, 
  Wifi, 
  WifiOff, 
  Volume2, 
  VolumeX, 
  Users, 
  Search, 
  Printer, 
  LogOut,
  Maximize2,
  Minimize2,
  PanelLeft,
  Home
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
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
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
  onOpenPbsSelector,
  onToggleSidebar,
  isSidebarOpen
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
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
    <header className="bg-[#064e3b] text-white border-b border-emerald-900 sticky top-0 z-40 shadow-xs no-print select-none">
      <div className="w-full px-3 sm:px-4 py-2 flex items-center justify-between gap-2 md:gap-4">
        {/* Left Side: Sidebar Toggle & PBS Brand Identity */}
        <div className="flex items-center gap-2.5">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800/80 transition-colors border border-emerald-700/60"
              title="সাইডবার মেনু টগল করুন"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
          )}

          {/* PBS Round Logo / Icon */}
          <div className="w-9 h-9 rounded-full bg-emerald-700 border border-emerald-500/50 flex items-center justify-center text-white shadow-xs shrink-0">
            <Home className="w-5 h-5 text-emerald-100" />
          </div>

          {/* Title & Subtitle */}
          <div className="leading-tight min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-tight flex items-center gap-1.5 truncate max-w-[130px] sm:max-w-none">
                <span className="truncate">{settings.pbsNameBn}</span>
              </h1>
              {onOpenPbsSelector && (
                <button
                  onClick={onOpenPbsSelector}
                  className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/60 transition-colors shrink-0"
                  title="৮০টি পবিস নির্বাচন ও পরিবর্তন"
                >
                  <Building2 className="w-2.5 h-2.5" />
                  <span>পবিস পরিবর্তন</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-emerald-200/90 font-normal hidden sm:block truncate">
              কর্মকর্তা-কর্মচারী গৃহ নির্মাণ ঋণ ব্যবস্থাপনা সফটওয়্যার
            </p>
          </div>
        </div>

        {/* Center: Quick Search Bar with Ctrl+K shortcut */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onSearchOpen}
            className="w-full bg-emerald-950/60 hover:bg-emerald-950/80 border border-emerald-700/60 text-emerald-200/90 hover:text-white px-3 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors shadow-inner"
            title="দ্রুত অনুসন্ধান করুন (Ctrl+K)"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">দ্রুত অনুসন্ধান: পে আইডি, নাম বা লোন নং...</span>
            </div>
            <kbd className="ml-2 font-mono text-[10px] bg-emerald-900/80 border border-emerald-700/80 px-1.5 py-0.5 rounded text-emerald-300">
              ctrl+k
            </kbd>
          </button>
        </div>

        {/* Right Side: Network Status, Quick Icons, Role & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Mobile search trigger */}
          <button
            onClick={onSearchOpen}
            className="md:hidden p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-lg transition-colors"
            title="অনুসন্ধান"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Network Connected Badge */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-emerald-900/90 border border-emerald-700/80 text-emerald-200 text-xs px-2 sm:px-2.5 py-1 rounded-full shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-medium hidden sm:inline">নেটওয়ার্ক সংযুক্ত</span>
            {latencyMs !== null && (
              <span className="text-[10px] text-emerald-300 font-num hidden lg:inline">({latencyMs}ms)</span>
            )}
          </div>

          {/* Search Icon */}
          <button
            onClick={onSearchOpen}
            className="hidden lg:block p-1 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-md transition-colors"
            title="অনুসন্ধান"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1 text-emerald-200 hover:text-white hover:bg-emerald-800 rounded-md transition-colors"
            title={isFullscreen ? "ফুলস্ক্রিন বন্ধ" : "ফুলস্ক্রিন মোড"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Branch / Role Indicator & Logout Button */}
          <div className="flex flex-col items-end">
            <div className="text-[10px] text-emerald-300/80 font-medium hidden sm:block">
              {currentRole.nameBn.includes('হিসাব') ? 'হিসাব শাখা' : currentRole.nameBn}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-emerald-900/80 hover:bg-emerald-900 text-emerald-100 hover:text-white border border-emerald-700/60 px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium transition-colors shadow-2xs"
              title="লগআউট"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
