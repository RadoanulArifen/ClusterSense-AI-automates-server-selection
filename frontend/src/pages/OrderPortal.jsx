import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deploymentRequestsAPI } from '../services/api';
import { Zap, Cpu, HardDrive, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

const SERVICES = [
  { name:'Shared Hosting Basic',    type:'shared',      job:'ETL',              cpu:2,  ram:2,   disk:50,   price:9.99,   priority:'Low',      runtime:30,  color:'emerald', desc:'Personal websites and small blogs. Managed Apache + cPanel.' },
  { name:'Business VPS Pro',        type:'vps',         job:'Data Processing',  cpu:4,  ram:8,   disk:200,  price:49.99,  priority:'Medium',   runtime:60,  color:'blue',   desc:'Dedicated virtual resources. Full root access, DDoS protection.' },
  { name:'Cloud Compute Standard',  type:'cloud',       job:'Analytics',        cpu:8,  ram:16,  disk:500,  price:99.99,  priority:'Medium',   runtime:120, color:'cyan',   desc:'Scalable cloud compute for high-traffic APIs and applications.' },
  { name:'GPU Compute Instance',    type:'gpu',         job:'ML Training',      cpu:16, ram:64,  disk:1000, price:299.99, priority:'High',     runtime:480, color:'violet', desc:'NVIDIA A100 GPU instances for ML training and rendering.' },
  { name:'Managed Kubernetes',      type:'kubernetes',  job:'Simulation',       cpu:32, ram:128, disk:2000, price:499.99, priority:'High',     runtime:240, color:'amber',  desc:'Production-grade K8s clusters with auto-healing and Helm.' },
  { name:'Managed Database',        type:'database',    job:'ETL',              cpu:8,  ram:32,  disk:1000, price:199.99, priority:'Medium',   runtime:90,  color:'rose',   desc:'Fully managed PostgreSQL/MySQL with daily backups.' },
  { name:'AI Workspace Enterprise', type:'ai_workspace',job:'ML Training',      cpu:64, ram:256, disk:5000, price:999.99, priority:'Critical', runtime:720, color:'pink',   desc:'8× GPU cluster with JupyterHub, MLflow, shared volumes.' },
];

const CUSTOMERS = ['Acme Corp','TechVision Inc','DataFlow Systems','CloudPeak Ltd','NexGen Solutions','ByteForge Co','PixelWave Agency'];

const CC = {
  emerald:{ bg:'bg-emerald-500/10', border:'border-emerald-500/20', text:'text-emerald-400', btn:'bg-emerald-600 hover:bg-emerald-500' },
  blue:   { bg:'bg-brand-500/10',    border:'border-brand-500/20',    text:'text-brand-400',    btn:'bg-brand-600 hover:bg-brand-500' },
  cyan:   { bg:'bg-sea-500/10',    border:'border-sea-500/20',    text:'text-sea-400',    btn:'bg-sea-600 hover:bg-sea-500' },
  violet: { bg:'bg-sage-500/10',  border:'border-sage-500/20',  text:'text-sage-400',  btn:'bg-sage-600 hover:bg-sage-500' },
  amber:  { bg:'bg-amber-500/10',   border:'border-amber-500/20',   text:'text-amber-400',   btn:'bg-amber-600 hover:bg-amber-500' },
  rose:   { bg:'bg-rose-500/10',    border:'border-rose-500/20',    text:'text-rose-400',    btn:'bg-rose-600 hover:bg-rose-500' },
  pink:   { bg:'bg-pink-500/10',    border:'border-pink-500/20',    text:'text-pink-400',    btn:'bg-pink-600 hover:bg-pink-500' },
};

export default function OrderPortal() {
  const navigate  = useNavigate();
  const [sub, setSub] = useState(null);
  const [ok, setOk]   = useState(null);

  const order = async (svc) => {
    setSub(svc.type);
    const cust  = CUSTOMERS[Math.floor(Math.random()*CUSTOMERS.length)];
    const email = `${cust.toLowerCase().replace(/[^a-z]/g,'').slice(0,8)}@example.com`;
    try {
      await deploymentRequestsAPI.create({
        customer_name: cust, customer_email: email,
        service_type: svc.type, service_name: svc.name,
        job_type: svc.job,
        required_cpu: svc.cpu, required_ram_gb: svc.ram, required_disk_gb: svc.disk,
        estimated_runtime_min: svc.runtime,
        priority: svc.priority, monthly_price: svc.price,
        notes: `Deployment request from ${cust} via Demo Portal`,
      });
      setOk(svc.name);
    } catch {}
    finally { setSub(null); }
    setTimeout(() => navigate('/app/requests'), 1800);
  };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="bg-shell border-b border-line px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center"><Zap size={16} className="text-ink"/></div>
            <div><div className="text-sm font-bold text-white">HostNova Cloud</div><div className="text-xs text-slate-400">Demo Order Portal</div></div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={()=>navigate('/')} className="text-slate-400 hover:text-white text-sm">← Home</button>
            <button onClick={()=>navigate('/login')} className="bg-line border border-edge text-white px-4 py-2 rounded-lg text-sm">Admin Login</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-2 mb-6 text-sm text-brand-300">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"/>
            Clicking Submit triggers the full ClusterSense AI workflow
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">Choose Your Hosting Service</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">Each service maps to a real job type from the Smart Scheduling dataset. The AI scores all 20 nodes and picks the best one.</p>
        </div>

        {ok && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-4 flex items-center gap-3 max-w-lg mx-auto">
            <CheckCircle size={20} className="text-emerald-400"/>
            <div>
              <div className="text-emerald-300 font-medium text-sm">{ok} — Request Created!</div>
              <div className="text-emerald-500 text-xs mt-0.5">Redirecting to Incoming Deployment Requests…</div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {SERVICES.map(svc => {
            const c = CC[svc.color] || CC.blue;
            const loading = sub === svc.type;
            return (
              <div key={svc.type} className={`bg-panel border ${c.border} rounded-2xl overflow-hidden hover:scale-[1.01] transition-all`}>
                <div className={`${c.bg} px-5 py-4 border-b ${c.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold uppercase ${c.text}`}>{svc.job}</span>
                    <div className="text-right">
                      <div className={`text-2xl font-black ${c.text}`}>${svc.price}</div>
                      <div className="text-xs text-slate-500">/month</div>
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-sm">{svc.name}</h3>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs text-slate-400 mb-4">{svc.desc}</p>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[['CPU',`${svc.cpu} vCores`],['RAM',`${svc.ram} GB`],['Disk',`${svc.disk} GB`],['Priority',svc.priority]].map(([l,v])=>(
                      <div key={l} className="bg-inset rounded-lg px-3 py-2">
                        <div className="text-xs text-slate-500">{l}</div>
                        <div className="text-xs font-semibold text-slate-200 mt-0.5">{v}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>order(svc)} disabled={loading||!!ok}
                    className={`w-full ${c.btn} disabled:opacity-50 text-ink py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all`}>
                    {loading ? <><Loader2 size={15} className="animate-spin"/>Creating...</> : <>Submit Request <ArrowRight size={15}/></>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
