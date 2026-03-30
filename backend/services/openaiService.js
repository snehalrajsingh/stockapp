const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.explainChart = async (rsi, trend, priceMovement) => {
  try {
    const prompt = `Explain this stock chart simply:\nRSI: ${rsi}\nTrend: ${trend}\nPrice movement: ${priceMovement}`;
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    });
    
    return {
      title: "Chart Analysis",
      explanation: response.choices[0].message.content,
      type: "chart_explanation"
    };
  } catch (error) {
    console.error('OpenAI Error (Explain Chart):', error.message);
    throw error;
  }
};

exports.chatbotResponse = async (question, portfolio, marketData) => {
  try {
    const systemPrompt = `You are a helpful AI stock market learning assistant. Keep responses simple and educational.
    User's Portfolio: ${JSON.stringify(portfolio)}
    Current Market Data: ${JSON.stringify(marketData)}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ]
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Error (Chatbot):', error.message);
    throw error;
  }
};

exports.postTradeFeedback = async (action, buyPrice, sellPrice, marketTrend) => {
  try {
    const actionText = action === 'BUY' ? `bought at ${buyPrice}` : `sold at ${sellPrice} (originally bought at ${buyPrice})`;
    const prompt = `User ${actionText}. Market trend was ${marketTrend}. Was this a good decision? Provide brief educational feedback.`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    });

    return {
      title: "Trade Feedback",
      explanation: response.choices[0].message.content,
      type: "trade_feedback"
    };
  } catch (error) {
    console.error('OpenAI Error (Trade Feedback):', error.message);
    throw error;
  }
};

exports.analyzeBehavior = async (trades) => {
  try {
    const tradesSummary = trades.map(t => `${t.type} ${t.quantity} ${t.symbol} at ${t.price}`).join(", ");
    const prompt = `Based on these recent trades:\n${tradesSummary}\nDetect any of these patterns: overtrading, panic selling, poor diversification. Keep it brief.`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Error (Behavior Analysis):', error.message);
    throw error;
  }
};
