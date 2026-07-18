import type { PillarKey, SinSal, SinSalCategory } from '@saju/core'

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
  길성: 'bg-emerald-100 text-emerald-800',
  흉살: 'bg-rose-100 text-rose-800',
  중립: 'bg-gray-100 text-gray-600',
}

function positionLabel(sinSal: SinSal): string {
  const parts = sinSal.hits.map(
    (h) => `${PILLAR_LABEL[h.pillar]}${h.position === 'stem' ? '간' : '지'}`,
  )
  return parts.join('·')
}

export function SinSalPanel({ sinSal }: SinSalPanelProps) {
  if (sinSal.length === 0) {
    return (
      <section aria-label="신살" className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-gray-700">신살·길성</h2>
        <p className="text-xs text-gray-400">해당하는 신살이 없습니다.</p>
      </section>
    )
  }

  return (
    <section aria-label="신살" className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-gray-700">신살·길성</h2>
      <div className="flex flex-wrap gap-1.5">
        {sinSal.map((s) => (
          <span
            key={s.name}
            className={`rounded px-2 py-0.5 text-xs ${CATEGORY_STYLE[s.category]}`}
          >
            {s.name}
            <span className="ml-1 opacity-70">{positionLabel(s)}</span>
          </span>
        ))}
      </div>
    </section>
  )
}
