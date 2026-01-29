import { z } from "zod";
export declare const ZAIConfigSchema: z.ZodObject<{
    debug: z.ZodDefault<z.ZodBoolean>;
    keys: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type ZAIConfig = z.infer<typeof ZAIConfigSchema>;
export declare const DEFAULT_CONFIG: ZAIConfig;
//# sourceMappingURL=schema.d.ts.map