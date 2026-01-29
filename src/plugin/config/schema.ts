import { z } from "zod";

export const ZAIConfigSchema = z.object({
  debug: z.boolean().default(false),
  keys: z.array(z.string()).default([]),
});

export type ZAIConfig = z.infer<typeof ZAIConfigSchema>;

export const DEFAULT_CONFIG: ZAIConfig = {
  debug: false,
  keys: [],
};
