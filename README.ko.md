# opencode-zai-auth

**멀티 키 라운드 로빈(Round-robin) 로테이션** 및 자동 재시도 메커니즘을 지원하는 ZAI API용 OpenCode 인증 플러그인입니다.

---

## 🚀 설치

```bash
npm install opencode-zai-auth
```

---

## 🔑 환경 변수 설정

이 플러그인을 사용하려면 최소 하나 이상의 ZAI API 키를 환경 변수로 설정해야 합니다. 여러 개의 키를 설정하면 자동으로 로테이션됩니다.

### 필수 환경 변수

```bash
# API 키 설정 (0부터 N까지)
export ZAI_API_KEY_0="your-api-key-0"
export ZAI_API_KEY_1="your-api-key-1"
# ...
export ZAI_API_KEY_N="your-api-key-n"
```

### 선택적 환경 변수

```bash
# 디버그 모드 활성화
export ZAI_DEBUG=1
```

---

## ⚙️ 설정 (Configuration)

JSON 파일을 사용하여 플러그인을 구성할 수 있습니다.

### 설정 파일 경로
`~/.config/opencode/zai.json`

### 설정 파일 예시
```json
{
  "debug": false
}
```

*참고: 설정 파일에서는 `keys` 필드를 지원하지 않습니다. API 키는 환경 변수를 사용해 주세요.*

### 디버그 모드
디버그 로그는 환경 변수 또는 설정 파일을 통해 활성화할 수 있습니다.

```bash
# 환경 변수를 통한 활성화
export ZAI_DEBUG=1

# 설정 파일을 통한 활성화 (~/.config/opencode/zai.json)
{
  "debug": true
}
```

---

## 🔌 OpenCode 연동

OpenCode에서 이 플러그인을 사용하려면 `opencode.json` 설정 파일에 추가하세요.

### opencode.json 예시

```json
{
  "plugin": ["opencode-zai-auth"]
}
```
*(참고: "plugins"가 아닌 단수형인 "plugin" 키를 사용해야 합니다.)*

### 전체 설정 예시

```json
{
  "plugin": ["opencode-zai-auth"],
  "provider": "zai-coding-plan",
  "model": "glm-4-plus"
}
```

> **중요**: 프로바이더 ID는 `"zai-coding-plan"`입니다. 이 플러그인은 빌트인 `zai-coding-plan` 프로바이더를 오버라이드합니다.

---

## 🔄 멀티 키 로테이션 전략

### 라운드 로빈(Round-Robin) 로테이션
플러그인은 `ZAI_API_KEY_N` 패턴을 따르는 모든 환경 변수를 자동으로 감지하고 순차적으로 순환합니다.

```
요청 1 → ZAI_API_KEY_0
요청 2 → ZAI_API_KEY_1
요청 3 → ZAI_API_KEY_0 (다시 처음으로)
```

---

## ⚡ 에러 처리 및 쿨다운 (Cooldown)

플러그인은 다양한 에러 코드가 발생했을 때 자동으로 다음 가용 키로 전환합니다.

1. **429 (Rate Limit)**: 현재 키를 'rate-limited' 상태로 표시합니다.
2. **401 (Unauthorized)**: 키가 유효하지 않음으로 표시합니다.
3. **5xx (Server Error)**: 다음 키로 자동 재시도합니다.

### 쿨다운(Cooldown) 메커니즘
속도 제한(Rate limit)에 도달한 키는 쿨다운 상태가 되며, 대기 시간이 끝날 때까지 건너뜁니다.

| 단위 (Window) | 지속 시간 (Duration) | 동작 방식 (Behavior) |
|--------|----------|----------|
| 분 단위 (Minute) | 60초 | 해당 키를 1분간 차단 |
| 시간 단위 (Hour) | 60분 | 해당 키를 1시간 동안 차단 |
| 일 단위 (Day) | 24시간 | 해당 키를 24시간 동안 차단 |

---

## 🛠 트러블슈팅

1. **"No API keys found"**: 최소한 `ZAI_API_KEY_0`이 내보내기(export) 되어 있는지 확인하세요.
2. **"All keys are on cooldown"**: 제공된 모든 키가 속도 제한에 도달했습니다. 잠시 기다리거나 키를 더 추가해 주세요.
3. **플러그인이 로드되지 않음**: `opencode.json`에서 단수형인 `"plugin": ["opencode-zai-auth"]` 필드를 사용하고 있는지 확인하세요.

---

## 🧪 테스트

```bash
bun test
```

---

## 📄 라이선스

MIT
