# opencode-zai-auth

**2개의 키를 활용한 round-robin 로테이션** 기능을 지원하는 ZAI API용 OpenCode 인증 플러그인입니다.

---

## 🚀 빠른 시작 (Quick Start)

```bash
npm install opencode-zai-auth
```

---

## 🔑 환경 변수 설정 가이드

이 플러그인을 사용하려면 **2개의 ZAI API key**를 환경 변수로 설정해야 합니다.

### 필수 환경 변수

```bash
# ~/.zshrc 또는 ~/.bashrc
export ZAI_API_KEY_0="여러분의-api-key-0"
export ZAI_API_KEY_1="여러분의-api-key-1"
```

### .env 파일 사용 시

```bash
# .env
ZAI_API_KEY_0=your-api-key-0
ZAI_API_KEY_1=your-api-key-1
```

---

## ⚙️ 설정 파일

환경 변수 외에도 설정 파일을 통해 플러그인을 구성할 수 있습니다.

### 설정 파일 위치

```
~/.config/opencode/zai.json
```

### 설정 파일 예시

```json
{
  "debug": false,
  "keys": [
    "your-api-key-0",
    "your-api-key-1"
  ]
}
```

### 설정 항목

| 항목 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `debug` | boolean | `false` | 디버그 로그 출력 활성화 |
| `keys` | string[] | `[]` | API 키 목록 |

### 우선순위

설정은 다음 순서로 적용됩니다 (아래로 갈수록 우선):

1. **기본값** - 코드에 정의된 기본 설정
2. **설정 파일** - `~/.config/opencode/zai.json`
3. **환경 변수** - `ZAI_API_KEY_0~N`, `ZAI_DEBUG` (최우선)

> ⚠️ **주의**: 환경 변수에 키가 1개라도 설정되면 설정 파일의 keys는 무시됩니다.

### 디버그 모드 활성화

```bash
# 환경 변수로 활성화
export ZAI_DEBUG=1

# 또는 설정 파일에서 활성화
# ~/.config/opencode/zai.json
{
  "debug": true
}
```

---

## 🔌 OpenCode 플러그인 설정

OpenCode에서 이 플러그인을 사용하려면 `opencode.json` 설정 파일에 추가하세요.

### opencode.json 설정 예시

```json
{
  "plugins": [
    "opencode-zai-auth"
  ]
}
```

### 전체 설정 예시

```json
{
  "plugins": [
    "opencode-zai-auth"
  ],
  "provider": "zai-coding-plan",
  "model": "glm-4-plus"
}
```

> **참고**: provider ID는 `zai-coding-plan`입니다 (빌트인 오버라이드).

---

## 🔄 키 로테이션 전략 (Key Rotation Strategy)

### Round-Robin 로테이션

플러그인은 2개의 키를 순차적으로 순환하는 **round-robin** 전략을 사용합니다.

```
요청 1 → KEY_0
요청 2 → KEY_1
요청 3 → KEY_0 (다시 처음으로)
...
```

### 계정 그룹

부하 분산 및 효율적인 관리를 위해 키는 두 그룹으로 나뉩니다.

| 그룹 | 키 (Keys) |
|-------|------|
| **A** | KEY_0 |
| **B** | KEY_1 |

---

## ⚡ Rate Limit 대응

**429 Rate Limit** 에러가 발생하면 다음과 같이 동작합니다.

1. 현재 사용 중인 키를 'rate-limited' 상태로 표시합니다.
2. 로테이션 순서에 따라 자동으로 다음 키를 선택합니다.
3. 'rate-limited' 상태인 키는 cooldown 기간이 끝날 때까지 건너뜁니다.

### Rate Limit 대기 시간 (Windows)

| 구분 (Window) | 지속 시간 (Duration) | 동작 방식 (Behavior) |
|--------|----------|----------|
| 분 단위 (Minute) | 60초 | 해당 키를 1분간 차단 |
| 시간 단위 (Hour) | 60분 | 해당 키를 1시간 동안 차단 |
| 일 단위 (Day) | 24시간 | 해당 키를 24시간 동안 차단 |

---

## 📦 사용 예시

```typescript
import { ZAIKeyRotator } from 'opencode-zai-auth';

const rotator_var = new ZAIKeyRotator();

// 다음 API key 가져오기
const apiKey_var = rotator_var.getNextKey();

// fetch와 함께 사용 예시
const response_var = await fetch('https://api.zai.ai/v1/chat', {
  headers: {
    'Authorization': `Bearer ${apiKey_var}`,
  },
});

// 429 에러 처리
if (response_var.status === 429) {
  rotator_var.handle429Error();
  // 다음 키로 재시도 로직 구현 가능
}
```

---

## ⚠️ 중요 주의사항

1. **2개의 키가 모두 필요합니다** - 키가 하나라도 누락되면 플러그인에서 에러를 발생시킵니다.
2. **서로 다른 계정의 키 사용 권장** - 효과적인 rate limit 대응을 위해 가급적 다른 계정에서 발급받은 키를 사용하는 것이 좋습니다.
3. **API Key 보안 유지** - API key는 고유하고 개인적인 정보이므로 절대 외부에 공유하지 마십시오.

---

## 🧪 테스트 (Testing)

```bash
bun test
```

---

## 📄 라이선스 (License)

MIT
