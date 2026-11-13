import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Activity, Brain, Check, ChevronRight, DollarSign, FlaskConical, Menu, MessageSquare, Play, Server, ShieldCheck, X, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const features = [
  { icon: Brain, title: 'Give every workload its best home.', label: 'SMART SCHEDULING', text: 'Compare node suitability and resource availability, then review the AI recommendation before you deploy.' },
  { icon: ShieldCheck, title: 'See the signals. Stay ahead.', label: 'PREDICTIVE OPERATIONS', text: 'Explore failure risk and the factors behind it. Bring the nodes that need attention into focus.' },
  { icon: DollarSign, title: 'Make room for more efficiency.', label: 'COST OPTIMIZATION', text: 'Identify underused capacity and review recommendations to keep running, sleep, or shut down.' },
  { icon: Activity, title: 'One view. The whole cluster.', label: 'LIVE VISIBILITY', text: 'Follow utilization, health, power, and alerts in a dashboard that refreshes as your demo evolves.' },
  { icon: FlaskConical, title: 'Try the next move before you make it.', label: 'WHAT-IF SIMULATION', text: 'Explore future deployments, compare plans, and understand capacity pressure before committing.' },
  { icon: MessageSquare, title: 'Ask questions. Find context.', label: 'AI COPILOT', text: 'Explore your cluster with a conversational assistant, backed by a built-in fallback when Gemini is unavailable.' },
];
const previews = [
  { id: 'overview', title: 'Cluster overview', text: 'From a cluster-wide view to individual node health, keep the details that matter in one place.' },
  { id: 'scheduling', title: 'Smart scheduling', text: 'Compare available capacity and review recommended placement before approving a deployment.' },
  { id: 'predictions', title: 'Predictive operations', text: 'Understand risk signals and focus your attention on the infrastructure that needs it.' },
];

function Brand() {
  return <span className="lp-brand"><span className="lp-brand-icon"><Zap size={20} fill="currentColor" /></span>ClusterSense<span className="lp-ai">AI</span></span>;
}

export default function Landing() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const demoPath = user ? '/app/dashboard' : '/login';
  const preview = previews[selected];
  const DemoLink = ({ className = '' }) => <Link to={demoPath} className={`lp-button ${className}`}><Play size={15} fill="currentColor" />Live Demo<ArrowUpRight size={17} /></Link>;

  return (
    <div className="landing-page" id="top">
      <a className="lp-skip" href="#main">Skip to content</a>
      <header className="lp-header">
        <div className="lp-container lp-nav">
          <Link to="/" aria-label="ClusterSense AI home"><Brand /></Link>
          <nav aria-label="Main navigation" className={`lp-links ${menuOpen ? 'is-open' : ''}`}>
            {[['Features', '#features'], ['Platform preview', '#platform'], ['Why ClusterSense', '#benefits']].map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
          </nav>
          <div className="lp-nav-actions"><Link className="lp-signin" to={demoPath}>{user ? 'Dashboard' : 'Sign in'}<ArrowRight size={14} /></Link><DemoLink /><button className="lp-menu" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div>
        </div>
      </header>

      <main id="main">
        <section className="lp-hero lp-container">
          <div className="lp-hero-copy">
            <span className="lp-eyebrow"><span className="lp-dot" />INTELLIGENCE FOR YOUR INFRASTRUCTURE</span>
            <h1>Less guesswork.<br />More <span>cluster sense.</span></h1>
            <p>Your infrastructure has a lot to tell you. Turn its signals into smarter deployments, clearer decisions, and better use of every server.</p>
            <div className="lp-hero-actions"><DemoLink /><a className="lp-text-link" href="#platform">Explore the platform <ArrowRight size={17} /></a></div>
            <div className="lp-hero-note"><ShieldCheck size={15} /> Administrator-led. AI-assisted. Always in control.</div>
          </div>
          <div className="lp-hero-visual">
            <div className="lp-orbit" aria-hidden="true" />
            <div className="lp-visual-label"><span className="lp-dot" /> YOUR CLUSTER. CONNECTED.</div>
            <div className="lp-browser"><div className="lp-browser-bar"><span /><span /><span /><span className="lp-browser-title">ClusterSense AI / Overview</span><ShieldCheck size={12} /></div><img src="/previews/overview.svg" width="1200" height="750" alt="Illustrative ClusterSense dashboard showing server health, utilization trends, and node status" fetchPriority="high" /></div>
            <div className="lp-insight"><span className="lp-insight-icon"><Brain size={22} /></span><div><strong>A little intelligence. A bigger picture.</strong><span>Scheduling, risk, and costs — connected.</span></div><Check size={16} /></div>
            <p className="lp-preview-note">Illustrative interface · Demo data</p>
          </div>
        </section>

        <div className="lp-capabilities"><div className="lp-container"><span>ONE CONNECTED WORKSPACE</span>{[[Server, 'Infrastructure'], [Brain, 'Intelligence'], [ShieldCheck, 'Resilience'], [DollarSign, 'Efficiency']].map(([Icon, text]) => <div key={text}><Icon size={19} />{text}</div>)}</div></div>

        <section className="lp-section lp-container" id="features">
          <div className="lp-section-heading"><div><span className="lp-eyebrow">BUILT FOR THE BIGGER PICTURE</span><h2>Complex infrastructure.<br /><span>Clear next steps.</span></h2></div><p>From the first deployment to the next capacity decision, bring your operations into one intelligent workspace.</p></div>
          <div className="lp-feature-grid">{features.map(({ icon: Icon, title, label, text }, i) => <article className="lp-feature" key={label}><div className="lp-feature-top"><span className="lp-feature-icon"><Icon size={22} /></span><span>0{i + 1}</span></div><span className="lp-feature-label">{label}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        </section>

        <section className="lp-platform" id="platform"><div className="lp-container lp-section">
          <div className="lp-centered-heading"><span className="lp-eyebrow">A CLOSER LOOK</span><h2>Meet your new <span>control center.</span></h2><p>Less jumping between tools. More understanding what happens next.</p></div>
          <div className="lp-tabs" role="tablist" aria-label="Platform previews">{previews.map((item, i) => <button key={item.id} id={`tab-${item.id}`} role="tab" aria-selected={selected === i} aria-controls="platform-panel" tabIndex={selected === i ? 0 : -1} onClick={() => setSelected(i)} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (i + (event.key === 'ArrowRight' ? 1 : 2)) % 3; setSelected(next); document.getElementById(`tab-${previews[next].id}`)?.focus(); } }}>{item.title}</button>)}</div>
          <figure id="platform-panel" role="tabpanel" aria-labelledby={`tab-${preview.id}`} className="lp-screenshot"><div className="lp-screenshot-top"><span><span className="lp-dot" />{preview.title}</span><span>PLATFORM PREVIEW</span></div><img src={`/previews/${preview.id}.svg`} width="1200" height="750" alt={`${preview.title} interface illustration with sample infrastructure metrics`} loading="lazy" /><figcaption><span>{preview.text}</span><span>Illustrative interface · Demo data</span></figcaption></figure>
        </div></section>

        <section className="lp-section lp-container lp-benefits" id="benefits">
          <div><span className="lp-eyebrow">THE HUMAN SIDE OF SMARTER OPERATIONS</span><h2>More clarity.<br />Less firefighting.<br /><span>Room to move forward.</span></h2><p>Good infrastructure decisions start with context. ClusterSense brings the signals and recommendations together, while you make the call.</p><a href="#get-started" className="lp-text-link">See it for yourself <ArrowRight size={17} /></a></div>
          <div className="lp-benefit-list">{[['01', 'Deploy with confidence', 'Review resource fit and AI recommendations before approving a deployment.'], ['02', 'Put your attention where it matters', 'Bring node health and emerging risk into the same conversation.'], ['03', 'Make capacity go further', 'Explore utilization, compare future scenarios, and find opportunities to reduce waste.']].map(([n, title, text]) => <article key={n}><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div><ChevronRight size={18} /></article>)}</div>
        </section>

        <section className="lp-container lp-cta-wrap" id="get-started"><div className="lp-cta"><span className="lp-eyebrow"><span className="lp-dot" /> YOUR NEXT SMARTER MOVE</span><h2>Get a feel for<br />infrastructure intelligence.</h2><p>Explore the ClusterSense AI software and its demo workflows.</p><DemoLink /><span className="lp-cta-note">Administrator sign-in required · Simulated infrastructure</span></div></section>
      </main>
      <footer className="lp-container lp-footer"><div><Link to="/" aria-label="ClusterSense AI home"><Brand /></Link><p>Clarity for every cluster.</p></div><div className="lp-footer-links"><a href="#features">Features</a><a href="#platform">Platform preview</a><Link to={demoPath}>Open software <ArrowUpRight size={13} /></Link></div><div className="lp-footer-bottom"><span>© {new Date().getFullYear()} ClusterSense AI</span><span>Built for HostNova Cloud · Infrastructure management demo</span></div></footer>
    </div>
  );
}
