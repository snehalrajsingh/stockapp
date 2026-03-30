import React, { useEffect, useState } from 'react';
import { marketAPI } from '../services/api';

export default function News({ userId }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNews();
  }, [userId]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const state = await marketAPI.getState(userId);
      if (state && state.symbol) {
        // Finnhub format YYYY-MM-DD. Simple fallback to real dates.
        const res = await marketAPI.getNews(state.symbol, '2023-01-01', '2023-01-10'); 
        setNews(res.slice(0, 10)); // take latest 10
      }
    } catch(e) {}
    setLoading(false);
  };

  return (
    <div>
      <h1>Market News</h1>
      {loading ? <p>Loading news...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {news.length === 0 ? <p className="card">No active scenario found or no news available. Start a scenario to see related company news.</p> : null}
          {news.map((item, i) => (
            <div key={i} className="card">
              <h3 style={{ color: 'var(--primary)', marginBottom: '8px' }}>{item.headline}</h3>
              <p style={{ display: 'block', marginBottom: '12px' }}>{item.summary}</p>
              <a href={item.url} target="_blank" rel="noreferrer" style={{ fontSize: '14px', color: '#6B7280', textDecoration: 'underline' }}>Read more</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
