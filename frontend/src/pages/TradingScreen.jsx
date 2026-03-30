import React, { useEffect, useState } from 'react';
import { marketAPI, tradeAPI, aiAPI, userAPI } from '../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function TradingScreen({ userId }) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [wallet, setWallet] = useState(0);

  useEffect(() => {
    loadState();
    loadWallet();
  }, [userId]);

  const loadState = async () => {
    try {
      setLoading(true);
      const res = await marketAPI.getState(userId);
      if (res && res.history) {
        setState(res);
      } else {
        setState(null);
      }
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const loadWallet = async () => {
     try {
       const u = await userAPI.getUser(userId);
       setWallet(u.wallet_balance);
     } catch(e) {}
  };

  const handleNextStep = async () => {
    try {
      const res = await marketAPI.nextStep(userId);
      if (res.done) alert("Scenario Complete!");
      else {
        setState(res);
        getExplanation(res);
      }
    } catch(e) {}
  };

  const getExplanation = async (currentState) => {
    if (!currentState.indicators) return;
    try {
      setAiExplanation({ loading: true });
      const { rsi, trend } = currentState.indicators;
      const res = await aiAPI.explainChart({
        rsi, 
        trend: trend || 'Neutral', 
        priceMovement: `Closing price is ${currentState.candle.c}`
      });
      setAiExplanation(res);
    } catch(e) {
      setAiExplanation({ explanation: "Failed to load explanation." });
    }
  };

  const executeTrade = async (type) => {
    try {
      await tradeAPI.execute({
        userId,
        symbol: state.symbol || 'AAPL',
        type,
        quantity: Number(quantity),
        price: state.candle.c,
        marketTrend: state.indicators?.trend || 'Neutral'
      });
      alert(`${type} successful!`);
      loadWallet();
    } catch(e) {
      alert(e.response?.data?.error || "Trade failed");
    }
  };

  if (loading) return <p>Loading market data...</p>;
  if (!state) return <p>No active scenario. Go to Dashboard to start one.</p>;

  const currentPrice = state.candle.c;
  const labels = state.history.map((_, i) => i.toString());
  const data = {
    labels,
    datasets: [
      {
        label: 'Closing Price',
        data: state.history.map(c => c.c),
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1>Trading: {state.symbol || 'Stock'}</h1>
        <button className="btn btn-primary" onClick={handleNextStep}>Advance Day &gt;</button>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="card" style={{ height: '400px' }}>
          <Line options={options} data={data} />
        </div>

        <div>
          <div className="card">
             <h3>Trade Execution</h3>
             <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '16px 0' }}>Current Price: ${currentPrice.toFixed(2)}</p>
             <p>Wallet Balance: ${wallet.toFixed(2)}</p>
             
             <div style={{ marginTop: '16px' }}>
               <label style={{ display: 'block', marginBottom: '8px' }}>Quantity</label>
               <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" />
             </div>

             <div className="grid-2" style={{ marginTop: '16px' }}>
               <button className="btn btn-success" onClick={() => executeTrade('BUY')}>BUY</button>
               <button className="btn btn-danger" onClick={() => executeTrade('SELL')}>SELL</button>
             </div>
          </div>

          <div className="card">
             <h3>Indicators</h3>
             <ul style={{ listStyle: 'none', padding: 0, marginTop: '12px', lineHeight: '1.8' }}>
               <li><strong>RSI:</strong> {state.indicators?.rsi || 'N/A'}</li>
               <li><strong>Moving Average:</strong> {state.indicators?.ma || 'N/A'}</li>
               <li><strong>Trend:</strong> {state.indicators?.trend || 'N/A'}</li>
             </ul>
             {state.indicators?.hint && (
               <p style={{ marginTop: '12px', color: 'var(--loss)', fontWeight: 'bold' }}>💡 Hint: {state.indicators.hint}</p>
             )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '16px' }}>
         <h3>🤖 AI Chart Analysis</h3>
         {aiExplanation?.loading ? (
           <p>Analyzing chart patterns... 🤔</p>
         ) : (
           <p style={{ marginTop: '8px' }}>{aiExplanation?.explanation || "No explanation available. Advance day to get analysis."}</p>
         )}
      </div>
    </div>
  );
}
