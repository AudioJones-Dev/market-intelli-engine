import type { MarketContract } from '../providers/index.js';

export interface MarketSnapshotRecord {
  provider: string;
  ticker: string;
  event_ticker?: string;
  title: string;
  category?: string;
  status: string;
  close_time?: string;
  yes_bid?: number;
  yes_ask?: number;
  last_price?: number;
  volume?: number;
  open_interest?: number;
  raw_json: unknown;
  ingested_at: string;
}

export interface MarketSnapshotRepository {
  saveMany(records: MarketSnapshotRecord[]): Promise<MarketSnapshotSaveResult>;
}

export interface MarketSnapshotSaveResult {
  insertedCount: number;
}

export function toMarketSnapshotRecord(
  market: MarketContract,
  ingestedAt: string = new Date().toISOString()
): MarketSnapshotRecord {
  return {
    provider: market.provider,
    ticker: market.ticker,
    ...(market.eventTicker !== undefined && { event_ticker: market.eventTicker }),
    title: market.title,
    ...(market.category !== undefined && { category: market.category }),
    status: market.status,
    ...(market.closeTime !== undefined && { close_time: market.closeTime }),
    ...(market.yesBid !== undefined && { yes_bid: market.yesBid }),
    ...(market.yesAsk !== undefined && { yes_ask: market.yesAsk }),
    ...(market.lastPrice !== undefined && { last_price: market.lastPrice }),
    ...(market.volume !== undefined && { volume: market.volume }),
    ...(market.openInterest !== undefined && { open_interest: market.openInterest }),
    raw_json: market.raw,
    ingested_at: ingestedAt
  };
}

export function toMarketSnapshotRecords(
  markets: MarketContract[],
  ingestedAt: string = new Date().toISOString()
): MarketSnapshotRecord[] {
  return markets.map((market) => toMarketSnapshotRecord(market, ingestedAt));
}
