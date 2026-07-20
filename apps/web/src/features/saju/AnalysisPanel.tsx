import type { Ohaeng, OSeong, SajuAnalysis } from '@saju/core'
import { ohaengFill, ohaengHanja, ohaengText } from './ohaeng'
import { Panel } from './Panel'

interface AnalysisPanelProps {
  analysis: SajuAnalysis
}

const OHAENG_ORDER: Ohaeng[] = ['목', '화', '토', '금', '수']
const OSEONG_ORDER: OSeong[] = ['비겁', '식상', '재성', '관성', '인성']

function BarRow({
  label,
  labelClass,
  percent,
  count,
  fillClass,
}: {
  label: string
  labelClass?: string
  percent: number
  count: number
  fillClass: string
}) {
  return (
    <div className="flex items-center gap-2.5 text-xs">
      <span className={`w-9 shrink-0 font-medium ${labelClass ?? 'text-ink'}`}>
        {label}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-line/60">
        <div
          className={`h-full rounded-full ${fillClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="w-14 shrink-0 text-right tabular-nums text-ink-faint">
        {count} · {percent}%
      </span>
    </div>
  )
}

export function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  return (
    <Panel title="오행 · 십성 분포" hanja="分布" ariaLabel="분포 분석">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-medium text-ink-soft">오행</h3>
          {OHAENG_ORDER.map((k) => (
            <BarRow
              key={k}
              label={`${k}${ohaengHanja(k)}`}
              labelClass={ohaengText(k)}
              percent={analysis.ohaeng.percent[k]}
              count={analysis.ohaeng.counts[k]}
              fillClass={ohaengFill(k)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-medium text-ink-soft">
            오성 (십성 5분류)
          </h3>
          {OSEONG_ORDER.map((k) => (
            <BarRow
              key={k}
              label={k}
              percent={analysis.oSeong.percent[k]}
              count={analysis.oSeong.counts[k]}
              fillClass="bg-ink/70"
            />
          ))}
        </div>
      </div>
    </Panel>
  )
}
