// ── Badge ─────────────────────────────────────────────────────────
export function Badge({ status }) {
  const map = {
    healthy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15  text-amber-400  border-amber-500/30',
    critical:'bg-rose-500/15   text-rose-400   border-rose-500/30',
    offline: 'bg-slate-500/15  text-slate-400  border-slate-500/30',
    Low:     'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Medium:  'bg-amber-500/15  text-amber-400  border-amber-500/30',
    High:    'bg-rose-500/15   text-rose-400   border-rose-500/30',
    pending: 'bg-blue-500/15   text-blue-400   border-blue-500/30',
    analyzing:'bg-violet-500/15 text-violet-400 border-violet-500/30',
    completed:'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    failed:  'bg-rose-500/15   text-rose-400   border-rose-500/30',
    'Keep Running':'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'Sleep Mode':  'bg-amber-500/15  text-amber-400  border-amber-500/30',
    'Shutdown':    'bg-rose-500/15   text-rose-400   border-rose-500/30',
    Critical:'bg-rose-500/15   text-rose-400   border-rose-500/30',
  };
  const cls = map[status] || 'bg-slate-500/15 text-slate-400 border-slate-500/30';
  return <span className={`inline-flex items-center border px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{status}</span>;
}

// ── UsageBar ──────────────────────────────────────────────────────
export function UsageBar({ value, color = 'blue' }) {
  const pct = Math.min(100, Math.max(0, value || 0));
  const bar  = pct > 85 ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : { blue:'bg-blue-500', violet:'bg-violet-500', cyan:'bg-cyan-500', emerald:'bg-emerald-500' }[color] || 'bg-blue-500';
  return (
    <div className="h-1.5 bg-[#162040] rounded-full overflow-hidden">
      <div className={`h-full ${bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

export function LoadingSpinner({ size = 24 }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" style={{ width: size, height: size }} />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={40} className="text-slate-600 mb-4" />}
      <h3 className="text-slate-300 font-medium">{title}</h3>
      {message && <p className="text-slate-500 text-sm mt-2 max-w-sm">{message}</p>}
    </div>
  );
}
