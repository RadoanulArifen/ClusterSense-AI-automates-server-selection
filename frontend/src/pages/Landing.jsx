import { useNavigate } from 'react-router-dom';
import { Zap, Brain, Shield, DollarSign, Activity, FlaskConical, MessageSquare, Play, Lock, ArrowRight, CheckCircle, ChevronRight } from 'lucide-react';

const FEATURES = [
  { icon: Brain,         title: 'Smart Scheduling AI',        desc: 'RandomForest model (92.6% accuracy) trained on 20,000 real job assignments. Scores every node, picks the best.',  color:'blue',   badge:'92.6% accuracy' },
  { icon: Shield,        title: 'Predictive Failure Detection',desc: 'GradientBoosting (98.6%) trained on 25,000 real sensor records. Detects High/Medium/Low risk with full explainability.', color:'rose',   badge:'98.6% accuracy' },
  { icon: DollarSign,    title: 'Cost Optimization',           desc: 'GradientBoosting (99.9%) trained on 20,000 rows. Recommends Keep Running, Sleep Mode, or Shutdown per node.',  color:'emerald',badge:'99.9% accuracy' },
  { icon: MessageSquare, title: 'AI Assistant',                  desc: 'Google Gemini-powered assistant with full cluster context. Falls back to rule-based engine automatically.',         color:'violet', badge:'Gemini AI' },
  { icon: Activity,      title: 'Live Dashboard',              desc: 'Cluster metrics auto-refresh every 3 seconds. Animated charts update immediately after every deployment.',          color:'cyan',   badge:'3s refresh' },
  { icon: FlaskConical,  title: 'What-if Simulator',           desc: 'Predict CPU/RAM saturation, identify overloaded nodes, and plan capacity before deploying.',                      color:'amber',  badge:'Capacity Planning' },
];

const WORKFLOW = [
  { n:'01', t:'Order Arrives',    d:'Customer purchases hosting via HostNova portal' },
  { n:'02', t:'Request Queued',   d:'Deployment request stored in PostgreSQL queue' },
  { n:'03', t:'AI Scheduling',    d:'RandomForest scores all 20 nodes, picks the best' },
  { n:'04', t:'Admin Deploys',    d:'One-click deployment with confidence score shown' },
  { n:'05', t:'Dashboard Updates',d:'Live metrics reflect new resource usage instantly' },
  { n:'06', t:'AI Monitoring',    d:'GradientBoosting watches all nodes for failure risk' },
];

const CM = {
  blue:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  rose:    'bg-rose-500/10 text-rose-400 border-rose-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  violet:  'bg-violet-500/10 text-violet-400 border-violet-500/20',
  cyan:    'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  amber:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#020408] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020408]/80 backdrop-blur-xl border-b border-[#162040]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><Zap size={16} className="text-white"/></div>
            <span className="font-bold">ClusterSense <span className="text-blue-400">AI</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={()=>navigate('/order')} className="text-slate-400 hover:text-white text-sm px-4 py-2">Demo Portal</button>
            <button onClick={()=>navigate('/login')} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <Lock size={14}/> Admin Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"/>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8 text-sm text-blue-300">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"/>
            Trained on 65,000 real infrastructure records — 3 real CSV datasets
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="text-white">AI-Powered</span><br/>
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">Infrastructure</span><br/>
            <span className="text-white">Management</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            ClusterSense AI automates server selection, predicts failures, and optimises costs for HostNova Cloud — powered by 3 real ML models trained on production infrastructure data.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={()=>navigate('/order')} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 shadow-lg shadow-blue-500/25 hover:scale-105 transition-all">
              <Play size={18}/> Try Demo Portal
            </button>
            <button onClick={()=>navigate('/login')} className="bg-[#0d1428] border border-[#162040] hover:border-blue-500/50 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 hover:scale-105 transition-all">
              Admin Dashboard <ArrowRight size={18}/>
            </button>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
            {[['65k','Training Rows'],['3','Real Datasets'],['98.6%','Max Accuracy']].map(([v,l])=>(
              <div key={l} className="bg-[#0d1428] border border-[#162040] rounded-xl p-4">
                <div className="text-2xl font-black text-blue-400">{v}</div>
                <div className="text-xs text-slate-400 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Datasets callout */}
      <section className="py-12 px-6 bg-[#0a0f1e] border-y border-[#162040]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <div className="text-sm text-emerald-400 font-medium uppercase tracking-wider mb-2">Real Data — Not Synthetic</div>
            <h2 className="text-2xl font-bold text-white">3 Production Infrastructure Datasets</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { file:'failure_prediction.csv', rows:'25,000', model:'GradientBoosting', acc:'98.6%', target:'Low / Medium / High risk', color:'rose',
                cols:'node_id · cpu_usage_percent · ram_usage_percent · disk_usage_percent · network_usage_percent · active_jobs · idle_time_minutes · power_consumption_watts · temperature_celsius' },
              { file:'smart_scheduling.csv', rows:'20,000', model:'RandomForest', acc:'92.6%', target:'Node suitability score', color:'blue',
                cols:'job_type · cpu_required · memory_required_gb · estimated_runtime_minutes · priority · current_node_load · available_cpu_cores · available_memory_gb' },
              { file:'cost_optimization.csv', rows:'20,000', model:'GradientBoosting', acc:'99.9%', target:'Keep Running / Sleep Mode / Shutdown', color:'emerald',
                cols:'cpu_usage_percent · ram_usage_percent · active_jobs · idle_time_minutes · power_consumption_watts · utilization_score · monthly_cost_usd' },
            ].map(({file,rows,model,acc,target,color,cols})=>(
              <div key={file} className={`bg-[#0d1428] border border-${color}-500/20 rounded-xl p-5`}>
                <div className={`text-xs font-bold text-${color}-400 mb-2`}>{file}</div>
                <div className="text-white font-semibold mb-1">{rows} rows</div>
                <div className="text-xs text-slate-400 mb-3">{model} · <span className={`text-${color}-400 font-bold`}>{acc}</span></div>
                <div className="text-xs text-slate-500 mb-2">Target: <span className="text-slate-300">{target}</span></div>
                <div className="text-xs text-slate-600 font-mono leading-relaxed">{cols}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-sm text-blue-400 font-medium uppercase tracking-wider mb-3">Core Workflow</div>
            <h2 className="text-3xl font-bold text-white">End-to-End AI Infrastructure Management</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {WORKFLOW.map(({n,t,d},i)=>(
              <div key={n} className="relative bg-[#0d1428] border border-[#162040] rounded-xl p-5">
                <div className="text-4xl font-black text-blue-600/20 mb-2">{n}</div>
                <h3 className="font-semibold text-white mb-1">{t}</h3>
                <p className="text-xs text-slate-400">{d}</p>
                {i<WORKFLOW.length-1&&<ChevronRight size={16} className="absolute -right-3 top-1/2 -translate-y-1/2 text-blue-500/50 hidden md:block"/>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-[#0a0f1e]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Platform Features</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({icon:Icon,title,desc,color,badge})=>(
              <div key={title} className="bg-[#0d1428] border border-[#162040] rounded-xl p-5 hover:border-blue-500/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg border ${CM[color]}`}><Icon size={20}/></div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${CM[color]}`}>{badge}</span>
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Try ClusterSense AI Now</h2>
          <p className="text-slate-400 mb-8">Submit a deployment request through the demo portal and watch the full AI workflow in action.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={()=>navigate('/order')} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 hover:scale-105 transition-all shadow-lg shadow-blue-500/25">
              <Play size={18}/> Launch Demo
            </button>
            <button onClick={()=>navigate('/login')} className="bg-[#0d1428] border border-[#162040] hover:border-blue-500/40 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3">
              <Lock size={18}/> Admin Login
            </button>
          </div>
          <p className="text-slate-600 text-xs mt-5">Sign in with the administrator account configured during setup</p>
        </div>
      </section>

      <footer className="border-t border-[#162040] bg-[#070b16] px-6 pt-12 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><Zap size={16} className="text-white"/></div>
                <span className="font-bold text-white">HostNova <span className="text-blue-400">Cloud</span></span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">Reliable cloud hosting with intelligent infrastructure management built in.</p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/> All systems operational
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Hosting Platform</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <div>Managed cloud hosting</div>
                <div>AI-powered scheduling</div>
                <div>Predictive monitoring</div>
                <div>Cost optimization</div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Get Started</h3>
              <div className="flex flex-col items-start gap-2 text-sm">
                <button onClick={()=>navigate('/order')} className="text-slate-400 hover:text-blue-400 transition-colors">Deploy a workload</button>
                <button onClick={()=>navigate('/login')} className="text-slate-400 hover:text-blue-400 transition-colors">Infrastructure console</button>
                <span className="text-slate-400">24/7 infrastructure monitoring</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Built for Operations</h3>
              <p className="text-sm leading-relaxed text-slate-400">3 ML models analyze scheduling, failure risk, and cost efficiency across your cluster.</p>
              <p className="mt-3 text-xs text-slate-500">65,000 infrastructure records powering smarter hosting decisions.</p>
            </div>
          </div>

          <div className="mt-10 pt-5 border-t border-[#162040] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>© 2026 HostNova Cloud. AI-powered infrastructure management.</span>
            <span>ClusterSense AI · Secure deployment workflow</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
