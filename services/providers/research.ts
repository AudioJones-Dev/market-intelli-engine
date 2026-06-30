import type { ProviderHealth } from './types.js';

export interface ResearchRequest {
  marketTicker: string;
  marketTitle: string;
  outcomeCondition: string;
  category?: string;
  expirationTime?: string;
  settlementSource?: string;
  promptVersion: string;
}

export interface ResearchSource {
  title: string;
  url: string;
  quality: 'high' | 'medium' | 'low';
  publishedAt?: string;
}

export interface ResearchResult {
  provider: string;
  promptVersion: string;
  summary: string;
  facts: string[];
  supportingEvidence: string[];
  opposingEvidence: string[];
  unknowns: string[];
  sources: ResearchSource[];
  researchQualityScore: number;
  raw: unknown;
}

export interface ResearchProvider {
  readonly name: string;
  health(): Promise<ProviderHealth>;
  researchMarket(input: ResearchRequest): Promise<ResearchResult>;
}
