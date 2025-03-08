
import { CryptoAsset, HistoricalData, TimeFrame } from "@/types/crypto";

const API_BASE_URL = "https://api.coingecko.com/api/v3";

export async function fetchTopCryptoAssets(limit = 20): Promise<CryptoAsset[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h,7d,30d,1y`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch top crypto assets');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching top crypto assets:", error);
    return [];
  }
}

export async function fetchHistoricalData(
  coinId: string,
  timeframe: TimeFrame
): Promise<HistoricalData | null> {
  try {
    const { days, interval } = getTimeframeParams(timeframe);
    
    const response = await fetch(
      `${API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch historical data for ${coinId}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching historical data for ${coinId}:`, error);
    return null;
  }
}

function getTimeframeParams(timeframe: TimeFrame): { days: string; interval: string } {
  switch (timeframe) {
    case '1D':
      return { days: '1', interval: 'hourly' };
    case '1W':
      return { days: '7', interval: 'daily' };
    case '1M':
      return { days: '30', interval: 'daily' };
    case '3M':
      return { days: '90', interval: 'daily' };
    case '1Y':
      return { days: '365', interval: 'daily' };
    case '5Y':
      return { days: 'max', interval: 'weekly' };
    default:
      return { days: '30', interval: 'daily' };
  }
}
