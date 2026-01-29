import { describe, it, expect, beforeEach } from 'vitest';
import { ZAIKeyRotator } from './rotation';

describe('ZAIKeyRotator - Round-Robin Rotation', () => {
  let rotator_var: ZAIKeyRotator;

  beforeEach(() => {
    process.env.ZAI_API_KEY_0 = 'key-0-account-a';
    process.env.ZAI_API_KEY_1 = 'key-1-account-b';

    rotator_var = new ZAIKeyRotator();
  });

  describe('키 로딩', () => {
    it('환경변수에서 2개 키를 모두 로딩해야 함', () => {
      const keys_var = rotator_var.getAllKeys();
      expect(keys_var).toHaveLength(2);
      expect(keys_var).toEqual([
        'key-0-account-a',
        'key-1-account-b',
      ]);
    });

    it('일부 키가 없으면 에러를 발생시켜야 함', () => {
      delete process.env.ZAI_API_KEY_1;
      expect(() => new ZAIKeyRotator()).toThrow('Missing API keys');
    });
  });

  describe('Round-Robin 순환', () => {
    it('순서대로 2개 키를 순환해야 함', () => {
      expect(rotator_var.getNextKey()).toBe('key-0-account-a');
      expect(rotator_var.getNextKey()).toBe('key-1-account-b');
    });

    it('2번째 이후엔 다시 첫 번째 키로 돌아가야 함', () => {
      for (let i = 0; i < 2; i++) {
        rotator_var.getNextKey();
      }
      
      expect(rotator_var.getNextKey()).toBe('key-0-account-a');
      expect(rotator_var.getNextKey()).toBe('key-1-account-b');
    });
  });

  describe('429 에러 처리', () => {
    it('429 에러 시 다음 키로 전환해야 함', () => {
      const first_key_var = rotator_var.getNextKey();
      expect(first_key_var).toBe('key-0-account-a');

      rotator_var.handle429Error();

      const next_key_var = rotator_var.getNextKey();
      expect(next_key_var).toBe('key-1-account-b');
    });

    it('연속 429 에러 시 계속 다음 키로 전환해야 함', () => {
      rotator_var.getNextKey();

      rotator_var.handle429Error();
      expect(rotator_var.getNextKey()).toBe('key-1-account-b');

      rotator_var.handle429Error();
      expect(rotator_var.getNextKey()).toBe('key-0-account-a');
    });

    it('모든 키가 429 에러면 첫 번째 키로 순환해야 함', () => {
      for (let i = 0; i < 2; i++) {
        rotator_var.getNextKey();
        rotator_var.handle429Error();
      }

      expect(rotator_var.getNextKey()).toBe('key-0-account-a');
    });
  });

  describe('계정 그룹 정보', () => {
    it('각 키의 계정 그룹을 반환해야 함', () => {
      expect(rotator_var.getAccountGroup('key-0-account-a')).toBe('A');
      expect(rotator_var.getAccountGroup('key-1-account-b')).toBe('B');
    });
  });
});
