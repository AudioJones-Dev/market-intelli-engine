import { describe, expect, it, vi } from 'vitest';
import { KalshiProvider, ProviderError } from '../services/providers/index.js';

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init
  });
}

describe('KalshiProvider', () => {
  it('lists and normalizes markets', async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse({
        markets: [
          {
            ticker: 'KXTEST-26JUN30',
            event_ticker: 'KXTEST',
            title: 'Will the test pass?',
            status: 'open',
            close_time: '2026-06-30T20:00:00Z',
            yes_bid_dollars: '0.5600',
            yes_ask_dollars: '0.5800',
            last_price_dollars: '0.5700',
            volume_fp: '100.00',
            open_interest_fp: '25.00'
          }
        ],
        cursor: 'next-page'
      })
    );

    const provider = new KalshiProvider({
      baseUrl: 'https://external-api.kalshi.com/trade-api/v2',
      fetchFn
    });

    const result = await provider.listMarkets({ status: 'open', limit: 100, cursor: 'abc' });

    expect(fetchFn).toHaveBeenCalledOnce();
    expect(String(fetchFn.mock.calls[0]?.[0])).toContain('/markets?status=open&limit=100&cursor=abc');
    expect(result.nextCursor).toBe('next-page');
    expect(result.markets[0]).toMatchObject({
      provider: 'kalshi',
      ticker: 'KXTEST-26JUN30',
      eventTicker: 'KXTEST',
      title: 'Will the test pass?',
      category: 'kxtest',
      yesBid: 0.56,
      yesAsk: 0.58,
      lastPrice: 0.57,
      volume: 100,
      openInterest: 25
    });
  });

  it('gets one market by ticker', async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse({
        market: {
          ticker: 'KXTEST-26JUN30',
          event_ticker: 'KXTEST',
          title: 'Will the test pass?',
          status: 'open'
        }
      })
    );

    const provider = new KalshiProvider({ baseUrl: 'https://example.test/trade-api/v2/', fetchFn });
    const market = await provider.getMarket('KXTEST-26JUN30');

    expect(String(fetchFn.mock.calls[0]?.[0])).toBe('https://example.test/trade-api/v2/markets/KXTEST-26JUN30');
    expect(market.ticker).toBe('KXTEST-26JUN30');
  });

  it('marks 5xx errors as retryable provider errors', async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ error: 'bad' }, { status: 503 }));
    const provider = new KalshiProvider({ baseUrl: 'https://example.test/trade-api/v2', fetchFn });

    await expect(provider.listMarkets()).rejects.toMatchObject<Partial<ProviderError>>({
      name: 'ProviderError',
      context: expect.objectContaining({ retryable: true, statusCode: 503 })
    });
  });

  it('rejects missing ticker for getMarket', async () => {
    const fetchFn = vi.fn();
    const provider = new KalshiProvider({ baseUrl: 'https://example.test/trade-api/v2', fetchFn });

    await expect(provider.getMarket('')).rejects.toBeInstanceOf(ProviderError);
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
