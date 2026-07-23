import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PlaceHit } from './geocode'
import type { SelectedPlace } from './PlaceSearchField'
import { PlaceSearchField } from './PlaceSearchField'

const { searchMock } = vi.hoisted(() => ({
  searchMock: vi.fn<(query: string) => Promise<PlaceHit[]>>(),
}))

// searchPlaces는 서버 함수라 jsdom에서 RPC를 탈 수 없다. 쿼리 정의째 모킹한다.
vi.mock('./geocode', () => ({
  placeSearchQuery: (query: string) => ({
    queryKey: ['places', query],
    queryFn: () => searchMock(query),
  }),
}))

// PlaceSearchField는 제어 컴포넌트라 부모 상태까지 포함해야 선택 흐름이 검증된다.
function Harness({ initial = null }: { initial?: SelectedPlace | null }) {
  const [place, setPlace] = useState<SelectedPlace | null>(initial)
  return <PlaceSearchField value={place} onChange={setPlace} />
}

function renderField(initial: SelectedPlace | null = null) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <Harness initial={initial} />
    </QueryClientProvider>,
  )
}

describe('PlaceSearchField', () => {
  beforeEach(() => {
    searchMock.mockReset()
  })

  it('트리거를 누르면 검색 모달이 열리고, 도시를 선택하면 닫히면서 경도가 표시된다', async () => {
    const user = userEvent.setup()
    searchMock.mockResolvedValue([
      { id: '1', name: '부산', detail: '대한민국', longitude: 129.08 },
    ])

    renderField()

    await user.click(screen.getByRole('button', { name: /도시명을 입력하세요/ }))
    const dialog = screen.getByRole('dialog', { name: '도시 검색' })

    await user.type(within(dialog).getByRole('searchbox'), '부산')

    // 주요 도시 칩에도 '부산'이 있어 결과 목록(list) 안으로 좁혀 클릭한다.
    const resultList = await within(dialog).findByRole('list')
    await user.click(within(resultList).getByRole('button', { name: /부산/ }))

    expect(searchMock).toHaveBeenCalledWith('부산')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('동경 129.08°')).toBeInTheDocument()
  })

  it('검색 결과가 없으면 모달 안에 안내 문구를 보여준다', async () => {
    const user = userEvent.setup()
    searchMock.mockResolvedValue([])

    renderField()

    await user.click(screen.getByRole('button', { name: /도시명을 입력하세요/ }))
    await user.type(screen.getByRole('searchbox'), '없는도시')

    expect(await screen.findByText('검색 결과가 없습니다.')).toBeInTheDocument()
  })

  it('모달의 주요 도시 칩을 누르면 검색 없이 바로 선택된다', async () => {
    const user = userEvent.setup()

    renderField()

    await user.click(screen.getByRole('button', { name: /도시명을 입력하세요/ }))
    await user.click(screen.getByRole('button', { name: '서울' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('동경 126.98°')).toBeInTheDocument()
    expect(searchMock).not.toHaveBeenCalled()
  })

  it('닫기를 누르면 선택 없이 모달만 닫힌다', async () => {
    const user = userEvent.setup()

    renderField()

    await user.click(screen.getByRole('button', { name: /도시명을 입력하세요/ }))
    await user.click(screen.getByRole('button', { name: '닫기' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /도시명을 입력하세요/ }),
    ).toBeInTheDocument()
  })

  it('선택된 상태에서 변경은 모달을 다시 열고, 지우기는 기본값으로 되돌린다', async () => {
    const user = userEvent.setup()

    renderField({ name: '서울', longitude: 126.98 })

    await user.click(screen.getByRole('button', { name: '변경' }))
    expect(
      screen.getByRole('dialog', { name: '도시 검색' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '닫기' }))
    await user.click(screen.getByRole('button', { name: '지우기' }))

    expect(screen.queryByText(/동경/)).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /도시명을 입력하세요/ }),
    ).toBeInTheDocument()
  })
})
