import type { MarketContract, MarketListResult, MarketProvider, MarketQueryParams } from './market.js';
import { ProviderError } from './types.js';
import type { ProviderHealth } from './types.js';

export interface KalshiProviderConfig {
  baseUrl: string;
  fetchFn?: typeof fetch;
}

interface KalshiMarketPayload {
  ticker?: string;
  event_ticker?: string;
  title?: string;
  subtitle?: string;
  status?: string;
  close_time?: string;
  yes_bid_dollars?: string;
  yes_ask_dollars?: string;
  last_price_dollars?: string;
  volume_fp?: string;
  open_interest_fp?: string;
  [key: string]: unknown;
}

interface KalshiMarketsResponse {
  markets?: KalshiMarketPayload[];
  cursor?: string;
}

interface KalshiMarketResponse {
  market?: KalshiMarketPayload;
}

export class KalshiProvider implements MarketProvider {
  public readonly name = 'kalshi';

  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;

  public constructor(config: KalshiProviderConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.fetchFn = config.fetchFn ?? fetch;
  }

  public async health(): Promise<ProviderHealth> {
    try {
      await this.listMarkets({ limit: 1 });
      return {
        providerName: this.name,
        providerKind: 'market',
        status: 'healthy',
        checkedAt: new Date().toISOString()
      };
    } catch (cause) {
      return {
        providerName: this.name,
        providerKind: 'market',
        status: 'unavailable',
        checkedAt: new Date().toISOString(),
        message: cause instanceof Error ? cause.message : 'Unknown Kalshi provider failure'
      };
    }
  }

  public async listMarkets(params: MarketQueryParams = {}): Promise<MarketListResult> {
    const url = this.buildMarketsUrl(params);
    const data = await this.getJson<KalshiMarketsResponse>(url, 'listMarkets');

    return {
      markets: (data.markets ?? []).map((market) => this.normalizeMarket(market)),
      ...optional('nextCursor', data.cursor || undefined)
    };
  }

  public async getMarket(ticker: string): Promise<MarketContract> {
    if (!ticker.trim()) {
      throw new ProviderError('Kalshi market ticker is required', {
        providerName: this.name,
        providerKind: 'market',
        operation: 'getMarket',
        retryable: false
      });
    }

    const url = new URL(`${this.baseUrl}/markets/${encodeURIComponent(ticker)}`);
    const data = await this.getJson<KalshiMarketResponse>(url, 'getMarket');

    if (!data.market) {
      throw new ProviderError('Kalshi market response did not include market payload', {
        providerName: this.name,
        providerKind: 'market',
        operation: 'getMarket',
        retryable: false
      });
    }

    return this.normalizeMarket(data.market);
  }

  private buildMarketsUrl(params: MarketQueryParams): URL {
    const url = new URL(`${this.baseUrl}/markets`);

    if (params.status) {
      url.searchParams.set('status', params.status);
    }

    if (params.limit !== undefined) {
      url.searchParams.set('limit', String(params.limit));
    }

    if (params.cursor) {
      url.searchParams.set('cursor', params.cursor);
    }

    return url;
  }

  private async getJson<T>(url: URL, operation: string): Promise<T> {
    let response: Response;

    try {
      response = await this.fetchFn(url);
    } catch (cause) {
      throw new ProviderError('Kalshi network request failed', {
        providerName: this.name,
        providerKind: 'market',
        operation,
        retryable: true,
        cause
      });
    }

    if (!response.ok) {
      throw new ProviderError(`Kalshi request failed with status ${response.status}`, {
        providerName: this.name,
        providerKind: 'market',
        operation,
        retryable: response.status === 429 || response.status >= 500,
        statusCode: response.status
      });
    }

    return (await response.json()) as T;
  }

  private normalizeMarket(market: KalshiMarketPayload): MarketContract {
    if (!market.ticker || !market.title || !market.status) {
      throw new ProviderError('Kalshi market payload is missing required fields', {
        providerName: this.name,
        providerKind: 'market',
        operation: 'normalizeMarket',
        retryable: false
      });
    }

    return {
      provider: this.name,
      ticker: market.ticker,
      title: market.title,
      status: market.status,
      raw: market,
      ...optional('eventTicker', market.event_ticker),
      ...optional('category', this.inferCategory(market)),
      ...optional('closeTime', market.close_time),
      ...optional('yesBid', parseOptionalNumber(market.yes_bid_dollars)),
      ...optional('yesAsk', parseOptionalNumber(market.yes_ask_dollars)),
      ...optional('lastPrice', parseOptionalNumber(market.last_price_dollars)),
      ...optional('volume', parseOptionalNumber(market.volume_fp)),
      ...optional('openInterest', parseOptionalNumber(market.open_interest_fp))
    };
  }

  private inferCategory(market: KalshiMarketPayload): string | undefined {
    const eventTicker = market.event_ticker;
    if (!eventTicker) {
      return undefined;
    }

    return eventTicker.split('-')[0]?.toLowerCase();
  }
}

/**
 * Yields a spreadable fragment that carries `key` only when `value` is present.
 *
 * `exactOptionalPropertyTypes` distinguishes "absent" from "present but undefined",
 * so an optional contract field must be omitted rather than set to `undefined`.
 */
function optional<K extends string, V>(key: K, value: V | undefined): { [P in K]?: V } {
  return (value === undefined ? {} : { [key]: value }) as { [P in K]?: V };
}

function parseOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
