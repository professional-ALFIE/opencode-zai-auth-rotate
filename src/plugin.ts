import type { Plugin, PluginInput, Hooks } from "@opencode-ai/plugin";
import { KeyManager } from "./plugin/keys";
import { loadConfig } from "./plugin/config/loader";
import { ZAI_PROVIDER_ID, DEBUG_PREFIX } from "./constants";
import type { GetAuth, Provider, LoaderResult } from "./plugin/types";

export const createZAIPlugin = (providerId: string) =>
  async (_context: PluginInput): Promise<Hooks> => {
    const keyManager = new KeyManager();
    const config = loadConfig();

    if (config.debug) {
      console.log(`${DEBUG_PREFIX} Loaded ${keyManager.getKeyCount()} keys`);
    }

    return {
      auth: {
        provider: providerId,

        loader: async (_getAuth: GetAuth, _provider: Provider): Promise<LoaderResult> => {
          return {
            apiKey: "",

            async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
              const maxRetries = keyManager.getKeyCount() * 2;

              for (let attempt = 0; attempt < maxRetries; attempt++) {
                const waitMs = keyManager.getMinCooldownMs();
                if (waitMs > 0) {
                  if (config.debug) {
                    console.log(`${DEBUG_PREFIX} All keys on cooldown, waiting ${waitMs}ms`);
                  }
                  await new Promise(resolve => setTimeout(resolve, waitMs));
                }

                const key = keyManager.getNextKey();
                const currentIdx = keyManager.getCurrentIndex();

                const headers = new Headers(init?.headers);
                headers.set("Authorization", `Bearer ${key}`);

                try {
                  const response = await fetch(input, { ...init, headers });

                  if (config.debug) {
                    console.log(`${DEBUG_PREFIX} Request with key index ${currentIdx}: ${response.status}`);
                  }

                  if (response.status === 401 || response.status === 403 || response.status === 429) {
                    keyManager.markRateLimited(currentIdx);
                    continue;
                  }

                  if (response.status >= 500) {
                    continue;
                  }

                  return response;
                } catch (error) {
                  if (config.debug) {
                    console.log(`${DEBUG_PREFIX} Network error with key index ${currentIdx}: ${error}`);
                  }
                  continue;
                }
              }

              throw new Error("All API keys exhausted or rate limited");
            }
          };
        },

        methods: [
          { label: "ZAI API Key", type: "api" }
        ] as const
      }
    };
  };

export const ZAIAuthPlugin: Plugin = createZAIPlugin(ZAI_PROVIDER_ID);
export { KeyManager } from "./plugin/keys";
