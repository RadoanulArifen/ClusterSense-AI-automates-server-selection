import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Zap, Lock, Mail, Eye, EyeOff, AlertCircle, Play, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail]   = useState('');
  const [pw, setPw]         = useState('');
  const [show, setShow]     = useState(false);
  const [error, setError]   = useState('');
  const [demoStatus, setDemoStatus] = useState(null);
  const { login, demoLogin, loading }  = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    authAPI.demoOptions().then(({ data }) => { if (active) setDemoStatus(data.enabled); })
      .catch(() => { if (active) setDemoStatus(false); });
    return () => { active = false; };
  }, []);

  const enterDemo = async () => {
    setError('');
    const result = await demoLogin();
    if (result.success) navigate('/app/dashboard');
    else setError(result.error);
  };

  const submit = async (e) => {
    e.preventDefault(); setError('');
    const r = await login(email, pw);
    if (r.success) navigate('/app/dashboard');
    else setError(r.error);
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-600/8 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 mb-4 shadow-lg shadow-brand-500/30">
            <Zap size={28} className="text-ink" />
          </div>
          <h1 className="text-2xl font-bold text-white">ClusterSense AI</h1>
          <p className="text-slate-400 text-sm mt-1">HostNova Cloud — Infrastructure Admin Portal</p>
        </div>
        <div className="bg-panel border border-line rounded-2xl p-5 sm:p-8">
          <div className="border border-brand-500/25 bg-brand-500/5 rounded-xl p-5 mb-6">
            <span className="text-xs uppercase tracking-wider text-brand-400 flex items-center gap-2"><ShieldCheck size={15}/> Explore the software</span>
            <h2 className="text-xl font-semibold text-white mt-3">Take the full platform for a spin.</h2>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">Explore scheduling, predictions, cost insights, and simulated deployments. No credentials to type.</p>
            <button type="button" onClick={enterDemo} disabled={loading || demoStatus !== true}
              className="w-full mt-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-ink py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2">
              <Play size={16}/>{loading ? 'Signing in…' : 'Continue as Demo Admin'}
            </button>
            <p className="text-xs text-slate-400 mt-3" role="status">{demoStatus === null ? 'Checking demo availability…' : demoStatus ? 'Full administrator demo · Shared demo data · Changes are visible to other reviewers.' : 'One-click demo access is not enabled on this installation.'}</p>
            <p className="text-xs text-slate-500 mt-2">Administrator is the only supported role in this workspace.</p>
          </div>
          <h2 className="text-base font-semibold text-white mb-5">Or sign in with your account</h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input id="login-email" autoComplete="username" type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  className="w-full bg-inset border border-edge rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500" required />
              </div>
            </div>
            <div>
              <label htmlFor="login-password" className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input id="login-password" autoComplete="current-password" type={show?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)}
                  className="w-full bg-inset border border-edge rounded-lg pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-500" required />
                <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {show?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>
            {error && (
              <div role="alert" className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                <AlertCircle size={16} className="text-rose-400" />
                <p className="text-rose-400 text-sm">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-ink py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 mt-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Authenticating...</> : <><Lock size={16}/> Sign In</>}
            </button>
          </form>
          <p className="text-xs text-slate-500 mt-4">Use the administrator credentials provided during setup.</p>
        </div>
        <p className="text-center text-slate-600 text-xs mt-4">
          <button onClick={()=>navigate('/')} className="text-brand-400 hover:text-brand-300">← Back to ClusterSense AI</button>
        </p>
      </div>
    </div>
  );
}
