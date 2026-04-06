# Claude Code Hooks — 발표 자료

> 특정 시점에 자동으로 실행되는 셸 명령 자동화 기능

---

## [1페이지] Hooks란 무엇인가

### 한 줄 정의

- Claude Code가 작업하는 **특정 순간마다 자동으로 실행되는 셸 명령**
- "Claude가 파일을 수정하면 → 자동으로 포맷터 실행" 같은 자동화

### 어떤 문제를 해결하는가

- Claude가 코드를 저장할 때마다 수동으로 `prettier` 돌리기 번거로움
- 실수로 `.env` 같은 민감한 파일을 수정하면 위험
- Claude가 작업 중일 때 알림을 받고 싶은데 방법이 없음

### Hooks로 할 수 있는 것

- 파일 저장 시 자동 코드 포맷팅 (Prettier, ESLint)
- 특정 파일 편집 차단 (`.env`, `package-lock.json`)
- Claude가 입력을 기다릴 때 데스크톱 알림 발송
- 특정 명령 실행 전 로그 기록
- 프로젝트 규칙 자동 적용

---

## [2페이지] 설정 방법

### 설정 파일 위치

- `~/.claude/settings.json` (전역 설정 — 모든 프로젝트에 적용)
- `.claude/settings.json` (프로젝트 설정 — 해당 프로젝트에만 적용)

### 기본 구조

```json
{
  "hooks": {
    "이벤트명": [
      {
        "matcher": "대상 필터 (정규식)",
        "hooks": [
          {
            "type": "command",
            "command": "실행할 셸 명령"
          }
        ]
      }
    ]
  }
}
```

### 구조 읽는 법

- **이벤트명** : 언제 실행할지 (어떤 순간인지)
- **matcher** : 어떤 도구/파일에만 반응할지 (필터)
- **command** : 실제로 실행할 터미널 명령

---

## [3페이지] 주요 이벤트 5가지

### SessionStart

- **발생 시점** : Claude Code 세션이 시작될 때
- **활용 예** : 환경 상태 확인, 의존성 설치 여부 점검

### PreToolUse

- **발생 시점** : Claude가 도구(Edit, Bash 등)를 실행하기 **직전**
- **특징** : `exit 2`를 반환하면 도구 실행을 **차단(Block)** 할 수 있음
- **활용 예** : 위험한 파일 편집 막기, 실행 전 확인 로그

### PostToolUse

- **발생 시점** : 도구 실행이 **완료된 직후**
- **활용 예** : 파일 저장 후 자동 포맷팅, 변경 내역 로깅

### Notification

- **발생 시점** : Claude가 사용자 입력을 기다릴 때
- **활용 예** : 맥 알림, 슬랙 메시지, 소리 알림

### ConfigChange

- **발생 시점** : Claude Code 설정이 변경될 때
- **활용 예** : 설정 변경 이력 기록

---

## [4페이지] 실전 예제 3가지

### ① 알림 — Claude가 기다릴 때 알려주기

```json
{
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude가 응답을 기다립니다\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

- `osascript` : macOS 전용 알림
- Linux는 `notify-send` 명령 사용

### ② 자동 포맷팅 — 저장할 때마다 Prettier 실행

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$CLAUDE_FILE_PATH\""
          }
        ]
      }
    ]
  }
}
```

- `matcher: "Edit|Write"` : 파일 편집/생성 도구에만 반응
- `$CLAUDE_FILE_PATH` : Claude가 방금 수정한 파일 경로 자동 주입

### ③ 파일 보호 — 민감한 파일 편집 차단

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo $CLAUDE_FILE_PATH | grep -E '(\\.env|package-lock\\.json)' && exit 2 || exit 0"
          }
        ]
      }
    ]
  }
}
```

- `exit 2` : 도구 실행 차단 (Block)
- `exit 0` : 정상 허용 (Allow)
- `.env`, `package-lock.json` 수정 시도 시 자동으로 막음

---

## [5페이지] 입출력 구조와 확인 방법

### 입력 — Hook이 받는 정보

- Claude Code가 Hook을 실행할 때 **표준 입력(stdin)** 으로 JSON 데이터 전달

```json
{
  "tool": "Edit",
  "file_path": "/path/to/file.js",
  "session_id": "abc-123"
}
```

### 출력 — Hook이 돌려주는 신호

| 반환값 | 의미 | 사용 상황 |
|--------|------|-----------|
| `exit 0` | 허용 (Allow) | 정상 실행 통과 |
| `exit 2` | 차단 (Block) | PreToolUse에서 실행 막기 |
| JSON 구조 | 구조화된 응답 | 메시지를 Claude에게 다시 전달 |

### Matcher 필터 작성법

- 정규식 패턴 사용

```
"Edit|Write"     → Edit 또는 Write 도구에만 반응
"Bash"           → Bash 명령 실행에만 반응
"mcp__.*"        → 모든 MCP 도구에 반응
""               → 모든 도구에 반응 (필터 없음)
```

### 현재 설정 확인 방법

- Claude Code 안에서 `/hooks` 명령 입력
- 현재 등록된 Hooks 목록을 브라우저에서 시각적으로 확인 가능

---

## [6페이지] 핵심 요약

### Hooks = Claude Code에 "자동화 규칙" 붙이기

- 언제 실행할지 → **이벤트** (PreToolUse / PostToolUse / Notification 등)
- 무엇에 반응할지 → **Matcher** (Edit, Write, Bash 등 정규식)
- 무엇을 실행할지 → **Command** (셸 명령 한 줄)

### 실무에서 바로 쓸 수 있는 조합

| 목적 | 이벤트 | Matcher |
|------|--------|---------|
| 코드 자동 포맷 | PostToolUse | Edit\|Write |
| 민감 파일 보호 | PreToolUse | Edit\|Write |
| 작업 완료 알림 | Notification | (없음) |
| 실행 전 로그 | PreToolUse | Bash |

### 주의사항

- `exit 2` 차단은 `PreToolUse` 에서만 작동 (PostToolUse에선 이미 실행된 후)
- 설정 파일 경로 오타 주의 — `~/.claude/settings.json`
- `/hooks` 명령으로 항상 등록 상태를 먼저 확인
