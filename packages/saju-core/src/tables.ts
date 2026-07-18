// 순수 상수 테이블. 엔진 의존 없음.
import type {
  EarthlyBranch,
  HeavenlyStem,
  JiJangGanRole,
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

export interface JiJangGanEntry {
  gan: HeavenlyStem
  role: JiJangGanRole
}

// 지장간 표준(월률분야). 신강신약 세력 계산 전용.
// 엔진의 hideGan 배열 순서(중기/여기가 유동적)에 의존하지 않으려고 별도로 고정한다.
// 각 지지의 정기 오행은 BRANCH_OHAENG와 일치한다.
export const BRANCH_JIJANGGAN: Record<EarthlyBranch, JiJangGanEntry[]> = {
  자: [
    { gan: '임', role: '여기' },
    { gan: '계', role: '정기' },
  ],
  축: [
    { gan: '계', role: '여기' },
    { gan: '신', role: '중기' },
    { gan: '기', role: '정기' },
  ],
  인: [
    { gan: '무', role: '여기' },
    { gan: '병', role: '중기' },
    { gan: '갑', role: '정기' },
  ],
  묘: [
    { gan: '갑', role: '여기' },
    { gan: '을', role: '정기' },
  ],
  진: [
    { gan: '을', role: '여기' },
    { gan: '계', role: '중기' },
    { gan: '무', role: '정기' },
  ],
  사: [
    { gan: '무', role: '여기' },
    { gan: '경', role: '중기' },
    { gan: '병', role: '정기' },
  ],
  오: [
    { gan: '병', role: '여기' },
    { gan: '기', role: '중기' },
    { gan: '정', role: '정기' },
  ],
  미: [
    { gan: '정', role: '여기' },
    { gan: '을', role: '중기' },
    { gan: '기', role: '정기' },
  ],
  신: [
    { gan: '무', role: '여기' },
    { gan: '임', role: '중기' },
    { gan: '경', role: '정기' },
  ],
  유: [
    { gan: '경', role: '여기' },
    { gan: '신', role: '정기' },
  ],
  술: [
    { gan: '신', role: '여기' },
    { gan: '정', role: '중기' },
    { gan: '무', role: '정기' },
  ],
  해: [
    { gan: '무', role: '여기' },
    { gan: '갑', role: '중기' },
    { gan: '임', role: '정기' },
  ],
}

// ─── 신살·길성 룩업 테이블 (saju-master 검증본) ───

/** 천을귀인(天乙貴人): 일간 → 지지 2개 */
export const CHEONEUL_GWIIN: Record<HeavenlyStem, EarthlyBranch[]> = {
  갑: ['축', '미'],
  무: ['축', '미'],
  경: ['축', '미'],
  을: ['자', '신'],
  기: ['자', '신'],
  병: ['해', '유'],
  정: ['해', '유'],
  신: ['인', '오'],
  임: ['묘', '사'],
  계: ['묘', '사'],
}

/** 문창귀인(文昌貴人): 일간 → 지지 1개 */
export const MUNCHANG_GWIIN: Record<HeavenlyStem, EarthlyBranch> = {
  갑: '사',
  을: '오',
  병: '신',
  정: '유',
  무: '신',
  기: '유',
  경: '해',
  신: '자',
  임: '인',
  계: '묘',
}

/** 정록/건록(正祿/建祿): 일간의 건록지 */
export const JEONGNOK: Record<HeavenlyStem, EarthlyBranch> = {
  갑: '인',
  을: '묘',
  병: '사',
  정: '오',
  무: '사',
  기: '오',
  경: '신',
  신: '유',
  임: '해',
  계: '자',
}

/** 양인(羊刃): 양간의 제왕지. 음간은 유파차가 커 미포함. */
export const YANGIN: Partial<Record<HeavenlyStem, EarthlyBranch>> = {
  갑: '묘',
  병: '오',
  무: '오',
  경: '유',
  임: '자',
}

/** 학당귀인(學堂貴人): 일간의 장생지 */
export const HAKDANG_GWIIN: Record<HeavenlyStem, EarthlyBranch> = {
  갑: '해',
  을: '오',
  병: '인',
  정: '유',
  무: '인',
  기: '유',
  경: '사',
  신: '자',
  임: '신',
  계: '묘',
}

/** 관귀학관(官貴學官): 일간 정관 오행의 장생지 */
export const GWANGWI_HAKGWAN: Record<HeavenlyStem, EarthlyBranch> = {
  갑: '사',
  을: '사',
  병: '신',
  정: '신',
  무: '해',
  기: '해',
  경: '인',
  신: '인',
  임: '인',
  계: '인',
}

export type SamhapGroup = '신자진' | '인오술' | '사유축' | '해묘미'

/** 지지 → 속한 삼합 그룹 */
export const BRANCH_TO_SAMHAP: Record<EarthlyBranch, SamhapGroup> = {
  신: '신자진',
  자: '신자진',
  진: '신자진',
  인: '인오술',
  오: '인오술',
  술: '인오술',
  사: '사유축',
  유: '사유축',
  축: '사유축',
  해: '해묘미',
  묘: '해묘미',
  미: '해묘미',
}

/** 삼합 그룹 → 삼합 기반 신살의 판정 지지 */
export const SAMHAP_SINSAL: Record<
  SamhapGroup,
  {
    도화: EarthlyBranch
    역마: EarthlyBranch
    화개: EarthlyBranch
    겁살: EarthlyBranch
    망신: EarthlyBranch
  }
> = {
  신자진: { 도화: '유', 역마: '인', 화개: '진', 겁살: '사', 망신: '해' },
  인오술: { 도화: '묘', 역마: '신', 화개: '술', 겁살: '해', 망신: '사' },
  사유축: { 도화: '오', 역마: '해', 화개: '축', 겁살: '인', 망신: '신' },
  해묘미: { 도화: '자', 역마: '사', 화개: '미', 겁살: '신', 망신: '인' },
}

/** 현침살(懸針殺): 천간·지지 자형 스캔 대상 */
export const HYEONCHIM_STEM: HeavenlyStem[] = ['갑', '신']
export const HYEONCHIM_BRANCH: EarthlyBranch[] = ['묘', '오', '미', '신']
