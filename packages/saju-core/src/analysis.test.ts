import { describe, expect, it } from 'vitest'
import { computeSaju } from './compute'
import type { SajuInput } from './types'

// 1990-05-15 14:30 남 (기본 옵션). 8글자:
// 경오 / 신사 / 경진 / 계미
const MALE: SajuInput = {
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  gender: 'male',
}

describe('오행 분포', () => {
  const { ohaeng } = computeSaju(MALE).analysis

  it('8글자를 오행별로 센다', () => {
    // 천간 금(경)·금(신)·금(경)·수(계), 지지 화(오)·화(사)·토(진)·토(미)
    expect(ohaeng.counts.금).toBe(3)
    expect(ohaeng.counts.수).toBe(1)
    expect(ohaeng.counts.화).toBe(2)
    expect(ohaeng.counts.토).toBe(2)
    expect(ohaeng.counts.목).toBe(0)
  })

  it('분모는 8, 퍼센트는 12.5 배수', () => {
    expect(ohaeng.total).toBe(8)
    expect(ohaeng.percent.금).toBe(37.5)
    expect(ohaeng.percent.화).toBe(25)
    expect(ohaeng.percent.목).toBe(0)
  })
})

describe('십성 분포', () => {
  const { sipSeong } = computeSaju(MALE).analysis

  it('일간(일원)은 비견으로 세어 분모 8', () => {
    // 천간 비견(년)·겁재(월)·비견(일=일원)·상관(시)
    // 지지 정관(년)·편관(월)·편인(일)·정인(시)
    expect(sipSeong.total).toBe(8)
    expect(sipSeong.counts.비견).toBe(2)
    expect(sipSeong.counts.겁재).toBe(1)
    expect(sipSeong.counts.상관).toBe(1)
    expect(sipSeong.counts.정관).toBe(1)
    expect(sipSeong.counts.편관).toBe(1)
    expect(sipSeong.counts.편인).toBe(1)
    expect(sipSeong.counts.정인).toBe(1)
    expect(sipSeong.counts.식신).toBe(0)
  })
})

describe('오성(5그룹) 분포', () => {
  const { oSeong } = computeSaju(MALE).analysis

  it('십성을 5그룹으로 묶는다', () => {
    expect(oSeong.counts.비겁).toBe(3) // 비견2 + 겁재1
    expect(oSeong.counts.식상).toBe(1) // 상관1
    expect(oSeong.counts.재성).toBe(0)
    expect(oSeong.counts.관성).toBe(2) // 편관1 + 정관1
    expect(oSeong.counts.인성).toBe(2) // 편인1 + 정인1
    expect(oSeong.total).toBe(8)
  })

  it('모든 분포의 합계가 8이고 퍼센트 합이 100', () => {
    const sum = (r: Record<string, number>) =>
      Object.values(r).reduce((a, b) => a + b, 0)
    expect(sum(oSeong.percent)).toBeCloseTo(100)
  })
})
