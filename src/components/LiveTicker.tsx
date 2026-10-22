import React from 'react';
import { Radio, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { LiveEventItem } from '../types';

interface LiveTickerProps {
  events: LiveEventItem[];
  onOpenFeed?: () => void;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ events, onOpenFeed }) => {
  const latestEvent = events[0];

  return (
    <div className="bg-emerald-950 text-emerald-100 border-b border-emerald-900/60 px-4 py-2 text-xs flex items-center justify-between gap-3 no-print">
      <div className="flex items-center gap-2 overflow-hidden flex-1">
        <div className="flex items-center gap-1.5 shrink-0 bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase border border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>লাইভ স্ট্রিম</span>
        </div>

        {latestEvent ? (
          <div className="flex items-center gap-2 truncate text-slate-200">
            <span className="font-semibold text-emerald-300 shrink-0">{latestEvent.title}:</span>
            <span className="truncate">{latestEvent.details}</span>
            <span className="text-slate-400 shrink-0 font-num text-[11px]">({latestEvent.timestamp})</span>
            {latestEvent.sourceUser && (
              <span className="text-emerald-400/80 text-[11px] shrink-0">[{latestEvent.sourceUser}]</span>
            )}
          </div>
        ) : (
          <span className="text-slate-400 italic">
            রিয়েলটাইম সংযোগ সক্রিয়। নতুন লেনদেন বা কর্তন সম্পন্ন হলে এখানে তাৎক্ষণিক প্রদর্শিত হবে...
          </span>
        )}
      </div>

      {events.length > 0 && (
        <button
          onClick={onOpenFeed}
          className="shrink-0 text-emerald-300 hover:text-white flex items-center gap-1 text-[11px] font-medium underline underline-offset-2 transition-colors"
        >
          <span>সর্বশেষ {events.length} টি ইভেন্ট</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
