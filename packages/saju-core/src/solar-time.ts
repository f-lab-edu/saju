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
