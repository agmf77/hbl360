import React, { useState } from 'react';
import { X, Search, Building2, Check, MapPin, KeyRound } from 'lucide-react';

export interface PbsListItem {
  code: string;
  nameBn: string;
  nameEn: string;
  districtBn: string;
  headquartersBn: string;
  username: string;
  defaultPassword: string;
  memoPrefix: string;
  email: string;
  phone: string;
  website: string;
  isActive: boolean;
  customLogoUrl?: string;
  currentNameBn?: string;
  currentMemoPrefix?: string;
}

interface PbsSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  pbsList: PbsListItem[];
  currentPbsCode: string;
  onSelectPbs: (pbsCode: string) => Promise<void>;
  isProcessing: boolean;
}

export const PbsSelectorModal: React.FC<PbsSelectorModalProps> = ({
  isOpen,
  onClose,
  pbsList,
  currentPbsCode,
  onSelectPbs,
  isProcessing
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');

  if (!isOpen) return null;

  const filtered = pbsList.filter(pbs => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      pbs.nameBn.toLowerCase().includes(q) ||
      pbs.nameEn.toLowerCase().includes(q) ||
      pbs.districtBn.toLowerCase().includes(q) ||
      pbs.headquartersBn.toLowerCase().includes(q) ||
      pbs.username.toLowerCase().includes(q);
    const matchesDistrict = !districtFilter || pbs.districtBn === districtFilter;
    return matchesSearch && matchesDistrict;
  });

  const districts = Array.from(new Set(pbsList.map(p => p.districtBn))).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              প
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm md:text-base">
                ৮০টি পল্লী বিদ্যুৎ সমিতি ডিরেক্টরি (Select PBS)
              </h3>
              <p className="text-[11px] text-slate-500">
                যেকোনো পবিস নির্বাচন করুন অথবা তাদের নির্ধারিত ইউজার আইডি দিয়ে লগইন করুন
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-2 bg-white">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="পবিসের নাম, জেলা, সদর দপ্তর বা ইউজার আইডি খুঁজুন..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <select
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white w-full sm:w-auto"
          >
            <option value="">সকল জেলা ({pbsList.length} টি পবিস)</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* PBS Cards Grid */}
        <div className="p-4 overflow-y-auto space-y-2 text-xs flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              "{searchTerm}" নামে কোনো পবিস খুঁজে পাওয়া যায়নি।
            </div>
          ) : (
            filtered.map(pbs => {
              const isSelected = pbs.code === currentPbsCode;

              return (
                <div
                  key={pbs.code}
                  onClick={async () => {
                    await onSelectPbs(pbs.code);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {pbs.customLogoUrl ? (
                      <img
                        src={pbs.customLogoUrl}
                        alt="Logo"
                        className="w-9 h-9 rounded-lg object-contain border border-slate-200 bg-white p-0.5"
                      />
                    ) : (
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {pbs.districtBn.charAt(0)}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {pbs.nameBn}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            বর্তমান সক্রিয়
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{pbs.headquartersBn}</span>
                        </span>
                        <span>·</span>
                        <span className="font-num text-slate-600">স্মারক: {pbs.memoPrefix}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-emerald-700 font-num font-semibold">
                          <KeyRound className="w-3 h-3" />
                          <span>ইউজার: {pbs.username}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={isProcessing}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSelected ? 'সক্রিয়' : 'নির্বাচন করুন'}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <span>মোট ৮০টি পল্লী বিদ্যুৎ সমিতি সক্রিয়</span>
          <span className="text-emerald-700 font-medium">ডিফল্ট পাসওয়ার্ড: pbs123 (সেটিংস থেকে পরিবর্তনযোগ্য)</span>
        </div>
      </div>
    </div>
  );
};
