export class ZAIKeyRotator {
    keys_var;
    currentIndex_var = 0;
    constructor() {
        this.keys_var = this.loadKeysFromEnv();
    }
    loadKeysFromEnv() {
        const keys_var = [];
        for (let i = 0; i < 2; i++) {
            const key_var = process.env[`ZAI_API_KEY_${i}`];
            if (!key_var) {
                throw new Error(`Missing API keys: ZAI_API_KEY_${i} is not set`);
            }
            keys_var.push(key_var);
        }
        return keys_var;
    }
    getAllKeys() {
        return [...this.keys_var];
    }
    getNextKey() {
        const key_var = this.keys_var[this.currentIndex_var];
        if (!key_var) {
            throw new Error('No key available at current index');
        }
        this.currentIndex_var = (this.currentIndex_var + 1) % this.keys_var.length;
        return key_var;
    }
    handle429Error() {
    }
    getAccountGroup(key_var) {
        const index_var = this.keys_var.indexOf(key_var);
        return index_var === 0 ? 'A' : 'B';
    }
}
//# sourceMappingURL=rotation.js.map