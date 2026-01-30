# opencode-zai-auth

ZAI API를 위한 OpenCode 인증 플러그인입니다. **멀티 키 라운드 로빈 로테이션(multi-key round-robin rotation)** 및 자동 재시도 메커니즘을 지원합니다.

---

## 🚀 설치

```bash
npm install opencode-zai-auth
```

---

## 🔑 환경 변수

이 플러그인은 환경 변수로 설정된 최소 하나 이상의 ZAI API 키가 필요합니다. 자동 로테이션을 위해 여러 개의 키를 지원합니다.

### 필수 변수

```bash
# API 키 설정 (0부터 N까지)
export ZAI_API_KEY_0="your-api-key-0"
export ZAI_API_KEY_1="your-api-key-1"
# ...
export ZAI_API_KEY_N="your-api-key-n"
```

### 선택 변수

```bash
# 디버그 모드 활성화
export ZAI_DEBUG=1
```

---

## 📁 파일 구조

```
opencode-zai-auth/
├── index.ts                  # re-export only (진입점)
├── src/
│   ├── plugin.ts             # 메인 플러그인 로직
│   ├── constants.ts          # 상수 정의
│   └── plugin/
│       ├── types.ts          # 타입 정의
│       ├── keys.ts           # KeyManager (round-robin rotation)
│       └── config/
│           ├── loader.ts     # 환경변수 로딩
│           └── schema.ts     # 설정 스키마
```

---

## ⚙️ 설정

JSON 파일을 사용하여 플러그인을 설정할 수 있습니다.

### 설정 파일 경로
`~/.config/opencode/zai.json`

### 설정 예시
```json
{
  "debug": false
}
```

*참고: 설정 파일에서는 `keys` 필드를 지원하지 않습니다. API 키는 환경 변수를 사용해 주세요.*

### 디버그 모드
디버그 로그는 환경 변수 또는 설정 파일을 통해 활성화할 수 있습니다.

```bash
# 환경 변수를 통한 설정
export ZAI_DEBUG=1

# 설정 파일을 통한 설정 (~/.config/opencode/zai.json)
{
  "debug": true
}
```

---

## 🔌 OpenCode 통합

이 플러그인을 OpenCode와 함께 사용하려면 `opencode.json` 설정 파일에 추가하세요.

### opencode.json 예시

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-zai-auth"],
  "model": "zai-coding-plan/glm-4-plus"
}
```

> **참고**: 
> - `"plugins"`가 아닌 단수형 `"plugin"`을 사용해야 합니다.
> - `model` 형식은 `"provider/model"`입니다 (예: `"zai-coding-plan/glm-4-plus"`).
> - 이 플러그인은 내장된 `zai-coding-plan` 프로바이더의 인증을 덮어씁니다.

---

## 🔄 멀티 키 로테이션 전략

### 라운드 로빈 로테이션
플러그인은 `ZAI_API_KEY_N` 패턴을 따르는 모든 환경 변수를 자동으로 감지하고 순차적으로 로테이션합니다.

```
요청 1 → ZAI_API_KEY_0
요청 2 → ZAI_API_KEY_1
요청 3 → ZAI_API_KEY_0 (다시 처음으로)
```

---

## ⚡ 에러 처리 및 쿨다운

플러그인은 다양한 에러 코드를 처리하며 자동으로 다음 가용 키로 전환합니다.

1. **429 (Rate Limit)**: 현재 키를 '쿨다운' 상태로 표시합니다.
2. **401 (Unauthorized)**: 현재 키를 유효하지 않은 것으로 표시합니다.
3. **5xx (Server Error)**: 다음 키로 자동 재시도합니다.

### 쿨다운 메커니즘
에러가 발생한 키는 쿨다운 상태가 되며, 대기 시간이 만료될 때까지 건너뜁니다.

| 상태 | 동작 |
|------|------|
| 429/401/403 에러 | 해당 키 60초 쿨다운 |
| 5xx 서버 에러 | 쿨다운 없이 다음 키로 전환 |
| 네트워크 에러 | 다음 키로 전환 |

---

## 🛠 문제 해결

1. **"No API keys found"**: 최소한 `ZAI_API_KEY_0`이 내보내기(export) 되어 있는지 확인하세요.
2. **"All keys are on cooldown"**: 제공된 모든 키가 속도 제한에 도달했습니다. 잠시 기다리거나 키를 더 추가하세요.
3. **플러그인이 로드되지 않음**: `opencode.json`에서 단수형인 `"plugin": ["opencode-zai-auth"]` 필드를 사용하고 있는지 확인하세요.

---

## 🧪 테스트

```bash
bun test
```

---

## 📄 라이선스

MIT
