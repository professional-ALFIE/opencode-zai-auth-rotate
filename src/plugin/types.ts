import type { PluginInput } from "@opencode-ai/plugin";

// GetAuth 타입 (loader 시그니처에 필요하지만, ZAI에서는 호출하지 않음)
export type GetAuth = () => Promise<Record<string, unknown>>;

// Provider 모델 정의
export interface ProviderModel {
  cost?: {
    input: number;
    output: number;
  };
  [key: string]: unknown;
}

export interface Provider {
  models?: Record<string, ProviderModel>;
}

// Loader 반환 타입
export interface LoaderResult {
  apiKey: string;
  fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
}

// Plugin Context (PluginInput에서 필요한 부분만)
export type PluginClient = PluginInput["client"];

export interface PluginContext {
  client: PluginClient;
  directory: string;
}

// Auth 메서드 타입
export interface AuthMethod {
  label: string;
  type: "oauth" | "api";
}

// Plugin 반환 타입
export interface PluginResult {
  auth: {
    provider: string;
    loader: (getAuth: GetAuth, provider: Provider) => Promise<LoaderResult | Record<string, unknown>>;
    methods: AuthMethod[];
  };
}
