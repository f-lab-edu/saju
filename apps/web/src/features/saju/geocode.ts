import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

/** 도시 검색 결과 한 건. 태양시 보정에는 longitude만 쓰인다. */
export interface PlaceHit {
  id: string
  /** 표시용 짧은 이름 (예: 서울) */
  name: string
  /** 보조 설명 (예: 대한민국) */
  detail: string
  longitude: number
}

interface NominatimItem {
  place_id?: number
  osm_id?: number
  name?: string
  display_name?: string
  lon?: string
}

// OSM Nominatim은 키가 필요 없는 대신 실제 앱을 식별하는 User-Agent를 요구하고,
// 브라우저에서 직접 호출하면 rate limit/CORS에 걸리기 쉽다. 서버 함수로 프록시한다.
const USER_AGENT = 'saju-app/0.1 (https://github.com/choimy/saju)'

function toPlaceHit(item: NominatimItem): PlaceHit | null {
  const longitude = Number(item.lon)
  if (!Number.isFinite(longitude)) return null

  const display = item.display_name ?? ''
  const parts = display
    .split(',')
    .map((p) => p.trim())
    // display_name에는 우편번호 조각(예: 04524, 100-0005)이 섞여 들어와 보조 설명에서 뺀다.
    .filter((p) => p !== '' && !/^[\d-]+$/.test(p))
  const name = item.name || parts[0] || display
  // 앞 조각은 name과 겹치므로 버리고, 뒤쪽 행정구역 2개만 보조 설명으로 쓴다.
  const detail = parts.slice(1).slice(-2).join(', ')

  return {
    id: String(item.place_id ?? item.osm_id ?? `${name}-${longitude}`),
    name,
    detail,
    longitude,
  }
}

export const searchPlaces = createServerFn({ method: 'GET' })
  .validator((query: unknown) => String(query ?? '').trim())
  .handler(async ({ data }): Promise<PlaceHit[]> => {
    if (data.length < 2) return []

    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', data)
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('limit', '8')
    url.searchParams.set('accept-language', 'ko')

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    })
    if (!response.ok) {
      throw new Error('지역 검색에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    }

    const items = (await response.json()) as NominatimItem[]
    const hits: PlaceHit[] = []
    const seen = new Set<string>()
    for (const item of items) {
      const hit = toPlaceHit(item)
      // 같은 도시가 여러 행정단위로 중복 반환되는 경우가 많아 이름 기준으로 접는다.
      if (!hit || seen.has(hit.name)) continue
      seen.add(hit.name)
      hits.push(hit)
    }
    return hits
  })

export const placeSearchQuery = (query: string) =>
  queryOptions({
    queryKey: ['places', query],
    queryFn: () => searchPlaces({ data: query }),
    staleTime: 10 * 60 * 1000,
    // Nominatim은 rate limit이 엄격해 실패해도 자동 재시도하지 않는다.
    retry: false,
  })
