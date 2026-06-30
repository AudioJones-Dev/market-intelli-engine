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
  return omitUndefined({
    provider: market.provider,
    ticker: market.ticker,
    event_ticker: market.eventTicker,
    title: market.title,
    category: market.category,
    status: market.status,
    close_time: market.closeTime,
    yes_bid: market.yesBid,
    yes_ask: market.yesAsk,
    last_price: market.lastPrice,
    volume: market.volume,
    open_interest: market.openInterest,
    raw_json: market.raw,
    ingested_at: ingestedAt
  });
}

export function toMarketSnapshotRecords(
  markets: MarketContract[],
  ingestedAt: string = new Date().toISOString()
): MarketSnapshotRecord[] {
  return markets.map((market) => toMarketSnapshotRecord(market, ingestedAt));
}

function omitUndefined<T extends Record<string, unknown>>(input: T): T {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined)) as T;
}
