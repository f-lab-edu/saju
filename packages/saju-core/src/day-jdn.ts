// 일주(日柱)의 독립 구현. 율리우스 적일(JDN) 기반으로 60갑자를 돌린다.
// 엔진과 무관한 오라클(oracle)로, 테스트에서 엔진 일주와 교차검증하는 용도다.
import { EARTHLY_BRANCHES, HEAVENLY_STEMS } from './types'
import type { GanZhi } from './types'
import { branchToOhaeng, stemToOhaeng } from './ohaeng'

/** 그레고리력 날짜의 정오 기준 율리우스 적일(Julian Day Number) */
export function gregorianToJdn(
  year: number,
  month: number,
  day: number,
): number {
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  )
}

// 알려진 갑자일(甲子日) 앵커: 2019-01-27. 이 날의 60갑자 인덱스를 0으로 둔다.
const ANCHOR_JDN = gregorianToJdn(2019, 1, 27)

/** 자정 기준 날짜의 일주 간지. 자시 정책과 무관하게 "그 날짜의 일간지"를 돌려준다. */
export function dayPillarByJdn(
  year: number,
  month: number,
  day: number,
): GanZhi {
  const jdn = gregorianToJdn(year, month, day)
  const idx = (((jdn - ANCHOR_JDN) % 60) + 60) % 60
  const gan = HEAVENLY_STEMS[idx % 10]
  const zhi = EARTHLY_BRANCHES[idx % 12]

  return {
    gan,
    zhi,
    ganOhaeng: stemToOhaeng(gan),
    zhiOhaeng: branchToOhaeng(zhi),
  }
}
