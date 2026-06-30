import type { ProviderHealth } from './types.js';

export type JsonSchema = Record<string, unknown>;

export interface ModelResponseFormat {
  type: 'json_schema';
  name: string;
  schema: JsonSchema;
  strict: boolean;
}

export interface ModelRequest<TInput = unknown> {
  promptId: string;
  promptVersion: string;
  modelName: string;
  temperature: number;
  responseFormat: ModelResponseFormat;
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
