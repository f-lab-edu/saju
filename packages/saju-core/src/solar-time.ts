// 태양시 보정. 엔진 호출 전에 우리 코드에서 벽시계 시각을 보정한다.
// 6tail은 입력 시각을 로컬 벽시계 그대로 취급하므로, 진태양시 보정은 여기서 미리 해 둔다.

/** 달력상의 벽시계 시각(초는 다루지 않음) */
export interface WallClock {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

/**
 * 분 단위로 시각을 이동시킨다. 날짜/월/연 경계를 넘으면 함께 굴린다.
 * 호스트 타임존에 의존하지 않도록 UTC 기준으로 산술만 한다(실제 UTC 의미는 없음).
 */
export function shiftMinutes(wc: WallClock, minutes: number): WallClock {
  const base = Date.UTC(wc.year, wc.month - 1, wc.day, wc.hour, wc.minute)
  const d = new Date(base + minutes * 60_000)
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
  }
}

/**
 * 경도 보정을 적용한 시각을 돌려준다. correctionMinutes는 보통 음수(한국 -30).
 * 이 값만큼 시각을 앞당겨(더해) 진태양시에 가깝게 만든다.
 */
export function applySolarTimeCorrection(
  wc: WallClock,
  correctionMinutes: number,
): WallClock {
  if (correctionMinutes === 0) return wc
  return shiftMinutes(wc, correctionMinutes)
}

// ─── 한국 표준시 이력 ───

function ymdNum(wc: WallClock): number {
  return wc.year * 10000 + wc.month * 100 + wc.day
}

// 표준 자오선이 동경 127.5도였던 구간(그 외는 135도).
// 1908-04-01~1911-12-31, 1954-03-21~1961-08-09.
const MERIDIAN_1275_PERIODS: [number, number][] = [
  [19080401, 19111231],
  [19540321, 19610809],
]

/** 해당 날짜에 유효했던 표준 자오선(동경, 도) */
export function standardMeridianFor(wc: WallClock): number {
  const n = ymdNum(wc)
  for (const [start, end] of MERIDIAN_1275_PERIODS) {
    if (n >= start && n <= end) return 127.5
  }
  return 135
}

// 한국 서머타임(일광절약시간) 시행 구간(IANA Asia/Seoul 기준, 날짜 단위 근사).
// 이 구간 출생은 벽시계가 표준시보다 1시간 빠르므로 -60분 보정한다.
const DST_PERIODS: [number, number][] = [
  [19480601, 19480912],
  [19490403, 19490910],
  [19500401, 19500910],
  [19510506, 19510908],
  [19550505, 19550908],
  [19560520, 19560929],
  [19570505, 19570921],
  [19580504, 19580920],
  [19590503, 19590919],
  [19600501, 19600917],
  [19870510, 19871010],
  [19880508, 19881008],
]

/** 해당 날짜가 한국 서머타임 시행 구간인지 */
export function inKoreaDst(wc: WallClock): boolean {
  const n = ymdNum(wc)
  return DST_PERIODS.some(([start, end]) => n >= start && n <= end)
}

export interface CorrectionOptions {
  /** 출생지 동경 경도. 주면 자오선 이력과 함께 정밀 계산. */
  longitude?: number
  /** longitude가 없을 때 쓰는 직접 보정값(분). 기본 -30. */
  longitudeCorrectionMinutes?: number
  /** 서머타임 자동 보정 여부 */
  applyDst: boolean
}

export interface CorrectionResult {
  /** 실제 적용된 경도 보정(분, 서머타임 제외) */
  longitudeCorrectionMinutes: number
  /** 서머타임 적용 여부 */
  dstApplied: boolean
  /** 적용된 표준 자오선(동경) */
  standardMeridian: number
  /** 경도 보정 + 서머타임까지 합친 총 이동(분) */
  totalMinutes: number
}

/**
 * 날짜에 유효한 표준 자오선·서머타임을 반영한 태양시 보정량을 계산한다.
 * 경도(longitude)가 있으면 (경도 - 자오선) × 4분으로, 없으면 직접값(-30 기본)으로.
 */
export function computeCorrection(
  wc: WallClock,
  opts: CorrectionOptions,
): CorrectionResult {
  const standardMeridian = standardMeridianFor(wc)
  const longitudeCorrectionMinutes =
    opts.longitude !== undefined
      ? Math.round((opts.longitude - standardMeridian) * 4)
      : (opts.longitudeCorrectionMinutes ?? -30)
  const dstApplied = opts.applyDst && inKoreaDst(wc)
  const totalMinutes = longitudeCorrectionMinutes + (dstApplied ? -60 : 0)
  return {
    longitudeCorrectionMinutes,
    dstApplied,
    standardMeridian,
    totalMinutes,
  }
}
