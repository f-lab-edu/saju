---
name: vercel-react-best-practices
description: Vercel Engineering의 React 성능 최적화 가이드 (70개 규칙). apps/web에서 성능 개선, 데이터 페칭 최적화, 번들 사이즈, 워터폴 제거, 리렌더 이슈를 다룰 때 사용. React 컴포넌트 작성·리뷰·리팩토링 시 활성화.
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
---

# Vercel React Best Practices

Comprehensive performance optimization guide for React applications, maintained by Vercel. Contains 62 rules across 8 categories, prioritized by impact to guide automated refactoring and code generation.

## ⚠️ 이 프로젝트 적용 노트 (규칙 원문보다 우선)

rules/ 파일은 업스트림(vercel-labs/agent-skills) 원본에서 **이 프로젝트에 맞지 않는 8개 규칙을 제거한 것**이다 (수동 메모이제이션 계열 3개 — React Compiler가 대체, RSC 전용 3개, SWR 1개 — TanStack Query가 대체, Next.js `after()` 1개). 남은 규칙도 Next.js 예시가 나오면 아래로 치환해서 읽을 것:

- **이 프로젝트는 Next.js가 아니라 TanStack Start(Vite + Nitro)다.**
  - `next/dynamic` → `React.lazy()` + Suspense (경계는 AsyncBoundary 재사용 가능). 라우트 단위 코드 스플리팅은 TanStack Router가 자동 처리.
  - API Routes / Server Actions → TanStack Start의 server function(`createServerFn`). `server-auth-actions`의 원칙(모든 서버 진입점에서 인증 검증)은 server function에 그대로 적용.
  - `next/script` → 라우트 `head()` 옵션으로 적용.
- **리렌더 규칙은 상태 설계 관점으로 읽는다**: 수동 memo 규칙은 제거됐고, 남은 것들(derived state, functional setState, lazy state init, transient values→ref, 인라인 컴포넌트 금지)은 React Compiler와 무관하게 유효하다.
- **요청 중복 제거·클라이언트 캐싱은 TanStack Query 담당** — 같은 데이터는 같은 queryKey로 접근. 별도 캐싱 라이브러리를 추가하지 않는다.
- **`async-suspense-boundaries`**: 우리 표준 패턴(useSuspenseQuery + AsyncBoundary, 라우트 loader 프리페치)과 정확히 일치 — 구체 구현은 apps/web/CLAUDE.md가 우선.
- **우선 적용 카테고리**: 이 프로젝트에서 가치가 큰 순서는 `async-`(워터폴 제거) > `bundle-` > `rerender-`(상태 설계) > `js-`. `server-` 계열은 server function을 본격적으로 쓰기 시작할 때 참조.

## When to Apply

Reference these guidelines when:
- Writing new React components or Next.js pages
- Implementing data fetching (client or server-side)
- Reviewing code for performance issues
- Refactoring existing React/Next.js code
- Optimizing bundle size or load times

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Eliminating Waterfalls | CRITICAL | `async-` |
| 2 | Bundle Size Optimization | CRITICAL | `bundle-` |
| 3 | Server-Side Performance | HIGH | `server-` |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH | `client-` |
| 5 | Re-render Optimization | MEDIUM | `rerender-` |
| 6 | Rendering Performance | MEDIUM | `rendering-` |
| 7 | JavaScript Performance | LOW-MEDIUM | `js-` |
| 8 | Advanced Patterns | LOW | `advanced-` |

## Quick Reference

### 1. Eliminating Waterfalls (CRITICAL)

- `async-cheap-condition-before-await` - Check cheap sync conditions before awaiting flags or remote values
- `async-defer-await` - Move await into branches where actually used
- `async-parallel` - Use Promise.all() for independent operations
- `async-dependencies` - Use better-all for partial dependencies
- `async-api-routes` - Start promises early, await late in API routes
- `async-suspense-boundaries` - Use Suspense to stream content

### 2. Bundle Size Optimization (CRITICAL)

- `bundle-barrel-imports` - Import directly, avoid barrel files
- `bundle-analyzable-paths` - Prefer statically analyzable import and file-system paths to avoid broad bundles and traces
- `bundle-dynamic-imports` - Use next/dynamic for heavy components
- `bundle-defer-third-party` - Load analytics/logging after hydration
- `bundle-conditional` - Load modules only when feature is activated
- `bundle-preload` - Preload on hover/focus for perceived speed

### 3. Server-Side Performance (HIGH)

- `server-auth-actions` - Authenticate server actions like API routes
- `server-cache-lru` - Use LRU cache for cross-request caching
- `server-hoist-static-io` - Hoist static I/O (fonts, logos) to module level
- `server-no-shared-module-state` - Avoid module-level mutable request state in RSC/SSR
- `server-parallel-fetching` - Restructure components to parallelize fetches
- `server-parallel-nested-fetching` - Chain nested fetches per item in Promise.all

### 4. Client-Side Data Fetching (MEDIUM-HIGH)

- `client-event-listeners` - Deduplicate global event listeners
- `client-passive-event-listeners` - Use passive listeners for scroll
- `client-localstorage-schema` - Version and minimize localStorage data

### 5. Re-render Optimization (MEDIUM)

- `rerender-defer-reads` - Don't subscribe to state only used in callbacks
- `rerender-dependencies` - Use primitive dependencies in effects
- `rerender-derived-state` - Subscribe to derived booleans, not raw values
- `rerender-derived-state-no-effect` - Derive state during render, not effects
- `rerender-functional-setstate` - Use functional setState for stable callbacks
- `rerender-lazy-state-init` - Pass function to useState for expensive values
- `rerender-simple-expression-in-memo` - Avoid memo for simple primitives
- `rerender-split-combined-hooks` - Split hooks with independent dependencies
- `rerender-move-effect-to-event` - Put interaction logic in event handlers
- `rerender-transitions` - Use startTransition for non-urgent updates
- `rerender-use-deferred-value` - Defer expensive renders to keep input responsive
- `rerender-use-ref-transient-values` - Use refs for transient frequent values
- `rerender-no-inline-components` - Don't define components inside components

### 6. Rendering Performance (MEDIUM)

- `rendering-animate-svg-wrapper` - Animate div wrapper, not SVG element
- `rendering-content-visibility` - Use content-visibility for long lists
- `rendering-svg-precision` - Reduce SVG coordinate precision
- `rendering-hydration-no-flicker` - Use inline script for client-only data
- `rendering-hydration-suppress-warning` - Suppress expected mismatches
- `rendering-activity` - Use Activity component for show/hide
- `rendering-conditional-render` - Use ternary, not && for conditionals
- `rendering-usetransition-loading` - Prefer useTransition for loading state
- `rendering-resource-hints` - Use React DOM resource hints for preloading
- `rendering-script-defer-async` - Use defer or async on script tags

### 7. JavaScript Performance (LOW-MEDIUM)

- `js-batch-dom-css` - Group CSS changes via classes or cssText
- `js-index-maps` - Build Map for repeated lookups
- `js-cache-property-access` - Cache object properties in loops
- `js-cache-function-results` - Cache function results in module-level Map
- `js-cache-storage` - Cache localStorage/sessionStorage reads
- `js-combine-iterations` - Combine multiple filter/map into one loop
- `js-length-check-first` - Check array length before expensive comparison
- `js-early-exit` - Return early from functions
- `js-hoist-regexp` - Hoist RegExp creation outside loops
- `js-min-max-loop` - Use loop for min/max instead of sort
- `js-set-map-lookups` - Use Set/Map for O(1) lookups
- `js-tosorted-immutable` - Use toSorted() for immutability
- `js-flatmap-filter` - Use flatMap to map and filter in one pass
- `js-request-idle-callback` - Defer non-critical work to browser idle time

### 8. Advanced Patterns (LOW)

- `advanced-effect-event-deps` - Don't put `useEffectEvent` results in effect deps
- `advanced-event-handler-refs` - Store event handlers in refs
- `advanced-init-once` - Initialize app once per app load
- `advanced-use-latest` - useLatest for stable callback refs

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/async-parallel.md
rules/bundle-barrel-imports.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references
