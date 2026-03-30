import React, { useEffect, useState } from 'react';
import { tradeAPI, marketAPI } from '../services/api';

export default function Portfolio({ userId }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(0);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const p = await tradeAPI.getPortfolio(userId);
      setPortfolio(p);
      
      const state = await marketAPI.getState(userId);
      if (state && state.candle) {
        setCurrentPrice(state.candle.c);
      }
    } catch(e) {}
    setLoading(false);
  };

  if (loading) return <p>Loading portfolio...</p>;
  if (!portfolio) return <p>No portfolio found.</p>;

  return (
    <div>
      <h1>My Portfolio</h1>
      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="card">
          <h3>Total Investment (Cost)</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>${portfolio.totalInvestment.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Current Active Scenario Price</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>${currentPrice ? currentPrice.toFixed(2) : 'N/A'}</p>
        </div>
      </div>

      <div className="card">
        <h3>Holdings</h3>
        {portfolio.stocks.length === 0 ? (
          <p>No active holdings.</p>
        ) : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '16px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '8px 0' }}>Symbol</th>
                <th>Quantity</th>
                <th>Avg. Buy Price</th>
                <th>Current Value (Est.)</th>
                <th>P&L</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.stocks.map((stock, i) => {
                const isCurrentStock = currentPrice > 0;
                const estValue = isCurrentStock ? currentPrice * stock.quantity : stock.averagePrice * stock.quantity;
                const pnl = estValue - (stock.averagePrice * stock.quantity);
                const pnlClass = pnl >= 0 ? 'profit-text' : 'loss-text';

                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 0', fontWeight: 'bold' }}>{stock.symbol}</td>
                    <td>{stock.quantity}</td>
                    <td>${stock.averagePrice.toFixed(2)}</td>
                    <td>${estValue.toFixed(2)}</td>
                    <td className={pnlClass}>
                      {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
