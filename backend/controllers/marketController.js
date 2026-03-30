const { startScenario, nextStep, getCurrentState } = require('../services/scenarioEngine');
const { getCompanyNews } = require('../services/finnhubService');

exports.startScenario = async (req, res) => {
  try {
    const { userId, scenarioId, symbol } = req.body;
    const result = await startScenario(userId, scenarioId, symbol);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.nextStep = (req, res) => {
  try {
    const { userId } = req.params;
    const result = nextStep(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCurrentState = (req, res) => {
  try {
    const { userId } = req.params;
    const state = getCurrentState(userId);
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getNews = async (req, res) => {
  try {
    const { symbol, from, to } = req.query;
    const news = await getCompanyNews(symbol, from, to);
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
