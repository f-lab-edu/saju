// 오행(五行) 매핑. 순수 결정적 함수라 엔진과 무관하게 독립 테스트한다.
import { BRANCH_OHAENG, STEM_OHAENG } from './tables'
import type { EarthlyBranch, HeavenlyStem, Ohaeng } from './types'

export function stemToOhaeng(gan: HeavenlyStem): Ohaeng {
  return STEM_OHAENG[gan]
}

export function branchToOhaeng(zhi: EarthlyBranch): Ohaeng {
  return BRANCH_OHAENG[zhi]
}

/**
 * 천간 또는 지지 한 글자(한글)를 받아 오행을 반환한다.
 * 두 표에 모두 없으면 알 수 없는 글자이므로 예외.
 */
export function ganziToOhaeng(char: string): Ohaeng {
  if (char in STEM_OHAENG) return STEM_OHAENG[char as HeavenlyStem]
  if (char in BRANCH_OHAENG) return BRANCH_OHAENG[char as EarthlyBranch]
  throw new Error(`오행을 알 수 없는 글자: ${char}`)
}
