import type { ProviderHealth } from './types.js';

export interface ModelRequest<TInput = unknown> {
  promptId: string;
  promptVersion: string;
  modelName: string;
  temperature: number;
  input: TInput;
}

export interface ModelResult<TOutput = unknown> {
  provider: string;
  modelName: string;
  promptId: string;
  promptVersion: string;
  output: TOutput;
  raw: unknown;
}

export interface ModelProvider {
  readonly name: string;
  health(): Promise<ProviderHealth>;
  runStructured<TInput, TOutput>(request: ModelRequest<TInput>): Promise<ModelResult<TOutput>>;
}
