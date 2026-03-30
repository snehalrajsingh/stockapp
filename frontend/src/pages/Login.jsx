import React, { useState } from 'react';
import { userAPI } from '../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await userAPI.login(email);
      onLogin(user._id);
    } catch (err) {
      alert("Error logging in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div className="card" style={{ width: '400px' }}>
        <h1 style={{ textAlign: 'center', color: 'var(--primary)' }}>StockLearn AI</h1>
        <p style={{ textAlign: 'center', marginBottom: '24px' }}>Enter email to continue</p>
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            placeholder="Email address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Loading...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
