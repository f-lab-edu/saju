// 최상위 오케스트레이션: 입력 검증 → 태양시 보정 → 엔진 호출 → 도메인 변환.
import { computeAnalysis } from './analysis'
import { computeJohu, yongSinRelation } from './johu'
import { computeRelations } from './interactions'
import { computeSinSal } from './sinsal'
import { computeStrength } from './strength'
import { toDaeUnList, toWolUnList } from './daeun'
import { toEngineDaeUn, toEnginePillars, toEngineWolUn } from './engine'
import { branchFromHanja } from './ganzhi'
import { toPillar } from './pillars'
import {
  applySolarTimeCorrection,
  computeCorrection,
  type WallClock,
} from './solar-time'
import type {
  ResolvedOptions,
  SajuInput,
  SajuOptions,
  SajuResult,
  WolUn,
} from './types'

function assertValidInput(input: SajuInput, timeUnknown: boolean): void {
  const { year, month, day, hour, minute } = input
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error(`월(month)은 1~12여야 합니다: ${month}`)
  }
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    throw new Error(`일(day)은 1~31이어야 합니다: ${day}`)
  }
  // 시간 모름이면 시/분은 무시하므로 검증하지 않는다.
  if (!timeUnknown) {
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
      throw new Error(`시(hour)는 0~23이어야 합니다: ${hour}`)
    }
    if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
      throw new Error(`분(minute)은 0~59여야 합니다: ${minute}`)
    }
  }
  // 존재하는 날짜인지 확인(예: 2월 30일 차단). UTC로 만들어 굴림 여부를 검사.
  const d = new Date(Date.UTC(year, month - 1, day))
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    throw new Error(`존재하지 않는 날짜입니다: ${year}-${month}-${day}`)
  }
}

/** 입력 + 옵션으로 태양시 보정된 벽시계와 실제 적용된 옵션을 만든다. */
function resolve(
  input: SajuInput,
  options?: SajuOptions,
): { corrected: WallClock; resolved: ResolvedOptions } {
  const ziPolicy = options?.ziPolicy ?? 'sameDay'
  const timeUnknown = options?.timeUnknown ?? false
  const applyDst = options?.applyDst ?? true

  // 시간 모름이면 정오(12:00)를 기준으로 년/월/일주를 뽑는다(경계 안전).
  const baseWc: WallClock = {
    year: input.year,
    month: input.month,
    day: input.day,
    hour: timeUnknown ? 12 : input.hour,
    minute: timeUnknown ? 0 : input.minute,
  }

  const corr = computeCorrection(baseWc, {
    longitude: options?.longitude,
    longitudeCorrectionMinutes: options?.longitudeCorrectionMinutes,
    applyDst,
  })

  return {
    corrected: applySolarTimeCorrection(baseWc, corr.totalMinutes),
    resolved: {
      ziPolicy,
      longitudeCorrectionMinutes: corr.longitudeCorrectionMinutes,
      longitude: options?.longitude,
      dstApplied: corr.dstApplied,
      standardMeridian: corr.standardMeridian,
      timeUnknown,
    },
  }
}

/**
 * 생년월일시(표준시 벽시계)로부터 사주 4기둥 8글자와 오행을 계산한다.
 * 잘못된 날짜/시각이면 예외를 던진다.
 */
export function computeSaju(
  input: SajuInput,
  options?: SajuOptions,
): SajuResult {
  const timeUnknown = options?.timeUnknown ?? false
  assertValidInput(input, timeUnknown)
  const { corrected, resolved } = resolve(input, options)

  const engine = toEnginePillars(corrected, resolved.ziPolicy)

  const year = toPillar(engine.year)
  const month = toPillar(engine.month)
  const day = toPillar(engine.day)
  // 시간 모름이면 시주는 내지 않는다.
  const hour = timeUnknown ? null : toPillar(engine.time)

  // 공망: '申酉' 두 글자를 각각 지지로.
  const gongMang = [...engine.dayXunKong].map(branchFromHanja)

  // 대운은 방향이 성별에 따라 갈리므로 gender가 있을 때만.
  const daeUn = input.gender
    ? toDaeUnList(toEngineDaeUn(corrected, resolved.ziPolicy, input.gender))
    : undefined

  const analysisPillars = hour ? [year, month, day, hour] : [year, month, day]
  const strength = computeStrength({ year, month, day, hour })
  const johu = computeJohu(day.gan, month.zhi)

  return {
    year,
    month,
    day,
    hour,
    gongMang,
    analysis: computeAnalysis(analysisPillars),
    strength,
    johu,
    yongSinRelation: yongSinRelation(johu, strength.yongSin.yongSin),
    relations: computeRelations({ year, month, day, hour }),
    sinSal: computeSinSal({ year, month, day, hour }),
    daeUn,
    input,
    options: resolved,
  }
}

/**
 * 특정 양력 연도의 월운(12개월)을 계산한다. 대운 흐름 위에서 정의되므로 성별이 필요하다.
 * 대운 범위(대운 시작 ~ 약 100년) 밖 연도면 빈 배열.
 */
export function computeWolUn(
  input: SajuInput,
  year: number,
  options?: SajuOptions,
): WolUn[] {
  const timeUnknown = options?.timeUnknown ?? false
  assertValidInput(input, timeUnknown)
  if (!input.gender) {
    throw new Error('월운 계산에는 성별(gender)이 필요합니다')
  }
  const { corrected, resolved } = resolve(input, options)
  return toWolUnList(
    toEngineWolUn(corrected, resolved.ziPolicy, input.gender, year),
  )
}
