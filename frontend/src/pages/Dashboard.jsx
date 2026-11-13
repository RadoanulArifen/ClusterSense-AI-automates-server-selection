import { useQuery } from '@tanstack/react-query';
import { dashboardAPI, alertsAPI, trustMeterAPI, outcomesAPI, planCompareAPI } from '../services/api';
import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Server, Cpu, HardDrive, AlertTriangle, CheckCircle, Clock, Bell, Zap, Activity, ShieldCheck } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import { Badge, UsageBar, LoadingSpinner } from '../components/ui/index.jsx';
import TrustMeterCard from '../components/ui/TrustMeterCard.jsx';
import { OutcomeStatusBadge } from '../components/ui/OutcomeHistoryTable.jsx';

const Tip = ({active,payload,label,unit='%'}) => {
  if (!active||!payload?.length) return null;
  return (
    <div className="bg-panel border border-line rounded-lg px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p=><p key={p.name} style={{color:p.color}}>{p.name}: {p.value?.toFixed(1)}{unit}</p>)}
    </div>
  );
};

export default function Dashboard() {
  const [last, setLast] = useState(new Date());

  const { data: stats } = useQuery({
    queryKey:['dashboard-stats'],
    queryFn: async()=>{const r=await dashboardAPI.getStats(); setLast(new Date()); return r.data;},
    refetchInterval: 3000,
  });
  const { data: nodes = [], isLoading: nodesLoading } = useQuery({
    queryKey:['dashboard-nodes'], queryFn: async()=>{const r=await dashboardAPI.getNodes(); return r.data;}, refetchInterval: 3000,
  });
  const { data: trends } = useQuery({
    queryKey:['dashboard-trends'], queryFn: async()=>{const r=await dashboardAPI.getTrends(); return r.data;}, refetchInterval: 5000,
  });
  const { data: alerts = [] } = useQuery({
    queryKey:['alerts'], queryFn: async()=>{const r=await alertsAPI.list(); return r.data;}, refetchInterval: 10000,
  });
  const { data: trustMeters } = useQuery({
    queryKey:['trust-meter-summary'], queryFn: async()=>{const r=await trustMeterAPI.getSummary(); return r.data;}, refetchInterval: 15000,
  });
  const { data: recentOutcomes = [] } = useQuery({
    queryKey:['recent-outcomes'], queryFn: async()=>{const r=await outcomesAPI.list({ limit: 5 }); return r.data;}, refetchInterval: 15000,
  });
  const { data: latestPlanComparison } = useQuery({
    queryKey:['latest-plan-comparison'], queryFn: async()=>{const r=await planCompareAPI.getLatest(); return r.data;}, refetchInterval: 15000,
  });

  const active = alerts.filter(a=>!a.is_acknowledged);
  const health = stats?.cluster_health_score || 0;
  const healthColor = health>80?'text-emerald-400':health>60?'text-amber-400':'text-rose-400';
  const chartData = key => trends?.[key]?.map(d=>({...d,name:d.time})) || [];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex flex-wrap items-center gap-2">
            Live Cluster Dashboard
            <span className="flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-xs font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/> LIVE
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 flex flex-wrap items-center gap-2"><Clock size={12}/> Last updated: {last.toLocaleTimeString()} · Auto-refreshes every 3s</p>
        </div>
        {active.length > 0 && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2">
            <Bell size={16} className="text-rose-400"/><span className="text-rose-300 text-sm font-medium">{active.length} Active Alert{active.length!==1?'s':''}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard title="Total Servers" value={stats?.total_servers ?? '—'} icon={Server} color="blue" pulse/>
        <StatCard title="Healthy"       value={stats?.healthy_servers ?? '—'} icon={CheckCircle} color="emerald"/>
        <StatCard title="Warning"       value={stats?.warning_servers ?? '—'} icon={AlertTriangle} color="amber"/>
        <StatCard title="Critical"      value={stats?.critical_servers ?? '—'} icon={AlertTriangle} color="rose"/>
        <StatCard title="Active Jobs"   value={stats?.total_running_services ?? '—'} icon={Activity} color="violet" pulse/>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard title="Avg CPU"    value={`${stats?.avg_cpu_usage?.toFixed(1) ?? '—'}%`} icon={Cpu} color="blue"/>
        <StatCard title="Avg RAM"    value={`${stats?.avg_ram_usage?.toFixed(1) ?? '—'}%`} icon={Server} color="violet"/>
        <StatCard title="Avg Disk"   value={`${stats?.avg_disk_usage?.toFixed(1) ?? '—'}%`} icon={HardDrive} color="cyan"/>
        <StatCard title="Power"      value={`${stats?.total_power_kw?.toFixed(1) ?? '—'} kW`} icon={Zap} color="amber"/>
        <div className="bg-panel border border-line rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase tracking-wider">Cluster Health</div>
          <div className={`text-3xl font-black mt-1 ${healthColor}`}>{health.toFixed(0)}%</div>
          <div className="mt-2 h-1.5 bg-line rounded-full">
            <div className={`h-full rounded-full transition-all duration-700 ${health>80?'bg-emerald-500':health>60?'bg-amber-500':'bg-rose-500'}`} style={{width:`${health}%`}}/>
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4"><ShieldCheck size={18} className="text-sage-400"/><h2 className="text-lg font-semibold text-white">Recommendation Trust Meter</h2></div>
        <div className="grid lg:grid-cols-2 gap-5">
          <TrustMeterCard trust={trustMeters?.scheduling}/>
          <TrustMeterCard trust={trustMeters?.cost_optimization}/>
        </div>
      </section>

      <div className="bg-panel border border-line rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent Outcomes</h2>
          <span className="text-xs text-slate-500">Last 5 recommendation records</span>
        </div>
        <div className="divide-y divide-line">
          {recentOutcomes.length === 0 ? <div className="px-5 py-6 text-sm text-slate-500">No recommendation outcomes recorded yet.</div> : recentOutcomes.map(record=>
            <div key={record.id} className="px-5 py-3 flex flex-wrap items-center gap-3 justify-between">
              <div className="min-w-0"><div className="text-sm text-white truncate">{record.recommendation}</div><div className="text-xs text-slate-500">{record.module === 'scheduling' ? 'Scheduling' : 'Cost Optimization'} · <span className="font-mono">{record.recommended_node}</span></div></div>
              <OutcomeStatusBadge status={record.status}/>
            </div>
          )}
        </div>
      </div>

      <div className="bg-panel border border-sage-500/20 rounded-xl p-5">
        <div className="flex items-center justify-between gap-3 mb-3"><h2 className="font-semibold text-white">Latest Plan Comparison</h2><span className="text-xs text-slate-500">What-if Simulator</span></div>
        {latestPlanComparison?.winning_plan ? (() => {
          const winningPlan = latestPlanComparison[latestPlanComparison.winning_plan === 'Plan A' ? 'plan_a' : 'plan_b'];
          return <div className="grid sm:grid-cols-3 gap-4"><div><div className="text-xs text-slate-500">Latest Compared Request</div><div className="text-sm font-semibold text-white mt-1">{latestPlanComparison.request?.future_deployments} deployments</div></div><div><div className="text-xs text-slate-500">Winning Plan</div><div className="text-sm font-semibold text-emerald-400 mt-1">{latestPlanComparison.winning_plan} · {winningPlan?.recommended_node}</div></div><div><div className="text-xs text-slate-500">Trust Score</div><div className="text-sm font-semibold text-sage-300 mt-1">{winningPlan?.trust_score?.toFixed(1)}%</div></div></div>;
        })() : <div className="text-sm text-slate-500">Run a What-if simulation to generate a plan comparison.</div>}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {[
          {title:'CPU Utilization Trend', key:'cpu',         color:'#c2ee8d', unit:'%'},
          {title:'RAM Utilization Trend', key:'ram',         color:'#91b89a', unit:'%'},
          {title:'Network Usage Trend',   key:'network',     color:'#80bcb0', unit:'%'},
          {title:'Temperature Trend',     key:'temperature', color:'#f59e0b', unit:'°C'},
        ].map(({title,key,color,unit})=>(
          <div key={key} className="bg-panel border border-line rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData(key)} margin={{top:5,right:5,bottom:5,left:0}}>
                <defs><linearGradient id={`g-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/><stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)"/>
                <XAxis dataKey="time" tick={{fontSize:10,fill:'#81909f'}}/>
                <YAxis tick={{fontSize:10,fill:'#81909f'}}/>
                <Tooltip content={<Tip unit={unit}/>}/>
                <Area type="monotone" dataKey="value" name={key.toUpperCase()} stroke={color} fill={`url(#g-${key})`} strokeWidth={2} dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      <div className="bg-panel border border-line rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <h3 className="font-semibold text-white">Node Status Table</h3>
          <div className="text-xs text-slate-400">{nodes.length} nodes active</div>
        </div>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Scrollable data table">
          <table className="w-full">
            <thead className="bg-inset">
              <tr>{['Node','CPU','RAM','Disk','Temp','Jobs','Power','Health','Status'].map(h=><th key={h} className="table-th">{h}</th>)}</tr>
            </thead>
            <tbody>
              {nodesLoading ? (
                <tr><td colSpan={9} className="py-8"><LoadingSpinner/></td></tr>
              ) : nodes.map(n=>(
                <tr key={n.id} className="table-row">
                  <td className="table-td"><div className="font-mono text-sm text-white">{n.node_id}</div><div className="text-xs text-slate-500">{n.ip_address}</div></td>
                  <td className="table-td w-28"><UsageBar value={n.cpu_usage}/><div className="text-xs text-slate-400 mt-0.5">{n.cpu_usage?.toFixed(1)}%</div></td>
                  <td className="table-td w-28"><UsageBar value={n.ram_usage} color="violet"/><div className="text-xs text-slate-400 mt-0.5">{n.ram_usage?.toFixed(1)}%</div></td>
                  <td className="table-td w-28"><UsageBar value={n.disk_usage} color="cyan"/><div className="text-xs text-slate-400 mt-0.5">{n.disk_usage?.toFixed(1)}%</div></td>
                  <td className="table-td"><span className={n.temperature>75?'text-rose-400':n.temperature>65?'text-amber-400':'text-emerald-400'}>{n.temperature?.toFixed(1)}°C</span></td>
                  <td className="table-td"><span className="text-white font-semibold">{n.active_jobs}</span></td>
                  <td className="table-td text-amber-400">{n.power_watts?.toFixed(0)}W</td>
                  <td className="table-td"><Badge status={n.health_status}/></td>
                  <td className="table-td"><div className={`w-2 h-2 rounded-full ${n.health_status==='healthy'?'bg-emerald-400 animate-pulse':n.health_status==='warning'?'bg-amber-400':'bg-rose-400 animate-pulse'}`}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {active.length > 0 && (
        <div className="bg-panel border border-rose-500/20 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-rose-500/20 flex items-center gap-2"><AlertTriangle size={16} className="text-rose-400"/><h3 className="font-semibold text-rose-300">Active Alerts ({active.length})</h3></div>
          <div className="divide-y divide-line">
            {active.slice(0,5).map(a=>(
              <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${a.severity==='critical'?'bg-rose-400 animate-pulse':'bg-amber-400'}`}/>
                  <div><span className="text-sm text-white">{a.message}</span><div className="text-xs text-slate-500 mt-0.5">{a.alert_type} · {new Date(a.created_at).toLocaleTimeString()}</div></div>
                </div>
                <Badge status={a.severity}/>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
