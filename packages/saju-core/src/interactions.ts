// 합충형파해(合沖刑破害). 8글자에서 천간·지지 사이의 관계를 찾는다.
// 테이블은 saju-master 검증본. 유파차가 있는 값(오미합=화 등)은 테이블에 모아 둔다.
import type {
  EarthlyBranch,
  HeavenlyStem,
  Ohaeng,
  Pillar,
  PillarKey,
  Relation,
  RelationMember,
} from './types'

const KEYS: PillarKey[] = ['year', 'month', 'day', 'hour']

interface PairElement<T> {
  pair: [T, T]
  element: Ohaeng
}

// 천간합: 갑기토 을경금 병신수 정임목 무계화
const STEM_COMBINE: PairElement<HeavenlyStem>[] = [
  { pair: ['갑', '기'], element: '토' },
  { pair: ['을', '경'], element: '금' },
  { pair: ['병', '신'], element: '수' },
  { pair: ['정', '임'], element: '목' },
  { pair: ['무', '계'], element: '화' },
]

// 천간충: 갑경 을신 병임 정계 (무기는 충 없음)
const STEM_CLASH: [HeavenlyStem, HeavenlyStem][] = [
  ['갑', '경'],
  ['을', '신'],
  ['병', '임'],
  ['정', '계'],
]

// 지지 육합: 오미=화(유파차, 기본값 화)
const BRANCH_COMBINE: PairElement<EarthlyBranch>[] = [
  { pair: ['자', '축'], element: '토' },
  { pair: ['인', '해'], element: '목' },
  { pair: ['묘', '술'], element: '화' },
  { pair: ['진', '유'], element: '금' },
  { pair: ['사', '신'], element: '수' },
  { pair: ['오', '미'], element: '화' },
]

// 삼합 4국
const BRANCH_TRIPLE: { members: EarthlyBranch[]; element: Ohaeng }[] = [
  { members: ['신', '자', '진'], element: '수' },
  { members: ['인', '오', '술'], element: '화' },
  { members: ['사', '유', '축'], element: '금' },
  { members: ['해', '묘', '미'], element: '목' },
]

// 반합: 왕지(자오묘유) 포함 2글자만 성립
const BRANCH_HALF: PairElement<EarthlyBranch>[] = [
  { pair: ['신', '자'], element: '수' },
  { pair: ['자', '진'], element: '수' },
  { pair: ['인', '오'], element: '화' },
  { pair: ['오', '술'], element: '화' },
  { pair: ['사', '유'], element: '금' },
  { pair: ['유', '축'], element: '금' },
  { pair: ['해', '묘'], element: '목' },
  { pair: ['묘', '미'], element: '목' },
]

// 방합 4국
const BRANCH_DIRECTION: { members: EarthlyBranch[]; element: Ohaeng }[] = [
  { members: ['인', '묘', '진'], element: '목' },
  { members: ['사', '오', '미'], element: '화' },
  { members: ['신', '유', '술'], element: '금' },
  { members: ['해', '자', '축'], element: '수' },
]

// 육충
const BRANCH_CLASH: [EarthlyBranch, EarthlyBranch][] = [
  ['자', '오'],
  ['축', '미'],
  ['인', '신'],
  ['묘', '유'],
  ['진', '술'],
  ['사', '해'],
]

// 육파
const BRANCH_BREAK: [EarthlyBranch, EarthlyBranch][] = [
  ['자', '유'],
  ['오', '묘'],
  ['신', '사'],
  ['인', '해'],
  ['진', '축'],
  ['술', '미'],
]

// 육해
const BRANCH_HARM: [EarthlyBranch, EarthlyBranch][] = [
  ['자', '미'],
  ['축', '오'],
  ['인', '사'],
  ['묘', '진'],
  ['신', '해'],
  ['유', '술'],
]

// 원진
const BRANCH_RESENT: [EarthlyBranch, EarthlyBranch][] = [
  ['자', '미'],
  ['축', '오'],
  ['인', '유'],
  ['묘', '신'],
  ['진', '해'],
  ['사', '술'],
]

// 형: 삼형 2조 + 상형(자묘) + 자형(같은 글자 2개)
const PUNISH_TRIPLE: { members: EarthlyBranch[]; label: string }[] = [
  { members: ['인', '사', '신'], label: '무은지형' },
  { members: ['축', '술', '미'], label: '지세지형' },
]
const PUNISH_MUTUAL: { pair: [EarthlyBranch, EarthlyBranch]; label: string }[] =
  [{ pair: ['자', '묘'], label: '무례지형' }]
const SELF_PUNISH: EarthlyBranch[] = ['진', '오', '유', '해']

function matchPair<T>(a: T, b: T, table: [T, T][]): boolean {
  return table.some(([x, y]) => (a === x && b === y) || (a === y && b === x))
}

function findPairElement<T>(
  a: T,
  b: T,
  table: PairElement<T>[],
): Ohaeng | undefined {
  const found = table.find(
    ({ pair: [x, y] }) => (a === x && b === y) || (a === y && b === x),
  )
  return found?.element
}

/** 지지 3개(중복 없는 집합)가 국을 이루는지 */
function tripleMatches(
  branches: EarthlyBranch[],
  set: EarthlyBranch[],
): boolean {
  return branches.length === 3 && set.every((s) => branches.includes(s))
}

const TRIPLE_INDEX_COMBOS = [
  [0, 1, 2],
  [0, 1, 3],
  [0, 2, 3],
  [1, 2, 3],
]

/**
 * 4기둥의 천간·지지 배열(year, month, day, hour 순)에서 합충형파해 관계를 찾는다.
 */
export function findRelations(
  stems: HeavenlyStem[],
  branches: EarthlyBranch[],
): Relation[] {
  const relations: Relation[] = []
  const stemAt = (i: number): RelationMember => ({
    pillar: KEYS[i],
    position: 'stem',
    char: stems[i],
  })
  const branchAt = (i: number): RelationMember => ({
    pillar: KEYS[i],
    position: 'branch',
    char: branches[i],
  })

  // --- 천간 쌍 --- (시간 모름이면 3개)
  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      const a = stems[i]
      const b = stems[j]
      const combineEl = findPairElement(a, b, STEM_COMBINE)
      if (combineEl) {
        relations.push({
          type: 'stemCombine',
          members: [stemAt(i), stemAt(j)],
          transformsTo: combineEl,
        })
      }
      if (matchPair(a, b, STEM_CLASH)) {
        relations.push({ type: 'stemClash', members: [stemAt(i), stemAt(j)] })
      }
    }
  }

  // --- 삼합/방합(3글자) 먼저: 반합 억제에 쓸 국 오행 수집 ---
  // 시간 모름이면 지지가 3개뿐이라 인덱스 3을 참조하는 조합은 제외.
  const combos = TRIPLE_INDEX_COMBOS.filter((c) =>
    c.every((i) => i < branches.length),
  )
  const fullTripleElements = new Set<Ohaeng>()
  for (const combo of combos) {
    const bs = combo.map((i) => branches[i])
    for (const t of BRANCH_TRIPLE) {
      if (tripleMatches(bs, t.members)) {
        fullTripleElements.add(t.element)
        relations.push({
          type: 'branchTriple',
          members: combo.map(branchAt),
          transformsTo: t.element,
        })
      }
    }
    for (const d of BRANCH_DIRECTION) {
      if (tripleMatches(bs, d.members)) {
        relations.push({
          type: 'branchDirection',
          members: combo.map(branchAt),
          transformsTo: d.element,
        })
      }
    }
    // 삼형(3글자)
    for (const p of PUNISH_TRIPLE) {
      if (tripleMatches(bs, p.members)) {
        relations.push({
          type: 'branchPunish',
          members: combo.map(branchAt),
          label: p.label,
        })
      }
    }
  }

  // --- 지지 쌍 --- (시간 모름이면 3개)
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const a = branches[i]
      const b = branches[j]
      const members = [branchAt(i), branchAt(j)]

      const combineEl = findPairElement(a, b, BRANCH_COMBINE)
      if (combineEl) {
        relations.push({
          type: 'branchCombine',
          members,
          transformsTo: combineEl,
        })
      }
      // 반합: 같은 오행의 완전 삼합이 없을 때만
      const halfEl = findPairElement(a, b, BRANCH_HALF)
      if (halfEl && !fullTripleElements.has(halfEl)) {
        relations.push({
          type: 'branchTriple',
          members,
          transformsTo: halfEl,
          partial: true,
        })
      }
      if (matchPair(a, b, BRANCH_CLASH)) {
        relations.push({ type: 'branchClash', members })
      }
      if (matchPair(a, b, BRANCH_BREAK)) {
        relations.push({ type: 'branchBreak', members })
      }
      if (matchPair(a, b, BRANCH_HARM)) {
        relations.push({ type: 'branchHarm', members })
      }
      if (matchPair(a, b, BRANCH_RESENT)) {
        relations.push({ type: 'branchResent', members })
      }
      const mutual = PUNISH_MUTUAL.find(
        ({ pair: [x, y] }) => (a === x && b === y) || (a === y && b === x),
      )
      if (mutual) {
        relations.push({ type: 'branchPunish', members, label: mutual.label })
      }
    }
  }

  // --- 자형(自刑): 같은 글자 2개 이상 ---
  const allIdx = branches.map((_, i) => i)
  for (const branch of SELF_PUNISH) {
    const idx = allIdx.filter((i) => branches[i] === branch)
    if (idx.length >= 2) {
      relations.push({
        type: 'branchPunish',
        members: idx.map(branchAt),
        label: '자형',
      })
    }
  }

  return relations
}

export function computeRelations(pillars: {
  year: Pillar
  month: Pillar
  day: Pillar
  hour: Pillar | null
}): Relation[] {
  const { year, month, day, hour } = pillars
  // 시간 모름이면 시주 없이 3기둥만.
  const list = hour ? [year, month, day, hour] : [year, month, day]
  return findRelations(
    list.map((p) => p.gan),
    list.map((p) => p.zhi),
  )
}
