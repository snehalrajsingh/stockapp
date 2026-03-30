import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const userAPI = {
  login: async (email) => {
    const res = await api.post('/user/create', { name: email.split('@')[0], email, monthly_savings: 1000 });
    return res.data;
  },
  getUser: async (userId) => {
    const res = await api.get(`/user/${userId}`);
    return res.data;
  },
  addSavings: async (userId, amount) => {
    const res = await api.post('/user/savings', { userId, amount });
    return res.data;
  }
};

export const marketAPI = {
  startScenario: async (userId, scenarioId, symbol) => {
    const res = await api.post('/market/scenario/start', { userId, scenarioId, symbol });
    return res.data;
  },
  nextStep: async (userId) => {
    const res = await api.post(`/market/scenario/next/${userId}`);
    return res.data;
  },
  getState: async (userId) => {
    const res = await api.get(`/market/scenario/state/${userId}`);
    return res.data;
  },
  getNews: async (symbol, from, to) => {
    const res = await api.get(`/market/news`, { params: { symbol, from, to } });
    return res.data;
  }
};

export const tradeAPI = {
  execute: async (data) => {
    const res = await api.post('/trade/execute', data);
    return res.data;
  },
  getPortfolio: async (userId) => {
    const res = await api.get(`/trade/portfolio/${userId}`);
    return res.data;
  },
  getHistory: async (userId) => {
    const res = await api.get(`/trade/history/${userId}`);
    return res.data;
  }
};

export const aiAPI = {
  explainChart: async (data) => {
    const res = await api.post('/ai/explain-chart', data);
    return res.data;
  },
  chat: async (data) => {
    const res = await api.post('/ai/chat', data);
    return res.data;
  },
  getBehaviorAnalysis: async (userId) => {
    const res = await api.get(`/ai/behavior/${userId}`);
    return res.data;
  }
};
