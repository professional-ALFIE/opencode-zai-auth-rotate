import { loadKeysFromEnv } from "./config/loader";
import { COOLDOWN_MS } from "../constants";

/**
 * KeyManager 클래스 - API Key Round-Robin Rotation
 */
export class KeyManager {
  private keys: string[];
  private currentIndex: number;
  private rateLimitedUntil: Map<number, number>;

  /**
   * 생성자: 환경변수에서 키 로드 (loadKeysFromEnv 재사용)
   * @throws Error "No API keys found. Set ZAI_API_KEY_0 environment variable."
   */
  constructor() {
    this.keys = loadKeysFromEnv("ZAI_API_KEY_");
    if (this.keys.length === 0) {
      throw new Error("No API keys found. Set ZAI_API_KEY_0 environment variable.");
    }
    this.currentIndex = 0;
    this.rateLimitedUntil = new Map();
  }

  /**
   * 다음 사용 가능한 키 반환 (round-robin) - SYNC 함수
   * @returns string - API 키 문자열
   */
  getNextKey(): string {
    const now = Date.now();

    // 1. 쿨다운이 아닌 키 찾기
    for (let i = 0; i < this.keys.length; i++) {
      const idx = (this.currentIndex + i) % this.keys.length;
      const cooldownUntil = this.rateLimitedUntil.get(idx) ?? 0;
      if (now >= cooldownUntil) {
        this.currentIndex = (idx + 1) % this.keys.length;
        return this.keys[idx]!;
      }
    }

    // 2. 모든 키가 쿨다운이면 가장 빨리 만료되는 키 즉시 반환
    let minWait = Infinity;
    let minIdx = 0;
    for (let i = 0; i < this.keys.length; i++) {
      const cooldownUntil = this.rateLimitedUntil.get(i) ?? 0;
      const wait = cooldownUntil - now;
      if (wait < minWait) {
        minWait = wait;
        minIdx = i;
      }
    }
    this.currentIndex = (minIdx + 1) % this.keys.length;
    return this.keys[minIdx]!;
  }

  /**
   * 특정 인덱스의 키를 rate-limited로 마킹
   * @param index - 키의 인덱스 (0-based)
   */
  markRateLimited(index: number): void {
    this.rateLimitedUntil.set(index, Date.now() + COOLDOWN_MS);
  }

  /**
   * 현재 인덱스 조회 (마지막으로 반환된 키의 인덱스)
   * @returns number - 현재 인덱스
   */
  getCurrentIndex(): number {
    return (this.currentIndex - 1 + this.keys.length) % this.keys.length;
  }

  /**
   * 키 개수 조회
   * @returns number - 로드된 키 개수
   */
  getKeyCount(): number {
    return this.keys.length;
  }

  /**
   * 최소 쿨다운 대기 시간 조회 (ms)
   * @returns number - 사용 가능한 키가 있으면 0, 없으면 최소 대기 시간
   */
  getMinCooldownMs(): number {
    const now = Date.now();
    let minWait = 0;
    for (let i = 0; i < this.keys.length; i++) {
      const cooldownUntil = this.rateLimitedUntil.get(i) ?? 0;
      if (now >= cooldownUntil) {
        return 0;
      }
      const wait = cooldownUntil - now;
      if (minWait === 0 || wait < minWait) {
        minWait = wait;
      }
    }
    return minWait;
  }
}
