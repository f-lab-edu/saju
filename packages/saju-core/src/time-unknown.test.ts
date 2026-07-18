import { describe, expect, it } from 'vitest'
import { computeSaju } from './compute'
import type { SajuInput } from './types'

const BASE: SajuInput = {
  year: 1990,
  month: 5,
  day: 15,
  hour: 0,
  minute: 0,
  gender: 'male',
}

describe('시간 모름', () => {
  const r = computeSaju(BASE, { timeUnknown: true })

  it('시주는 null', () => {
    expect(r.hour).toBeNull()
    expect(r.options.timeUnknown).toBe(true)
  })

  it('년/월/일주는 정상(시간 무관)', () => {
    expect(r.year.gan + r.year.zhi).toBe('경오')
    expect(r.month.gan + r.month.zhi).toBe('신사')
    expect(r.day.gan + r.day.zhi).toBe('경진')
  })

  it('오행 분포는 6글자(분모 6)', () => {
    expect(r.analysis.ohaeng.total).toBe(6)
  })

  it('득시는 판정 불가라 false', () => {
    expect(r.strength.sinGangYak.duk.deukSi).toBe(false)
  })

  it('시/분이 잘못돼도(무시) 예외 없음', () => {
    expect(() =>
      computeSaju({ ...BASE, hour: 99, minute: 99 }, { timeUnknown: true }),
    ).not.toThrow()
  })

  it('관계·신살은 시주 없이 계산되어 시주 위치가 없다', () => {
    const hasHour = (
      arr: { members?: { pillar: string }[]; hits?: { pillar: string }[] }[],
    ) =>
      arr.some((x) =>
        (x.members ?? x.hits ?? []).some((m) => m.pillar === 'hour'),
      )
    expect(hasHour(r.relations)).toBe(false)
    expect(hasHour(r.sinSal)).toBe(false)
  })
})
