import { ShieldCheck, Clock3 } from 'lucide-react';

export default function TrustMeterCard({ trust, compact = false }) {
  if (!trust) {
    return <div className="bg-[#0d1428] border border-[#162040] rounded-xl p-5 animate-pulse"><div className="h-4 w-32 bg-[#162040] rounded"/><div className="h-9 w-20 bg-[#162040] rounded mt-3"/></div>;
  }

  const updatedAt = trust.last_updated ? new Date(trust.last_updated).toLocaleString() : '—';
  const scoreColor = trust.trust_score >= 80 ? 'text-emerald-400' : trust.trust_score >= 60 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="bg-[#0d1428] border border-violet-500/20 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-violet-300"><ShieldCheck size={16}/><span className="text-xs font-semibold uppercase tracking-wider">Recommendation Trust</span></div>
          <h3 className="text-sm font-semibold text-white mt-2">{trust.recommendation_type}</h3>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Current Trust Score</div>
          <div className={`text-3xl font-black ${scoreColor}`}>{trust.trust_score?.toFixed(0)}%</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-[#111b35] rounded-lg px-3 py-2.5">
          <div className="text-xs text-slate-500">Historical Accuracy</div>
          <div className="text-lg font-bold text-blue-300 mt-0.5">{trust.historical_accuracy?.toFixed(0)}%</div>
        </div>
        <div className="bg-[#111b35] rounded-lg px-3 py-2.5">
          <div className="text-xs text-slate-500">Total Recommendations</div>
          <div className="text-lg font-bold text-white mt-0.5">{trust.total_recommendations}</div>
        </div>
      </div>

      {!compact && <>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5">
            <div className="text-xs text-emerald-300">Successful</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">{trust.successful_recommendations}</div>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2.5">
            <div className="text-xs text-rose-300">Failed</div>
            <div className="text-lg font-bold text-rose-400 mt-0.5">{trust.failed_recommendations}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-4"><Clock3 size={12}/> Last updated: {updatedAt}</div>
      </>}
    </div>
  );
}
