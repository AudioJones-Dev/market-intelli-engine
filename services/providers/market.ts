import type { ProviderHealth } from './types.js';

export interface MarketQueryParams {
  status?: string;
  category?: string;
  limit?: number;
  cursor?: string;
}

export interface MarketContract {
  provider: string;
  ticker: string;
  eventTicker?: string;
  title: string;
  category?: string;
  status: string;
  closeTime?: string;
  yesBid?: number;
  yesAsk?: number;
  lastPrice?: number;
  volume?: number;
  openInterest?: number;
  raw: unknown;
}

export interface MarketListResult {
  markets: MarketContract[];
  nextCursor?: string;
}

export interface MarketProvider {
  readonly name: string;
  health(): Promise<ProviderHealth>;
  listMarkets(params: MarketQueryParams): Promise<MarketListResult>;
  getMarket(ticker: string): Promise<MarketContract>;
}
