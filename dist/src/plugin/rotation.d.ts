export declare class ZAIKeyRotator {
    private keys_var;
    private currentIndex_var;
    constructor();
    private loadKeysFromEnv;
    getAllKeys(): string[];
    getNextKey(): string;
    handle429Error(): void;
    getAccountGroup(key_var: string): 'A' | 'B';
}
//# sourceMappingURL=rotation.d.ts.map