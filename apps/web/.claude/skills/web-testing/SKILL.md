---
name: web-testing
description: apps/web의 테스트를 작성·수정·실행할 때 사용. Vitest + React Testing Library 컨벤션과 react-query/zustand/react-hook-form 테스트 패턴.
---

# apps/web 테스트 컨벤션

## 실행

```bash
pnpm --filter web test              # 전체 (vitest run)
pnpm --filter web exec vitest run src/components/Foo.test.tsx   # 단일 파일
```

- 설정: `apps/web/vitest.config.ts` (jsdom + React Compiler babel). `vite.config.ts`가 아니다 — 거긴 nitro 등 서버 플러그인이 있어 테스트에 못 쓴다.
- setup: `src/test/setup.ts`에서 jest-dom 매처 로드됨 (`toBeInTheDocument` 등).

## 기본 규칙

- 테스트 파일은 대상 옆에 콜로케이션: `Foo.tsx` ↔ `Foo.test.tsx`
- **구현이 아니라 동작을 테스트한다**: 내부 상태·함수 호출이 아니라 사용자가 보는 결과를 단언.
- 쿼리 우선순위: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`(최후)
- 상호작용은 `fireEvent` 대신 `userEvent`:

```tsx
import userEvent from '@testing-library/user-event'
const user = userEvent.setup()
await user.type(screen.getByLabelText('생년월일'), '1990-03-15')
await user.click(screen.getByRole('button', { name: '사주 보기' }))
```

## react-query가 있는 컴포넌트

테스트마다 새 QueryClient + retry 끔:

```tsx
function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}
```

- `useSuspenseQuery` 컴포넌트는 반드시 Suspense 경계 안에서 렌더해야 한다 — 프로덕션과 동일하게 `AsyncBoundary`로 감싸서 테스트한다 (`AsyncBoundary.test.tsx` 참고).
- 로딩 상태 단언: `getByRole('status')` (AsyncBoundary 기본 스피너), 데이터 대기: `await screen.findByText(...)`, 에러 상태: `await screen.findByRole('alert')`.
- `waitFor` 안에서 부수효과 금지.

## zustand 스토어

스토어 모듈은 테스트 간 상태가 남는다. 초기 상태를 저장해두고 `beforeEach`에서 리셋:

```ts
const initialState = useBirthStore.getState()
beforeEach(() => useBirthStore.setState(initialState, true))
```

## react-hook-form

- 폼 테스트는 필드 입력 → 제출 → 결과(에러 메시지/제출 콜백)를 사용자 관점으로 검증.
- 검증 에러는 `await screen.findByRole('alert')`로 대기 (검증이 비동기).

## 커버리지 우선순위

1. 사주 계산 로직 (순수 함수 — 경계 케이스 필수: 입춘, 절기, 자시)
2. 폼 검증 규칙
3. 쿼리 성공/로딩/에러 3상태 렌더링
