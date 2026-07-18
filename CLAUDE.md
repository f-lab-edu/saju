# 사주 (Saju) 앱

React Native(Expo) 껍데기 안에 TanStack Start 웹앱을 WebView로 띄우는 하이브리드 사주 앱.

## 프로젝트 구조

pnpm workspace 모노레포:

- `apps/web`: TanStack Start (React 19 + React Compiler, TanStack Query, zustand, react-hook-form, react-error-boundary, Tailwind v4, Vitest + RTL). 실제 UI/로직은 전부 여기. 스택 컨벤션은 `apps/web/CLAUDE.md`(디렉토리 메모리, 웹 파일 작업 시 자동 로드), 테스트는 `web-testing` skill 참조.
- `apps/mobile`: Expo (SDK 57). `react-native-webview`로 웹앱을 감싸는 껍데기. 네이티브 기능이 필요할 때만 손댄다.
- `packages/`: (예정) 웹/모바일이 공유하는 사주 계산 코어.

## 명령어

루트에서 실행:

- `pnpm dev:web`: 웹 개발 서버 (http://localhost:3000)
- `pnpm dev:mobile`: Expo 개발 서버 (웹 서버가 먼저 떠 있어야 WebView에 내용이 보임)
- `pnpm --filter web test`: 웹 테스트 (vitest)
- `pnpm lint`: 웹 oxlint (react/rules-of-hooks + react/react-compiler 네이티브 규칙 + TanStack Query는 `jsPlugins`(alpha)로 `@tanstack/eslint-plugin-query` 실행). 설정은 `apps/web/.oxlintrc.json`
- `pnpm format`: oxfmt 전체 포맷 (스타일은 루트 `.oxfmtrc.json`: semi 없음, 작은따옴표). `pnpm format:check`로 검사만
- 타입체크는 TypeScript 7 네이티브(`tsgo`, `@typescript/native-preview`): `pnpm --filter web typecheck`

## 아키텍처 규칙

- 비즈니스 로직(사주 계산, 만세력)은 `apps/mobile`에 두지 않는다. 웹 또는 공유 패키지에.
- 모바일 → 웹 통신은 WebView `postMessage` 브릿지로만. 브릿지 메시지는 `{ type: string, payload: unknown }` 형태 유지.
- Android 에뮬레이터에서 로컬 웹 서버는 `10.0.2.2:3000`으로 접근 (`apps/mobile/App.tsx` 참고).
- 라우트는 `apps/web/src/routes/` 파일 기반 라우팅. 라우트 추가 후 타입 에러가 나면 `pnpm --filter web generate-routes`.
- 상태 관리 역할 분담: 서버 상태=TanStack Query(`useSuspenseQuery` + `AsyncBoundary`가 기본, `useQuery` 금지), 전역 클라이언트 상태=zustand(`src/stores/`), 폼=react-hook-form, 공유 가능한 화면 상태=URL search params.
- React Compiler 활성화 상태: 수동 메모이제이션(useMemo/useCallback/React.memo) 금지, forwardRef 대신 ref prop.

## 주의사항 (실제로 겪은 함정)

- **react / react-dom 버전은 19.2.3으로 정확히 고정** (`apps/web/package.json`). Expo가 react를 exact 버전으로 고정하는데, `.npmrc`의 `node-linker=hoisted` 때문에 웹과 모바일이 react를 공유한다. 버전이 어긋나면 웹 서버가 "Incompatible React versions"로 죽는다. react 버전을 올릴 때는 두 앱을 함께 올릴 것.
- `.npmrc`의 `node-linker=hoisted`는 Expo/Metro 호환성 때문에 필요하다. 제거하지 말 것.
- `apps/web/src/routeTree.gen.ts`는 자동 생성 파일. 직접 수정 금지. 라우트 파일을 추가하면 dev 서버가 재생성하고, 수동 재생성은 `pnpm --filter web generate-routes`.

## 변경 후 검증

- 웹 변경: `pnpm --filter web test` 실행 후 `pnpm dev:web`으로 실제 화면 확인 (Playwright MCP 활용 가능)
- 모바일 변경: `cd apps/mobile && pnpm exec tsgo --noEmit`
- 워크스페이스에 새 패키지 추가 시: `packages/` 아래 생성 → 루트에서 `pnpm install` (pnpm-workspace.yaml이 `packages/*`를 이미 포함)

## 도메인 용어

- 사주팔자(四柱八字): 년/월/일/시 4개 기둥, 각 기둥은 천간+지지 2글자 = 8글자
- 천간(天干) 10개: 갑을병정무기경신임계
- 지지(地支) 12개: 자축인묘진사오미신유술해
- 만세력: 양력/음력 날짜 → 간지(干支) 변환에 쓰는 달력 데이터

## Claude Code 설정 맵 (이 저장소의 학습 포인트)

배치 원칙: **공통은 루트 `.claude/`, 앱 전용은 해당 앱의 `.claude/`** (중첩 skill/agent는 그 디렉토리 파일을 다룰 때 on-demand 로드됨). 단, **hooks와 settings.json은 중첩을 지원하지 않으므로 항상 루트에** 두고, 스크립트 안에서 경로로 대상을 거른다.

루트 (공통):

- `.claude/settings.json`: hooks 등록 + 권한 설정 (웹 전용 hook도 여기 등록, 스크립트가 `apps/web` 경로만 검사)
- `.claude/hooks/`: 자동 포맷+lint(format-file: oxfmt 후 apps/web 파일은 oxlint --fix, 남은 오류는 Claude에 피드백), .env 보호, 완료 알림, 수동 메모 경고, useQuery 경고, 서브에이전트 라우팅 힌트(UserPromptSubmit), 커밋 전 검증 강제(pre-commit-check: tsgo/lint/테스트 실패 시 git commit 차단)
- `.claude/agents/`: saju-master(사주 도메인 전문가), debugger(진단 전용 디버깅, 수정 금지)
- `.claude/rules/`: 항상 로드되는 규칙 파일(`.md`만 인식, `.mdx` 불가). performance.md(모델 선택·컨텍스트 관리), markdown-style.md(md 작성 시 em-dash 금지·강조 최소화). frontmatter `paths:` glob을 주면 해당 파일을 읽을 때만 조건부 로드
- `.claude/skills/`: dev-servers(두 앱 실행), saju-calc(공유 도메인 규칙), ship(/ship: 검증→커밋→브랜치→머지/PR 워크플로)
- `.mcp.json`: MCP 서버 (context7 문서 조회, playwright 브라우저)

apps/web (웹 전용):

- `apps/web/CLAUDE.md`: 웹 스택 핵심 컨벤션(React 19/Compiler, Query/zustand/RHF, Tailwind). 항상 적용되는 필수 규칙이라 skill(모델 판단 로드)이 아니라 디렉토리 메모리로 둔다. 웹 파일을 읽을 때 결정적으로 로드됨.
- `apps/web/.claude/agents/frontend-reviewer.md`: TanStack Start 코드 리뷰어
- `apps/web/.claude/skills/`: web-testing(Vitest+RTL), toss-frontend-fundamentals(코드 품질 4기준 + 17개 규칙), react-best-practices(Vercel 성능 62규칙, 부적합 8개 제거됨). 상황 의존적이거나 대형 외부 참조라 on-demand skill로 둔다. 외부 유래 skill은 SKILL.md 상단 "프로젝트 적용 노트"가 규칙 원문보다 우선.
  - 규칙이 skill별 `rules/` 아래 개별 파일로 쪼개진 것은 의도된 점진 로드 구조다(트리거 시 SKILL.md만, 개별 규칙은 필요할 때만 로드). 파일 수를 줄이려고 통합하거나 `.claude/rules/`(항상 로드)로 옮기지 말 것.

apps/mobile:

- `apps/mobile/CLAUDE.md`: Expo 스캐폴더가 생성한 디렉토리별 메모리 (mobile 파일을 읽을 때 로드)
