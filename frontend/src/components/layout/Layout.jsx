import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
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

  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef(null);
  const menuRef = useRef(null);
  const expanded = open || mobileOpen;

  useEffect(() => {
    if (!mobileOpen) return;
    const sidebar = sidebarRef.current;
    sidebar?.querySelector('button')?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
      if (event.key === 'Tab') {
        const items = [...sidebar.querySelectorAll('a, button')].filter(el => el.getClientRects().length);
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
      menuRef.current?.focus();
    };
  }, [mobileOpen]);

  return (
    <div className="app-shell flex overflow-hidden bg-canvas">
      <header className="app-mobile-header">
        <span className="flex items-center gap-2 font-semibold"><Zap size={20} className="text-brand-400"/>ClusterSense AI</span>
        <button ref={menuRef} type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation" aria-expanded={mobileOpen} aria-controls="app-sidebar"><Menu size={22}/></button>
      </header>
      {mobileOpen && <button className="app-sidebar-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)}/> }
      {/* Sidebar */}
      <aside id="app-sidebar" ref={sidebarRef} role={mobileOpen ? 'dialog' : undefined} aria-modal={mobileOpen || undefined} aria-label="Workspace navigation" className={`app-sidebar ${mobileOpen ? 'is-mobile-open' : ''} ${open ? 'w-64' : 'w-20'} flex-shrink-0 transition-all duration-300 bg-shell border-r border-line flex flex-col`}>
        {/* Logo */}
        <div className={`flex items-center border-b border-line ${expanded ? 'h-16 justify-between px-4' : 'flex-col gap-2 px-2 py-3'}`}>
          {expanded && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center"><Zap size={16} className="text-ink" /></div>
              <div><div className="text-sm font-bold text-white">ClusterSense</div><div className="text-xs text-brand-400">AI Platform</div></div>
            </div>
          )}
          {!expanded && <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center mx-auto"><Zap size={16} className="text-ink" /></div>}
          <button aria-label={expanded ? "Collapse navigation" : "Expand navigation"} onClick={() => { if (mobileOpen) setMobileOpen(false); else setOpen(!open); }} className="text-slate-400 hover:text-white p-1 rounded ml-auto">
            {expanded ? <X size={16}/> : <Menu size={16}/>}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label, badge }) => (
            <NavLink key={to} to={to} title={label} onClick={() => setMobileOpen(false)} className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30' : 'text-slate-400 hover:text-white hover:bg-line'
              }`}>
              <Icon size={18} className="flex-shrink-0" />
              {expanded && (
                <>
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${badge==='LIVE'?'bg-emerald-500/20 text-emerald-400 animate-pulse':'bg-sage-500/20 text-sage-400'}`}>{badge}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-line">
          {expanded ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-ink">{user?.full_name?.charAt(0)||'A'}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">{user?.full_name}</div>
                <div className="text-xs text-slate-500 truncate">{user?.email}</div>
              </div>
              <button aria-label="Sign out" onClick={() => { logout(); navigate('/'); }} className="text-slate-400 hover:text-rose-400 p-1"><LogOut size={16}/></button>
            </div>
          ) : (
            <button aria-label="Sign out" onClick={() => { logout(); navigate('/'); }} className="w-full flex justify-center text-slate-400 hover:text-rose-400 p-2"><LogOut size={16}/></button>
          )}
        </div>
      </aside>

      {/* Main */}
      <main id="app-content" inert={mobileOpen ? '' : undefined} className="app-content flex-1 min-w-0 overflow-y-auto"><Outlet /></main>
    </div>
  );
}
