const fs = require('fs');
const path = require('path');
const { getCandles } = require('./finnhubService');

// A map to store active scenario per user.
const activeScenarios = {};

const SCENARIOS = {
  'COVID': {
    name: 'COVID crash (Feb 2020 – April 2020)',
    from: Math.floor(new Date('2020-02-01').getTime() / 1000),
    to: Math.floor(new Date('2020-04-30').getTime() / 1000),
    note: 'Limited free tier historical data - may not work'
  },
  'BULL': {
    name: 'Bull run (2021)',
    from: Math.floor(new Date('2021-01-01').getTime() / 1000),
    to: Math.floor(new Date('2021-12-31').getTime() / 1000),
    note: 'Limited free tier historical data - may not work'
  },
  // Recent scenarios that should work with free tier
  'RECENT_BULL': {
    name: 'Recent Bull Run (2023)',
    from: Math.floor(new Date('2023-01-01').getTime() / 1000),
    to: Math.floor(new Date('2023-12-31').getTime() / 1000)
  },
  'RECENT_2024': {
    name: '2024 Market',
    from: Math.floor(new Date('2024-01-01').getTime() / 1000),
    to: Math.floor(new Date('2024-12-31').getTime() / 1000)
  }
};

exports.startScenario = async (userId, scenarioId, symbol) => {
  const scenarioInfo = SCENARIOS[scenarioId];
  if (!scenarioInfo) {
    const availableScenarios = Object.keys(SCENARIOS).join(', ');
    throw new Error(`Invalid scenario. Available: ${availableScenarios}`);
  }

  console.log(`[Scenario] Starting ${scenarioInfo.name} for symbol ${symbol}`);
  
  try {
    const candles = await getCandles(symbol, 'D', scenarioInfo.from, scenarioInfo.to);
    
    if (!candles || candles.length === 0) {
      throw new Error(
        `No historical data available for ${symbol} in ${scenarioInfo.name}. ` +
        `This may be due to: 1) Finnhub free tier limited historical access, ` +
        `2) Symbol not supported, 3) Date range beyond free tier limits. ` +
        `Try a more recent scenario like RECENT_BULL or RECENT_2024.`
      );
    }

    if (candles.length < 15) {
      console.warn(`[Scenario] Only ${candles.length} candles fetched. RSI may be inaccurate.`);
    }

    const filePath = path.join(__dirname, `../data/scenario_${userId}_${symbol}.json`);
    if (!fs.existsSync(path.join(__dirname, '../data'))) {
        fs.mkdirSync(path.join(__dirname, '../data'));
    }
    fs.writeFileSync(filePath, JSON.stringify(candles));

    activeScenarios[userId] = {
      symbol: symbol.toUpperCase(),
      candles,
      currentIndex: 0,
      scenarioName: scenarioInfo.name
    };

    console.log(`[Scenario] Started successfully with ${candles.length} candles`);
    return { 
      message: 'Scenario started', 
      totalSteps: candles.length,
      scenarioName: scenarioInfo.name,
      symbol: symbol.toUpperCase()
    };
  } catch (error) {
    console.error(`[Scenario] Failed to start: ${error.message}`);
    throw error;
  }
};

exports.nextStep = (userId) => {
  const state = activeScenarios[userId];
  if (!state) throw new Error('No active scenario. Go to Dashboard to start one.');

  if (state.currentIndex >= state.candles.length - 1) {
    return { done: true, message: 'Scenario complete!' };
  }

  state.currentIndex += 1;
  const currentCandle = state.candles[state.currentIndex];
  
  // Dynamic window based on available data
  const windowSize = Math.min(14, state.currentIndex);
  const windowEnd = state.currentIndex;
  const windowStart = Math.max(0, windowEnd - windowSize);
  
  const windowCandles = state.candles.slice(windowStart, windowEnd + 1);
  const closingPrices = windowCandles.map(c => c.c);
  
  // Simple Moving Average (SMA)
  const ma = closingPrices.reduce((a, b) => a + b, 0) / closingPrices.length;

  // RSI calculation
  let gains = 0, losses = 0;
  for (let i = 1; i < closingPrices.length; i++) {
    const diff = closingPrices[i] - closingPrices[i-1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  
  const avgGain = gains / windowSize;
  const avgLoss = losses / windowSize;
  let rsi = 50; // Neutral if no data
  if (avgLoss !== 0) {
    const rs = avgGain / avgLoss;
    rsi = 100 - (100 / (1 + rs));
  }

  let hint = "";
  if (rsi > 70) hint = "Overbought - Consider selling";
  if (rsi < 30) hint = "Oversold - Consider buying";

  let trend = "Neutral";
  if (ma > closingPrices[closingPrices.length - 1]) trend = "Downwards";
  if (ma < closingPrices[0]) trend = "Upwards";
  
  // Also compare current price to MA for better trend detection
  if (currentCandle.c > ma) trend = "Upwards (Price above MA)";
  if (currentCandle.c < ma) trend = "Downwards (Price below MA)";
  
  state.lastTrend = trend;
  state.lastRsi = rsi.toFixed(2);

  return {
    done: false,
    step: state.currentIndex,
    totalSteps: state.candles.length,
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
