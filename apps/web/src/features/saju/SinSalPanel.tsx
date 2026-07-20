import type { PillarKey, SinSal, SinSalCategory } from '@saju/core'
import { Panel } from './Panel'

interface SinSalPanelProps {
  sinSal: SinSal[]
}

const PILLAR_LABEL: Record<PillarKey, string> = {
  year: '년',
  month: '월',
  day: '일',
  hour: '시',
}

const CATEGORY_STYLE: Record<SinSalCategory, string> = {
  길성: 'border-mok/30 bg-mok/8 text-mok',
  흉살: 'border-hwa/30 bg-hwa/8 text-hwa',
  중립: 'border-line bg-hanji text-ink-soft',
}

function positionLabel(sinSal: SinSal): string {
  return sinSal.hits
    .map(
      (h) => `${PILLAR_LABEL[h.pillar]}${h.position === 'stem' ? '간' : '지'}`,
    )
    .join('·')
}

export function SinSalPanel({ sinSal }: SinSalPanelProps) {
  return (
    <Panel title="신살 · 길성" hanja="神殺" ariaLabel="신살">
      {sinSal.length === 0 ? (
        <p className="text-sm text-ink-faint">해당하는 신살이 없습니다.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {sinSal.map((s, i) => (
            <span
              key={`${s.name}-${s.basis}-${i}`}
              className={`rounded-md border px-2.5 py-1 text-xs ${CATEGORY_STYLE[s.category]}`}
            >
              {s.name}
              <span className="ml-1 opacity-65">{positionLabel(s)}</span>
              {s.basis === '삼합(일지)' && (
                <span className="ml-1 opacity-45">일지</span>
              )}
            </span>
          ))}
        </div>
      )}
    </Panel>
  )
}
