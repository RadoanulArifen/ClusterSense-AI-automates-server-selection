import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { deploymentRequestsAPI } from '../services/api';
import { Badge, PageHeader, LoadingSpinner, EmptyState } from '../components/ui/index.jsx';
import { Inbox, Brain, Plus, RefreshCw, Clock } from 'lucide-react';
import { useState } from 'react';

const PRIORITY_CLR = { Low:'text-slate-400', Medium:'text-brand-400', High:'text-amber-400', Critical:'text-rose-400' };

export default function DeploymentRequests() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const { data: reqs = [], isLoading, refetch } = useQuery({
    queryKey: ['deployment-requests', filter],
    queryFn: async () => {
      const r = await deploymentRequestsAPI.list(filter !== 'all' ? filter : undefined);
      return r.data;
    },
    refetchInterval: 5000,
  });

  const counts = {
    total: reqs.length,
    pending: reqs.filter(r=>r.status==='pending').length,
    analyzing: reqs.filter(r=>r.status==='analyzing').length,
    completed: reqs.filter(r=>r.status==='completed').length,
  };

  const fmt = iso => iso ? new Date(iso).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';

  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="Incoming Deployment Requests" subtitle={`${counts.total} total · ${counts.pending} pending · ${counts.analyzing} analyzing`}>
        <button onClick={()=>navigate('/order')} className="btn-secondary"><Plus size={15}/> New Request</button>
        <button onClick={()=>refetch()} className="btn-secondary"><RefreshCw size={15}/> Refresh</button>
      </PageHeader>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {[
          {label:'Total',     value:counts.total,     color:'text-white'},
          {label:'Pending',   value:counts.pending,   color:'text-brand-400'},
          {label:'Analyzing', value:counts.analyzing, color:'text-sage-400'},
          {label:'Completed', value:counts.completed, color:'text-emerald-400'},
        ].map(({label,value,color})=>(
          <div key={label} className="bg-panel border border-line rounded-xl p-4">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-slate-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {['all','pending','analyzing','completed'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${filter===f?'bg-brand-600 text-ink':'bg-panel border border-line text-slate-400 hover:text-white'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-panel border border-line rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-inset border-b border-line">
            <tr>
              {['Request ID','Customer','Service','Job Type','CPU','RAM','Priority','Status','Created','Actions'].map(h=>(
                <th key={h} className="table-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={10} className="py-10"><LoadingSpinner/></td></tr>
            ) : reqs.length === 0 ? (
              <tr><td colSpan={10}><EmptyState icon={Inbox} title="No deployment requests" message="Submit a request from the Demo Order Portal to get started."/></td></tr>
            ) : reqs.map(req=>(
              <tr key={req.id} className="table-row">
                <td className="table-td"><span className="font-mono text-xs text-brand-400">{req.request_id}</span></td>
                <td className="table-td">
                  <div className="text-sm text-white font-medium">{req.customer_name}</div>
                  <div className="text-xs text-slate-500">{req.customer_email}</div>
                </td>
                <td className="table-td">
                  <div className="text-sm text-white">{req.service_name}</div>
                  <div className="text-xs text-slate-500 capitalize">{req.service_type}</div>
                </td>
                <td className="table-td"><span className="text-xs bg-line border border-edge px-2 py-0.5 rounded text-slate-300">{req.job_type}</span></td>
                <td className="table-td text-slate-300">{req.required_cpu} vCPU</td>
                <td className="table-td text-slate-300">{req.required_ram_gb} GB</td>
                <td className="table-td"><span className={`text-xs font-semibold uppercase ${PRIORITY_CLR[req.priority]||'text-slate-400'}`}>{req.priority}</span></td>
                <td className="table-td"><Badge status={req.status}/></td>
                <td className="table-td">
                  <div className="flex items-center gap-1 text-xs text-slate-400"><Clock size={11}/>{fmt(req.created_at)}</div>
                </td>
                <td className="table-td">
                  {(req.status==='pending'||req.status==='analyzing') && (
                    <button onClick={()=>navigate(`/app/schedule/${req.request_id}`)}
                      className="bg-brand-600/20 hover:bg-brand-600/40 text-brand-400 border border-brand-500/30 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
                      <Brain size={12}/> Open Request
                    </button>
                  )}
                  {req.status==='completed' && <span className="text-xs text-emerald-400">✅ Deployed</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
