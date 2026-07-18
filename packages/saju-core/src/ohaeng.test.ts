import { describe, expect, it } from 'vitest'
import { branchToOhaeng, ganziToOhaeng, stemToOhaeng } from './ohaeng'
import { EARTHLY_BRANCHES, HEAVENLY_STEMS } from './types'
import type { EarthlyBranch, HeavenlyStem, Ohaeng } from './types'

describe('천간 오행', () => {
  const cases: [HeavenlyStem, Ohaeng][] = [
    ['갑', '목'],
    ['을', '목'],
    ['병', '화'],
    ['정', '화'],
    ['무', '토'],
    ['기', '토'],
    ['경', '금'],
    ['신', '금'],
    ['임', '수'],
    ['계', '수'],
  ]
  it.each(cases)('%s → %s', (gan, ohaeng) => {
    expect(stemToOhaeng(gan)).toBe(ohaeng)
  })

  it('모든 천간이 매핑을 가진다', () => {
    for (const gan of HEAVENLY_STEMS) {
      expect(stemToOhaeng(gan)).toBeDefined()
    }
  })
})

describe('지지 오행', () => {
  const cases: [EarthlyBranch, Ohaeng][] = [
    ['자', '수'],
    ['축', '토'],
    ['인', '목'],
    ['묘', '목'],
    ['진', '토'],
    ['사', '화'],
    ['오', '화'],
    ['미', '토'],
    ['신', '금'],
    ['유', '금'],
    ['술', '토'],
    ['해', '수'],
  ]
  it.each(cases)('%s → %s', (zhi, ohaeng) => {
    expect(branchToOhaeng(zhi)).toBe(ohaeng)
  })

  it('모든 지지가 매핑을 가진다', () => {
    for (const zhi of EARTHLY_BRANCHES) {
      expect(branchToOhaeng(zhi)).toBeDefined()
    }
  })
})

describe('ganziToOhaeng', () => {
  it('천간과 지지 모두 처리한다', () => {
    expect(ganziToOhaeng('갑')).toBe('목')
    expect(ganziToOhaeng('자')).toBe('수')
  })

  it('알 수 없는 글자는 예외', () => {
    expect(() => ganziToOhaeng('X')).toThrow()
  })
})
