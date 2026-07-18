import { describe, expect, it } from 'vitest'
import { computeSaju } from './compute'
import { findRelations } from './interactions'
import type {
  EarthlyBranch,
  HeavenlyStem,
  Relation,
  RelationType,
} from './types'

// 관계 목록에서 특정 타입 + 관여 글자 집합이 있는지 확인하는 헬퍼
function has(
  relations: Relation[],
  type: RelationType,
  chars: string[],
  opts?: { partial?: boolean },
): boolean {
  const target = [...chars].sort().join('')
  return relations.some((r) => {
    if (r.type !== type) return false
    if (opts?.partial !== undefined && Boolean(r.partial) !== opts.partial) {
      return false
    }
    const got = r.members
      .map((m) => m.char)
      .sort()
      .join('')
    return got === target
  })
}

const DUMMY_STEMS: HeavenlyStem[] = ['갑', '을', '병', '정']

function rel(branches: EarthlyBranch[], stems: HeavenlyStem[] = DUMMY_STEMS) {
  return findRelations(stems, branches)
}

describe('천간합·충', () => {
  it('갑기합(토), 병임충', () => {
    const r = findRelations(['갑', '기', '병', '임'], ['자', '축', '인', '묘'])
    expect(has(r, 'stemCombine', ['갑', '기'])).toBe(true)
    const combine = r.find((x) => x.type === 'stemCombine')
    expect(combine?.transformsTo).toBe('토')
    expect(has(r, 'stemClash', ['병', '임'])).toBe(true)
  })
})

describe('지지 육합·충', () => {
  it('자축합(토)', () => {
    const r = rel(['자', '축', '인', '오'])
    expect(has(r, 'branchCombine', ['자', '축'])).toBe(true)
    expect(r.find((x) => x.type === 'branchCombine')?.transformsTo).toBe('토')
  })

  it('자오충·묘유충', () => {
    const r = rel(['자', '오', '묘', '유'])
    expect(has(r, 'branchClash', ['자', '오'])).toBe(true)
    expect(has(r, 'branchClash', ['묘', '유'])).toBe(true)
  })
})

describe('삼합·반합·방합', () => {
  it('신자진 삼합 수국(완전)', () => {
    const r = rel(['신', '자', '진', '오'])
    expect(has(r, 'branchTriple', ['신', '자', '진'], { partial: false })).toBe(
      true,
    )
  })

  it('반합은 왕지 포함 2글자, partial 표시', () => {
    const r = rel(['신', '자', '인', '축']) // 신자(수) 반합, 완전 삼합 없음
    expect(has(r, 'branchTriple', ['신', '자'], { partial: true })).toBe(true)
  })

  it('완전 삼합이 있으면 같은 오행 반합은 억제', () => {
    const r = rel(['신', '자', '진', '축'])
    // 신자진 완전 수국이 있으므로 신자·자진 반합은 나오지 않아야
    expect(has(r, 'branchTriple', ['신', '자'], { partial: true })).toBe(false)
  })

  it('사오미 방합 화국', () => {
    const r = rel(['사', '오', '미', '자'])
    expect(has(r, 'branchDirection', ['사', '오', '미'])).toBe(true)
  })
})

describe('형·파·해·원진', () => {
  it('인사신 삼형(무은지형)', () => {
    const r = rel(['인', '사', '신', '자'])
    expect(has(r, 'branchPunish', ['인', '사', '신'])).toBe(true)
    expect(
      r.find((x) => x.type === 'branchPunish' && x.members.length === 3)?.label,
    ).toBe('무은지형')
  })

  it('자묘 상형', () => {
    expect(
      has(rel(['자', '묘', '인', '오']), 'branchPunish', ['자', '묘']),
    ).toBe(true)
  })

  it('진진 자형', () => {
    const r = rel(['진', '진', '인', '오'])
    expect(r.some((x) => x.type === 'branchPunish' && x.label === '자형')).toBe(
      true,
    )
  })

  it('진축 파, 묘진 해, 사술 원진', () => {
    expect(
      has(rel(['진', '축', '인', '오']), 'branchBreak', ['진', '축']),
    ).toBe(true)
    expect(has(rel(['묘', '진', '인', '오']), 'branchHarm', ['묘', '진'])).toBe(
      true,
    )
    expect(
      has(rel(['사', '술', '인', '오']), 'branchResent', ['사', '술']),
    ).toBe(true)
  })

  it('자미는 해이면서 원진(둘 다 표시)', () => {
    const r = rel(['자', '미', '인', '오'])
    expect(has(r, 'branchHarm', ['자', '미'])).toBe(true)
    expect(has(r, 'branchResent', ['자', '미'])).toBe(true)
  })
})

describe('실제 사주 (1990-05-15 14:30 남, 지지 오·사·진·미)', () => {
  const { relations } = computeSaju({
    year: 1990,
    month: 5,
    day: 15,
    hour: 14,
    minute: 30,
    gender: 'male',
  })

  it('오미 육합(화)', () => {
    expect(has(relations, 'branchCombine', ['오', '미'])).toBe(true)
  })

  it('사오미 방합(화)', () => {
    expect(has(relations, 'branchDirection', ['사', '오', '미'])).toBe(true)
  })

  it('충은 없다', () => {
    expect(relations.some((r) => r.type === 'branchClash')).toBe(false)
  })
})
