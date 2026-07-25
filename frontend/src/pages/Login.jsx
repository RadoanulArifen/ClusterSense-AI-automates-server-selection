import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail]   = useState('admin@hostnova.com');
  const [pw, setPw]         = useState('password123');
  const [show, setShow]     = useState(false);
  const [error, setError]   = useState('');
  const { login, loading }  = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setError('');
    const r = await login(email, pw);
    if (r.success) navigate('/app/dashboard');
    else setError(r.error);
  };

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/8 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4 shadow-lg shadow-blue-500/30">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">ClusterSense AI</h1>
          <p className="text-slate-400 text-sm mt-1">HostNova Cloud — Infrastructure Admin Portal</p>
        </div>
        <div className="bg-[#0d1428] border border-[#162040] rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-6">Sign in to your account</h2>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  className="w-full bg-[#111b35] border border-[#1e2d52] rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={show?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)}
                  className="w-full bg-[#111b35] border border-[#1e2d52] rounded-lg pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {show?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                <AlertCircle size={16} className="text-rose-400" />
                <p className="text-rose-400 text-sm">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 mt-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Authenticating...</> : <><Lock size={16}/> Sign In</>}
            </button>
          </form>
          <div className="mt-6 pt-5 border-t border-[#162040]">
            <p className="text-xs text-slate-500 text-center mb-2">Demo credentials</p>
            <div className="bg-[#111b35] rounded-lg px-4 py-3 font-mono text-xs text-slate-300 space-y-1">
              <div><span className="text-slate-500">Email:</span> admin@hostnova.com</div>
              <div><span className="text-slate-500">Pass:</span>  password123</div>
            </div>
          </div>
        </div>
        <p className="text-center text-slate-600 text-xs mt-4">
          <button onClick={()=>navigate('/order')} className="text-blue-400 hover:text-blue-300">Try the Demo Portal</button>
        </p>
      </div>
    </div>
  );
}
