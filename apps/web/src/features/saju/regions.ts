// 주요 도시 동경 경도. 태양시 보정((경도-표준자오선)×4분)에 쓴다.
export interface Region {
  name: string
  longitude: number
}

export const REGIONS: Region[] = [
  { name: '서울', longitude: 126.98 },
  { name: '인천', longitude: 126.7 },
  { name: '대전', longitude: 127.38 },
  { name: '대구', longitude: 128.6 },
  { name: '광주', longitude: 126.85 },
  { name: '부산', longitude: 129.08 },
  { name: '울산', longitude: 129.31 },
  { name: '제주', longitude: 126.53 },
]
