import { useState } from 'react';
import { simulationAPI } from '../services/api';
import { FlaskConical, Play, Server, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { PageHeader } from '../components/ui/index.jsx';
import PlanComparison from '../components/ui/PlanComparison.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function InputField({ label, value, onChange, min, max, step=1, unit }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 uppercase tracking-wider mb-1.5 font-medium">{label}</label>
      <div className="flex items-center gap-2">
        <input type="number" value={value} onChange={e=>onChange(Number(e.target.value))} min={min} max={max} step={step}
          className="w-full bg-[#111b35] border border-[#1e2d52] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        {unit && <span className="text-slate-400 text-sm flex-shrink-0">{unit}</span>}
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))} className="w-full mt-2 accent-blue-500"/>
    </div>
  );
}

export default function WhatIfSimulator() {
  const [params, setParams] = useState({ future_deployments:10, avg_cpu_per_deployment:4, avg_ram_per_deployment:8, avg_disk_per_deployment:100 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try { const res = await simulationAPI.run(params); setResult(res.data); }
    catch {} finally { setLoading(false); }
  };

  const healthColor = h => ({Healthy:'text-emerald-400',Warning:'text-amber-400',Critical:'text-rose-400'}[h] || 'text-slate-400');
  const compData = result ? [
    {name:'CPU %', Current:result.current_state.avg_cpu, Projected:result.projected_state.avg_cpu},
    {name:'RAM %', Current:result.current_state.avg_ram, Projected:result.projected_state.avg_ram},
  ] : [];

  return (
    <div className="p-6">
      <PageHeader title="What-if Simulator" subtitle="Capacity planning — predict future cluster state before deploying"/>
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="space-y-5">
          <div className="bg-[#0d1428] border border-[#162040] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-5"><FlaskConical size={18} className="text-blue-400"/><h3 className="font-semibold text-white">Simulation Parameters</h3></div>
            <div className="space-y-5">
              <InputField label="Future Deployments" value={params.future_deployments} onChange={v=>setParams(p=>({...p,future_deployments:v}))} min={1} max={100} unit="requests"/>
              <InputField label="Avg CPU per Deployment" value={params.avg_cpu_per_deployment} onChange={v=>setParams(p=>({...p,avg_cpu_per_deployment:v}))} min={1} max={64} unit="vCPU"/>
              <InputField label="Avg RAM per Deployment" value={params.avg_ram_per_deployment} onChange={v=>setParams(p=>({...p,avg_ram_per_deployment:v}))} min={1} max={256} unit="GB"/>
              <InputField label="Avg Disk per Deployment" value={params.avg_disk_per_deployment} onChange={v=>setParams(p=>({...p,avg_disk_per_deployment:v}))} min={10} max={5000} step={10} unit="GB"/>
            </div>
            <button onClick={run} disabled={loading} className="w-full mt-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Running...</> : <><Play size={18}/> Run Simulation</>}
            </button>
          </div>

          <div className="bg-[#0d1428] border border-[#162040] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Quick Scenarios</h3>
            <div className="space-y-2">
              {[
                ['Black Friday Rush',{future_deployments:50,avg_cpu_per_deployment:8,avg_ram_per_deployment:16,avg_disk_per_deployment:200}],
                ['Normal Business Day',{future_deployments:10,avg_cpu_per_deployment:4,avg_ram_per_deployment:8,avg_disk_per_deployment:100}],
                ['GPU Workload Surge',{future_deployments:5,avg_cpu_per_deployment:32,avg_ram_per_deployment:128,avg_disk_per_deployment:1000}],
                ['Minimal Load',{future_deployments:3,avg_cpu_per_deployment:2,avg_ram_per_deployment:4,avg_disk_per_deployment:50}],
              ].map(([label,p])=>(
                <button key={label} onClick={()=>setParams(p)} className="w-full text-left bg-[#111b35] hover:bg-[#162040] border border-[#162040] hover:border-blue-500/30 rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:text-white transition-all">{label}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          {!result && !loading && (
            <div className="bg-[#0d1428] border border-[#162040] rounded-xl p-16 flex flex-col items-center justify-center text-center">
              <FlaskConical size={48} className="text-slate-700 mb-4"/>
              <h3 className="text-slate-300 font-semibold text-lg">Configure & Run Simulation</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-sm">Set your deployment parameters and click "Run Simulation".</p>
            </div>
          )}
          {loading && (
            <div className="bg-[#0d1428] border border-[#162040] rounded-xl p-16 flex flex-col items-center justify-center">
              <div className="relative mb-4"><div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"/><Zap size={22} className="absolute inset-0 m-auto text-blue-400"/></div>
              <p className="text-slate-300 font-medium">Simulating {params.future_deployments} deployments...</p>
            </div>
          )}
          {result && !loading && (
            <>
              <div className={`rounded-xl p-5 border ${result.projected_state.cluster_health==='Critical'?'bg-rose-500/10 border-rose-500/30':result.projected_state.cluster_health==='Warning'?'bg-amber-500/10 border-amber-500/30':'bg-emerald-500/10 border-emerald-500/30'}`}>
                <div className="flex items-start gap-3">
                  {result.projected_state.cluster_health==='Healthy'?<CheckCircle size={22} className="text-emerald-400 flex-shrink-0 mt-0.5"/>:<AlertTriangle size={22} className={`${result.projected_state.cluster_health==='Critical'?'text-rose-400':'text-amber-400'} flex-shrink-0 mt-0.5`}/>}
                  <div>
                    <h3 className={`font-semibold text-lg ${healthColor(result.projected_state.cluster_health)}`}>Projected Cluster Health: {result.projected_state.cluster_health}</h3>
                    <p className="text-slate-300 text-sm mt-1">{result.recommendation}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0d1428] border border-[#162040] rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Current State</h3>
                  {[['Avg CPU',`${result.current_state.avg_cpu}%`,'text-blue-400'],['Avg RAM',`${result.current_state.avg_ram}%`,'text-violet-400'],['Total Services',result.current_state.total_services,'text-cyan-400'],['Active Nodes',result.current_state.active_nodes,'text-emerald-400']].map(([l,v,c])=>(
                    <div key={l} className="flex justify-between items-center py-1"><span className="text-slate-400 text-sm">{l}</span><span className={`font-bold ${c}`}>{v}</span></div>
                  ))}
                </div>
                <div className="bg-[#0d1428] border border-[#162040] rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">After +{params.future_deployments} Deployments</h3>
                  {[['Avg CPU',`${result.projected_state.avg_cpu}%`],['Avg RAM',`${result.projected_state.avg_ram}%`],['Total Services',result.projected_state.total_services],['Cluster Health',result.projected_state.cluster_health]].map(([l,v])=>(
                    <div key={l} className="flex justify-between items-center py-1"><span className="text-slate-400 text-sm">{l}</span><span className="font-bold text-amber-400">{v}</span></div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0d1428] border border-[#162040] rounded-xl p-5">
                <h3 className="font-semibold text-white mb-4">Before vs After Comparison</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={compData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#162040"/>
                    <XAxis dataKey="name" tick={{fontSize:12,fill:'#64748b'}}/>
                    <YAxis tick={{fontSize:12,fill:'#64748b'}}/>
                    <Tooltip
                      contentStyle={{background:'#0d1428',border:'1px solid #162040',borderRadius:8,color:'#f8fafc'}}
                      labelStyle={{color:'#f8fafc'}}
                      itemStyle={{color:'#cbd5e1'}}
                      cursor={{fill:'rgba(59, 130, 246, 0.10)'}}
                    />
                    <Legend wrapperStyle={{fontSize:12,color:'#94a3b8'}}/>
                    <Bar dataKey="Current" fill="#3b82f6" radius={[4,4,0,0]} activeBar={{stroke:'#93c5fd',strokeWidth:1}}/>
                    <Bar dataKey="Projected" fill="#f59e0b" radius={[4,4,0,0]} activeBar={{stroke:'#fde68a',strokeWidth:1}}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <PlanComparison comparison={result.plan_comparison}/>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0d1428] border border-[#162040] rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-rose-300 mb-3 flex items-center gap-2"><AlertTriangle size={14}/> Overloaded Nodes ({result.overloaded_nodes?.length||0})</h3>
                  {result.overloaded_nodes?.length===0 ? <div className="flex items-center gap-2 text-emerald-400 text-sm"><CheckCircle size={14}/> None overloaded</div> : (
                    <div className="space-y-2">{result.overloaded_nodes?.map(n=>(
                      <div key={n.node_id} className="bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                        <div className="font-mono text-sm text-rose-300 font-semibold">{n.node_id}</div>
                        <div className="text-xs text-slate-400 mt-0.5">CPU: {n.projected_cpu}% · RAM: {n.projected_ram}%</div>
                      </div>
                    ))}</div>
                  )}
                </div>
                <div className="bg-[#0d1428] border border-[#162040] rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2"><Server size={14}/> Suggested Servers</h3>
                  {result.suggested_servers?.length===0 ? <div className="text-amber-400 text-sm">None available</div> : (
                    <div className="space-y-1.5">{result.suggested_servers?.map((n,i)=>(
                      <div key={n} className="flex items-center gap-2 text-sm"><span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">{i+1}</span><span className="font-mono text-slate-200">{n}</span></div>
                    ))}</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
