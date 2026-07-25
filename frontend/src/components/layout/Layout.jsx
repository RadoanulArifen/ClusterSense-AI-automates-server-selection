import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { LayoutDashboard, Inbox, Brain, DollarSign, MessageSquare, FlaskConical, ClipboardCheck, LogOut, Zap, X, Menu } from 'lucide-react';

const NAV = [
  { to: '/app/dashboard',   icon: LayoutDashboard, label: 'Live Dashboard',       badge: 'LIVE' },
  { to: '/app/requests',    icon: Inbox,            label: 'Deployment Requests'              },
  { to: '/app/predictions', icon: Brain,            label: 'Predictive Ops',       badge: 'AI' },
  { to: '/app/cost',        icon: DollarSign,       label: 'Cost Optimization',    badge: 'AI' },
  { to: '/app/outcomes',    icon: ClipboardCheck,   label: 'Outcome History'                 },
  { to: '/app/copilot',     icon: MessageSquare,    label: 'AI Assistant',           badge: 'AI' },
  { to: '/app/simulator',   icon: FlaskConical,     label: 'What-if Simulator'                },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-[#020408]">
      {/* Sidebar */}
      <aside className={`${open ? 'w-64' : 'w-16'} flex-shrink-0 transition-all duration-300 bg-[#0a0f1e] border-r border-[#162040] flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#162040]">
          {open && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><Zap size={16} className="text-white" /></div>
              <div><div className="text-sm font-bold text-white">ClusterSense</div><div className="text-xs text-blue-400">AI Platform</div></div>
            </div>
          )}
          {!open && <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center mx-auto"><Zap size={16} className="text-white" /></div>}
          <button onClick={() => setOpen(!open)} className="text-slate-400 hover:text-white p-1 rounded ml-auto">
            {open ? <X size={16}/> : <Menu size={16}/>}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label, badge }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-[#162040]'
              }`}>
              <Icon size={18} className="flex-shrink-0" />
              {open && (
                <>
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${badge==='LIVE'?'bg-emerald-500/20 text-emerald-400 animate-pulse':'bg-violet-500/20 text-violet-400'}`}>{badge}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-[#162040]">
          {open ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">{user?.full_name?.charAt(0)||'A'}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">{user?.full_name}</div>
                <div className="text-xs text-slate-500 truncate">{user?.email}</div>
              </div>
              <button onClick={() => { logout(); navigate('/'); }} className="text-slate-400 hover:text-rose-400 p-1"><LogOut size={16}/></button>
            </div>
          ) : (
            <button onClick={() => { logout(); navigate('/'); }} className="w-full flex justify-center text-slate-400 hover:text-rose-400 p-2"><LogOut size={16}/></button>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto"><Outlet /></main>
    </div>
  );
}
