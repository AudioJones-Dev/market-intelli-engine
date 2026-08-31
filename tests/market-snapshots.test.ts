import { describe, expect, it } from 'vitest';
import { toMarketSnapshotRecord, toMarketSnapshotRecords } from '../services/ingestion/index.js';
import type { MarketContract } from '../services/providers/index.js';

const market: MarketContract = {
  provider: 'kalshi',
  ticker: 'KXTEST-26JUN30',
  eventTicker: 'KXTEST',
  title: 'Will the test pass?',
  category: 'kxtest',
  status: 'open',
  closeTime: '2026-06-30T20:00:00Z',
  yesBid: 0.56,
  yesAsk: 0.58,
  lastPrice: 0.57,
  volume: 100,
  openInterest: 25,
  raw: { ticker: 'KXTEST-26JUN30' }
};

describe('market snapshot mapping', () => {
  it('maps market contracts into database-ready snapshot records', () => {
    const record = toMarketSnapshotRecord(market, '2026-06-30T13:00:00.000Z');

    expect(record).toEqual({
      provider: 'kalshi',
      ticker: 'KXTEST-26JUN30',
      event_ticker: 'KXTEST',
      title: 'Will the test pass?',
      category: 'kxtest',
      status: 'open',
      close_time: '2026-06-30T20:00:00Z',
      yes_bid: 0.56,
      yes_ask: 0.58,
      last_price: 0.57,
      volume: 100,
      open_interest: 25,
      raw_json: { ticker: 'KXTEST-26JUN30' },
      ingested_at: '2026-06-30T13:00:00.000Z'
    });
  });

  it('omits undefined optional fields', () => {
    const record = toMarketSnapshotRecord(
      {
        provider: 'kalshi',
        ticker: 'KXTEST-26JUN30',
        title: 'Will the test pass?',
        status: 'open',
        raw: {}
      },
      '2026-06-30T13:00:00.000Z'
    );

    expect(record).not.toHaveProperty('event_ticker');
    expect(record).not.toHaveProperty('yes_bid');
  });

  it('maps many market contracts with one ingestion timestamp', () => {
    const records = toMarketSnapshotRecords([market, market], '2026-06-30T13:00:00.000Z');

    expect(records).toHaveLength(2);
    expect(records[0]?.ingested_at).toBe('2026-06-30T13:00:00.000Z');
    expect(records[1]?.ingested_at).toBe('2026-06-30T13:00:00.000Z');
  });
});
