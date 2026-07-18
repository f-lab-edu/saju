// 대운/연운/월운 원자료 → 도메인 객체 매핑. 엔진 의존 없는 순수 변환.
import type { RawDaeUn, RawWolUn } from './engine'
import { parseGanZhi } from './ganzhi'
import type { DaeUn, WolUn } from './types'

export function toDaeUnList(raw: RawDaeUn[]): DaeUn[] {
  return raw.map((d) => ({
    ...parseGanZhi(d.ganZhi),
    startAge: d.startAge,
    endAge: d.endAge,
    startYear: d.startYear,
    yeonUn: d.yeonUn.map((y) => ({
      ...parseGanZhi(y.ganZhi),
      year: y.year,
      age: y.age,
    })),
  }))
}

export function toWolUnList(raw: RawWolUn[]): WolUn[] {
  return raw.map((m) => ({
    ...parseGanZhi(m.ganZhi),
    monthLabel: m.monthLabel,
  }))
}
