import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { predictionsAPI } from '../services/api';
import { Shield, AlertTriangle, Brain, RefreshCw, Cpu, Thermometer, Activity } from 'lucide-react';
import { PageHeader, Badge, LoadingSpinner } from '../components/ui/index.jsx';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

function RiskDot({ level }) {
  const c = { High:{d:'bg-rose-500', r:'ring-rose-500/30'}, Medium:{d:'bg-amber-500', r:'ring-amber-500/30'}, Low:{d:'bg-emerald-500', r:'ring-emerald-500/30'} }[level] || {};
  return <div className={`w-3 h-3 rounded-full ${c.d} ring-4 ${c.r} ${level==='High'?'animate-pulse':''}`}/>;
}

export default function PredictiveOps() {
  const [selected, setSelected] = useState(null);
  const { data: preds = [], isLoading, refetch } = useQuery({
    queryKey:['predictions'], queryFn: async()=>{const r=await predictionsAPI.getAll(); return r.data;}, refetchInterval: 30000,
  });

  const high = preds.filter(p=>p.risk_level==='High').length;
  const med  = preds.filter(p=>p.risk_level==='Medium').length;
  const low  = preds.filter(p=>p.risk_level==='Low').length;
  const sel  = selected ? preds.find(p=>p.node_id===selected) : null;

  const radar = sel ? [
    {subject:'CPU',    value: sel.cpu_usage},
    {subject:'RAM',    value: sel.ram_usage || 50},
    {subject:'Temp',   value: ((sel.temperature||50)/90)*100},
    {subject:'Risk',   value: sel.risk_level==='High'?90:sel.risk_level==='Medium'?55:20},
    {subject:'Confidence', value: sel.confidence||70},
  ] : [];

  return (
    <div className="p-6">
      <PageHeader title="Predictive Operations" subtitle="GradientBoosting model · 98.6% accuracy · Trained on 25,000 real sensor records">
        <button onClick={()=>refetch()} className="btn-secondary"><RefreshCw size={15}/> Re-analyze</button>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          {l:'Nodes Analyzed', v:preds.length, c:'text-white',        b:'border-[#162040]'},
          {l:'High Risk',      v:high,          c:'text-rose-400',    b:'border-rose-500/30'},
          {l:'Medium Risk',    v:med,           c:'text-amber-400',   b:'border-amber-500/30'},
          {l:'Low Risk',       v:low,           c:'text-emerald-400', b:'border-emerald-500/30'},
        ].map(({l,v,c,b})=>(
          <div key={l} className={`bg-[#0d1428] border ${b} rounded-xl p-4`}>
            <div className={`text-3xl font-black ${c}`}>{v}</div>
            <div className="text-xs text-slate-400 mt-1">{l}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-[#0d1428] border border-[#162040] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#162040] flex items-center gap-2">
            <Brain size={16} className="text-violet-400"/><h3 className="font-semibold text-white">Node Risk Analysis</h3>
            <span className="text-xs text-slate-500 ml-auto">Click a node for details</span>
          </div>
          {isLoading ? <div className="py-10"><LoadingSpinner/></div> : (
            <div className="divide-y divide-[#162040]">
              {preds.map(p=>(
                <div key={p.node_id} onClick={()=>setSelected(selected===p.node_id?null:p.node_id)}
                  className={`px-5 py-4 cursor-pointer transition-all ${selected===p.node_id?'bg-blue-500/10 border-l-2 border-l-blue-500':'hover:bg-[#111b35]'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <RiskDot level={p.risk_level}/>
                      <div><div className="font-mono text-sm font-semibold text-white">{p.node_id}</div><div className="text-xs text-slate-500">{p.hostname}</div></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right"><div className="text-xs text-slate-400">CPU</div><div className={`text-sm font-semibold ${p.cpu_usage>80?'text-rose-400':'text-slate-200'}`}>{p.cpu_usage?.toFixed(1)}%</div></div>
                      <div className="text-right"><div className="text-xs text-slate-400">Temp</div><div className={`text-sm font-semibold ${p.temperature>75?'text-rose-400':'text-slate-200'}`}>{p.temperature?.toFixed(1)}°C</div></div>
                      <div className="text-right"><div className="text-xs text-slate-400">AI Confidence</div><div className="text-sm font-semibold text-white">{p.confidence?.toFixed(1)}%</div></div>
                      <Badge status={p.risk_level}/>
                    </div>
                  </div>
                  {selected===p.node_id && (
                    <div className="mt-4 space-y-2">
                      <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Risk Factors</div>
                      {(p.reasons||[]).map((r,i)=>(
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-[#0a0f1e] rounded-lg px-3 py-2">
                          <AlertTriangle size={11} className={p.risk_level==='High'?'text-rose-400':'text-amber-400'}/>{r}
                        </div>
                      ))}
                      <div className="mt-3 bg-[#0a0f1e] rounded-lg px-3 py-3">
                        <div className="text-xs text-slate-400 mb-1">AI Recommendation</div>
                        <div className="text-sm text-white">{p.recommendation}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {sel ? (
            <>
              <div className="bg-[#0d1428] border border-[#162040] rounded-xl p-5">
                <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-white">{sel.node_id} Details</h3><Badge status={sel.risk_level}/></div>
                <div className="space-y-3">
                  {[
                    [Cpu,'CPU Usage',`${sel.cpu_usage?.toFixed(1)}%`, sel.cpu_usage>80?'text-rose-400':'text-blue-400'],
                    [Thermometer,'Temperature',`${sel.temperature?.toFixed(1)}°C`, sel.temperature>75?'text-rose-400':'text-amber-400'],
                    [Activity,'Health',sel.health_status, sel.health_status==='healthy'?'text-emerald-400':'text-amber-400'],
                    [Brain,'AI Confidence',`${sel.confidence?.toFixed(1)}%`,'text-violet-400'],
                  ].map(([Icon,l,v,c])=>(
                    <div key={l} className="flex items-center justify-between bg-[#111b35] rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-2"><Icon size={14} className={c}/><span className="text-xs text-slate-400">{l}</span></div>
                      <span className={`text-sm font-semibold ${c} capitalize`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#0d1428] border border-[#162040] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Risk Profile</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <RadarChart data={radar}>
                    <PolarGrid stroke="#162040"/><PolarAngleAxis dataKey="subject" tick={{fontSize:11,fill:'#64748b'}}/>
                    <Radar name="Value" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2}/>
                    <Tooltip contentStyle={{background:'#0d1428',border:'1px solid #162040',borderRadius:8}}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              {sel.top_features?.length > 0 && (
                <div className="bg-[#0d1428] border border-[#162040] rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3"> Model Feature Importance</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Overall contribution of each feature in the trained Gradient Boosting model. 
                  </p> <br/>
                  
                  <div className="space-y-2">
                    {sel.top_features.map(f=>(
                      <div key={f.feature}>
                        <div className="flex justify-between text-xs mb-1"><span className="text-slate-400">{f.feature}</span><span className="text-white">{f.importance?.toFixed(1)}%</span></div>
                        <div className="h-1.5 bg-[#162040] rounded-full"><div className="h-full bg-violet-500 rounded-full" style={{width:`${f.importance}%`}}/></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-[#0d1428] border border-[#162040] rounded-xl p-8 text-center">
              <Shield size={40} className="text-slate-600 mx-auto mb-3"/>
              <p className="text-slate-400 text-sm">Click any node to view detailed risk analysis and feature importance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
