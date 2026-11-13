import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { deploymentsAPI } from '../services/api';
import { Rocket, CheckCircle, Server, Cpu, MemoryStick, HardDrive, ChevronRight, Activity, AlertCircle, BarChart2 } from 'lucide-react';

function Step({ n, label, status }) {
  const st = {
    done:   { icon: CheckCircle, color:'text-emerald-400', bg:'bg-emerald-500/15 border-emerald-500/30' },
    active: { icon: Activity,    color:'text-brand-400',    bg:'bg-brand-500/15 border-brand-500/30' },
    pending:{ icon: null,        color:'text-slate-600',   bg:'bg-line border-edge' },
  }[status];
  const Icon = st.icon;
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${st.bg} transition-all duration-500`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${st.bg}`}>
        {Icon ? <Icon size={14} className={`${st.color} ${status==='active'?'animate-pulse':''}`}/> : <span className="text-slate-600 text-xs">{n}</span>}
      </div>
      <span className={`text-sm font-medium ${status==='pending'?'text-slate-500':'text-white'}`}>{label}</span>
    </div>
  );
}

export default function DeploymentPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { scheduleResult, request } = state || {};

  const [deploying, setDeploying] = useState(false);
  const [done, setDone]           = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');
  const [step, setStep]           = useState(0);

  const sched      = scheduleResult?.scheduling_result;
  const nodeId      = sched?.recommended_node || '';
  const confidence  = sched?.confidence || 0;
  const reasons     = sched?.reasons || [];

  const STEPS = ['Validating deployment request','Allocating resources on node','Updating cluster state','Recording metrics snapshot','Deployment complete'];

  const handleDeploy = async () => {
    setDeploying(true); setError('');
    for (let i = 0; i < STEPS.length - 1; i++) { setStep(i+1); await new Promise(r=>setTimeout(r,650)); }
    try {
      const res = await deploymentsAPI.deploy({
        request_id: requestId, node_id: nodeId,
        confidence_score: confidence, ai_reasoning: reasons.join(' | '),
      });
      setResult(res.data); setStep(STEPS.length); setDone(true);
    } catch (e) {
      setError(e.response?.data?.detail || 'Deployment failed'); setStep(0);
    } finally { setDeploying(false); }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400 mb-6">
        <button onClick={()=>navigate('/app/requests')} className="hover:text-white">Requests</button>
        <ChevronRight size={14}/>
        <button onClick={()=>navigate(`/app/schedule/${requestId}`)} className="hover:text-white">{requestId}</button>
        <ChevronRight size={14}/>
        <span className="text-brand-400">Deploy</span>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center"><Rocket size={24} className="text-brand-400"/></div>
        <div>
          <h1 className="text-2xl font-bold text-white">Execute Deployment</h1>
          <p className="text-slate-400 text-sm">AI recommends <span className="text-white font-medium">{nodeId}</span> with {confidence.toFixed(1)}% confidence</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <div className="bg-panel border border-brand-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"/>
              <h3 className="text-sm font-semibold text-brand-300 uppercase tracking-wider">AI Scheduling Result</h3>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div><div className="text-xs text-slate-400">Recommended Server</div><div className="text-3xl font-black text-white">{nodeId}</div></div>
              <div className="text-right"><div className="text-xs text-slate-400">Confidence Score</div><div className="text-3xl font-black text-emerald-400">{confidence.toFixed(1)}%</div></div>
            </div>
            <div className="space-y-2">
              {reasons.slice(0,4).map((r,i)=>(
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle size={13} className="text-emerald-400 mt-0.5 flex-shrink-0"/>{r}
                </div>
              ))}
            </div>
          </div>

          {request && (
            <div className="bg-panel border border-line rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Resources to Allocate</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  [Cpu,'CPU',`${request.required_cpu} vCPU`,'text-brand-400'],
                  [MemoryStick,'RAM',`${request.required_ram_gb} GB`,'text-sage-400'],
                  [HardDrive,'Disk',`${request.required_disk_gb} GB`,'text-sea-400'],
                ].map(([Icon,l,v,c])=>(
                  <div key={l} className="bg-inset rounded-xl p-3 text-center">
                    <Icon size={20} className={`${c} mx-auto mb-2`}/>
                    <div className="text-white font-bold text-sm">{v}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-line text-xs text-slate-400">
                {request.service_name} · {request.customer_name} · Job: <span className="text-sage-400">{request.job_type}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-panel border border-line rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Deployment Pipeline</h3>
            <div className="space-y-2">
              {STEPS.map((s,i)=>(<Step key={i} n={i+1} label={s} status={step>i+1?'done':step===i+1?'active':'pending'}/>))}
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle size={20} className="text-rose-400 flex-shrink-0"/><p className="text-rose-300 text-sm">{error}</p>
            </div>
          )}

          {done && result && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3"><CheckCircle size={20} className="text-emerald-400"/><h3 className="font-semibold text-emerald-300">Deployment Successful!</h3></div>
              <div className="space-y-2 text-sm">
                {[
                  ['Node', result.node_id],
                  ['New CPU Usage', `${result.new_cpu_usage?.toFixed(1)}%`],
                  ['New RAM Usage', `${result.new_ram_usage?.toFixed(1)}%`],
                  ['Active Jobs', result.new_active_jobs],
                  ['Utilization Score', `${result.utilization_score?.toFixed(1)}%`],
                  ['Node Health', result.health_status],
                ].map(([l,v])=>(
                  <div key={l} className="flex justify-between"><span className="text-slate-400">{l}</span><span className="text-white capitalize">{v}</span></div>
                ))}
              </div>
              <button onClick={()=>navigate('/app/dashboard')} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                <BarChart2 size={18}/> View Live Dashboard
              </button>
            </div>
          )}

          {!done && (
            <button onClick={handleDeploy} disabled={deploying||!nodeId}
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-ink py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-lg shadow-brand-500/25">
              {deploying ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Deploying to {nodeId}...</> : <><Rocket size={20}/> Deploy to {nodeId}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
