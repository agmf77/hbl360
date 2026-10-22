import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  Building2, 
  Upload, 
  Image as ImageIcon, 
  KeyRound, 
  Eye, 
  EyeOff, 
  FileText, 
  Trash2, 
  Palette,
  ExternalLink
} from 'lucide-react';
import { PbsSettings, UserSession } from '../types';
import { PbsListItem } from './PbsSelectorModal';

interface SettingsViewProps {
  settings: PbsSettings;
  currentUser: UserSession;
  onSaveSettings: (settings: Partial<PbsSettings>) => Promise<void>;
  isProcessing: boolean;
  onOpenPbsSelector?: () => void;
  pbsList?: PbsListItem[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  currentUser,
  onSaveSettings,
  isProcessing,
  onOpenPbsSelector,
  pbsList = []
}) => {
  const [form, setForm] = useState<PbsSettings>({ ...settings });
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [previewTab, setPreviewTab] = useState<'edit' | 'preview'>('edit');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if active PBS settings change
  useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  // Find metadata for current PBS from pbsList
  const currentPbsMeta = pbsList.find(p => p.code === form.pbsCode) || 
    pbsList.find(p => p.nameBn === form.pbsNameBn);

  const username = currentPbsMeta?.username || form.pbsCode?.replace('-', '') || 'gazipur2';

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('অনুগ্রহ করে ২ মেগাবাইট (2MB)-এর ছোট ছবি নির্বাচন করুন।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setForm(prev => ({ ...prev, logoUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setForm(prev => ({ ...prev, logoUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" />
              <span>পবিস সাধারণ সেটিংস, লেটারহেড ও লগইন কনফিগারেশন</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {form.pbsNameBn}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            সমিতির লোগো আপলোড, ইউজার আইডি ও পাসওয়ার্ড ব্যবস্থাপনা, অফিশিয়াল লেটারহেড ও স্বাক্ষরকারী নির্ধারণ
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenPbsSelector && (
            <button
              type="button"
              onClick={onOpenPbsSelector}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>৮০টি পবিস সুইচ</span>
            </button>
          )}

          {saved && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>সফলভাবে সংরক্ষিত!</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs: Edit Settings vs Live Letterhead Preview */}
      <div className="flex border-b border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setPreviewTab('edit')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
            previewTab === 'edit'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>সেটিংস সম্পাদনা</span>
        </button>

        <button
          type="button"
          onClick={() => setPreviewTab('preview')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
            previewTab === 'preview'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>অফিসিয়াল লেটারহেড লাইভ প্রিভিউ</span>
        </button>
      </div>

      {previewTab === 'preview' ? (
        /* Live Letterhead Preview Mode */
        <div className="bg-slate-100 p-6 rounded-2xl border border-slate-300">
          <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-xl shadow-lg border border-slate-300 font-serif text-slate-800">
            {/* Letterhead Top */}
            <div className="border-b-2 border-emerald-800 pb-4 mb-6">
              <div className="flex items-center justify-between gap-4">
                {form.logoUrl ? (
                  <img
                    src={form.logoUrl}
                    alt={form.pbsNameBn}
                    className="w-20 h-20 object-contain rounded-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-emerald-700 text-white flex flex-col items-center justify-center text-xs font-bold font-sans">
                    <span>বাপবিবো</span>
                    <span className="text-[10px] text-emerald-200">লোগো</span>
                  </div>
                )}

                <div className="text-center flex-1">
                  <div className="text-xs tracking-wider text-slate-600 font-sans font-semibold">
                    {form.boardNameBn}
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-emerald-950 mt-1 font-serif">
                    {form.pbsNameBn}
                  </h1>
                  {form.taglineBn && (
                    <div className="text-xs text-emerald-800 italic mt-0.5 font-sans">
                      "{form.taglineBn}"
                    </div>
                  )}
                  <div className="text-xs text-slate-600 mt-1 font-sans">
                    {form.addressBn} · ফোন: {form.phone} · ইমেইল: {form.email}
                  </div>
                  <div className="text-[11px] text-slate-500 font-sans">
                    ওয়েবসাইট: {form.website}
                  </div>
                </div>

                <div className="w-20 hidden sm:block text-right">
                  <span className="text-[10px] text-slate-400 font-sans block">পবিস কোড</span>
                  <span className="font-mono text-xs font-bold text-slate-700 uppercase">{form.pbsCode || 'PBS'}</span>
                </div>
              </div>
            </div>

            {/* Mock Official Letter Content */}
            <div className="space-y-4 text-xs font-sans text-slate-700 leading-relaxed my-8 min-h-[160px]">
              <div className="flex justify-between items-center text-slate-600">
                <span className="font-num font-semibold">স্মারক নং: {form.memoPrefix}.২৬.০১</span>
                <span>তারিখ: {new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })} খ্রি.</span>
              </div>

              <div className="mt-4 font-semibold text-slate-900">
                বিষয়: কর্মকর্তা-কর্মচারীদের অনুকূলে গৃহ ঋণ মঞ্জুরি ও মাসিক কিস্তি কর্তন সংক্রান্ত।
              </div>

              <p className="text-justify">
                উপর্যুক্ত বিষয়ের প্রেক্ষিতে জানানো যাচ্ছে যে, {form.boardNameBn} এর গৃহ ঋণ নীতিমালা অনুযায়ী {form.pbsNameBn} এ কর্মরত কর্মকর্তা-কর্মচারীদের মাসিক বেতন হতে নির্ধারিত গৃহ ঋণ কিস্তি এবং প্রযোজ্য ক্ষেত্রে সুদ কর্তন কার্যক্রম যথাযথভাবে পরিচালিত হচ্ছে।
              </p>
            </div>

            {/* Official Signatories footer */}
            <div className="border-t border-slate-200 pt-8 mt-12 grid grid-cols-3 gap-4 text-center font-sans text-xs">
              <div>
                <div className="h-10 border-b border-dashed border-slate-300 mb-1"></div>
                <div className="font-bold text-slate-900">{form.agmFinanceName || 'নাজমুন নাহার'}</div>
                <div className="text-[11px] text-slate-600">এজিএম (অর্থ-হিসাব)</div>
                <div className="text-[10px] text-slate-500">{form.pbsNameBn}</div>
              </div>

              <div>
                <div className="h-10 border-b border-dashed border-slate-300 mb-1"></div>
                <div className="font-bold text-slate-900">{form.dgmName || 'রফিকুল ইসলাম'}</div>
                <div className="text-[11px] text-slate-600">ডিজিএম</div>
                <div className="text-[10px] text-slate-500">{form.pbsNameBn}</div>
              </div>

              <div>
                <div className="h-10 border-b border-dashed border-slate-300 mb-1"></div>
                <div className="font-bold text-slate-900">{form.gmName || 'প্রকৌশলী এ. কে. এম. সামসুল আলম'}</div>
                <div className="text-[11px] text-slate-600">জেনারেল ম্যানেজার (জিএম)</div>
                <div className="text-[10px] text-slate-500">{form.pbsNameBn}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs text-xs">
          {/* PBS Logo Customization */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>সমিতির নিজস্ব লোগো (PBS Custom Logo)</span>
              </h3>
              <span className="text-[11px] text-slate-500">
                লেটারহেড, ব্যাংক চিঠি এবং খতিয়ানে প্রিন্ট হবে
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Preview Box */}
              <div className="relative group">
                {form.logoUrl ? (
                  <div className="w-24 h-24 rounded-2xl border-2 border-emerald-500 bg-white p-1 flex items-center justify-center overflow-hidden shadow-xs">
                    <img
                      src={form.logoUrl}
                      alt="PBS Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 gap-1">
                    <Upload className="w-6 h-6 text-slate-300" />
                    <span className="text-[10px] font-medium">লোগো নেই</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="space-y-2 flex-1 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    id="pbs-logo-upload"
                  />
                  <label
                    htmlFor="pbs-logo-upload"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>ডিভাইস থেকে লোগো আপলোড করুন</span>
                  </label>

                  {form.logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-semibold transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>লোগো মুছে ফেলুন</span>
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-slate-500">
                  সুপারিশ: স্বচ্ছ ব্যাকগ্রাউন্ডের পিএনজি (PNG) অথবা জেপিজি ফাইল, সর্বোচ্চ ২ মেগাবাইট।
                </div>

                {/* Direct URL input option */}
                <div className="pt-1">
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">অথবা অনলাইন ইমেজ লিংক (URL):</label>
                  <input
                    type="url"
                    value={form.logoUrl || ''}
                    onChange={e => setForm({ ...form, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PBS User ID & Password Management */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3">
            <h3 className="font-bold text-amber-950 text-sm flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-700" />
              <span>পবিস ইউজার আইডি ও পাসওয়ার্ড কনফিগারেশন</span>
            </h3>

            <p className="text-[11px] text-amber-800">
              এই সমিতির হিসাব কর্মকর্তা ও অর্থ শাখা এই ইউজার আইডি এবং পাসওয়ার্ড দিয়ে সিস্টেমে সরাসরি লগইন করতে পারবেন।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  নির্ধারিত ইউজার আইডি (PBS Username)
                </label>
                <div className="px-3 py-2 rounded-lg border border-slate-300 bg-slate-100 font-mono font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span>{username}</span>
                  <span className="text-[10px] text-slate-500 font-sans font-normal">স্থায়ী ইউজারনেম</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  লগইন পাসওয়ার্ড (Password)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.customPassword || 'pbs123'}
                    onChange={e => setForm({ ...form, customPassword: e.target.value })}
                    placeholder="ডিফল্ট: pbs123"
                    className="w-full px-3 py-2 pr-10 rounded-lg border border-slate-300 font-mono text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  (ডিফল্ট পাসওয়ার্ড: <span className="font-mono font-semibold">pbs123</span>)
                </span>
              </div>
            </div>
          </div>

          {/* PBS & Board Identity */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>পবিস ও বোর্ডের নাম</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">সমিতির নাম (বাংলা) *</label>
                <input
                  type="text"
                  value={form.pbsNameBn}
                  onChange={e => setForm({ ...form, pbsNameBn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">সমিতির নাম (English)</label>
                <input
                  type="text"
                  value={form.pbsNameEn}
                  onChange={e => setForm({ ...form, pbsNameEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">বোর্ডের নাম (বাংলা) *</label>
                <input
                  type="text"
                  value={form.boardNameBn}
                  onChange={e => setForm({ ...form, boardNameBn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">স্মারক নম্বরের মূল অংশ (Memo Prefix) *</label>
                <input
                  type="text"
                  value={form.memoPrefix}
                  onChange={e => setForm({ ...form, memoPrefix: e.target.value })}
                  placeholder="২৭.১২.৩৩০০.৫৪২.০১.০২৪"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-num font-semibold text-emerald-950"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">লেটারহেড ট্যাগলাইন / স্লোগান (Tagline)</label>
                <input
                  type="text"
                  value={form.taglineBn || ''}
                  onChange={e => setForm({ ...form, taglineBn: e.target.value })}
                  placeholder="আলোর ফেরিওয়ালা — ঘরে ঘরে বিদ্যুৎ"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Address & Contacts */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3 border-b border-slate-100 pb-2">
              ঠিকানা ও যোগাযোগ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">অফিসের ঠিকানা (বাংলা)</label>
                <input
                  type="text"
                  value={form.addressBn}
                  onChange={e => setForm({ ...form, addressBn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ফোন নম্বর</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-num"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ইমেইল ঠিকানা</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ওয়েবসাইট</label>
                <input
                  type="text"
                  value={form.website}
                  onChange={e => setForm({ ...form, website: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3 border-b border-slate-100 pb-2">
              সমিতির নিজস্ব ব্যাংক হিসাব বিবরণী
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ব্যাংক ও শাখা</label>
                <input
                  type="text"
                  value={form.bankNameBn}
                  onChange={e => setForm({ ...form, bankNameBn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">হিসাব নম্বর</label>
                <input
                  type="text"
                  value={form.accountNo}
                  onChange={e => setForm({ ...form, accountNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-num font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">রাউটিং নম্বর</label>
                <input
                  type="text"
                  value={form.routingNo}
                  onChange={e => setForm({ ...form, routingNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-num font-bold"
                />
              </div>
            </div>
          </div>

          {/* Official Signatories */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3 border-b border-slate-100 pb-2">
              অফিসিয়াল স্বাক্ষরকারী কর্মকর্তা (লেটারহেড ও পত্রে স্বাক্ষর)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">এজিএম (অর্থ-হিসাব) এর নাম *</label>
                <input
                  type="text"
                  value={form.agmFinanceName}
                  onChange={e => setForm({ ...form, agmFinanceName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ডিজিএম এর নাম</label>
                <input
                  type="text"
                  value={form.dgmName}
                  onChange={e => setForm({ ...form, dgmName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">জেনারেল ম্যানেজার (জিএম) এর নাম *</label>
                <input
                  type="text"
                  value={form.gmName}
                  onChange={e => setForm({ ...form, gmName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPreviewTab('preview')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>লেটারহেড প্রিভিউ দেখুন</span>
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isProcessing ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
