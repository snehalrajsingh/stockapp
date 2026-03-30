const axios = require('axios');

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Validate API key is present
const validateApiKey = () => {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey || apiKey === 'YOUR_FINNHUB_API_KEY' || apiKey.length < 10) {
    throw new Error('Invalid or missing FINNHUB_API_KEY in .env file');
  }
  return apiKey;
};

exports.getCandles = async (symbol, resolution, from, to) => {
  try {
    const token = validateApiKey();
    
    console.log(`[Finnhub] Fetching candles for ${symbol} from ${from} to ${to}`);
    
    const response = await axios.get(`${FINNHUB_BASE_URL}/stock/candle`, {
      params: {
        symbol: symbol.toUpperCase(),
        resolution,
        from,
        to,
        token
      },
      timeout: 10000
    });

    console.log(`[Finnhub] Response status: ${response.status}, data status: ${response.data.s}`);

    if (response.data.s === 'no_data') {
      console.warn(`[Finnhub] No data available for ${symbol} in the specified date range`);
      return null;
    }

    if (response.data.s === 'error') {
      const errorMsg = response.data.errmsg || 'Unknown Finnhub API error';
      console.error(`[Finnhub] API Error: ${errorMsg}`);
      throw new Error(`Finnhub API error: ${errorMsg}`);
    }

    // Validate response has required fields
    if (!response.data.t || !response.data.c || response.data.t.length === 0) {
      console.warn(`[Finnhub] Empty data for ${symbol}`);
      return null;
    }

    // Convert response to easier format
    const candles = [];
    for (let i = 0; i < response.data.t.length; i++) {
        candles.push({
            t: response.data.t[i],
            o: response.data.o[i],
            h: response.data.h[i],
            l: response.data.l[i],
            c: response.data.c[i],
            v: response.data.v[i]
        });
    }
    
    console.log(`[Finnhub] Successfully fetched ${candles.length} candles for ${symbol}`);
    return candles;
  } catch (error) {
    if (error.message.includes('Invalid or missing FINNHUB_API_KEY')) {
      throw error; // Re-throw API key errors as-is
    }
    console.error('[Finnhub Error (Candles)]:', error.message);
    throw new Error(`Failed to fetch candles: ${error.message}`);
  }
};

exports.getCompanyNews = async (symbol, from, to) => {
  try {
    const token = validateApiKey();
    
    console.log(`[Finnhub] Fetching news for ${symbol} from ${from} to ${to}`);
    
    // Category is required - use 'general' as default
    const response = await axios.get(`${FINNHUB_BASE_URL}/company-news`, {
      params: {
        symbol: symbol.toUpperCase(),
        from,
        to,
        category: 'general',  // Required parameter
        token
      },
      timeout: 10000
    });

    console.log(`[Finnhub] News response status: ${response.status}, articles: ${response.data.length}`);

    if (!Array.isArray(response.data) || response.data.length === 0) {
      console.warn(`[Finnhub] No news found for ${symbol}`);
      return [];
    }

    return response.data.map(news => ({
      headline: news.headline,
      summary: news.summary,
      url: news.url,
      datetime: news.datetime,
      source: news.source
    }));
  } catch (error) {
    if (error.message.includes('Invalid or missing FINNHUB_API_KEY')) {
      throw error;
    }
    console.error('[Finnhub Error (News)]:', error.message);
    throw new Error(`Failed to fetch news: ${error.message}`);
  }
};
