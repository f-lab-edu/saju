import { describe, expect, it } from 'vitest'
import { computeSaju } from './compute'
import { computeJohu, yongSinRelation } from './johu'

describe('조후용신 룩업 (궁통보감)', () => {
  it('갑목 자월 → 화 (한목향양)', () => {
    const j = computeJohu('갑', '자')
    expect(j.primary).toBe('화')
    expect(j.urgent).toBe(true) // 겨울생 + 화
  })

  it('병화 오월 → 수 (여름 태양엔 물)', () => {
    const j = computeJohu('병', '오')
    expect(j.primary).toBe('수')
    expect(j.urgent).toBe(true) // 여름생 + 수
  })

  it('을목 자월 → 화 단독(보조 없음)', () => {
    const j = computeJohu('을', '자')
    expect(j.primary).toBe('화')
    expect(j.secondary).toEqual([])
  })

  it('경금 오월 → 수 단독(임·계 중복 제거)', () => {
    const j = computeJohu('경', '오')
    expect(j.primary).toBe('수')
    expect(j.secondary).toEqual([]) // 임·계 모두 수라 primary와 중복 제거
    expect(j.rawStems).toEqual(['임', '계'])
  })

  it('정화 신월 → 목, 보조 금·화·토 유지', () => {
    const j = computeJohu('정', '신')
    expect(j.primary).toBe('목') // 갑
    expect(j.secondary).toEqual(['금', '화', '토']) // 경·병·무
    expect(j.rawStems).toEqual(['갑', '경', '병', '무'])
  })

  // 전수 검증(궁통보감 대조)에서 정정한 칸들
  it('경금 인월 → 화(병) 우선 (무土 아님)', () => {
    const j = computeJohu('경', '인')
    expect(j.rawStems).toEqual(['병', '갑', '정', '임', '무'])
    expect(j.primary).toBe('화') // 조후는 병화 온난이 우선
  })

  it('기토 인월 → 병·경·갑 (2순위는 금, 수 아님)', () => {
    const j = computeJohu('기', '인')
    expect(j.rawStems).toEqual(['병', '경', '갑']) // 정월 기토는 忌壬水
    expect(j.primary).toBe('화')
  })

  it('신금 술월 → 임·갑 (병 아님)', () => {
    const j = computeJohu('신', '술')
    expect(j.rawStems).toEqual(['임', '갑']) // 土厚埋金이라 갑으로 소통
    expect(j.primary).toBe('수')
  })
})

describe('억부·조후 관계 판정', () => {
  it('같으면 aligned', () => {
    const j = computeJohu('갑', '자') // 화
    expect(yongSinRelation(j, '화')).toBe('aligned')
  })

  it('보조에 있으면 partial', () => {
    const j = computeJohu('정', '신') // 목, 보조 금화토
    expect(yongSinRelation(j, '화')).toBe('partial')
  })

  it('상극이면 conflict', () => {
    const j = computeJohu('갑', '자') // 화
    expect(yongSinRelation(j, '수')).toBe('conflict') // 수극화
  })
})

describe('결과에 조후·관계가 실린다', () => {
  const r = computeSaju({
    year: 1990,
    month: 5,
    day: 15,
    hour: 14,
    minute: 30,
    gender: 'male',
  })

  it('일간 경, 월지 사 → 조후 primary는 수', () => {
    // 경금 사월: 임무병정 → 수토화화 → primary 수
    expect(r.johu.primary).toBe('수')
    expect(r.johu.rawStems).toEqual(['임', '무', '병', '정'])
  })

  it('억부용신(목)과 조후(수)의 관계 플래그가 있다', () => {
    // 수생목이므로 partial
    expect(r.strength.yongSin.yongSin).toBe('목')
    expect(r.yongSinRelation).toBe('partial')
  })
})
