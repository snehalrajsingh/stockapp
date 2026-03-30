const fs = require('fs');
const path = require('path');
const { getCandles } = require('./finnhubService');

// A map to store active scenario per user.
const activeScenarios = {};

const SCENARIOS = {
  'COVID': {
    name: 'COVID crash (Feb 2020 – April 2020)',
    from: Math.floor(new Date('2020-02-01').getTime() / 1000),
    to: Math.floor(new Date('2020-04-30').getTime() / 1000)
  },
  'BULL': {
    name: 'Bull run (2021)',
    from: Math.floor(new Date('2021-01-01').getTime() / 1000),
    to: Math.floor(new Date('2021-12-31').getTime() / 1000)
  }
};

exports.startScenario = async (userId, scenarioId, symbol) => {
  const scenarioInfo = SCENARIOS[scenarioId];
  if (!scenarioInfo) throw new Error('Invalid scenario');

  const candles = await getCandles(symbol, 'D', scenarioInfo.from, scenarioInfo.to);
  if (!candles || candles.length === 0) throw new Error('No data for this scenario');

  const filePath = path.join(__dirname, `../data/scenario_${userId}_${symbol}.json`);
  if (!fs.existsSync(path.join(__dirname, '../data'))) {
      fs.mkdirSync(path.join(__dirname, '../data'));
  }
  fs.writeFileSync(filePath, JSON.stringify(candles));

  activeScenarios[userId] = {
    symbol,
    candles,
    currentIndex: 20 // start with history for RSI
  };

  return { message: 'Scenario started', totalSteps: candles.length };
};

exports.nextStep = (userId) => {
  const state = activeScenarios[userId];
  if (!state) throw new Error('No active scenario');

  if (state.currentIndex >= state.candles.length - 1) {
    return { done: true };
  }

  state.currentIndex += 1;
  const currentCandle = state.candles[state.currentIndex];
  
  const windowEnd = state.currentIndex;
  const windowStart = Math.max(0, windowEnd - 14);
  
  const windowCandles = state.candles.slice(windowStart, windowEnd + 1);
  const closingPrices = windowCandles.map(c => c.c);
  
  const ma = closingPrices.reduce((a, b) => a + b, 0) / closingPrices.length;

  let gains = 0, losses = 0;
  for (let i = 1; i < closingPrices.length; i++) {
    const diff = closingPrices[i] - closingPrices[i-1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / 14;
  const avgLoss = losses / 14;
  let rsi = 100;
  if (avgLoss !== 0) {
    const rs = avgGain / avgLoss;
    rsi = 100 - (100 / (1 + rs));
  }

  let hint = "";
  if (rsi > 70) hint = "Overbought";
  if (rsi < 30) hint = "Oversold";

  let trend = "Neutral";
  if (ma > closingPrices[0]) trend = "Upwards";
  if (ma < closingPrices[0]) trend = "Downwards";
  
  state.lastTrend = trend;
  state.lastRsi = rsi.toFixed(2);

  return {
    done: false,
    step: state.currentIndex,
    candle: currentCandle,
    indicators: {
      rsi: rsi.toFixed(2),
      ma: ma.toFixed(2),
      hint,
      trend
    },
    history: state.candles.slice(0, state.currentIndex + 1)
  };
};

exports.getCurrentState = (userId) => {
  return activeScenarios[userId] || null;
};
