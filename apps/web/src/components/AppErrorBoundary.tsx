import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : '알 수 없는 오류'

  return (
    <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-xl font-semibold">문제가 발생했습니다</h1>
      <p className="text-sm text-gray-500">{message}</p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white"
      >
        다시 시도
      </button>
    </div>
  )
}

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
}
