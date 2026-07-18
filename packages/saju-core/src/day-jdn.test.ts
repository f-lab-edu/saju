import { describe, expect, it } from 'vitest'
import { computeSaju } from './compute'
import { dayPillarByJdn, gregorianToJdn } from './day-jdn'

describe('gregorianToJdn', () => {
  it('알려진 JDN 값', () => {
    // 2000-01-01 정오 = JDN 2451545 (천문학 표준 J2000.0 기준일)
    expect(gregorianToJdn(2000, 1, 1)).toBe(2451545)
  })
})

describe('dayPillarByJdn 앵커', () => {
  it('2019-01-27은 갑자일', () => {
    const p = dayPillarByJdn(2019, 1, 27)
    expect(p.gan).toBe('갑')
    expect(p.zhi).toBe('자')
  })

  it('하루 뒤는 을축일 (60갑자 순행)', () => {
    const p = dayPillarByJdn(2019, 1, 28)
    expect(p.gan).toBe('을')
    expect(p.zhi).toBe('축')
  })
})

describe('일주 오라클 vs 엔진 교차검증', () => {
  // 정오(낮) 출생은 태양시 보정을 꺼도 날짜가 바뀌지 않으므로,
  // "그 날짜의 일주" = 엔진이 계산한 일주여야 한다. 서로 독립 구현이라 교차검증이 된다.
  const dates: [number, number, number][] = [
    [2019, 1, 27],
    [1984, 2, 2],
    [2000, 1, 1],
    [1990, 5, 15],
    [2024, 12, 31],
  ]
  it.each(dates)('%i-%i-%i 일주 일치', (y, m, d) => {
    const oracle = dayPillarByJdn(y, m, d)
    const engine = computeSaju(
      { year: y, month: m, day: d, hour: 12, minute: 0 },
      { longitudeCorrectionMinutes: 0 },
    ).day
    expect(engine.gan).toBe(oracle.gan)
    expect(engine.zhi).toBe(oracle.zhi)
  })
})
