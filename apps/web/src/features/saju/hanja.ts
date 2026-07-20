import type { EarthlyBranch, HeavenlyStem } from '@saju/core'

// 간지 한글 → 한자 병기용. 만세력 전통 표기를 위해 명식에 함께 노출한다.

const STEM_HANJA: Record<HeavenlyStem, string> = {
  갑: '甲',
  을: '乙',
  병: '丙',
  정: '丁',
  무: '戊',
  기: '己',
  경: '庚',
  신: '辛',
  임: '壬',
  계: '癸',
}

const BRANCH_HANJA: Record<EarthlyBranch, string> = {
  자: '子',
  축: '丑',
  인: '寅',
  묘: '卯',
  진: '辰',
  사: '巳',
  오: '午',
  미: '未',
  신: '申',
  유: '酉',
  술: '戌',
  해: '亥',
}

export function stemHanja(gan: HeavenlyStem): string {
  return STEM_HANJA[gan]
}
export function branchHanja(zhi: EarthlyBranch): string {
  return BRANCH_HANJA[zhi]
}
