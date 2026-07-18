// 신강신약·억부용신. 가중 오행 세력을 내고, 득령·득지·득시·득세로 강약을 판정하며,
// 억부용신을 결정한다. 화면용 균등 분포(analysis.ts)와 별개의 세력 엔진이다.
//
// 유파 차이가 큰 지점(가중치·임계값·용신 분기)은 상수/함수로 뽑아 교체 가능하게 둔다.
import { stemToOhaeng } from './ohaeng'
import { ohaengToOSeong, oSeongToOhaeng } from './relations'
import { BRANCH_JIJANGGAN } from './tables'
import type {
  DukPanjeong,
  EokBuYongSin,
  Ohaeng,
  OhaengStrength,
  OSeong,
  Pillar,
  SajuStrengthAnalysis,
  SinGangYakLevel,
} from './types'

// 세력 가중치 (조정 가능)
const WEIGHT = {
  STEM: 1.0, // 천간(일간 제외)
  정기: 1.0, // 지지 지장간 본기
  중기: 0.4,
  여기: 0.2,
  MONTH_MULTIPLIER: 2.0, // 월지 지장간 전체에 곱하는 배수(월령 최강)
} as const

// 8단계 경계(돕는 세력 %). 미만 기준으로 아래에서부터 배정.
const LEVEL_BOUNDS: { max: number; level: SinGangYakLevel }[] = [
  { max: 10, level: '극약' },
  { max: 25, level: '태약' },
  { max: 40, level: '신약' },
  { max: 50, level: '중화신약' },
  { max: 60, level: '중화신강' },
  { max: 75, level: '신강' },
  { max: 90, level: '태강' },
  { max: Infinity, level: '극왕' },
]

const OHAENG_KEYS: Ohaeng[] = ['목', '화', '토', '금', '수']

function zeroOhaeng(): Record<Ohaeng, number> {
  return { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 }
}

function classify(ratio: number): SinGangYakLevel {
  return LEVEL_BOUNDS.find((b) => ratio < b.max)!.level
}

/** 일간 기준으로 어떤 오행이 일간을 돕는가(비겁·인성) */
function isSupport(dayOhaeng: Ohaeng, o: Ohaeng): boolean {
  const oSeong = ohaengToOSeong(dayOhaeng, o)
  return oSeong === '비겁' || oSeong === '인성'
}

/** 가중 오행 세력 합산. 일간 천간은 제외, 지지는 지장간으로만(이중 계산 방지). */
function computeOhaengScores(
  pillars: Pillar[],
  monthPillar: Pillar,
  dayPillar: Pillar,
): Record<Ohaeng, number> {
  const scores = zeroOhaeng()

  for (const p of pillars) {
    // 천간: 일간(일주 천간)만 제외
    if (p !== dayPillar) {
      scores[p.ganOhaeng] += WEIGHT.STEM
    }
    // 지지: 표준 지장간(월률분야)으로 세력화
    const isMonth = p === monthPillar
    for (const entry of BRANCH_JIJANGGAN[p.zhi]) {
      const base = WEIGHT[entry.role]
      const weight = isMonth ? base * WEIGHT.MONTH_MULTIPLIER : base
      scores[stemToOhaeng(entry.gan)] += weight
    }
  }

  return scores
}

function toOhaengStrength(scores: Record<Ohaeng, number>): OhaengStrength {
  const total = OHAENG_KEYS.reduce((s, k) => s + scores[k], 0)
  const percent = zeroOhaeng()
  for (const k of OHAENG_KEYS) {
    percent[k] = total === 0 ? 0 : Math.round((scores[k] / total) * 1000) / 10
  }
  return { scores, percent, total }
}

/** 억부용신 결정(설기제극/생조 방향과 오행). */
function pickYongSin(
  dayOhaeng: Ohaeng,
  ratio: number,
  oSeong: Record<OSeong, number>,
): EokBuYongSin {
  const ohaengOf = oSeongToOhaeng(dayOhaeng)
  let yongSinOSeong: OSeong
  let huiOSeong: OSeong
  let direction: '설기제극' | '생조'

  if (ratio >= 50) {
    // 신강 계열: 억(抑)
    direction = '설기제극'
    if (oSeong.인성 >= oSeong.비겁) {
      yongSinOSeong = '재성' // 인성 과다 → 財剋印
      huiOSeong = '관성'
    } else {
      yongSinOSeong = '관성' // 비겁 과다 → 官剋比
      huiOSeong = '식상'
    }
  } else {
    // 신약 계열: 부(扶). 가장 강한 설·극 세력을 상대로.
    direction = '생조'
    const drains: OSeong[] = ['관성', '재성', '식상'] // tie-break 우선순위
    const drainMax = drains.reduce((a, b) => (oSeong[b] > oSeong[a] ? b : a))
    if (drainMax === '관성') {
      yongSinOSeong = '인성' // 殺印相生
      huiOSeong = '비겁'
    } else if (drainMax === '재성') {
      yongSinOSeong = '비겁' // 得比理財
      huiOSeong = '인성'
    } else {
      yongSinOSeong = '인성' // 印制食傷
      huiOSeong = '비겁'
    }
  }

  return {
    yongSin: ohaengOf[yongSinOSeong],
    huiSin: ohaengOf[huiOSeong],
    yongSinOSeong,
    direction,
  }
}

/** 4기둥으로부터 신강신약·용신을 계산한다. */
export function computeStrength(pillars: {
  year: Pillar
  month: Pillar
  day: Pillar
  hour: Pillar | null
}): SajuStrengthAnalysis {
  const { year, month, day, hour } = pillars
  const dayOhaeng = day.ganOhaeng
  // 시간 모름이면 시주를 세력에서 뺀다.
  const list = hour ? [year, month, day, hour] : [year, month, day]

  const scores = computeOhaengScores(list, month, day)
  const ohaengStrength = toOhaengStrength(scores)

  // 오행 세력 → 일간 기준 오성 세력
  const oSeongStrength: Record<OSeong, number> = {
    비겁: 0,
    식상: 0,
    재성: 0,
    관성: 0,
    인성: 0,
  }
  for (const o of OHAENG_KEYS) {
    oSeongStrength[ohaengToOSeong(dayOhaeng, o)] += scores[o]
  }

  const supportScore = oSeongStrength.비겁 + oSeongStrength.인성
  const drainScore =
    oSeongStrength.식상 + oSeongStrength.재성 + oSeongStrength.관성
  const totalPower = supportScore + drainScore
  const supportRatio =
    totalPower === 0 ? 0 : Math.round((supportScore / totalPower) * 1000) / 10

  const duk: DukPanjeong = {
    deukRyeong: isSupport(dayOhaeng, month.zhiOhaeng),
    deukJi: isSupport(dayOhaeng, day.zhiOhaeng),
    // 시간 모름이면 득시는 판정 불가 → false
    deukSi: hour ? isSupport(dayOhaeng, hour.zhiOhaeng) : false,
    deukSe: supportRatio >= 50,
  }

  return {
    ilganOhaeng: dayOhaeng,
    ohaengStrength,
    oSeongStrength,
    sinGangYak: {
      supportScore,
      drainScore,
      supportRatio,
      level: classify(supportRatio),
      duk,
    },
    yongSin: pickYongSin(dayOhaeng, supportRatio, oSeongStrength),
  }
}
