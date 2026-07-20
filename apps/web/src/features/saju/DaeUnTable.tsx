import type { DaeUn } from '@saju/core'
import { ohaengBorder, ohaengText, ohaengTint } from './ohaeng'
import { Panel } from './Panel'

interface DaeUnTableProps {
  daeUn: DaeUn[]
}

export function DaeUnTable({ daeUn }: DaeUnTableProps) {
  return (
    <Panel title="대운" hanja="大運">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {daeUn.map((d) => (
          <div
            key={d.startAge}
            className="flex shrink-0 flex-col items-center gap-1"
          >
            <span className="text-[11px] tabular-nums text-ink-faint">
              {d.startAge}
            </span>
            <div
              className={`flex flex-col items-center rounded-md border ${ohaengBorder(d.ganOhaeng)} ${ohaengTint(d.ganOhaeng)} px-2.5 py-1`}
            >
              <span
                className={`font-myeongjo text-lg leading-none font-bold ${ohaengText(d.ganOhaeng)}`}
              >
                {d.gan}
              </span>
            </div>
            <div
              className={`flex flex-col items-center rounded-md border ${ohaengBorder(d.zhiOhaeng)} ${ohaengTint(d.zhiOhaeng)} px-2.5 py-1`}
            >
              <span
                className={`font-myeongjo text-lg leading-none font-bold ${ohaengText(d.zhiOhaeng)}`}
              >
                {d.zhi}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}
