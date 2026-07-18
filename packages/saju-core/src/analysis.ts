// 사주 8글자 기반 분포 분석. 화면 표시용 균등 카운트(지장간 제외, 분모 8).
// 신강신약용 가중 분포는 별도 엔진에서 다룬다(지장간 통근·월령 가중 필요).
import type {
  Distribution,
  Ohaeng,
  OSeong,
  Pillar,
  SajuAnalysis,
  SipSeong,
  SipSeongOrSelf,
} from './types'

const OHAENG_KEYS: Ohaeng[] = ['목', '화', '토', '금', '수']

const SIPSEONG_KEYS: SipSeong[] = [
  '비견',
  '겁재',
  '식신',
  '상관',
  '편재',
  '정재',
  '편관',
  '정관',
  '편인',
  '정인',
]

const OSEONG_KEYS: OSeong[] = ['비겁', '식상', '재성', '관성', '인성']

// 십성 → 오성(5그룹)
const SIPSEONG_TO_OSEONG: Record<SipSeong, OSeong> = {
  비견: '비겁',
  겁재: '비겁',
  식신: '식상',
  상관: '식상',
  편재: '재성',
  정재: '재성',
  편관: '관성',
  정관: '관성',
  편인: '인성',
  정인: '인성',
}

function zeroCounts<K extends string>(keys: readonly K[]): Record<K, number> {
  const out = {} as Record<K, number>
  for (const k of keys) out[k] = 0
  return out
}

function toDistribution<K extends string>(
  counts: Record<K, number>,
  keys: readonly K[],
): Distribution<K> {
  const total = keys.reduce((sum, k) => sum + counts[k], 0)
  const percent = zeroCounts(keys)
  for (const k of keys) {
    // 분모가 8이라 12.5 배수로 떨어지지만, 안전하게 소수 첫째자리로 정리.
    percent[k] = total === 0 ? 0 : Math.round((counts[k] / total) * 1000) / 10
  }
  return { counts, total, percent }
}

// 일간(일원)은 자기 자신과 같은 오행·음양이므로 비견으로 카운트한다.
function normalizeSipSeong(value: SipSeongOrSelf): SipSeong {
  return value === '일원' ? '비견' : value
}

/** 4기둥으로부터 오행/십성/오성 분포를 계산한다. */
export function computeAnalysis(pillars: Pillar[]): SajuAnalysis {
  const ohaengCounts = zeroCounts(OHAENG_KEYS)
  const sipSeongCounts = zeroCounts(SIPSEONG_KEYS)

  for (const p of pillars) {
    ohaengCounts[p.ganOhaeng] += 1
    ohaengCounts[p.zhiOhaeng] += 1
    sipSeongCounts[normalizeSipSeong(p.ganSipSeong)] += 1
    sipSeongCounts[p.zhiSipSeong] += 1
  }

  const oSeongCounts = zeroCounts(OSEONG_KEYS)
  for (const k of SIPSEONG_KEYS) {
    oSeongCounts[SIPSEONG_TO_OSEONG[k]] += sipSeongCounts[k]
  }

  return {
    ohaeng: toDistribution(ohaengCounts, OHAENG_KEYS),
    sipSeong: toDistribution(sipSeongCounts, SIPSEONG_KEYS),
    oSeong: toDistribution(oSeongCounts, OSEONG_KEYS),
  }
}
