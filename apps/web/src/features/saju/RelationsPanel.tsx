import type { Relation, RelationType } from '@saju/core'

interface RelationsPanelProps {
  relations: Relation[]
}

// 합류(합·삼합·방합)는 긍정 계열, 충·형·파·해·원진은 주의 계열로 색을 나눈다.
const HARMONY: RelationType[] = [
  'stemCombine',
  'branchCombine',
  'branchTriple',
  'branchDirection',
]

const SUFFIX: Record<RelationType, string> = {
  stemCombine: '합',
  stemClash: '충',
  branchCombine: '합',
  branchTriple: '삼합',
  branchDirection: '방합',
  branchClash: '충',
  branchPunish: '형',
  branchBreak: '파',
  branchHarm: '해',
  branchResent: '원진',
}

function relationName(r: Relation): string {
  const chars = r.members.map((m) => m.char).join('')
  if (r.type === 'branchTriple' && r.partial) {
    return `${chars} 반합${r.transformsTo ? `(${r.transformsTo})` : ''}`
  }
  const base = `${chars}${SUFFIX[r.type]}`
  if (r.transformsTo) return `${base}(${r.transformsTo})`
  if (r.label) return `${base}(${r.label})`
  return base
}

export function RelationsPanel({ relations }: RelationsPanelProps) {
  if (relations.length === 0) {
    return (
      <section aria-label="합충형파해" className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-gray-700">합충형파해</h2>
        <p className="text-xs text-gray-400">특별한 관계가 없습니다.</p>
      </section>
    )
  }

  return (
    <section aria-label="합충형파해" className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-gray-700">합충형파해</h2>
      <div className="flex flex-wrap gap-1.5">
        {relations.map((r, i) => {
          const harmony = HARMONY.includes(r.type)
          return (
            <span
              key={`${r.type}-${i}`}
              className={`rounded px-2 py-0.5 text-xs ${
                harmony
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {relationName(r)}
            </span>
          )
        })}
      </div>
    </section>
  )
}
