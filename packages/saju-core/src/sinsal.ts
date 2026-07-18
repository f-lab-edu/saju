// 신살(神殺)·길성(吉星). 확정된 8글자만 입력으로 쓰는 순수 룩업. saju-master 검증 테이블 사용.
// 삼합 기반 살은 년지 기준을 기본값으로 한다(유파차: 일지 기준은 후속 옵션).
import {
  BRANCH_TO_SAMHAP,
  CHEONEUL_GWIIN,
  GWANGWI_HAKGWAN,
  HAKDANG_GWIIN,
  HYEONCHIM_BRANCH,
  HYEONCHIM_STEM,
  JEONGNOK,
  MUNCHANG_GWIIN,
  SAMHAP_SINSAL,
  YANGIN,
} from './tables'
import type {
  EarthlyBranch,
  HeavenlyStem,
  Pillar,
  PillarKey,
  SinSal,
  SinSalBasis,
  SinSalCategory,
  SinSalHit,
} from './types'

const KEYS: PillarKey[] = ['year', 'month', 'day', 'hour']

export function computeSinSal(pillars: {
  year: Pillar
  month: Pillar
  day: Pillar
  hour: Pillar
}): SinSal[] {
  const { year, month, day, hour } = pillars
  const stems: HeavenlyStem[] = [year.gan, month.gan, day.gan, hour.gan]
  const branches: EarthlyBranch[] = [year.zhi, month.zhi, day.zhi, hour.zhi]
  const dayGan = day.gan
  const result: SinSal[] = []

  // 특정 지지들이 4기둥 지지 중 어디에 있는지 찾아 붙인다.
  function addByBranch(
    name: string,
    category: SinSalCategory,
    basis: SinSalBasis,
    targets: EarthlyBranch[],
  ): void {
    const hits: SinSalHit[] = []
    branches.forEach((b, i) => {
      if (targets.includes(b)) {
        hits.push({ pillar: KEYS[i], position: 'branch', char: b })
      }
    })
    if (hits.length > 0) result.push({ name, category, basis, hits })
  }

  // ── 일간 기준 ──
  addByBranch('천을귀인', '길성', '일간', CHEONEUL_GWIIN[dayGan])
  addByBranch('문창귀인', '길성', '일간', [MUNCHANG_GWIIN[dayGan]])
  addByBranch('정록', '길성', '일간', [JEONGNOK[dayGan]])
  const yangin = YANGIN[dayGan]
  if (yangin) addByBranch('양인', '흉살', '일간', [yangin])
  addByBranch('학당귀인', '길성', '일간', [HAKDANG_GWIIN[dayGan]])
  addByBranch('관귀학관', '길성', '일간', [GWANGWI_HAKGWAN[dayGan]])

  // ── 삼합 기준 (년지 우선, 일지 병행) ──
  // 유파차: 전통은 년지, 현대 실무는 일지도 병행. 두 기준을 basis로 구분해 담는다.
  function addSamhap(basisBranch: EarthlyBranch, basis: SinSalBasis): void {
    const samhap = SAMHAP_SINSAL[BRANCH_TO_SAMHAP[basisBranch]]
    addByBranch('도화살', '흉살', basis, [samhap.도화])
    addByBranch('역마살', '중립', basis, [samhap.역마])
    addByBranch('화개살', '중립', basis, [samhap.화개])
    addByBranch('겁살', '흉살', basis, [samhap.겁살])
    addByBranch('망신살', '흉살', basis, [samhap.망신])
  }
  addSamhap(year.zhi, '삼합(년지)')
  // 일지가 년지와 다른 삼합 그룹일 때만 병행(같으면 결과가 동일해 중복).
  if (BRANCH_TO_SAMHAP[day.zhi] !== BRANCH_TO_SAMHAP[year.zhi]) {
    addSamhap(day.zhi, '삼합(일지)')
  }

  // ── 현침살(자형): 천간·지지 모두 스캔 ──
  const hyeonchimHits: SinSalHit[] = []
  stems.forEach((s, i) => {
    if (HYEONCHIM_STEM.includes(s)) {
      hyeonchimHits.push({ pillar: KEYS[i], position: 'stem', char: s })
    }
  })
  branches.forEach((b, i) => {
    if (HYEONCHIM_BRANCH.includes(b)) {
      hyeonchimHits.push({ pillar: KEYS[i], position: 'branch', char: b })
    }
  })
  if (hyeonchimHits.length > 0) {
    result.push({
      name: '현침살',
      category: '흉살',
      basis: '자형',
      hits: hyeonchimHits,
    })
  }

  return result
}
