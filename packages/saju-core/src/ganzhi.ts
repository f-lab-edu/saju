// 간지 한자 파싱 공용 헬퍼. 4기둥과 대운/연운/월운이 함께 쓴다. 엔진 의존 없음.
import { branchToOhaeng, stemToOhaeng } from './ohaeng'
import { BRANCH_HANJA_TO_HANGUL, STEM_HANJA_TO_HANGUL } from './tables'
import type { EarthlyBranch, GanZhi, HeavenlyStem } from './types'

export function stemFromHanja(hanja: string): HeavenlyStem {
  const gan = STEM_HANJA_TO_HANGUL[hanja]
  if (!gan) throw new Error(`알 수 없는 천간 한자: ${hanja}`)
  return gan
}

export function branchFromHanja(hanja: string): EarthlyBranch {
  const zhi = BRANCH_HANJA_TO_HANGUL[hanja]
  if (!zhi) throw new Error(`알 수 없는 지지 한자: ${hanja}`)
  return zhi
}

/** '庚午' 같은 2글자 간지 한자 → GanZhi(한글 + 오행) */
export function parseGanZhi(hanja: string): GanZhi {
  const gan = stemFromHanja(hanja[0])
  const zhi = branchFromHanja(hanja[1])
  return {
    gan,
    zhi,
    ganOhaeng: stemToOhaeng(gan),
    zhiOhaeng: branchToOhaeng(zhi),
  }
}
