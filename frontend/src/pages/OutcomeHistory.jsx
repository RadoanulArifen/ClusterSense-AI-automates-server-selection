import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ClipboardCheck } from 'lucide-react';
import { outcomesAPI } from '../services/api';
import { PageHeader } from '../components/ui/index.jsx';
import OutcomeHistoryTable from '../components/ui/OutcomeHistoryTable.jsx';

const FILTERS = [
  { label: 'All', onClick: (setModule, setStatus) => { setModule(''); setStatus(''); } },
  { label: 'Scheduling', module: 'scheduling' },
  { label: 'Cost Optimization', module: 'cost_optimization' },
  { label: 'GOOD', status: 'GOOD' },
  { label: 'MIXED', status: 'MIXED' },
  { label: 'POOR', status: 'POOR' },
];

export default function OutcomeHistory() {
  const [module, setModule] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const { data: records = [], isLoading } = useQuery({
    queryKey: ['outcome-records', module, status, search],
    queryFn: async () => { const r = await outcomesAPI.list({ module, status, search }); return r.data; },
  });
  const isActive = filter => (filter.module ? module === filter.module : filter.status ? status === filter.status : !module && !status);

  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="Outcome History" subtitle="Simulated results from Scheduling and Cost Optimization recommendations"/>

      <div className="bg-panel border border-line rounded-xl p-4 mb-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(filter=><button key={filter.label} onClick={() => {
              if (filter.onClick) return filter.onClick(setModule, setStatus);
              if (filter.module) setModule(current => current === filter.module ? '' : filter.module);
              if (filter.status) setStatus(current => current === filter.status ? '' : filter.status);
            }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${isActive(filter) ? 'bg-brand-500/15 text-brand-300 border-brand-500/30' : 'bg-inset text-slate-400 border-line hover:text-white'}`}>{filter.label}</button>)}
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-inset text-slate-400 border-line">Newest First</span>
          </div>
          <div className="relative w-full lg:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search node or recommendation"
              className="w-full bg-inset border border-line rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"/>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3"><ClipboardCheck size={17} className="text-sage-400"/><h2 className="font-semibold text-white">Recommendation Outcome Records</h2><span className="text-xs text-slate-500">{records.length} records</span></div>
      <OutcomeHistoryTable records={records} loading={isLoading}/>
    </div>
  );
}
