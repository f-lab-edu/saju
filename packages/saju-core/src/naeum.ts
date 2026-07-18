// 납음오행(納音五行). 60갑자 인덱스로 결정되므로 엔진 반환 문자열에 의존하지 않고
// 간지에서 직접 계산한다(간체/번체 표기 흔들림 방지). 30개 납음이 각각 2갑자를 덮는다.
import { EARTHLY_BRANCHES, HEAVENLY_STEMS } from './types'
import type { EarthlyBranch, HeavenlyStem } from './types'

// 60갑자 순서대로, 2갑자마다 하나씩. 갑자·을축=해중금, 병인·정묘=노중화 …
const NAEUM_NAMES = [
  '해중금',
  '노중화',
  '대림목',
  '노방토',
  '검봉금',
  '산두화',
  '간하수',
  '성두토',
  '백랍금',
  '양류목',
  '천중수',
  '옥상토',
  '벽력화',
  '송백목',
  '장류수',
  '사중금',
  '산하화',
  '평지목',
  '벽상토',
  '금박금',
  '복등화',
  '천하수',
  '대역토',
  '차천금',
  '상자목',
  '대계수',
  '사중토',
  '천상화',
  '석류목',
  '대해수',
] as const

/** 천간·지지 한글로부터 60갑자 인덱스(0=갑자 … 59=계해)를 구한다. */
function ganZhiIndex(gan: HeavenlyStem, zhi: EarthlyBranch): number {
  const g = HEAVENLY_STEMS.indexOf(gan)
  const z = EARTHLY_BRANCHES.indexOf(zhi)
  // n ≡ g (mod 10), n ≡ z (mod 12), 0 ≤ n < 60 을 만족하는 n.
  for (let n = 0; n < 60; n++) {
    if (n % 10 === g && n % 12 === z) return n
  }
  throw new Error(`간지 조합이 60갑자에 없습니다: ${gan}${zhi}`)
}

/** 간지의 납음오행 이름(한글) */
export function naEum(gan: HeavenlyStem, zhi: EarthlyBranch): string {
  const index = ganZhiIndex(gan, zhi)
  return NAEUM_NAMES[Math.floor(index / 2)]
}
