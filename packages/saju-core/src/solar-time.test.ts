import { describe, expect, it } from 'vitest'
import { computeSaju } from './compute'
import {
  computeCorrection,
  inKoreaDst,
  standardMeridianFor,
} from './solar-time'

describe('표준 자오선 이력', () => {
  it('1954~1961은 127.5도', () => {
    expect(
      standardMeridianFor({ year: 1958, month: 6, day: 1, hour: 0, minute: 0 }),
    ).toBe(127.5)
  })

  it('그 외 현대는 135도', () => {
    expect(
      standardMeridianFor({
        year: 1990,
        month: 5,
        day: 15,
        hour: 0,
        minute: 0,
      }),
    ).toBe(135)
  })
})

describe('서머타임 구간', () => {
  it('1988-06은 서머타임', () => {
    expect(
      inKoreaDst({ year: 1988, month: 6, day: 15, hour: 0, minute: 0 }),
    ).toBe(true)
  })

  it('1990-06은 서머타임 아님', () => {
    expect(
      inKoreaDst({ year: 1990, month: 6, day: 15, hour: 0, minute: 0 }),
    ).toBe(false)
  })
})

describe('경도 보정 계산', () => {
  it('경도 주면 (경도-자오선)×4분', () => {
    // 서울 126.98, 현대 자오선 135 → (126.98-135)*4 ≈ -32분
    const c = computeCorrection(
      { year: 2000, month: 1, day: 1, hour: 12, minute: 0 },
      { longitude: 126.98, applyDst: true },
    )
    expect(c.standardMeridian).toBe(135)
    expect(c.longitudeCorrectionMinutes).toBe(-32)
    expect(c.dstApplied).toBe(false)
    expect(c.totalMinutes).toBe(-32)
  })

  it('1958년(127.5 자오선)엔 서울 보정이 거의 0', () => {
    const c = computeCorrection(
      { year: 1958, month: 3, day: 1, hour: 12, minute: 0 },
      { longitude: 126.98, applyDst: true },
    )
    expect(c.standardMeridian).toBe(127.5)
    expect(c.longitudeCorrectionMinutes).toBe(-2) // (126.98-127.5)*4 ≈ -2
  })

  it('서머타임 구간이면 -60분 추가', () => {
    const c = computeCorrection(
      { year: 1988, month: 6, day: 15, hour: 12, minute: 0 },
      { longitude: 126.98, applyDst: true },
    )
    expect(c.dstApplied).toBe(true)
    expect(c.totalMinutes).toBe(-32 - 60)
  })

  it('applyDst false면 서머타임 무시', () => {
    const c = computeCorrection(
      { year: 1988, month: 6, day: 15, hour: 12, minute: 0 },
      { longitude: 126.98, applyDst: false },
    )
    expect(c.dstApplied).toBe(false)
  })

  it('경도 없으면 기본 -30 (135° 시기)', () => {
    const c = computeCorrection(
      { year: 2000, month: 1, day: 1, hour: 12, minute: 0 },
      { applyDst: true },
    )
    expect(c.longitudeCorrectionMinutes).toBe(-30)
  })

  it('경도 없어도 127.5° 시기엔 기본 보정이 ~0으로 조정', () => {
    // 1958년(127.5°): -30 + (135-127.5)*4 = -30 + 30 = 0
    const c = computeCorrection(
      { year: 1958, month: 3, day: 1, hour: 12, minute: 0 },
      { applyDst: true },
    )
    expect(c.standardMeridian).toBe(127.5)
    expect(c.longitudeCorrectionMinutes).toBe(0)
  })

  it('사용자가 직접 지정한 보정값은 시기와 무관하게 그대로', () => {
    const c = computeCorrection(
      { year: 1958, month: 3, day: 1, hour: 12, minute: 0 },
      { longitudeCorrectionMinutes: 0, applyDst: true },
    )
    expect(c.longitudeCorrectionMinutes).toBe(0)
  })
})

describe('결과 options에 이력이 반영된다', () => {
  it('기본은 -30, 서머타임 아님, 135도', () => {
    const r = computeSaju({
      year: 1990,
      month: 5,
      day: 15,
      hour: 14,
      minute: 30,
      gender: 'male',
    })
    expect(r.options.longitudeCorrectionMinutes).toBe(-30)
    expect(r.options.dstApplied).toBe(false)
    expect(r.options.standardMeridian).toBe(135)
    expect(r.options.timeUnknown).toBe(false)
  })
})
