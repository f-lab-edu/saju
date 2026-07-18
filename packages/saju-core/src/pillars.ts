// 엔진 원자료(RawPillar)를 도메인 Pillar(한글 + 십성/지장간/12운성/납음)로 변환한다.
// 엔진 의존 없는 순수 매핑.
import type { RawPillar } from './engine'
import { parseGanZhi, stemFromHanja } from './ganzhi'
import { naEum } from './naeum'
import { stemToOhaeng } from './ohaeng'
import { SIPSEONG_HANJA_TO_HANGUL, UNSEONG_HANJA_TO_HANGUL } from './tables'
import type {
  JiJangGan,
  Pillar,
  SipSeong,
  SipSeongOrSelf,
  UnSeong,
} from './types'

function toSipSeong(hanja: string): SipSeongOrSelf {
  const value = SIPSEONG_HANJA_TO_HANGUL[hanja]
  if (!value) throw new Error(`알 수 없는 십성 한자: ${hanja}`)
  return value
}

function toSipSeongStrict(hanja: string): SipSeong {
  const value = toSipSeong(hanja)
  if (value === '일원') {
    throw new Error('지장간 십성에 일원이 올 수 없습니다')
  }
  return value
}

function toUnSeong(hanja: string): UnSeong {
  const value = UNSEONG_HANJA_TO_HANGUL[hanja]
  if (!value) throw new Error(`알 수 없는 12운성 한자: ${hanja}`)
  return value
}

export function toPillar(raw: RawPillar): Pillar {
  const { gan, zhi, ganOhaeng, zhiOhaeng } = parseGanZhi(raw.gan + raw.zhi)

  const jiJangGan: JiJangGan[] = raw.hideGan.map((hanja, i) => {
    const stem = stemFromHanja(hanja)
    return {
      gan: stem,
      ohaeng: stemToOhaeng(stem),
      sipSeong: toSipSeongStrict(raw.hideGanShiShen[i]),
    }
  })

  return {
    gan,
    zhi,
    ganOhaeng,
    zhiOhaeng,
    ganSipSeong: toSipSeong(raw.ganShiShen),
    // 지지 십성은 정기(본기, 지장간 첫 원소) 기준
    zhiSipSeong: jiJangGan[0].sipSeong,
    jiJangGan,
    unSeong: toUnSeong(raw.diShi),
    naEum: naEum(gan, zhi),
  }
}
