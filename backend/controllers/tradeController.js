const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Trade = require('../models/Trade');
const { postTradeFeedback } = require('../services/openaiService');

exports.executeTrade = async (req, res) => {
  try {
    const { userId, symbol, type, quantity, price, marketTrend } = req.body;
    const user = await User.findById(userId);
    let portfolio = await Portfolio.findOne({ user: userId });
    
    if (!user || !portfolio) return res.status(404).json({ error: 'User/Portfolio not found' });

    const totalAmount = quantity * price;

    if (type === 'BUY') {
      if (user.wallet_balance < totalAmount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }
      user.wallet_balance -= totalAmount;
      portfolio.totalInvestment += totalAmount;

      const stockIndex = portfolio.stocks.findIndex(s => s.symbol === symbol);
      if (stockIndex >= 0) {
        const stock = portfolio.stocks[stockIndex];
        const newTotalQuantity = stock.quantity + quantity;
        const newTotalCost = (stock.quantity * stock.averagePrice) + totalAmount;
        stock.averagePrice = newTotalCost / newTotalQuantity;
        stock.quantity = newTotalQuantity;
      } else {
        portfolio.stocks.push({ symbol, quantity, averagePrice: price });
      }

    } else if (type === 'SELL') {
      const stockIndex = portfolio.stocks.findIndex(s => s.symbol === symbol);
      if (stockIndex === -1 || portfolio.stocks[stockIndex].quantity < quantity) {
        return res.status(400).json({ error: 'Insufficient stock quantity' });
      }
      const stock = portfolio.stocks[stockIndex];
      const buyPrice = stock.averagePrice;
      const profitLoss = (price - buyPrice) * quantity;
      
      user.wallet_balance += totalAmount;
      stock.quantity -= quantity;
      portfolio.totalInvestment -= (buyPrice * quantity);

      if (stock.quantity === 0) {
        portfolio.stocks.splice(stockIndex, 1);
      }

      const trade = await Trade.create({
        user: userId, symbol, type, quantity, price, totalAmount, profitLoss, marketTrend
      });

      try {
          const feedback = await postTradeFeedback('SELL', buyPrice, price, marketTrend || 'Neutral');
          trade.aiFeedback = feedback.explanation;
          await trade.save();
      } catch (e) { console.log('OpenAI Feedback skipped for trade'); }
      
      await user.save();
      await portfolio.save();
      
      return res.json({ message: 'Trade successful', trade, portfolio, user });
    }

    const trade = await Trade.create({
      user: userId, symbol, type, quantity, price, totalAmount, marketTrend
    });
    
    try {
        const feedback = await postTradeFeedback('BUY', price, 0, marketTrend || 'Neutral');
        trade.aiFeedback = feedback.explanation;
        await trade.save();
    } catch (e) { console.log('OpenAI Feedback skipped for trade'); }

    await user.save();
    await portfolio.save();

    res.json({ message: 'Trade successful', trade, portfolio, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.params.userId });
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTrades = async (req, res) => {
    try {
        const trades = await Trade.find({ user: req.params.userId }).sort({ createdAt: -1 });
        res.json(trades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
