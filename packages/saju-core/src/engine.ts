// 계산 엔진(lunar-typescript, 6tail) 격리 계층.
// 이 파일 밖에서는 lunar-typescript를 import하지 않는다. 나중에 엔진을 자체 절기
// 테이블이나 KASI 데이터로 교체하더라도 도메인 코드는 이 인터페이스(원자료)만 바라본다.
import { Solar } from 'lunar-typescript'
import type { EightChar } from 'lunar-typescript'
import type { WallClock } from './solar-time'
import type { Gender, ZiPolicy } from './types'

/** 엔진이 돌려준 한 기둥의 원자료(모두 한자) */
export interface RawPillar {
  gan: string
  zhi: string
  /** 천간 십성 */
  ganShiShen: string
  /** 지장간(정기 우선) */
  hideGan: string[]
  /** 지장간 각각의 십성(hideGan과 같은 순서) */
  hideGanShiShen: string[]
  /** 12운성 */
  diShi: string
}

export interface EnginePillars {
  year: RawPillar
  month: RawPillar
  day: RawPillar
  time: RawPillar
  /** 일주 기준 공망(순공) 두 지지. 예: '申酉' */
  dayXunKong: string
}

export interface RawYeonUn {
  year: number
  age: number
  ganZhi: string
}

export interface RawDaeUn {
  startAge: number
  endAge: number
  startYear: number
  ganZhi: string
  yeonUn: RawYeonUn[]
}

export interface RawWolUn {
  monthLabel: string
  ganZhi: string
}

function eightCharOf(wc: WallClock, ziPolicy: ZiPolicy): EightChar {
  const solar = Solar.fromYmdHms(
    wc.year,
    wc.month,
    wc.day,
    wc.hour,
    wc.minute,
    0,
  )
  const ec = solar.getLunar().getEightChar()
  // 자시 정책: 'sameDay'=2(야자시 일주는 당일, 기본), 'nextDay'=1.
  ec.setSect(ziPolicy === 'sameDay' ? 2 : 1)
  return ec
}

/** 6tail의 성별 코드: 1=남, 0=여 */
function genderCode(gender: Gender): number {
  return gender === 'male' ? 1 : 0
}

/**
 * 보정된 벽시계 시각으로 사주 4기둥의 원자료를 뽑는다.
 * - 년주는 EightChar가 입춘(立春) 기준으로 계산한다.
 * - 월주는 12절기 경계.
 */
export function toEnginePillars(
  wc: WallClock,
  ziPolicy: ZiPolicy,
): EnginePillars {
  const ec = eightCharOf(wc, ziPolicy)

  return {
    year: {
      gan: ec.getYearGan(),
      zhi: ec.getYearZhi(),
      ganShiShen: ec.getYearShiShenGan(),
      hideGan: ec.getYearHideGan(),
      hideGanShiShen: ec.getYearShiShenZhi(),
      diShi: ec.getYearDiShi(),
    },
    month: {
      gan: ec.getMonthGan(),
      zhi: ec.getMonthZhi(),
      ganShiShen: ec.getMonthShiShenGan(),
      hideGan: ec.getMonthHideGan(),
      hideGanShiShen: ec.getMonthShiShenZhi(),
      diShi: ec.getMonthDiShi(),
    },
    day: {
      gan: ec.getDayGan(),
      zhi: ec.getDayZhi(),
      ganShiShen: ec.getDayShiShenGan(),
      hideGan: ec.getDayHideGan(),
      hideGanShiShen: ec.getDayShiShenZhi(),
      diShi: ec.getDayDiShi(),
    },
    time: {
      gan: ec.getTimeGan(),
      zhi: ec.getTimeZhi(),
      ganShiShen: ec.getTimeShiShenGan(),
      hideGan: ec.getTimeHideGan(),
      hideGanShiShen: ec.getTimeShiShenZhi(),
      diShi: ec.getTimeDiShi(),
    },
    dayXunKong: ec.getDayXunKong(),
  }
}

/**
 * 대운(연운 포함) 원자료. 방향(순행/역행)은 엔진이 성별과 연간 음양으로 정한다.
 * 첫 항목이 대운 시작 전 placeholder(간지 없음)면 걸러 낸다.
 */
export function toEngineDaeUn(
  wc: WallClock,
  ziPolicy: ZiPolicy,
  gender: Gender,
): RawDaeUn[] {
  const ec = eightCharOf(wc, ziPolicy)
  const yun = ec.getYun(genderCode(gender))

  return yun
    .getDaYun()
    .filter((d) => d.getGanZhi().length >= 2)
    .map((d) => ({
      startAge: d.getStartAge(),
      endAge: d.getEndAge(),
      startYear: d.getStartYear(),
      ganZhi: d.getGanZhi(),
      yeonUn: d.getLiuNian().map((ln) => ({
        year: ln.getYear(),
        age: ln.getAge(),
        ganZhi: ln.getGanZhi(),
      })),
    }))
}

/** 특정 양력 연도의 월운(12개월) 원자료. 대운 범위 밖 연도면 빈 배열. */
export function toEngineWolUn(
  wc: WallClock,
  ziPolicy: ZiPolicy,
  gender: Gender,
  year: number,
): RawWolUn[] {
  const ec = eightCharOf(wc, ziPolicy)
  const yun = ec.getYun(genderCode(gender))

  for (const d of yun.getDaYun()) {
    for (const ln of d.getLiuNian()) {
      if (ln.getYear() === year) {
        return ln.getLiuYue().map((m) => ({
          monthLabel: m.getMonthInChinese(),
          ganZhi: m.getGanZhi(),
        }))
      }
    }
  }
  return []
}
