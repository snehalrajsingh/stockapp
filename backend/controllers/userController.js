const User = require('../models/User');
const Portfolio = require('../models/Portfolio');

exports.createUser = async (req, res) => {
  try {
    const { name, email, monthly_savings } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, monthly_savings, wallet_balance: monthly_savings });
      await Portfolio.create({ user: user._id, stocks: [], totalInvestment: 0 });
    }
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addSavings = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.wallet_balance += Number(amount);
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
