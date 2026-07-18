import { describe, expect, it } from 'vitest'
import { computeSaju } from './compute'
import type { SajuInput } from './types'

function ganzi(p: { gan: string; zhi: string }): string {
  return p.gan + p.zhi
}

describe('computeSaju 기본 계산', () => {
  // 1990-05-15 14:30 KST. 기본 옵션(-30분 보정)에선 14:00이 되지만
  // 시지는 미시(13~15시)로 동일. 엔진 대조로 확정한 기준값.
  const result = computeSaju({
    year: 1990,
    month: 5,
    day: 15,
    hour: 14,
    minute: 30,
  })

  it('사주팔자 8글자', () => {
    expect(ganzi(result.year)).toBe('경오')
    expect(ganzi(result.month)).toBe('신사')
    expect(ganzi(result.day)).toBe('경진')
    expect(ganzi(result.hour!)).toBe('계미')
  })

  it('각 글자의 오행', () => {
    expect(result.year.ganOhaeng).toBe('금') // 경
    expect(result.year.zhiOhaeng).toBe('화') // 오
    expect(result.day.ganOhaeng).toBe('금') // 경
    expect(result.day.zhiOhaeng).toBe('토') // 진
  })

  it('적용된 옵션을 결과에 담는다', () => {
    expect(result.options.ziPolicy).toBe('sameDay')
    expect(result.options.longitudeCorrectionMinutes).toBe(-30)
    expect(result.input.year).toBe(1990)
  })
})

describe('년주 경계 = 입춘(立春)', () => {
  // 2000년 입춘은 2월 4일경. 그 전은 전년도(1999=기묘) 간지, 그 후는 2000=경진.
  it('입춘 전 출생은 전년도 년주', () => {
    const r = computeSaju({
      year: 2000,
      month: 2,
      day: 3,
      hour: 12,
      minute: 0,
    })
    expect(ganzi(r.year)).toBe('기묘')
  })

  it('입춘 후 출생은 당년 년주', () => {
    const r = computeSaju({
      year: 2000,
      month: 2,
      day: 5,
      hour: 12,
      minute: 0,
    })
    expect(ganzi(r.year)).toBe('경진')
  })
})

describe('자시(子時) 정책', () => {
  // 보정을 꺼서 정책만 분리 검증. 1990-05-15 23:30 출생.
  const base: SajuInput = {
    year: 1990,
    month: 5,
    day: 15,
    hour: 23,
    minute: 30,
  }

  it('sameDay(기본): 야자시 일주는 당일(경진)', () => {
    const r = computeSaju(base, { longitudeCorrectionMinutes: 0 })
    expect(ganzi(r.day)).toBe('경진')
    expect(r.hour!.zhi).toBe('자')
  })

  it('nextDay: 야자시 일주는 다음 날(신사)', () => {
    const r = computeSaju(base, {
      longitudeCorrectionMinutes: 0,
      ziPolicy: 'nextDay',
    })
    expect(ganzi(r.day)).toBe('신사')
    expect(r.hour!.zhi).toBe('자')
  })
})

describe('태양시 경도 보정', () => {
  // 13:15 출생: 보정 없으면 미시(13~15시), -30분 보정 시 12:45 → 오시(11~13시).
  const base: SajuInput = {
    year: 2000,
    month: 1,
    day: 1,
    hour: 13,
    minute: 15,
  }

  it('보정 0이면 미시', () => {
    const r = computeSaju(base, { longitudeCorrectionMinutes: 0 })
    expect(r.hour!.zhi).toBe('미')
  })

  it('-30분 보정이면 시주가 오시로 바뀐다', () => {
    const r = computeSaju(base, { longitudeCorrectionMinutes: -30 })
    expect(r.hour!.zhi).toBe('오')
  })
})

describe('입력 검증', () => {
  const valid: SajuInput = {
    year: 2000,
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
  }

  it('잘못된 월', () => {
    expect(() => computeSaju({ ...valid, month: 13 })).toThrow()
  })

  it('존재하지 않는 날짜', () => {
    expect(() => computeSaju({ ...valid, month: 2, day: 30 })).toThrow()
  })

  it('잘못된 시', () => {
    expect(() => computeSaju({ ...valid, hour: 24 })).toThrow()
  })
})
