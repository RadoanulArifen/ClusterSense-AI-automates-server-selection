import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { deploymentsAPI, deploymentRequestsAPI } from '../services/api';
import { Brain, CheckCircle, ChevronRight, Server, Cpu, HardDrive, Zap, AlertTriangle, ArrowRight } from 'lucide-react';
import { Badge } from '../components/ui/index.jsx';
import TrustMeterCard from '../components/ui/TrustMeterCard.jsx';

function ConfidenceRing({ value }) {
  const r = 52, circ = 2 * Math.PI * r;
  const color = value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#f43f5e';
  return (
    <svg width="130" height="130" className="-rotate-90">
      <circle cx="65" cy="65" r={r} fill="none" stroke="#162040" strokeWidth="10"/>
      <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={circ*(1-value/100)}
        strokeLinecap="round" style={{transition:'stroke-dashoffset 1s ease'}}/>
      <text x="65" y="65" textAnchor="middle" dominantBaseline="middle"
        fill="white" fontSize="22" fontWeight="bold" className="rotate-90 origin-center">
        {Math.round(value)}%
      </text>
    </svg>
  );
}

export default function SmartScheduling() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [reqRes, schedRes] = await Promise.all([
          deploymentRequestsAPI.get(requestId),
          deploymentsAPI.schedule(requestId),
        ]);
        setRequest(reqRes.data);
        setResult(schedRes.data);
      } catch (e) {
        setError(e.response?.data?.detail || 'Failed to run AI scheduling');
      } finally { setLoading(false); }
    })();
  }, [requestId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-20">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"/>
        <Brain size={28} className="absolute inset-0 m-auto text-blue-400"/>
      </div>
      <div className="text-center">
        <h3 className="text-white font-semibold text-lg">Running Smart Scheduling AI</h3>
        <p className="text-slate-400 text-sm mt-1">RandomForest model · 92.6% accuracy · Scoring 20 nodes…</p>
        <p className="text-slate-500 text-xs mt-1">Trained on 20,000 real job assignments from smart_scheduling.csv</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6 flex items-center justify-center">
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-8 text-center max-w-md">
        <AlertTriangle size={40} className="text-rose-400 mx-auto mb-3"/>
        <h3 className="text-white font-semibold">Scheduling Failed</h3>
        <p className="text-slate-400 text-sm mt-2">{error}</p>
        <button onClick={()=>navigate('/app/requests')} className="btn-secondary mt-4 mx-auto">← Back</button>
      </div>
    </div>
  );

  const sched = result?.scheduling_result;
  const confidence = sched?.confidence || 0;
  const recommended = sched?.recommended_node || '—';

  if (sched?.error) return (
    <div className="p-6 flex items-center justify-center">
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-8 text-center max-w-md">
        <AlertTriangle size={40} className="text-rose-400 mx-auto mb-3"/>
        <h3 className="text-white font-semibold">No Eligible Node</h3>
        <p className="text-slate-400 text-sm mt-2">{sched.error}</p>
        <button onClick={()=>navigate('/app/requests')} className="btn-secondary mt-4 mx-auto">← Back</button>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <button onClick={()=>navigate('/app/requests')} className="hover:text-white">Requests</button>
        <ChevronRight size={14}/>
        <span className="text-white">{requestId}</span>
        <ChevronRight size={14}/>
        <span className="text-blue-400">Smart Scheduling AI</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
          <Brain size={24} className="text-violet-400"/>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Smart Scheduling AI</h1>
          <p className="text-slate-400 text-sm">RandomForest · 92.6% accuracy · Trained on 20,000 real records from smart_scheduling.csv</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Request info */}
        <div className="bg-[#0d1428] border border-[#162040] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Deployment Request</h2>
          {request && (
            <div className="space-y-3">
              <div><div className="text-xs text-slate-500">Request ID</div><div className="font-mono text-blue-400 text-sm">{request.request_id}</div></div>
              <div><div className="text-xs text-slate-500">Customer</div><div className="text-white text-sm">{request.customer_name}</div></div>
              <div><div className="text-xs text-slate-500">Service</div><div className="text-white text-sm">{request.service_name}</div></div>
              <div><div className="text-xs text-slate-500">Job Type</div><div className="text-violet-400 text-sm font-mono">{request.job_type}</div></div>
              <div><div className="text-xs text-slate-500">Priority</div><Badge status={request.priority}/></div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                {[['CPU',`${request.required_cpu} vCPU`],['RAM',`${request.required_ram_gb} GB`],['Disk',`${request.required_disk_gb} GB`]].map(([l,v])=>(
                  <div key={l} className="bg-[#111b35] rounded-lg p-2 text-center">
                    <div className="text-white text-xs font-semibold">{v}</div>
                    <div className="text-slate-500 text-xs">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Recommendation */}
        <div className="bg-[#0d1428] border border-emerald-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={16} className="text-emerald-400"/>
            <h2 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider">AI Recommendation</h2>
          </div>
          <div className="flex flex-col items-center py-3">
            <ConfidenceRing value={confidence}/>
            <div className="text-center mt-3">
              <div className="text-xs text-slate-400 uppercase tracking-wider">Recommended Server</div>
              <div className="text-3xl font-black text-white mt-1">{recommended}</div>
              <div className="text-xs text-slate-500 mt-1">{sched?.node_details?.location || '—'}</div>
            </div>
          </div>
          {sched?.node_details && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {[
                ['CPU Usage',  `${sched.node_details.cpu_usage?.toFixed(1)}%`],
                ['RAM Usage',  `${sched.node_details.ram_usage?.toFixed(1)}%`],
                ['Active Jobs', sched.node_details.running_services],
                ['Health',      sched.node_details.health_status],
              ].map(([l,v])=>(
                <div key={l} className="bg-[#111b35] rounded-lg px-3 py-2">
                  <div className="text-xs text-slate-500">{l}</div>
                  <div className="text-sm font-semibold text-white capitalize">{v}</div>
                </div>
              ))}
            </div>
          )}
          {sched?.trust_meter && <div className="mt-3"><TrustMeterCard trust={sched.trust_meter} compact/></div>}
        </div>

        {/* Explainable AI */}
        <div className="bg-[#0d1428] border border-[#162040] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-violet-400"/>
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Explainable AI</h2>
          </div>
          <div className="space-y-2 mb-4">
            {(sched?.reasons || []).map((r,i)=>(
              <div key={i} className="flex items-start gap-2 bg-[#111b35] rounded-lg px-3 py-2.5">
                <CheckCircle size={13} className="text-emerald-400 mt-0.5 flex-shrink-0"/>
                <span className="text-xs text-slate-300">{r}</span>
              </div>
            ))}
          </div>
          {sched?.alternatives?.length > 0 && (
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Alternative Nodes</div>
              {sched.alternatives.map((alt,i)=>(
                <div key={alt.node_id} className="flex items-center justify-between py-1.5 border-b border-[#162040] last:border-0">
                  <span className="text-sm text-slate-300">{i+1}. {alt.node_id}</span>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">{alt.cpu_usage?.toFixed(0)}% CPU</div>
                    <div className="text-xs text-slate-400">Score: {alt.score?.toFixed(0)}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Model info banner */}
      <div className="mt-4 bg-[#0d1428] border border-violet-500/20 rounded-xl px-5 py-3 flex items-center gap-3">
        <Brain size={16} className="text-violet-400 flex-shrink-0"/>
        <div className="text-xs text-slate-400">
          <span className="text-violet-300 font-medium">Model:</span> RandomForest Classifier ·
          <span className="text-violet-300 font-medium ml-1">Accuracy:</span> 92.6% ·
          <span className="text-violet-300 font-medium ml-1">Features:</span> job_type, cpu_required, memory_required_gb, estimated_runtime_minutes, priority, current_node_load, available_cpu_cores, available_memory_gb ·
          <span className="text-violet-300 font-medium ml-1">Training data:</span> 20,000 rows from smart_scheduling.csv
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={()=>navigate(`/app/deploy/${requestId}`, { state:{ scheduleResult:result, request } })}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 hover:scale-105 transition-all shadow-lg shadow-blue-500/25">
          <Server size={20}/> Deploy to {recommended} <ArrowRight size={20}/>
        </button>
        <button onClick={()=>navigate('/app/requests')} className="btn-secondary px-6 py-4">Back</button>
        <span className="text-xs text-slate-500 ml-1">AI Confidence: <span className="text-white font-medium">{confidence.toFixed(1)}%</span></span>
      </div>
    </div>
  );
}
