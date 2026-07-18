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

/** 지장간의 역할(월률분야). 정기=본기. */
export type JiJangGanRole = '여기' | '중기' | '정기'

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
  /** 0~23. timeUnknown이면 무시된다. */
  hour: number
  /** 0~59. timeUnknown이면 무시된다. */
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
   * 출생지 동경 경도(예: 서울 126.98). 주면 그 날짜에 유효했던 표준 자오선
   * (135도 또는 1954~1961·1908~1911의 127.5도) 대비 (경도-자오선)×4분으로 보정.
   */
  longitude?: number
  /**
   * longitude가 없을 때 쓰는 직접 경도 보정(분). 기본 -30. 0이면 보정 안 함.
   */
  longitudeCorrectionMinutes?: number
  /** 서머타임 자동 보정 여부. 기본 true(시행 구간 출생만 -60분). */
  applyDst?: boolean
  /** 출생 시각을 모를 때 true. 시주를 계산하지 않고 년/월/일주만 낸다. */
  timeUnknown?: boolean
}

/** 옵션 기본값이 채워진, 실제 적용된 설정. 결과에 담아 계산의 투명성을 남긴다. */
export interface ResolvedOptions {
  ziPolicy: ZiPolicy
  /** 실제 적용된 경도 보정(분, 서머타임 제외) */
  longitudeCorrectionMinutes: number
  /** 입력받은 경도(있으면) */
  longitude?: number
  /** 서머타임 적용 여부 */
  dstApplied: boolean
  /** 적용된 표준 자오선(동경, 도) */
  standardMeridian: number
  /** 시간 모름 여부 */
  timeUnknown: boolean
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

/** 오성(五星): 십성을 음양 쌍으로 묶은 5그룹. (흔히 '육친'으로도 부른다) */
export type OSeong = '비겁' | '식상' | '재성' | '관성' | '인성'

/** 어떤 분류(오행/십성/오성)의 개수·분모·퍼센트 분포 */
export interface Distribution<K extends string> {
  /** 분류별 개수 */
  counts: Record<K, number>
  /** 분모(오행·십성·오성 모두 8글자 기준) */
  total: number
  /** 퍼센트. 분모 8이라 12.5 배수로 떨어진다. */
  percent: Record<K, number>
}

/** 사주 8글자 기반 분포 분석(화면 표시용, 지장간 제외 균등 카운트) */
export interface SajuAnalysis {
  /** 오행 분포: 천간4 + 지지4 = 8글자 */
  ohaeng: Distribution<Ohaeng>
  /** 십성 분포: 천간4(일원→비견) + 지지 정기4 */
  sipSeong: Distribution<SipSeong>
  /** 오성 분포: 십성을 5그룹으로 묶은 것 */
  oSeong: Distribution<OSeong>
}

/** 신강신약 8단계 */
export type SinGangYakLevel =
  | '극약'
  | '태약'
  | '신약'
  | '중화신약'
  | '중화신강'
  | '신강'
  | '태강'
  | '극왕'

/** 가중 오행 세력(지장간·월령 가중 포함) */
export interface OhaengStrength {
  scores: Record<Ohaeng, number>
  percent: Record<Ohaeng, number>
  total: number
}

/** 득령·득지·득시·득세 판정 */
export interface DukPanjeong {
  /** 득령(得令): 월지 본기가 일간을 돕는가 */
  deukRyeong: boolean
  /** 득지(得地): 일지 본기가 일간을 돕는가 */
  deukJi: boolean
  /** 득시(得時): 시지 본기가 일간을 돕는가 */
  deukSi: boolean
  /** 득세(得勢): 전체 세력의 절반 이상이 돕는 세력인가 */
  deukSe: boolean
}

/** 조후용신(調候用神). 궁통보감 희용제요 기준. */
export interface JohuYongSin {
  /** 1순위 조후 오행 */
  primary: Ohaeng
  /** 보조 오행(중복 제거) */
  secondary: Ohaeng[]
  /** 궁통보감 원전 천간 순서(예: ['병','계']) */
  rawStems: HeavenlyStem[]
  /** 겨울생 화 / 여름생 수처럼 조후가 시급한 경우 */
  urgent: boolean
}

/** 억부용신과 조후용신의 관계 */
export type YongSinRelation = 'aligned' | 'partial' | 'conflict'

/** 억부용신(抑扶用神) 결과 */
export interface EokBuYongSin {
  /** 용신 오행(1순위) */
  yongSin: Ohaeng
  /** 희신 오행(보조) */
  huiSin: Ohaeng
  /** 용신의 일간 기준 오성 */
  yongSinOSeong: OSeong
  /** '설기제극'(신강) 또는 '생조'(신약) */
  direction: '설기제극' | '생조'
}

export interface SinGangYak {
  /** 돕는 세력(비겁+인성) */
  supportScore: number
  /** 빼는 세력(식상+재성+관성) */
  drainScore: number
  /** 돕는 세력 비율 0~100 */
  supportRatio: number
  level: SinGangYakLevel
  duk: DukPanjeong
}

/** 신강신약·용신 통합 분석(가중 세력 기반). 화면 분포와 별개다. */
export interface SajuStrengthAnalysis {
  /** 일간 오행 */
  ilganOhaeng: Ohaeng
  /** 가중 오행 세력 */
  ohaengStrength: OhaengStrength
  /** 일간 기준 오성별 세력 */
  oSeongStrength: Record<OSeong, number>
  sinGangYak: SinGangYak
  yongSin: EokBuYongSin
}

/** 기둥 위치 */
export type PillarKey = 'year' | 'month' | 'day' | 'hour'

/** 합충형파해 관계 종류 */
export type RelationType =
  | 'stemCombine' // 천간합
  | 'stemClash' // 천간충
  | 'branchCombine' // 지지 육합
  | 'branchTriple' // 삼합(반합 포함)
  | 'branchDirection' // 방합
  | 'branchClash' // 육충
  | 'branchPunish' // 형
  | 'branchBreak' // 파
  | 'branchHarm' // 해
  | 'branchResent' // 원진

export interface RelationMember {
  pillar: PillarKey
  position: 'stem' | 'branch'
  char: string
}

/** 8글자에서 발견된 관계 하나 */
export interface Relation {
  type: RelationType
  members: RelationMember[]
  /** 합류(합·삼합·방합)일 때 화(化)하는 오행 */
  transformsTo?: Ohaeng
  /** 삼합의 반합 등 부분 성립 */
  partial?: boolean
  /** 형의 세부 명칭(무은지형 등) */
  label?: string
}

export type SinSalCategory = '길성' | '흉살' | '중립'

export type SinSalBasis = '일간' | '삼합(년지)' | '삼합(일지)' | '자형'

/** 신살이 붙은 한 지점 */
export interface SinSalHit {
  pillar: PillarKey
  position: 'stem' | 'branch'
  char: string
}

/** 신살·길성 하나 */
export interface SinSal {
  name: string
  category: SinSalCategory
  basis: SinSalBasis
  hits: SinSalHit[]
}

export interface SajuResult {
  /** 년주(年柱) - 입춘 기준 */
  year: Pillar
  /** 월주(月柱) - 절기 기준 */
  month: Pillar
  /** 일주(日柱) */
  day: Pillar
  /** 시주(時柱). 시간 모름(timeUnknown)이면 null. */
  hour: Pillar | null
  /** 공망(空亡): 일주 기준으로 비어 있는 두 지지 */
  gongMang: EarthlyBranch[]
  /** 8글자 기반 오행/십성/오성 분포 */
  analysis: SajuAnalysis
  /** 가중 세력 기반 신강신약·억부용신 분석 */
  strength: SajuStrengthAnalysis
  /** 조후용신(궁통보감) */
  johu: JohuYongSin
  /** 억부용신과 조후용신의 관계(일치/상생/충돌) */
  yongSinRelation: YongSinRelation
  /** 8글자에서 발견된 합충형파해 관계 */
  relations: Relation[]
  /** 신살·길성 */
  sinSal: SinSal[]
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
