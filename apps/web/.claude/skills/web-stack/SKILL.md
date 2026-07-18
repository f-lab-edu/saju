---
name: web-stack
description: apps/web에서 React 컴포넌트·라우트·상태관리·폼 코드를 작성하거나 수정할 때 사용. React 19 + React Compiler + TanStack Query + zustand + react-hook-form + Tailwind 컨벤션.
---

# apps/web 스택 컨벤션

apps/web 코드를 작성하기 전에 이 규칙을 따를 것.

## React 19 + React Compiler (가장 중요)

React Compiler가 켜져 있다 (`vite.config.ts`, `vitest.config.ts`의 `babel-plugin-react-compiler`).

- **`useMemo`, `useCallback`, `React.memo`를 쓰지 않는다.** 컴파일러가 자동 메모이제이션한다. (hook이 경고를 띄운다)
- 대신 Rules of React를 지킨다: 렌더 중 부수효과 금지, props/state 직접 변경 금지. 컴파일러는 규칙을 지킨 코드만 최적화한다.
- `forwardRef` 금지. React 19부터 `ref`를 일반 prop으로 받는다: `function Input({ ref, ...props }: Props & { ref?: Ref<HTMLInputElement> })`
- Context는 `<MyContext value={...}>`로 직접 렌더 (`.Provider` 불필요). 읽을 때는 조건부 가능한 `use(MyContext)` 우선.
- `<title>`, `<meta>`는 컴포넌트에서 직접 렌더 가능하지만, 라우트 레벨 메타데이터는 TanStack Router의 `head()` 옵션을 쓴다.

## 상태 관리: 종류별로 도구가 다르다

| 상태 종류              | 도구                          | 예                              |
| ---------------------- | ----------------------------- | ------------------------------- |
| 서버 상태 (API 데이터) | TanStack Query                | 사주 풀이 결과, 사용자 프로필   |
| 전역 클라이언트 상태   | zustand                       | 테마, 입력 중인 생년월일시      |
| 폼 상태                | react-hook-form               | 생년월일 입력 폼                |
| URL 상태               | TanStack Router search params | 탭, 필터, 공유 가능한 화면 상태 |

서버 데이터를 zustand에 복사하지 않는다. 폼 값을 zustand에 실시간 동기화하지 않는다(제출 시점에만).

## TanStack Query: Suspense가 기본

- **데이터 조회는 `useSuspenseQuery`가 기본이다. `useQuery`는 쓰지 않는다.** (hook이 경고한다) `isLoading`/`isError` 분기 코드를 컴포넌트에 넣지 않는다. 로딩은 Suspense가, 에러는 ErrorBoundary가 담당.
- Suspense 경계는 `src/components/AsyncBoundary.tsx`를 쓴다. 로딩 fallback + 에러 fallback + 쿼리 리셋(다시 시도)이 묶여 있다:

```tsx
<AsyncBoundary>
  <FortuneResult birth={birth} /> {/* 내부에서 useSuspenseQuery */}
</AsyncBoundary>
```

- 경계 위치 = 로딩 UI 단위. 화면 전체가 아니라 독립적으로 로딩되어야 할 조각(카드, 패널)마다 감싼다.
- QueryClient는 `src/router.tsx`에서 라우터 context로 주입된다. **라우트에서 쓰는 쿼리는 loader에서 `context.queryClient.ensureQueryData(fortuneQuery(birth))`로 프리페치**한다. SSR에서 데이터가 미리 준비되고 클라이언트 워터폴이 없어진다. loader 프리페치가 있으면 컴포넌트의 useSuspenseQuery는 캐시를 바로 읽는다.
- 쿼리 정의는 `queryOptions()` 헬퍼로 만들어 loader와 컴포넌트가 공유한다:

```ts
export const fortuneQuery = (birth: string) =>
  queryOptions({
    queryKey: ['fortune', birth],
    queryFn: () => fetchFortune(birth),
  })
```

- `useQuery`가 정당한 예외: 폴링(refetchInterval), 조건부 조회(enabled), 백그라운드 갱신 표시처럼 "없어도 화면이 성립하는" 데이터. 이때는 왜 suspense가 아닌지 주석을 남긴다.
- 뮤테이션 후에는 `queryClient.invalidateQueries()`로 무효화. 낙관적 업데이트가 필요하면 `useOptimistic`(React 19) 또는 mutation의 `onMutate` 롤백 패턴.

## zustand

- 스토어는 `src/stores/`에 도메인 단위로. 거대 단일 스토어 금지.
- 컴포넌트에서는 셀렉터로 구독: `useBirthStore((s) => s.birthDate)`. 스토어 전체 구독 금지.
- 액션은 스토어 안에 정의하고, `set` 밖에서 상태를 직접 변경하지 않는다.

## react-hook-form

- 비제어(uncontrolled) 기본: `register` 우선, 커스텀 컴포넌트만 `Controller`.
- 검증 규칙은 `register`의 옵션 또는 resolver로. 제출 핸들러는 `handleSubmit(onValid)` 경유.
- 에러 표시는 `formState.errors`: 각 필드에 연결된 `<p role="alert">` 형태로 접근성 유지.

## 에러 처리

- 전역 경계는 `src/components/AppErrorBoundary.tsx` (react-error-boundary). 루트에 이미 걸려 있다 (최후의 안전망).
- 데이터 로딩 영역은 `AsyncBoundary`가 에러까지 처리한다 (QueryErrorResetBoundary 연동 내장). 별도 ErrorBoundary를 직접 조립하지 말 것.
- 이벤트 핸들러 안의 에러는 boundary에 잡히지 않는다. try/catch 후 상태로 표현할 것.

## Tailwind v4

- CSS 설정은 `src/styles.css`의 `@theme`/`@import "tailwindcss"` 방식 (v4, tailwind.config.js 없음).
- 클래스가 5개 이상 반복되면 컴포넌트로 추출한다. `@apply` 남용 금지.
