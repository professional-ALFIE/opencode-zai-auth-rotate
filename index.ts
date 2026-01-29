/**
 * Z-AI API Key Rotation Plugin for OpenCode
 * Round-Robin strategy with dynamic API keys
 */

import type { Plugin, PluginInput } from "@opencode-ai/plugin";
import { loadConfig, loadKeysFromEnv } from "./src/plugin/config/loader";
import type { ZAIConfig } from "./src/plugin/config/schema";

const provider_id_var = "zai-coding-plan";

interface KeyState {
  keys: string[];
  currentIndex: number;
  rateLimitedUntil: Map<number, number>;
}

const key_state_var: KeyState = {
  keys: [],
  currentIndex: 0,
  rateLimitedUntil: new Map(),
};

function load_keys_func(): string[] {
  const keys_var = loadKeysFromEnv("ZAI_API_KEY_");
  if (keys_var.length === 0) {
    throw new Error("No ZAI API keys found. Set ZAI_API_KEY_0, ZAI_API_KEY_1, ...");
  }
  return keys_var;
}

function get_next_available_key_func(): string | null {
  const now_var = Date.now();
  const keys_count_var = key_state_var.keys.length;

  for (let attempt_var = 0; attempt_var < keys_count_var; attempt_var++) {
    const index_var = (key_state_var.currentIndex + attempt_var) % keys_count_var;
    const rate_limited_until_var = key_state_var.rateLimitedUntil.get(index_var) || 0;

    if (now_var >= rate_limited_until_var) {
      key_state_var.currentIndex = (index_var + 1) % keys_count_var;
      return key_state_var.keys[index_var]!;
    }
  }

  return null;
}

function mark_rate_limited_func(key_index_var: number, duration_ms_var: number = 60000): void {
  key_state_var.rateLimitedUntil.set(key_index_var, Date.now() + duration_ms_var);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getMinWaitTime(): number {
  const now = Date.now();
  let minWait = Infinity;
  for (const [_, resetTime] of key_state_var.rateLimitedUntil) {
    if (resetTime > now) {
      minWait = Math.min(minWait, resetTime - now);
    }
  }
  return minWait === Infinity ? 60000 : minWait;
}

async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  config: ZAIConfig
): Promise<Response> {
  const maxAttempts = key_state_var.keys.length;
  let attempts = 0;
  let lastError: unknown = null;

  while (attempts < maxAttempts) {
    const current_key = get_next_available_key_func();
    if (!current_key) {
      const minWait = getMinWaitTime();
      await sleep(minWait);
      continue;
    }
    
    const keyIndex = key_state_var.keys.indexOf(current_key);
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${current_key}`);

    try {
      const response = await fetch(input, { ...init, headers });
      
      if (config.debug) {
        console.log(`[ZAI] Request with key index ${keyIndex}: ${response.status}`);
      }
      
      if (response.ok) return response;

      if ([401, 403, 429].includes(response.status) || response.status >= 500) {
        mark_rate_limited_func(keyIndex);
        attempts++;
        if (config.debug) {
          console.log(`[ZAI] Key ${keyIndex} rate-limited, trying next...`);
        }
        continue;
      }

      return response;
    } catch (err) {
      lastError = err;
      mark_rate_limited_func(keyIndex);
      attempts++;
      continue;
    }
  }

  if (lastError) {
    throw new Error(`All API keys exhausted after ${maxAttempts} attempts (last error: ${String(lastError)})`);
  }
  throw new Error(`All API keys exhausted after ${maxAttempts} attempts`);
}

export const ZAIAuthPlugin: Plugin = async (_plugin_context_var: PluginInput) => {
  key_state_var.keys = load_keys_func();
  const config_var = loadConfig();

  if (config_var.debug) {
    console.log(`[ZAI] Loaded ${key_state_var.keys.length} keys`);
  }

  return {
    auth: {
      provider: provider_id_var,

      async loader() {
        const api_key_var = get_next_available_key_func();
        if (!api_key_var) {
          throw new Error("No available API key. All keys are rate-limited.");
        }

        return {
          apiKey: api_key_var,
          fetch: async (url_var: RequestInfo | URL, init_var?: RequestInit) => {
            return fetchWithRetry(url_var, init_var, config_var);
          },
        };
      },
      methods: [
        {
          label: "ZAI API Key",
          type: "api" as const,
        },
      ],
    },
  };
};

export default ZAIAuthPlugin;
