export type ProviderKind = 'market' | 'research' | 'model' | 'delivery';

export type ProviderHealthStatus = 'healthy' | 'degraded' | 'unavailable';

export interface ProviderHealth {
  providerName: string;
  providerKind: ProviderKind;
  status: ProviderHealthStatus;
  checkedAt: string;
  message?: string;
}

export interface ProviderErrorContext {
  providerName: string;
  providerKind: ProviderKind;
  operation: string;
  retryable: boolean;
  statusCode?: number;
  cause?: unknown;
}

export class ProviderError extends Error {
  public readonly context: ProviderErrorContext;

  public constructor(message: string, context: ProviderErrorContext) {
    super(message);
    this.name = 'ProviderError';
    this.context = context;
  }
}
