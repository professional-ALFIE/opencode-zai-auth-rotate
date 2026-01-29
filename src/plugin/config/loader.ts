import { homedir } from "os";
import { join } from "path";
import { existsSync, readFileSync } from "fs";
import { ZAIConfigSchema, DEFAULT_CONFIG, type ZAIConfig } from "./schema";

const MAX_KEYS = 100;

export function getConfigDir(): string {
  const platform = process.platform;
  if (platform === "win32") {
    return join(process.env.APPDATA || join(homedir(), "AppData", "Roaming"), "opencode");
  }
  return join(process.env.XDG_CONFIG_HOME || join(homedir(), ".config"), "opencode");
}

export function getUserConfigPath(): string {
  return join(getConfigDir(), "zai.json");
}

export function loadKeysFromEnv(prefix: string): string[] {
  const keys: string[] = [];
  let index = 0;
  
  while (index < MAX_KEYS) {
    const key = process.env[`${prefix}${index}`];
    if (!key) break;
    keys.push(key);
    index++;
  }
  
  return keys;
}

export function loadConfig(): ZAIConfig {
  let config = { ...DEFAULT_CONFIG };
  
  const userConfigPath = getUserConfigPath();
  if (existsSync(userConfigPath)) {
    try {
      const fileContent = readFileSync(userConfigPath, "utf-8");
      const parsed = JSON.parse(fileContent);
      const validated = ZAIConfigSchema.partial().parse(parsed);
      config = { ...config, ...validated };
    } catch (e) {
      // Ignore config parsing errors
    }
  }
  
  if (process.env.ZAI_DEBUG === "1" || process.env.ZAI_DEBUG === "true") {
    config.debug = true;
  }
  
  return config;
}
