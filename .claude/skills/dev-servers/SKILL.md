---
name: dev-servers
description: 이 프로젝트의 개발 서버(웹 + Expo)를 실행하거나 동작을 확인해야 할 때 사용. "앱 실행해줘", "화면 확인해줘", "웹뷰 테스트" 같은 요청에서 트리거.
---

# 개발 서버 실행

## 웹 (TanStack Start)

```bash
pnpm dev:web
```

- http://localhost:3000 에서 뜬다. 백그라운드로 실행하고 `curl -s localhost:3000` 또는 Playwright MCP로 확인.
- 포트가 이미 사용 중이면 기존 프로세스 확인: `lsof -i :3000`
- 라우트 파일 추가 후 타입 에러가 나면: `pnpm --filter web generate-routes`

## 모바일 (Expo)

```bash
pnpm dev:mobile
```

- **웹 서버가 먼저 떠 있어야 한다.** WebView가 localhost:3000을 로드하는 구조.
- iOS 시뮬레이터: Expo 터미널에서 `i`, Android 에뮬레이터: `a`
- Android 에뮬레이터는 `10.0.2.2:3000`으로 접근하도록 이미 처리되어 있음 (`apps/mobile/App.tsx`)

## 검증 순서

1. 웹 단독으로 브라우저(Playwright MCP)에서 먼저 확인 — 대부분의 문제는 여기서 잡힌다.
2. 웹뷰 관련 변경일 때만 Expo까지 띄워서 확인한다.
