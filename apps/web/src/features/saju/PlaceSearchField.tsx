import { useQuery } from '@tanstack/react-query'
import { useEffect, useId, useRef, useState } from 'react'
import type { PlaceHit } from './geocode'
import { placeSearchQuery } from './geocode'
import { REGIONS } from './regions'

export interface SelectedPlace {
  name: string
  longitude: number
}

interface PlaceSearchFieldProps {
  value: SelectedPlace | null
  onChange: (place: SelectedPlace | null) => void
}

const FIELD_LABEL = 'text-sm font-bold text-ink'
const LINK_BUTTON =
  'text-xs text-ink-soft underline underline-offset-2 hover:text-ink'

export function PlaceSearchField({ value, onChange }: PlaceSearchFieldProps) {
  const [open, setOpen] = useState(false)

  function handleSelect(place: SelectedPlace) {
    onChange(place)
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className={FIELD_LABEL}>도시</span>

      {value ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-line bg-hanji px-3 py-2">
          <span className="truncate text-ink">
            {value.name}
            <span className="ml-2 text-xs text-ink-faint">
              동경 {value.longitude.toFixed(2)}°
            </span>
          </span>
          <div className="flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={LINK_BUTTON}
            >
              변경
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className={LINK_BUTTON}
            >
              지우기
            </button>
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-line bg-hanji px-3 py-2 text-left text-ink-faint hover:border-ink hover:text-ink-soft"
          >
            도시명을 입력하세요
            <SearchIcon />
          </button>
          <p className="text-xs text-ink-faint">
            선택하지 않으면 한국 표준시 기준 -30분으로 보정합니다.
          </p>
        </>
      )}

      {open && (
        <PlaceSearchDialog
          onClose={() => setOpen(false)}
          onSelect={handleSelect}
        />
      )}
    </div>
  )
}

interface PlaceSearchDialogProps {
  onClose: () => void
  onSelect: (place: SelectedPlace) => void
}

function PlaceSearchDialog({ onClose, onSelect }: PlaceSearchDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputId = useId()
  const titleId = useId()
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')

  // Nominatim 사용 정책상 타이핑마다 요청하면 안 된다. 300ms 디바운스.
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300)
    return () => clearTimeout(id)
  }, [query])

  // 검색 결과는 없어도 화면이 성립하는 보조 데이터이고, 입력이 2글자 이상일 때만
  // 조회하는 조건부 쿼리라 useSuspenseQuery 대신 useQuery(enabled)를 쓴다.
  const { data, isFetching, isError } = useQuery({
    ...placeSearchQuery(debounced),
    enabled: debounced.length >= 2,
  })

  const hits: PlaceHit[] = data ?? []
  const showList = debounced.length >= 2 && !isFetching && !isError

  return (
    <dialog
      // 마운트 시점에 모달로 연다. 리렌더마다 ref 콜백이 다시 불려도 이미 열려
      // 있으면 showModal이 던지므로 open 상태를 확인한다. showModal은 스펙상
      // 첫 포커스 가능 요소(닫기 버튼)에 포커스를 주므로 검색 입력으로 옮긴다.
      ref={(node) => {
        dialogRef.current = node
        if (node && !node.open) {
          node.showModal()
          node.querySelector('input')?.focus()
        }
      }}
      aria-labelledby={titleId}
      onClose={onClose}
      // 패널 밖(백드롭) 클릭은 dialog 요소 자신이 target으로 잡힌다.
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close()
      }}
      className="m-auto w-[min(92vw,26rem)] rounded-xl border border-line bg-hanji-raised p-0 backdrop:bg-ink/40"
    >
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <h2 id={titleId} className="font-medium text-ink">
            도시 검색
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className={LINK_BUTTON}
          >
            닫기
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={inputId} className="sr-only">
            도시 이름
          </label>
          <input
            id={inputId}
            type="search"
            autoComplete="off"
            placeholder="도시명을 입력하세요 (예: 부산, Tokyo)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            // dialog는 바깥 폼 안에 렌더되므로 Enter가 폼을 제출하지 않게 막는다.
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault()
            }}
            className="w-full rounded-lg border border-line bg-hanji px-3 py-2 text-ink focus:border-ink focus:outline-none"
          />

          <p aria-live="polite" className="text-xs text-ink-faint">
            {isError
              ? '지역 검색에 실패했습니다. 아래 주요 도시에서 골라 주세요.'
              : isFetching
                ? '검색 중…'
                : showList && hits.length === 0
                  ? '검색 결과가 없습니다.'
                  : '해외 도시는 영문으로도 검색할 수 있습니다.'}
          </p>
        </div>

        {showList && hits.length > 0 && (
          <ul className="max-h-64 overflow-y-auto rounded-lg border border-line bg-hanji">
            {hits.map((hit) => (
              <li key={hit.id}>
                <button
                  type="button"
                  onClick={() =>
                    onSelect({ name: hit.name, longitude: hit.longitude })
                  }
                  className="flex w-full flex-col items-start gap-0.5 border-b border-line/60 px-3 py-2 text-left last:border-b-0 hover:bg-line/20"
                >
                  <span className="text-sm text-ink">{hit.name}</span>
                  {hit.detail && (
                    <span className="text-xs text-ink-faint">{hit.detail}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-ink-faint">주요 도시</p>
          <div className="flex flex-wrap gap-1.5">
            {REGIONS.map((region) => (
              <button
                key={region.name}
                type="button"
                onClick={() =>
                  onSelect({ name: region.name, longitude: region.longitude })
                }
                className="rounded-full border border-line px-2.5 py-1 text-xs text-ink-soft hover:border-ink hover:text-ink"
              >
                {region.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </dialog>
  )
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-4 w-4 shrink-0"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4.35-4.35" />
    </svg>
  )
}
