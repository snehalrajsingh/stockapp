import React, { useEffect, useState } from 'react';
import { userAPI, marketAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Wallet, PiggyBank } from 'lucide-react';

export default function Dashboard({ userId }) {
  const [user, setUser] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      const data = await userAPI.getUser(userId);
      setUser(data);
    } catch (e) { console.error(e); }
  };

  const handleAddSavings = async (e) => {
    e.preventDefault();
    if (!amount) return;
    setLoading(true);
    try {
      await userAPI.addSavings(userId, Number(amount));
      setAmount('');
      loadUser();
    } catch (e) { alert('Error adding savings'); }
    setLoading(false);
  };

  const startScenario = async (scenarioId, symbol) => {
    try {
      await marketAPI.startScenario(userId, scenarioId, symbol);
      navigate('/trade');
    } catch (e) {
      alert('Error starting scenario: ' + e.message);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      
      <div className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Wallet color="var(--primary)" size={32} />
            <div>
              <h3>Wallet Balance</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                ${user.wallet_balance.toFixed(2)}
              </p>
            </div>
          </div>
          
          <form onSubmit={handleAddSavings} style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="number" 
              placeholder="Add funds..." 
              value={amount} 
              onChange={e => setAmount(e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>Add</button>
          </form>
        </div>

        <div className="card">
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <PiggyBank color="var(--profit)" size={32} />
            <div>
              <h3>Total Monthly Savings Setup</h3>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                ${user.monthly_savings.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: '32px', marginBottom: '16px' }}>Start a Learning Scenario</h2>
      <div className="grid-2">
        <div className="card" style={{ borderLeft: '4px solid var(--loss)' }}>
          <h3>COVID Crash (2020)</h3>
          <p>Experience the extreme volatility of the February 2020 market crash.</p>
          <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Note: May require paid Finnhub tier</p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline" onClick={() => startScenario('COVID', 'AAPL')}>AAPL</button>
            <button className="btn btn-outline" onClick={() => startScenario('COVID', 'TSLA')}>TSLA</button>
          </div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--profit)' }}>
          <h3>Bull Run (2021)</h3>
          <p>Learn to ride the trend during the massive 2021 tech bull run.</p>
          <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Note: May require paid Finnhub tier</p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline" onClick={() => startScenario('BULL', 'MSFT')}>MSFT</button>
            <button className="btn btn-outline" onClick={() => startScenario('BULL', 'NVDA')}>NVDA</button>
          </div>
        </div>
      </div>

      <h2 style={{ marginTop: '32px', marginBottom: '16px' }}>Recent Scenarios (Free Tier)</h2>
      <div className="grid-2">
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <h3>2023 Bull Run</h3>
          <p>Post-pandemic recovery and AI boom. Best for free tier users.</p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline" onClick={() => startScenario('RECENT_BULL', 'AAPL')}>AAPL</button>
            <button className="btn btn-outline" onClick={() => startScenario('RECENT_BULL', 'MSFT')}>MSFT</button>
            <button className="btn btn-outline" onClick={() => startScenario('RECENT_BULL', 'NVDA')}>NVDA</button>
          </div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <h3>2024 Market</h3>
          <p>Most recent data available. Full year coverage.</p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button className="btn btn-outline" onClick={() => startScenario('RECENT_2024', 'AAPL')}>AAPL</button>
            <button className="btn btn-outline" onClick={() => startScenario('RECENT_2024', 'GOOGL')}>GOOGL</button>
            <button className="btn btn-outline" onClick={() => startScenario('RECENT_2024', 'AMZN')}>AMZN</button>
          </div>
        </div>
      </div>
    </div>
  );
}
