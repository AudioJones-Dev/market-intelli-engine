import { describe, expect, it } from 'vitest';
import { ProviderError } from '../services/providers/index.js';
import type { MarketProvider, ResearchProvider } from '../services/providers/index.js';

describe('provider contracts', () => {
  it('supports typed market provider mocks', async () => {
    const provider: MarketProvider = {
      name: 'mock-market',
      async health() {
        return {
          providerName: 'mock-market',
          providerKind: 'market',
          status: 'healthy',
          checkedAt: new Date(0).toISOString()
        };
      },
      async listMarkets() {
        return {
          markets: [
            {
              provider: 'mock-market',
              ticker: 'TEST-1',
              title: 'Test market',
              status: 'open',
              raw: {}
            }
          ]
        };
      },
      async getMarket(ticker: string) {
        return {
          provider: 'mock-market',
          ticker,
          title: 'Test market',
          status: 'open',
          raw: {}
        };
      }
    };

    const result = await provider.listMarkets({ status: 'open' });
    expect(result.markets[0]?.ticker).toBe('TEST-1');
  });

  it('supports typed research provider mocks', async () => {
    const provider: ResearchProvider = {
      name: 'mock-research',
      async health() {
        return {
          providerName: 'mock-research',
          providerKind: 'research',
          status: 'healthy',
          checkedAt: new Date(0).toISOString()
        };
      },
      async researchMarket(input) {
        return {
          provider: 'mock-research',
          promptVersion: input.promptVersion,
          summary: 'Mock summary',
          facts: [],
          supportingEvidence: [],
          opposingEvidence: [],
          unknowns: [],
          sources: [],
          researchQualityScore: 0,
          raw: {}
        };
      }
    };

    const result = await provider.researchMarket({
      marketTicker: 'TEST-1',
      marketTitle: 'Test market',
      outcomeCondition: 'Test outcome',
      promptVersion: 'test-v0'
    });

    expect(result.provider).toBe('mock-research');
  });

  it('preserves provider error context', () => {
    const error = new ProviderError('provider failed', {
      providerName: 'mock-market',
      providerKind: 'market',
      operation: 'listMarkets',
      retryable: true,
      statusCode: 503
    });

    expect(error.context.retryable).toBe(true);
    expect(error.context.statusCode).toBe(503);
  });
});
