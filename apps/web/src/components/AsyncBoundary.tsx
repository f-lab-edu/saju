import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : "알 수 없는 오류";

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-red-200 p-6"
    >
      <p className="text-sm text-gray-600">불러오지 못했습니다: {message}</p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white"
      >
        다시 시도
      </button>
    </div>
  );
}

function DefaultPendingFallback() {
  return (
    <div
      role="status"
      aria-label="불러오는 중"
      className="flex items-center justify-center p-6"
    >
      <div className="size-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
    </div>
  );
}

interface AsyncBoundaryProps {
  children: React.ReactNode;
  /** Suspense 대기 중 보여줄 UI. 기본값은 스피너. */
  pendingFallback?: React.ReactNode;
  /** 에러 시 보여줄 컴포넌트. 기본값은 재시도 버튼이 있는 인라인 안내. */
  errorFallback?: React.ComponentType<FallbackProps>;
}

/**
 * useSuspenseQuery를 쓰는 화면 조각의 표준 경계.
 * 로딩(Suspense)과 에러(ErrorBoundary)를 한 번에 처리하고,
 * "다시 시도"가 실패한 쿼리를 리셋(QueryErrorResetBoundary)하도록 연결한다.
 */
export function AsyncBoundary({
  children,
  pendingFallback,
  errorFallback,
}: AsyncBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          FallbackComponent={errorFallback ?? DefaultErrorFallback}
        >
          <Suspense fallback={pendingFallback ?? <DefaultPendingFallback />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
