// 사주 계산 코어의 공개 타입.
// 표기는 한글(갑을병정… / 자축인묘…)을 기본으로 한다. 계산 엔진(lunar-typescript)이
// 반환하는 한자는 engine 계층에서 한글로 변환되므로, 이 타입에는 엔진 흔적이 없다.

/** 천간(天干) 10개, 한글 표기 */
export const HEAVENLY_STEMS = [
  '갑',
  '을',
  '병',
  '정',
  '무',
  '기',
  '경',
  '신',
  '임',
  '계',
] as const

/** 지지(地支) 12개, 한글 표기 */
export const EARTHLY_BRANCHES = [
  '자',
  '축',
  '인',
  '묘',
  '진',
  '사',
  '오',
  '미',
  '신',
  '유',
  '술',
  '해',
] as const

export type HeavenlyStem = (typeof HEAVENLY_STEMS)[number]
export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number]

/** 오행(五行) */
export type Ohaeng = '목' | '화' | '토' | '금' | '수'

/** 십성(十星) 10개. 일간(日干) 자신은 '일원'으로 따로 표기한다. */
export type SipSeong =
  | '비견'
  | '겁재'
  | '식신'
  | '상관'
  | '편재'
  | '정재'
  | '편관'
  | '정관'
  | '편인'
  | '정인'

/** 일간 자신(아신)을 포함한 십성 표기 */
export type SipSeongOrSelf = SipSeong | '일원'

/** 12운성(十二運星) */
export type UnSeong =
  | '장생'
  | '목욕'
  | '관대'
  | '건록'
  | '제왕'
  | '쇠'
  | '병'
  | '사'
  | '묘'
  | '절'
  | '태'
  | '양'

/** 지장간(支藏干): 지지 속에 숨은 천간 하나. 배열의 첫 원소가 정기(본기)다. */
export interface JiJangGan {
  gan: HeavenlyStem
  ohaeng: Ohaeng
  /** 이 지장간의 십성(일간 기준) */
  sipSeong: SipSeong
}

/** 사주의 한 기둥(柱): 천간 + 지지 두 글자와 부가 정보 */
export interface Pillar {
  gan: HeavenlyStem
  zhi: EarthlyBranch
  ganOhaeng: Ohaeng
  zhiOhaeng: Ohaeng
  /** 천간의 십성. 일주 천간은 '일원'. */
  ganSipSeong: SipSeongOrSelf
  /** 지지의 십성(정기 기준) */
  zhiSipSeong: SipSeong
  /** 지장간 목록(정기 우선) */
  jiJangGan: JiJangGan[]
  /** 지지 기준 12운성 */
  unSeong: UnSeong
  /** 납음오행(한글). 예: '노방토' */
  naEum: string
}

export type Gender = 'male' | 'female'

/**
 * 계산 입력. 시각은 "출생지의 표준시 벽시계 시각"으로 받는다.
 * (한국이면 KST 기준. 태양시 보정은 옵션으로 이 코어가 적용한다.)
 */
export interface SajuInput {
  year: number
  /** 1~12 */
  month: number
  /** 1~31 */
  day: number
  /** 0~23 */
  hour: number
  /** 0~59 */
  minute: number
  /** MVP에선 계산에 영향 없음(대운 방향 등 후속 기능에서 사용). 보관만 한다. */
  gender?: Gender
}

/**
 * 자시(子時, 23:00~00:59) 처리 정책. 명리 유파에 따라 23:00~24:00 출생의
 * 일주(日柱)가 달라지는 지점이라 옵션으로 노출한다.
 * - 'sameDay'  (기본): 야자시(23:00~24:00)의 일주를 '당일'로 본다. 주류 유파. 6tail sect=2.
 * - 'nextDay': 야자시의 일주를 '다음 날'로 본다. 6tail sect=1.
 */
export type ZiPolicy = 'sameDay' | 'nextDay'

export interface SajuOptions {
  /** 기본 'sameDay' */
  ziPolicy?: ZiPolicy
  /**
   * 태양시 경도 보정(분). 표준시 자오선과 실제 출생지 경도 차이를 시각에서 뺀다.
   * 한국(서울 약 127.5°E, KST는 135°E 기준)은 약 -30분이 관례. 기본 -30.
   * 0을 주면 보정하지 않는다.
   */
  longitudeCorrectionMinutes?: number
}

/** 옵션 기본값이 채워진, 실제 적용된 설정. 결과에 담아 계산의 투명성을 남긴다. */
export interface ResolvedOptions {
  ziPolicy: ZiPolicy
  longitudeCorrectionMinutes: number
}

/** 간지 한 쌍과 오행. 대운/연운/월운 등 시간 흐름 항목의 기본 단위. */
export interface GanZhi {
  gan: HeavenlyStem
  zhi: EarthlyBranch
  ganOhaeng: Ohaeng
  zhiOhaeng: Ohaeng
}

/** 연운(年運): 특정 해의 간지 */
export interface YeonUn extends GanZhi {
  year: number
  /** 그 해의 만 나이(대운 계산 기준) */
  age: number
}

/** 대운(大運): 10년 단위 운의 흐름 */
export interface DaeUn extends GanZhi {
  /** 이 대운이 지배하는 시작/끝 나이 */
  startAge: number
  endAge: number
  /** 시작 연도(양력) */
  startYear: number
  /** 이 대운 구간의 연운 목록(10년) */
  yeonUn: YeonUn[]
}

/** 월운(月運): 특정 해 12개월의 간지. 필요할 때 computeWolUn으로 구한다. */
export interface WolUn extends GanZhi {
  /** 음력 월 라벨(예: '正', '二' … 엔진 표기 그대로) */
  monthLabel: string
}

export interface SajuResult {
  /** 년주(年柱) - 입춘 기준 */
  year: Pillar
  /** 월주(月柱) - 절기 기준 */
  month: Pillar
  /** 일주(日柱) */
  day: Pillar
  /** 시주(時柱) */
  hour: Pillar
  /** 공망(空亡): 일주 기준으로 비어 있는 두 지지 */
  gongMang: EarthlyBranch[]
  /**
   * 대운 목록. 방향(순행/역행)이 성별에 따라 갈리므로 gender가 있을 때만 채운다.
   * gender가 없으면 undefined.
   */
  daeUn?: DaeUn[]
  /** 입력값 그대로 */
  input: SajuInput
  /** 실제 적용된 옵션 */
  options: ResolvedOptions
}
