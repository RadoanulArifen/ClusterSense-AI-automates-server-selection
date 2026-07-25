import { useState, useRef, useEffect } from 'react';
import { copilotAPI } from '../services/api';
import { Send, Bot, User, Loader2, RefreshCw, Sparkles } from 'lucide-react';

const PROMPTS = [
  "Why is the cluster showing critical alerts?",
  "Which nodes are at high failure risk?",
  "How can we reduce infrastructure costs?",
  "Summarize the current cluster status",
];

const WELCOME = `👋 **Hello, Infrastructure Admin!**

I'm ClusterSense AI Assistant, trained on 65,000 real infrastructure records across 3 datasets.

I can help you with:
- 🔍 Node health diagnosis (98.6% accuracy failure model)
- 🧠 Explaining AI scheduling decisions (92.6% accuracy)
- 📊 Cluster status summaries
- 🚀 Deployment recommendations
- 💰 Cost optimization (99.9% accuracy)
- 🔮 Predictive failure analysis

Try a quick prompt below, or ask me anything!`;

function Msg({ m }) {
  const isBot = m.role === 'assistant';
  return (
    <div className={`flex gap-3 ${isBot?'':'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${isBot?'bg-violet-500/20 border border-violet-500/30':'bg-blue-600'}`}>
        {isBot ? <Bot size={16} className="text-violet-400"/> : <User size={16} className="text-white"/>}
      </div>
      <div className={`max-w-[80%] ${isBot?'':'items-end flex flex-col'}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isBot?'bg-[#111b35] border border-[#162040] text-slate-200 rounded-tl-sm':'bg-blue-600 text-white rounded-tr-sm'}`}>
          {isBot ? (
            <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{__html: m.content
              .replace(/\*\*(.*?)\*\*/g,'<strong class="text-white">$1</strong>')
              .replace(/`(.*?)`/g,'<code class="bg-[#0a0f1e] px-1 py-0.5 rounded text-blue-300 text-xs font-mono">$1</code>')
              .replace(/\n/g,'<br/>')}}/>
          ) : m.content}
        </div>
        {isBot && m.model && <div className="text-xs text-slate-600 mt-1 px-1">{m.model==='gemini-1.5-flash'?'✨ Gemini AI':'🤖 ClusterSense Engine'}</div>}
      </div>
    </div>
  );
}

export default function AICopilot() {
  const [messages, setMessages] = useState([{id:1,role:'assistant',content:WELCOME,model:'system'}]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); },[messages]);

  const send = async (text) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput('');
    setMessages(p=>[...p,{id:Date.now(),role:'user',content:q}]);
    setLoading(true);
    try {
      const res = await copilotAPI.chat(q);
      setMessages(p=>[...p,{id:Date.now()+1,role:'assistant',content:res.data.response,model:res.data.model}]);
    } catch {
      setMessages(p=>[...p,{id:Date.now()+1,role:'assistant',content:'⚠️ Unable to reach the AI backend.',model:'error'}]);
    } finally { setLoading(false); inputRef.current?.focus(); }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center"><Sparkles size={20} className="text-violet-400"/></div>
          <div><h1 className="text-xl font-bold text-white">AI Assistant</h1><p className="text-xs text-slate-400">Google Gemini · Falls back to ClusterSense Engine</p></div>
        </div>
        <button onClick={()=>setMessages([{id:1,role:'assistant',content:WELCOME,model:'system'}])} className="btn-secondary text-xs"><RefreshCw size={13}/> Clear</button>
      </div>

      <div className="flex-1 bg-[#0d1428] border border-[#162040] rounded-xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map(m=><Msg key={m.id} m={m}/>)}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center"><Bot size={16} className="text-violet-400"/></div>
              <div className="bg-[#111b35] border border-[#162040] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 size={16} className="text-violet-400 animate-spin"/><span className="text-slate-400 text-sm">Analyzing cluster data...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>
        <div className="px-4 py-3 border-t border-[#162040] flex gap-2 flex-wrap">
          {PROMPTS.map(p=>(
            <button key={p} onClick={()=>send(p)} disabled={loading} className="text-xs bg-[#111b35] hover:bg-[#162040] border border-[#162040] text-slate-400 hover:text-white px-3 py-1.5 rounded-lg disabled:opacity-50">{p}</button>
          ))}
        </div>
        <div className="px-4 pb-4">
          <div className="flex gap-3 bg-[#111b35] border border-[#1e2d52] rounded-xl p-2">
            <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
              placeholder="Ask about your cluster, nodes, deployments, costs..."
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 resize-none focus:outline-none max-h-28 min-h-[36px] py-1 px-2" rows={1} disabled={loading}/>
            <button onClick={()=>send()} disabled={!input.trim()||loading} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white p-2.5 rounded-lg flex-shrink-0 self-end">
              {loading?<Loader2 size={18} className="animate-spin"/>:<Send size={18}/>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
