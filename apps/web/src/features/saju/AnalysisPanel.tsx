import type { Ohaeng, OSeong, SajuAnalysis } from '@saju/core'
import { ohaengBar } from './ohaeng'

interface AnalysisPanelProps {
  analysis: SajuAnalysis
}

interface BarRowProps {
  label: string
  percent: number
  count: number
  colorClass: string
}

function BarRow({ label, percent, count, colorClass }: BarRowProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-8 shrink-0 text-gray-600">{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="w-16 shrink-0 text-right text-gray-500">
        {count}개 · {percent}%
      </span>
    </div>
  )
}

const OHAENG_ORDER: Ohaeng[] = ['목', '화', '토', '금', '수']
const OSEONG_ORDER: OSeong[] = ['비겁', '식상', '재성', '관성', '인성']

export function AnalysisPanel({ analysis }: AnalysisPanelProps) {
  return (
    <section aria-label="분포 분석" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-sm font-semibold text-gray-700">오행 분포</h2>
        {OHAENG_ORDER.map((k) => (
          <BarRow
            key={k}
            label={k}
            percent={analysis.ohaeng.percent[k]}
            count={analysis.ohaeng.counts[k]}
            colorClass={ohaengBar(k)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="text-sm font-semibold text-gray-700">
          오성(십성 5그룹)
        </h2>
        {OSEONG_ORDER.map((k) => (
          <BarRow
            key={k}
            label={k}
            percent={analysis.oSeong.percent[k]}
            count={analysis.oSeong.counts[k]}
            colorClass="bg-slate-500"
          />
        ))}
      </div>
    </section>
  )
}
