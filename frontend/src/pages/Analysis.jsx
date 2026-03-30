import React, { useEffect, useState } from 'react';
import { aiAPI, tradeAPI, marketAPI } from '../services/api';

export default function Analysis({ userId }) {
  const [behavior, setBehavior] = useState(null);
  const [chatLog, setChatLog] = useState([{ role: 'ai', content: "Hi! I'm your AI stock tutor. Ask me anything about your current active scenario or portfolio." }]);
  const [message, setMessage] = useState('');
  const [loadingMsg, setLoadingMsg] = useState(false);

  useEffect(() => {
    loadBehavior();
  }, [userId]);

  const loadBehavior = async () => {
    try {
      const res = await aiAPI.getBehaviorAnalysis(userId);
      setBehavior(res.analysis);
    } catch(e) {}
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!message) return;
    
    const newLog = [...chatLog, { role: 'user', content: message }];
    setChatLog(newLog);
    setMessage('');
    setLoadingMsg(true);
    
    try {
      // Mocked if no backend running since user device has no node. 
      // Assuming a running backend:
      const p = await tradeAPI.getPortfolio(userId).catch(() => null);
      const s = await marketAPI.getState(userId).catch(() => null);
      const res = await aiAPI.chat({
        question: message,
        portfolio: p,
        marketData: s
      });
      setChatLog([...newLog, { role: 'ai', content: res.reply }]);
    } catch(e) {
      setChatLog([...newLog, { role: 'ai', content: "Sorry, I couldn't understand that or API backend is not reachable." }]);
    }
    setLoadingMsg(false);
  };

  return (
    <div>
      <h1>AI Insights & Chat</h1>
      
      <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '12px' }}>
            🧠 Trading Behavior Analysis
          </h3>
          <p style={{ lineHeight: '1.6' }}>{behavior || "No trading behavior detected yet. Make some trades and get comprehensive AI feedback on your habits!"}</p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
          <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '12px' }}>
            💬 Chat with AI Advisor
          </h3>
          
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chatLog.map((log, i) => (
              <div key={i} style={{
                alignSelf: log.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: log.role === 'user' ? 'var(--primary)' : '#f3f4f6',
                color: log.role === 'user' ? 'white' : 'var(--text-main)',
                padding: '10px 14px',
                borderRadius: '12px',
                maxWidth: '85%',
                lineHeight: '1.4'
              }}>
                {log.content}
              </div>
            ))}
            {loadingMsg && <div style={{ alignSelf: 'flex-start', padding: '10px', color: 'var(--text-secondary)' }}>Typing... 💭</div>}
          </div>

          <form onSubmit={handleChat} style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            <input 
              type="text" 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              placeholder="Ask about your portfolio or market..." 
              style={{ padding: '12px', margin: 0, flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }}>Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
