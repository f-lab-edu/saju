import { describe, expect, it } from 'vitest'
import { computeSaju } from './compute'
import { ohaengToOSeong, oSeongToOhaeng } from './relations'
import type { SajuInput } from './types'

// 1990-05-15 14:30 남, 일간 경금. 8글자: 경오 / 신사 / 경진 / 계미
const MALE: SajuInput = {
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  gender: 'male',
}

describe('오행 생극 / 오성 매핑', () => {
  it('일간 금 기준 오성', () => {
    expect(ohaengToOSeong('금', '금')).toBe('비겁')
    expect(ohaengToOSeong('금', '수')).toBe('식상') // 금생수
    expect(ohaengToOSeong('금', '목')).toBe('재성') // 금극목
    expect(ohaengToOSeong('금', '화')).toBe('관성') // 화극금
    expect(ohaengToOSeong('금', '토')).toBe('인성') // 토생금
  })

  it('오성 → 오행 역매핑(일간 금)', () => {
    const m = oSeongToOhaeng('금')
    expect(m.비겁).toBe('금')
    expect(m.식상).toBe('수')
    expect(m.재성).toBe('목')
    expect(m.관성).toBe('화')
    expect(m.인성).toBe('토')
  })
})

describe('가중 오행 세력', () => {
  const { strength } = computeSaju(MALE)

  it('일간 천간 제외, 지장간·월지배수 반영한 세력', () => {
    const s = strength.ohaengStrength.scores
    // 손계산: 화3.4 토2.8 금2.8 수1.4 목0.6 (합 11.0)
    expect(s.화).toBeCloseTo(3.4)
    expect(s.토).toBeCloseTo(2.8)
    expect(s.금).toBeCloseTo(2.8)
    expect(s.수).toBeCloseTo(1.4)
    expect(s.목).toBeCloseTo(0.6)
    expect(strength.ohaengStrength.total).toBeCloseTo(11.0)
  })
})

describe('신강신약 판정', () => {
  const { sinGangYak } = computeSaju(MALE).strength

  it('돕는 세력 대 빼는 세력', () => {
    // support = 비겁(금2.8)+인성(토2.8)=5.6, drain = 식상(수1.4)+재성(목0.6)+관성(화3.4)=5.4
    expect(sinGangYak.supportScore).toBeCloseTo(5.6)
    expect(sinGangYak.drainScore).toBeCloseTo(5.4)
    expect(sinGangYak.supportRatio).toBeCloseTo(50.9, 1)
  })

  it('8단계 중 중화신강', () => {
    expect(sinGangYak.level).toBe('중화신강')
  })

  it('득령 X, 득지 O, 득시 O, 득세 O', () => {
    expect(sinGangYak.duk.deukRyeong).toBe(false) // 월지 사(화)=관성
    expect(sinGangYak.duk.deukJi).toBe(true) // 일지 진(토)=인성
    expect(sinGangYak.duk.deukSi).toBe(true) // 시지 미(토)=인성
    expect(sinGangYak.duk.deukSe).toBe(true) // ratio>=50
  })
})

describe('억부용신', () => {
  const { yongSin } = computeSaju(MALE).strength

  it('신강 계열이라 설기제극 방향, 인성 과다형이라 재성(목) 용신', () => {
    expect(yongSin.direction).toBe('설기제극')
    expect(yongSin.yongSinOSeong).toBe('재성')
    expect(yongSin.yongSin).toBe('목') // 금극목
    // 희신은 식상(식상생재로 재성 용신 보좌) → 금생수 = 수
    expect(yongSin.huiSin).toBe('수')
  })
})

describe('신약 사주 방향 확인', () => {
  it('세력이 약하면 생조 방향 용신이 나온다', () => {
    // 목 일간이 금·토 왕한 계절/구성이면 신약이 되기 쉽다.
    // 여기서는 방향만 확인(구체 오행은 케이스 의존).
    const r = computeSaju({
      year: 1980,
      month: 9,
      day: 20,
      hour: 6,
      minute: 0,
      gender: 'female',
    })
    const { sinGangYak, yongSin } = r.strength
    if (sinGangYak.supportRatio < 50) {
      expect(yongSin.direction).toBe('생조')
    } else {
      expect(yongSin.direction).toBe('설기제극')
    }
  })
})
