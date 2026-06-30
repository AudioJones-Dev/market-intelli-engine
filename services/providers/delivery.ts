import type { ProviderHealth } from './types.js';

export interface ReportPayload {
  reportId: string;
  title: string;
  markdown: string;
  generatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface DeliveryResult {
  provider: string;
  delivered: boolean;
  destination: string;
  deliveredAt?: string;
  raw?: unknown;
}

export interface DeliveryProvider {
  readonly name: string;
  health(): Promise<ProviderHealth>;
  deliverReport(report: ReportPayload): Promise<DeliveryResult>;
}
