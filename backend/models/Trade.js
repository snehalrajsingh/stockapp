const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  profitLoss: { type: Number, default: 0 },
  marketTrend: { type: String },
  aiFeedback: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Trade', tradeSchema);
