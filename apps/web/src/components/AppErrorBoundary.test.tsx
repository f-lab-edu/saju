import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AppErrorBoundary } from './AppErrorBoundary'

describe('AppErrorBoundary', () => {
  it('자식이 던진 에러를 잡아 fallback을 보여준다', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    function Bomb(): never {
      throw new Error('폭발')
    }

    render(
      <AppErrorBoundary>
        <Bomb />
      </AppErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('폭발')).toBeInTheDocument()
  })

  it('다시 시도 버튼으로 경계를 리셋한다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()

    let shouldThrow = true
    function Bomb() {
      if (shouldThrow) throw new Error('폭발')
      return <p>정상 화면</p>
    }

    render(
      <AppErrorBoundary>
        <Bomb />
      </AppErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()

    shouldThrow = false
    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(screen.getByText('정상 화면')).toBeInTheDocument()
  })
})
