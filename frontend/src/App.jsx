import { Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, LineChart, PieChart, Newspaper, BrainCircuit } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import TradingScreen from './pages/TradingScreen';
import Portfolio from './pages/Portfolio';
import News from './pages/News';
import Analysis from './pages/Analysis';
import Login from './pages/Login';
import { useState } from 'react';

function App() {
  const [userId, setUserId] = useState(localStorage.getItem('userId'));

  if (!userId) {
    return <Login onLogin={(id) => {
      localStorage.setItem('userId', id);
      setUserId(id);
    }} />
  }

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2>StockLearn AI</h2>
        <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/trade" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <LineChart size={20} /> Trade
        </NavLink>
        <NavLink to="/portfolio" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <PieChart size={20} /> Portfolio
        </NavLink>
        <NavLink to="/news" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Newspaper size={20} /> News
        </NavLink>
        <NavLink to="/analysis" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <BrainCircuit size={20} /> AI Analysis
        </NavLink>
        
        <div style={{ marginTop: 'auto' }}>
          <button className="btn btn-outline" style={{width: '100%'}} onClick={() => {
            localStorage.removeItem('userId');
            setUserId(null);
          }}>Logout</button>
        </div>
      </div>
      
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard userId={userId} />} />
          <Route path="/trade" element={<TradingScreen userId={userId} />} />
          <Route path="/portfolio" element={<Portfolio userId={userId} />} />
          <Route path="/news" element={<News userId={userId} />} />
          <Route path="/analysis" element={<Analysis userId={userId} />} />
        </Routes>
      </div>
    </div>
  )
}

export default App;
