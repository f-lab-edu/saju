import { describe, expect, it } from 'vitest'
import { computeSaju, computeWolUn } from './compute'
import { naEum } from './naeum'
import type { SajuInput } from './types'

// 1990-05-15 14:30 남, 기본 옵션(-30분 → 14:00). 엔진 대조로 확정한 기준값.
const MALE: SajuInput = {
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  gender: 'male',
}

describe('십성(十星)', () => {
  const r = computeSaju(MALE)

  it('천간 십성', () => {
    expect(r.year.ganSipSeong).toBe('비견') // 경(년간) vs 경(일간)
    expect(r.month.ganSipSeong).toBe('겁재') // 신
    expect(r.day.ganSipSeong).toBe('일원') // 일간 자신
    expect(r.hour.ganSipSeong).toBe('상관') // 계
  })

  it('지지 십성(정기 기준)', () => {
    expect(r.year.zhiSipSeong).toBe('정관') // 오(午) 정기 정
    expect(r.day.zhiSipSeong).toBe('편인') // 진(辰) 정기 무
  })
})

describe('지장간(支藏干)', () => {
  const r = computeSaju(MALE)

  it('일지 진(辰)의 지장간은 무·을·계(정기 우선)', () => {
    expect(r.day.jiJangGan.map((j) => j.gan)).toEqual(['무', '을', '계'])
    expect(r.day.jiJangGan[0].sipSeong).toBe('편인') // 무
    expect(r.day.jiJangGan[1].sipSeong).toBe('정재') // 을
    expect(r.day.jiJangGan[2].sipSeong).toBe('상관') // 계
  })

  it('각 지장간에 오행이 붙는다', () => {
    expect(r.day.jiJangGan[0].ohaeng).toBe('토') // 무
    expect(r.day.jiJangGan[2].ohaeng).toBe('수') // 계
  })
})

describe('12운성(十二運星)', () => {
  const r = computeSaju(MALE)

  it('각 기둥의 12운성', () => {
    expect(r.year.unSeong).toBe('목욕') // 경 in 오
    expect(r.month.unSeong).toBe('장생') // 경 in 사
    expect(r.day.unSeong).toBe('양') // 경 in 진
    expect(r.hour.unSeong).toBe('관대') // 경 in 미
  })
})

describe('납음(納音)', () => {
  it('간지에서 직접 계산', () => {
    expect(naEum('경', '오')).toBe('노방토')
    expect(naEum('경', '진')).toBe('백랍금')
    expect(naEum('갑', '자')).toBe('해중금')
    expect(naEum('계', '해')).toBe('대해수')
  })

  it('기둥 결과에도 실린다', () => {
    const r = computeSaju(MALE)
    expect(r.year.naEum).toBe('노방토')
    expect(r.day.naEum).toBe('백랍금')
  })
})

describe('공망(空亡)', () => {
  it('일주 경진 기준 공망은 신·유', () => {
    const r = computeSaju(MALE)
    expect(r.gongMang).toEqual(['신', '유'])
  })
})

describe('대운(大運)', () => {
  it('성별이 있으면 대운 목록을 채운다', () => {
    const r = computeSaju(MALE)
    expect(r.daeUn).toBeDefined()
    const daeUn = r.daeUn!
    expect(daeUn.length).toBeGreaterThan(0)

    const first = daeUn[0]
    expect(first.gan).toBe('임')
    expect(first.zhi).toBe('오')
    expect(first.startAge).toBe(8)
    expect(first.endAge).toBe(17)
    expect(first.startYear).toBe(1997)

    // 연운이 대운 안에 중첩된다
    expect(first.yeonUn.length).toBe(10)
    expect(first.yeonUn[0].year).toBe(1997)
    expect(first.yeonUn[0].gan).toBe('정')
    expect(first.yeonUn[0].zhi).toBe('축')
  })

  it('성별이 없으면 대운은 undefined', () => {
    const r = computeSaju({ ...MALE, gender: undefined })
    expect(r.daeUn).toBeUndefined()
  })
})

describe('월운(月運)', () => {
  it('특정 연도의 12개월 간지', () => {
    const wol = computeWolUn(MALE, 1997)
    expect(wol.length).toBe(12)
    // 각 원소가 간지 + 오행 + 월 라벨을 가진다
    expect(wol[0].gan).toBeDefined()
    expect(wol[0].zhi).toBeDefined()
    expect(wol[0].monthLabel).toBeTruthy()
  })

  it('대운 범위 밖 연도는 빈 배열', () => {
    expect(computeWolUn(MALE, 1800)).toEqual([])
  })

  it('성별이 없으면 예외', () => {
    expect(() => computeWolUn({ ...MALE, gender: undefined }, 1997)).toThrow()
  })
})

describe('여성 대운은 방향이 다르다', () => {
  it('남/여의 첫 대운 간지가 다르다', () => {
    const male = computeSaju(MALE).daeUn![0]
    const female = computeSaju({ ...MALE, gender: 'female' }).daeUn![0]
    expect(male.gan + male.zhi).not.toBe(female.gan + female.zhi)
  })
})
