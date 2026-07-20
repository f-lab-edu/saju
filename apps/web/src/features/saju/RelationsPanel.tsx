import type { Relation, RelationType } from '@saju/core'
import { Panel } from './Panel'

interface RelationsPanelProps {
  relations: Relation[]
}

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
  return (
    <Panel title="합충형파해" hanja="合沖刑破害">
      {relations.length === 0 ? (
        <p className="text-sm text-ink-faint">별다른 관계가 없습니다.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {relations.map((r, i) => {
            const harmony = HARMONY.includes(r.type)
            return (
              <span
                key={`${r.type}-${i}`}
                className={`rounded-md border px-2.5 py-1 text-xs ${
                  harmony
                    ? 'border-mok/30 bg-mok/8 text-mok'
                    : 'border-hwa/30 bg-hwa/8 text-hwa'
                }`}
              >
                {relationName(r)}
              </span>
            )
          })}
        </div>
      )}
    </Panel>
  )
}
