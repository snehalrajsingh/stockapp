const axios = require('axios');

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

exports.getCandles = async (symbol, resolution, from, to) => {
  try {
    const response = await axios.get(`${FINNHUB_BASE_URL}/stock/candle`, {
      params: {
        symbol,
        resolution,
        from,
        to,
        token: process.env.FINNHUB_API_KEY
      }
    });

    if (response.data.s === 'no_data') {
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
    return candles;
  } catch (error) {
    console.error('Finnhub Error (Candles):', error.message);
    throw error;
  }
};

exports.getCompanyNews = async (symbol, from, to) => {
  try {
    const response = await axios.get(`${FINNHUB_BASE_URL}/company-news`, {
      params: {
        symbol,
        from,
        to,
        token: process.env.FINNHUB_API_KEY
      }
    });
    return response.data.map(news => ({
      headline: news.headline,
      summary: news.summary,
      url: news.url,
      datetime: news.datetime
    }));
  } catch (error) {
    console.error('Finnhub Error (News):', error.message);
    throw error;
  }
};
