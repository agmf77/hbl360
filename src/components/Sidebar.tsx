import React from 'react';
import {
  LayoutGrid,
  Users,
  FileText,
  CreditCard,
  Send,
  AlertTriangle,
  Percent,
  FileCheck,
  BookOpen,
  UserCheck,
  Trash2,
  ShieldCheck,
  Settings,
  X,
  Database,
  Building2
} from 'lucide-react';

export interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  transferredCount?: number;
  pendingRemittanceCount?: number;
  recycleCount?: number;
  dbFileName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpen,
  onClose,
  transferredCount = 0,
  pendingRemittanceCount = 0,
  recycleCount = 0,
  dbFileName = 'database/pbs_house_loan.db'
}) => {
  const menuSections = [
    {
      title: 'মূল তথ্য',
      items: [
        {
          id: 'dashboard',
          label: 'ড্যাশবোর্ড',
          icon: LayoutGrid,
        },
        {
          id: 'employees',
          label: 'কর্মকর্তা/কর্মচারী',
          icon: Users,
        },
        {
          id: 'loans',
          label: 'গৃহ ঋণ তালিকা',
          icon: FileText,
        },
      ],
    },
    {
      title: 'মাসিক আদায় ও রেমিট্যান্স',
      items: [
        {
          id: 'repayments',
          label: 'মাসিক কিস্তি কর্তন',
          icon: CreditCard,
        },
        {
          id: 'remittances',
          label: 'অন্য পবিস রেমিট্যান্স',
          icon: Send,
          badge: pendingRemittanceCount > 0 ? `${pendingRemittanceCount}` : undefined,
        },
        {
          id: 'transferred',
          label: 'বদলিকৃত ঋণ ও তাগাদা পত্র',
          icon: AlertTriangle,
          hasWarningIcon: true,
          badge: transferredCount > 0 ? `${transferredCount}` : undefined,
        },
        {
          id: 'provisions',
          label: 'সুদ প্রভিশন (৮% / ৭%)',
          icon: Percent,
        },
        {
          id: 'advices',
          label: 'প্রস্তুতকৃত ব্যাংক অ্যাডভাইস',
          icon: FileCheck,
        },
      ],
    },
    {
      title: 'হিসাব ও প্রতিবেদন',
      items: [
        {
          id: 'fiscal_year',
          label: 'খতিয়ান (ঋণ Ledger)',
          icon: BookOpen,
        },
        {
          id: 'employee_portal',
          label: 'কর্মচারীভিত্তিক খতিয়ান',
          icon: UserCheck,
        },
      ],
    },
    {
      title: 'সিস্টেম ও কনফিগারেশন',
      items: [
        {
          id: 'recycle_bin',
          label: 'রিসাইকেল বিন',
          icon: Trash2,
          badge: recycleCount > 0 ? `${recycleCount}` : undefined,
        },
        {
          id: 'audit_logs',
          label: 'অডিট লগ',
          icon: ShieldCheck,
        },
        {
          id: 'settings',
          label: 'সেটিংস',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-68 max-w-[85vw] bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shrink-0 ${
          isOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full lg:hidden'
        }`}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 tracking-wider">
              কর্মপরিসর
            </div>
            <h2 className="text-base font-bold text-slate-800">
              প্রধান মেনু
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="মেনু বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs">
          {menuSections.map((section, sIndex) => (
            <div key={sIndex}>
              <div className="text-[11px] font-semibold text-slate-400 tracking-wider px-3 mb-1">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  // Handle mapped tab ids (e.g. advices -> remittances view with advice sub-tab)
                  const isActive = 
                    activeTab === item.id || 
                    (item.id === 'advices' && activeTab === 'advices');

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        if (window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                        isActive
                          ? 'bg-emerald-800 text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.hasWarningIcon ? (
                          <div className={`w-4 h-4 rounded flex items-center justify-center ${isActive ? 'text-amber-300' : 'text-amber-500'}`}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        ) : (
                          <Icon
                            className={`w-4 h-4 flex-shrink-0 ${
                              isActive ? 'text-white' : 'text-slate-500'
                            }`}
                          />
                        )}
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-emerald-700 text-white'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer with Local Database Status */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-800">
              লোকাল ডাটাবেজ সক্রিয়
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate pl-4">
            ফাইল: {dbFileName}
          </div>
        </div>
      </aside>
    </>
  );
};
