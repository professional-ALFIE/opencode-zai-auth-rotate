import { z } from "zod";

export const ZAIConfigSchema = z.object({
  debug: z.boolean().default(false),
  /** @deprecated env-only 정책에 따라 사용되지 않음 */
  keys: z.array(z.string()).default([]),
});

export type ZAIConfig = z.infer<typeof ZAIConfigSchema>;

export const DEFAULT_CONFIG: ZAIConfig = {
  debug: false,
  keys: [],
};
