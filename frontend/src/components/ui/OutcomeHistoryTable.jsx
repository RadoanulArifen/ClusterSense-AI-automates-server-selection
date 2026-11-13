import { CheckCircle, AlertTriangle, MinusCircle } from 'lucide-react';
import { LoadingSpinner } from './index.jsx';

const STATUS_CFG = {
  GOOD:  { icon: CheckCircle,  cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  MIXED: { icon: MinusCircle,  cls: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  POOR:  { icon: AlertTriangle, cls: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
};

export function OutcomeStatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.MIXED;
  const Icon = cfg.icon;
  return <span className={`inline-flex items-center gap-1.5 border rounded-full px-2.5 py-1 text-xs font-medium ${cfg.cls}`}><Icon size={12}/>{status}</span>;
}

export default function OutcomeHistoryTable({ records = [], loading = false }) {
  return (
    <div className="bg-panel border border-line rounded-xl overflow-hidden">
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Scrollable data table">
        <table className="w-full">
          <thead className="bg-inset">
            <tr>{['Date', 'Module', 'Recommendation', 'Recommended Node', 'Actual Outcome', 'Status'].map(h=><th key={h} className="table-th">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6}><LoadingSpinner/></td></tr> : records.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-500">No outcome records match these filters.</td></tr>
            ) : records.map(record=>(
              <tr key={record.id} className="table-row">
                <td className="table-td text-slate-400 whitespace-nowrap">{record.timestamp ? new Date(record.timestamp).toLocaleString() : '—'}</td>
                <td className="table-td"><span className="text-slate-300">{record.module === 'scheduling' ? 'Scheduling' : 'Cost Optimization'}</span></td>
                <td className="table-td text-white font-medium">{record.recommendation}</td>
                <td className="table-td font-mono text-brand-300">{record.recommended_node}</td>
                <td className="table-td text-slate-400 max-w-xs">{record.actual_outcome}</td>
                <td className="table-td"><OutcomeStatusBadge status={record.status}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
