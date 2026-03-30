const { explainChart, chatbotResponse, analyzeBehavior } = require('../services/openaiService');
const Trade = require('../models/Trade');

exports.getChartExplanation = async (req, res) => {
  try {
    const { rsi, trend, priceMovement } = req.body;
    const explanation = await explainChart(rsi, trend, priceMovement);
    res.json(explanation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.chat = async (req, res) => {
  try {
    const { question, portfolio, marketData } = req.body;
    const reply = await chatbotResponse(question, portfolio, marketData);
    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBehaviorAnalysis = async (req, res) => {
  try {
    const { userId } = req.params;
    const trades = await Trade.find({ user: userId }).sort({ createdAt: -1 }).limit(10);
    const analysis = await analyzeBehavior(trades);
    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
