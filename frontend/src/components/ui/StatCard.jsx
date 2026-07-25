export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', pulse }) {
  const c = {
    blue:    { bg:'bg-blue-500/10',    border:'border-blue-500/20',    icon:'text-blue-400',    val:'text-blue-100' },
    emerald: { bg:'bg-emerald-500/10', border:'border-emerald-500/20', icon:'text-emerald-400', val:'text-emerald-100' },
    amber:   { bg:'bg-amber-500/10',   border:'border-amber-500/20',   icon:'text-amber-400',   val:'text-amber-100' },
    rose:    { bg:'bg-rose-500/10',    border:'border-rose-500/20',    icon:'text-rose-400',    val:'text-rose-100' },
    violet:  { bg:'bg-violet-500/10',  border:'border-violet-500/20',  icon:'text-violet-400',  val:'text-violet-100' },
    cyan:    { bg:'bg-cyan-500/10',    border:'border-cyan-500/20',    icon:'text-cyan-400',    val:'text-cyan-100' },
  }[color] || { bg:'bg-blue-500/10', border:'border-blue-500/20', icon:'text-blue-400', val:'text-blue-100' };

  return (
    <div className={`bg-[#0d1428] border ${c.border} rounded-xl p-4 relative overflow-hidden`}>
      {pulse && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${c.val}`}>{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && <div className={`${c.bg} p-2.5 rounded-lg`}><Icon size={20} className={c.icon} /></div>}
      </div>
    </div>
  );
}
