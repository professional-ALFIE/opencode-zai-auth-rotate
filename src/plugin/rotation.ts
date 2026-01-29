export class ZAIKeyRotator {
  private keys_var: string[];
  private currentIndex_var: number = 0;

  constructor() {
    this.keys_var = this.loadKeysFromEnv();
  }

  private loadKeysFromEnv(): string[] {
    const keys_var: string[] = [];
    
    for (let i = 0; i < 2; i++) {
      const key_var = process.env[`ZAI_API_KEY_${i}`];
      if (!key_var) {
        throw new Error(`Missing API keys: ZAI_API_KEY_${i} is not set`);
      }
      keys_var.push(key_var);
    }
    
    return keys_var;
  }

  getAllKeys(): string[] {
    return [...this.keys_var];
  }

  getNextKey(): string {
    const key_var = this.keys_var[this.currentIndex_var];
    if (!key_var) {
      throw new Error('No key available at current index');
    }
    this.currentIndex_var = (this.currentIndex_var + 1) % this.keys_var.length;
    return key_var;
  }

  handle429Error(): void {
  }

  getAccountGroup(key_var: string): 'A' | 'B' {
    const index_var = this.keys_var.indexOf(key_var);
    return index_var === 0 ? 'A' : 'B';
  }
}
