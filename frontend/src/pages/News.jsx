import React, { useEffect, useState } from 'react';
import { marketAPI } from '../services/api';

export default function News({ userId }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState('');

  useEffect(() => {
    loadNews();
  }, [userId]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const state = await marketAPI.getState(userId);
      if (state && state.symbol) {
        setSymbol(state.symbol);
        // Get last 7 days of news
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const formatDate = (d) => d.toISOString().split('T')[0];
        const res = await marketAPI.getNews(state.symbol, formatDate(weekAgo), formatDate(today)); 
        setNews(res.slice(0, 10));
      }
    } catch(e) {
      console.error('Failed to load news:', e);
    }
    setLoading(false);
  };

  const refreshNews = () => {
    loadNews();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1>Market News {symbol && `- ${symbol}`}</h1>
        <button className="btn btn-outline" onClick={refreshNews} disabled={loading}>
          Refresh
        </button>
      </div>
      {loading ? <p>Loading news...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {news.length === 0 ? (
            <div className="card">
              <p>No news found. Try starting a scenario first or wait for market hours.</p>
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '8px' }}>
                Note: News is only available during market hours (Mon-Fri, 9:30 AM - 4:00 PM ET)
              </p>
            </div>
          ) : null}
          {news.map((item, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '8px' }}>{item.headline}</h3>
                {item.source && <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{item.source}</span>}
              </div>
              <p style={{ display: 'block', marginBottom: '12px' }}>{item.summary}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href={item.url} target="_blank" rel="noreferrer" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'underline' }}>
                  Read more →
                </a>
                {item.datetime && (
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                    {new Date(item.datetime * 1000).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
