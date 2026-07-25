import { useQuery } from '@tanstack/react-query';
import { costAPI } from '../services/api';
import { DollarSign, TrendingDown, Power, Moon, Layers, RefreshCw, PieChart as PieIcon } from 'lucide-react';
import { PageHeader, LoadingSpinner } from '../components/ui/index.jsx';
import TrustMeterCard from '../components/ui/TrustMeterCard.jsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const ACTION_CFG = {
  'Shutdown':     { icon: Power,      color:'text-rose-400',    bg:'bg-rose-500/10 border-rose-500/30' },
  'Sleep Mode':   { icon: Moon,       color:'text-amber-400',   bg:'bg-amber-500/10 border-amber-500/30' },
  'Keep Running': { icon: Layers,     color:'text-emerald-400', bg:'bg-emerald-500/10 border-emerald-500/30' },
};
const PIE_COLORS = { 'Shutdown':'#f43f5e', 'Sleep Mode':'#f59e0b', 'Keep Running':'#10b981' };

export default function CostOptimization() {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey:['cost-recommendations'], queryFn: async()=>{const r=await costAPI.getRecommendations(); return r.data;},
  });

  const summary = data?.summary || {};
  const recs    = data?.recommendations || [];
  const actionCounts = recs.reduce((a,r)=>{a[r.action]=(a[r.action]||0)+1; return a;},{});
  const pieData = Object.entries(actionCounts).map(([name,value])=>({name,value}));
  const topSavings = recs.filter(r=>r.estimated_saving_monthly>0).sort((a,b)=>b.estimated_saving_monthly-a.estimated_saving_monthly).slice(0,8);

  return (
    <div className="p-6">
      <PageHeader title="Cost Optimization" subtitle="GradientBoosting model · 99.9% accuracy · Trained on 20,000 real cost records">
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''}/>
          {isFetching ? 'Analyzing…' : 'Re-analyze'}
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          ['Monthly Cost',       `$${summary.total_monthly_cost?.toFixed(0)??'—'}`,      'text-white',    DollarSign],
          ['Potential Savings/Mo',`$${summary.total_saving_monthly?.toFixed(0)??'—'}`,   'text-emerald-400', TrendingDown],
          ['Annual Savings',     `$${summary.total_saving_annual?.toFixed(0)??'—'}`,     'text-emerald-300', TrendingDown],
          ['Idle Servers',       summary.idle_servers??'—',                              'text-amber-400', Power],
          ['Avg Utilization',    `${summary.avg_utilization_score?.toFixed(1)??'—'}%`,   'text-blue-400',  Layers],
        ].map(([label,value,color,Icon])=>(
          <div key={label} className="bg-[#0d1428] border border-[#162040] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2"><span className="text-xs text-slate-400">{label}</span><Icon size={16} className={color}/></div>
            <div className={`text-2xl font-black ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {data?.trust_meter && <div className="mb-5"><TrustMeterCard trust={data.trust_meter} compact/></div>}

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <div className="bg-[#0d1428] border border-[#162040] rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><PieIcon size={16} className="text-blue-400"/> Action Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {pieData.map(e=><Cell key={e.name} fill={PIE_COLORS[e.name]||'#64748b'}/>)}
              </Pie>
              <Tooltip
                contentStyle={{background:'#0d1428',border:'1px solid #162040',borderRadius:8,color:'#f8fafc'}}
                labelStyle={{color:'#f8fafc'}}
                itemStyle={{color:'#34d399'}}
                cursor={false}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map(({name,value})=>(
              <div key={name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{background:PIE_COLORS[name]}}/><span className="text-slate-300">{name}</span></div>
                <span className="text-slate-400">{value} nodes</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#0d1428] border border-[#162040] rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Top Savings Opportunities ($/month)</h3>
          {isLoading ? <LoadingSpinner/> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topSavings} margin={{left:0,right:10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#162040"/>
                <XAxis dataKey="node_id" tick={{fontSize:11,fill:'#64748b'}}/>
                <YAxis tick={{fontSize:11,fill:'#64748b'}} tickFormatter={v=>`$${v}`}/>
                <Tooltip
                  formatter={v=>[`$${v.toFixed(2)}`,'Monthly Saving']}
                  contentStyle={{background:'#0d1428',border:'1px solid #162040',borderRadius:8,color:'#f8fafc'}}
                  labelStyle={{color:'#f8fafc'}}
                  itemStyle={{color:'#34d399'}}
                  cursor={{fill:'rgba(59, 130, 246, 0.10)'}}
                />
                <Bar
                  dataKey="estimated_saving_monthly"
                  name="Monthly Saving"
                  radius={[4,4,0,0]}
                  activeBar={{stroke:'#f8fafc',strokeWidth:1}}
                >
                  {topSavings.map(r=><Cell key={r.node_id} fill={PIE_COLORS[r.action]||'#3b82f6'}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-[#0d1428] border border-[#162040] rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#162040]"><h3 className="font-semibold text-white">All Node Recommendations</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#111b35]">
              <tr>{['Node','CPU','RAM','Jobs','Idle (min)','Utilization','Monthly Cost','Saving/Mo','Annual Saving','Action'].map(h=><th key={h} className="table-th">{h}</th>)}</tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan={10} className="py-10"><LoadingSpinner/></td></tr> : recs.map(r=>{
                const cfg = ACTION_CFG[r.action] || ACTION_CFG['Keep Running'];
                const Icon = cfg.icon;
                return (
                  <tr key={r.node_id} className="table-row">
                    <td className="table-td font-mono text-white text-sm">{r.node_id}</td>
                    <td className="table-td"><span className={r.current_cpu<20?'text-rose-400':'text-slate-300'}>{r.current_cpu?.toFixed(1)}%</span></td>
                    <td className="table-td"><span className={r.current_ram<20?'text-rose-400':'text-slate-300'}>{r.current_ram?.toFixed(1)}%</span></td>
                    <td className="table-td text-slate-300">{r.active_jobs}</td>
                    <td className="table-td text-slate-300">{r.idle_time_minutes?.toFixed(0)}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-[#162040] rounded-full"><div className={`h-full rounded-full ${r.utilization_score>60?'bg-emerald-500':r.utilization_score>30?'bg-amber-500':'bg-rose-500'}`} style={{width:`${r.utilization_score}%`}}/></div>
                        <span className="text-xs text-slate-400">{r.utilization_score?.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="table-td text-slate-300">${r.current_cost_monthly?.toFixed(2)}</td>
                    <td className="table-td"><span className={r.estimated_saving_monthly>0?'text-emerald-400 font-semibold':'text-slate-400'}>{r.estimated_saving_monthly>0?`$${r.estimated_saving_monthly?.toFixed(2)}`:'—'}</span></td>
                    <td className="table-td"><span className={r.estimated_saving_annual>0?'text-emerald-300 font-semibold':'text-slate-400'}>{r.estimated_saving_annual>0?`$${r.estimated_saving_annual?.toFixed(0)}`:'—'}</span></td>
                    <td className="table-td"><div className={`inline-flex items-center gap-1.5 border rounded-full px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.color}`}><Icon size={11}/>{r.action}</div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
