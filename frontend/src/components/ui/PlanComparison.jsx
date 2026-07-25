import { CheckCircle, Scale } from 'lucide-react';

const RISK_CLASS = { LOW:'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', MEDIUM:'text-amber-400 bg-amber-500/10 border-amber-500/30', HIGH:'text-rose-400 bg-rose-500/10 border-rose-500/30' };

function RiskBadge({ risk }) {
  return <span className={`inline-flex border rounded-full px-2.5 py-1 text-xs font-medium ${RISK_CLASS[risk] || RISK_CLASS.MEDIUM}`}>{risk}</span>;
}

const rows = [
  ['Recommended Node', plan => <span className="font-mono text-blue-300">{plan.recommended_node}</span>],
  ['Estimated Cost', plan => `$${plan.estimated_cost?.toFixed(2)}`],
  ['Expected CPU Load', plan => `${plan.expected_cpu_load?.toFixed(1)}%`],
  ['Expected RAM Usage', plan => `${plan.expected_ram_usage?.toFixed(1)}%`],
  ['Predicted Risk', plan => <RiskBadge risk={plan.predicted_risk}/>],
  ['Trust Score', plan => <span className="font-semibold text-violet-300">{plan.trust_score?.toFixed(1)}%</span>],
  ['Expected Outcome', plan => plan.expected_outcome],
];

export default function PlanComparison({ comparison }) {
  if (!comparison?.plan_a || !comparison?.plan_b) return null;
  const plans = [comparison.plan_a, comparison.plan_b];

  return (
    <section className="bg-[#0d1428] border border-violet-500/20 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2"><Scale size={18} className="text-violet-400"/><div><h3 className="font-semibold text-white">Plan Compare</h3><p className="text-xs text-slate-500 mt-0.5">Two simulated deployment plans for this request</p></div></div>
        <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-full px-3 py-1.5 text-xs font-semibold"><CheckCircle size={13}/> Recommended Plan: {comparison.winning_plan}</div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-5">
        {plans.map(plan => {
          const winner = plan.name === comparison.winning_plan;
          return <div key={plan.name} className={`rounded-xl border p-4 ${winner ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-[#111b35] border-[#162040]'}`}>
            <div className="flex items-center justify-between"><span className="font-semibold text-white">{plan.name}</span>{winner && <span className="text-xs text-emerald-400 font-medium">Recommended Plan</span>}</div>
            <div className="mt-3 text-2xl font-black text-white">{plan.recommended_node}</div>
            <div className="text-xs text-slate-400 mt-1">{plan.expected_outcome}</div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center"><div><div className="text-xs text-slate-500">Cost</div><div className="text-sm font-semibold text-emerald-400">${plan.estimated_cost?.toFixed(0)}</div></div><div><div className="text-xs text-slate-500">Risk</div><div className="mt-1"><RiskBadge risk={plan.predicted_risk}/></div></div><div><div className="text-xs text-slate-500">Trust</div><div className="text-sm font-semibold text-violet-300">{plan.trust_score?.toFixed(0)}%</div></div></div>
          </div>;
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-slate-500"><tr><th className="text-left pb-3 font-medium">Feature</th>{plans.map(plan=><th key={plan.name} className="text-left pb-3 font-medium px-3">{plan.name}</th>)}</tr></thead>
          <tbody>{rows.map(([label, value])=><tr key={label} className="border-t border-[#162040]"><td className="py-3 text-slate-500 whitespace-nowrap">{label}</td>{plans.map(plan=><td key={plan.name} className="py-3 px-3 text-slate-200">{value(plan)}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5 text-sm text-emerald-200"><span className="font-semibold">Why {comparison.winning_plan}?</span> {comparison.recommendation_reason}</div>
    </section>
  );
}
