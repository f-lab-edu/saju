import { describe, expect, it } from 'vitest'
import { computeSaju } from './compute'
import type { PillarKey, SinSal } from './types'

// 신살 목록에서 이름(+선택적 basis)으로 찾기
function find(
  sinSal: SinSal[],
  name: string,
  basis?: string,
): SinSal | undefined {
  return sinSal.find(
    (s) => s.name === name && (basis === undefined || s.basis === basis),
  )
}

function pillarsOf(s: SinSal | undefined): PillarKey[] {
  return (s?.hits ?? []).map((h) => h.pillar)
}

// 1990-05-15 14:30 남. 일간 경, 지지 오·사·진·미.
const { sinSal } = computeSaju({
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  gender: 'male',
})

describe('일간(경) 기준 신살', () => {
  it('천을귀인은 시지 미', () => {
    const s = find(sinSal, '천을귀인')
    expect(s).toBeDefined()
    expect(s?.category).toBe('길성')
    expect(pillarsOf(s)).toEqual(['hour']) // 미
  })

  it('학당귀인은 월지 사', () => {
    expect(pillarsOf(find(sinSal, '학당귀인'))).toEqual(['month'])
  })

  it('문창(해)·정록(신)·양인(유)·관귀학관(인)은 없다', () => {
    expect(find(sinSal, '문창귀인')).toBeUndefined()
    expect(find(sinSal, '정록')).toBeUndefined()
    expect(find(sinSal, '양인')).toBeUndefined()
    expect(find(sinSal, '관귀학관')).toBeUndefined()
  })
})

describe('삼합(년지 오=인오술) 기준 신살', () => {
  it('망신살은 월지 사', () => {
    const s = find(sinSal, '망신살', '삼합(년지)')
    expect(pillarsOf(s)).toEqual(['month'])
  })

  it('년지 기준 도화(묘)·역마(신)·화개(술)·겁살(해)은 없다', () => {
    expect(find(sinSal, '도화살', '삼합(년지)')).toBeUndefined()
    expect(find(sinSal, '역마살', '삼합(년지)')).toBeUndefined()
    expect(find(sinSal, '화개살', '삼합(년지)')).toBeUndefined()
    expect(find(sinSal, '겁살', '삼합(년지)')).toBeUndefined()
  })
})

describe('삼합(일지 진=신자진) 병행 신살', () => {
  // 일지 진은 년지 오(인오술)와 다른 그룹(신자진)이라 일지 기준을 병행한다.
  it('화개살은 일지 진(기준 화개=진)', () => {
    const s = find(sinSal, '화개살', '삼합(일지)')
    expect(pillarsOf(s)).toEqual(['day'])
  })

  it('겁살은 월지 사(신자진 기준 겁살=사)', () => {
    const s = find(sinSal, '겁살', '삼합(일지)')
    expect(pillarsOf(s)).toEqual(['month'])
  })
})

describe('현침살(자형)', () => {
  it('월간 신, 년지 오, 시지 미에 붙는다', () => {
    const s = find(sinSal, '현침살')
    expect(s).toBeDefined()
    // 월간 신(stem), 년지 오(branch), 시지 미(branch)
    const positions = s?.hits.map((h) => `${h.pillar}:${h.position}:${h.char}`)
    expect(positions).toContain('month:stem:신')
    expect(positions).toContain('year:branch:오')
    expect(positions).toContain('hour:branch:미')
  })
})

describe('삼합 신살 정확성 (다른 사주)', () => {
  it('년지가 자(신자진 수국)면 도화=유', () => {
    // 2008-02-10 은 무자년. 년지 자.
    const r = computeSaju({
      year: 2008,
      month: 5,
      day: 10,
      hour: 10,
      minute: 0,
      gender: 'female',
    })
    const dohwa = find(r.sinSal, '도화살')
    // 도화살이 있으면 그 대상 지지는 유여야 한다(신자진 기준)
    if (dohwa) {
      for (const h of dohwa.hits) expect(h.char).toBe('유')
    }
    // 년지가 실제로 신자진 그룹인지 확인
    expect(['신', '자', '진']).toContain(r.year.zhi)
  })
})
