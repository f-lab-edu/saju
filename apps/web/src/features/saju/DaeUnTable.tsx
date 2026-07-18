import type { DaeUn } from '@saju/core'
import { ohaengStyle } from './ohaeng'

interface DaeUnTableProps {
  daeUn: DaeUn[]
}

export function DaeUnTable({ daeUn }: DaeUnTableProps) {
  return (
    <section aria-label="대운" className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-gray-700">대운</h2>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {daeUn.map((d) => (
          <div
            key={d.startAge}
            className="flex shrink-0 flex-col items-center gap-1"
          >
            <span className="text-[11px] text-gray-400">{d.startAge}세</span>
            <div
              className={`flex flex-col items-center rounded-md border px-2 py-1 ${ohaengStyle(d.ganOhaeng)}`}
            >
              <span className="text-lg font-bold leading-none">{d.gan}</span>
            </div>
            <div
              className={`flex flex-col items-center rounded-md border px-2 py-1 ${ohaengStyle(d.zhiOhaeng)}`}
            >
              <span className="text-lg font-bold leading-none">{d.zhi}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
