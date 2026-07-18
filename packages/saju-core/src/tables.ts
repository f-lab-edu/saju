// 순수 상수 테이블. 엔진 의존 없음.
import type {
  EarthlyBranch,
  HeavenlyStem,
  Ohaeng,
  SipSeongOrSelf,
  UnSeong,
} from './types'

/** 엔진(lunar-typescript)이 돌려주는 천간 한자 → 한글 */
export const STEM_HANJA_TO_HANGUL: Record<string, HeavenlyStem> = {
  甲: '갑',
  乙: '을',
  丙: '병',
  丁: '정',
  戊: '무',
  己: '기',
  庚: '경',
  辛: '신',
  壬: '임',
  癸: '계',
}

/** 엔진이 돌려주는 지지 한자 → 한글 */
export const BRANCH_HANJA_TO_HANGUL: Record<string, EarthlyBranch> = {
  子: '자',
  丑: '축',
  寅: '인',
  卯: '묘',
  辰: '진',
  巳: '사',
  午: '오',
  未: '미',
  申: '신',
  酉: '유',
  戌: '술',
  亥: '해',
}

/** 천간 오행: 갑을=木, 병정=火, 무기=土, 경신=金, 임계=水 */
export const STEM_OHAENG: Record<HeavenlyStem, Ohaeng> = {
  갑: '목',
  을: '목',
  병: '화',
  정: '화',
  무: '토',
  기: '토',
  경: '금',
  신: '금',
  임: '수',
  계: '수',
}

/** 지지 오행: 인묘=木, 사오=火, 진술축미=土, 신유=金, 해자=水 */
export const BRANCH_OHAENG: Record<EarthlyBranch, Ohaeng> = {
  인: '목',
  묘: '목',
  사: '화',
  오: '화',
  진: '토',
  술: '토',
  축: '토',
  미: '토',
  신: '금',
  유: '금',
  해: '수',
  자: '수',
}

// 엔진(lunar-typescript)이 돌려주는 십성 한자(간체)를 한글로. 七杀=편관, 日主=일원.
export const SIPSEONG_HANJA_TO_HANGUL: Record<string, SipSeongOrSelf> = {
  比肩: '비견',
  劫财: '겁재',
  食神: '식신',
  伤官: '상관',
  偏财: '편재',
  正财: '정재',
  七杀: '편관',
  正官: '정관',
  偏印: '편인',
  正印: '정인',
  日主: '일원',
}

// 12운성 한자(간체)를 한글로. 临官=건록.
export const UNSEONG_HANJA_TO_HANGUL: Record<string, UnSeong> = {
  长生: '장생',
  沐浴: '목욕',
  冠带: '관대',
  临官: '건록',
  帝旺: '제왕',
  衰: '쇠',
  病: '병',
  死: '사',
  墓: '묘',
  绝: '절',
  胎: '태',
  养: '양',
}
