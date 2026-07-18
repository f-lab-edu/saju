import type { Ohaeng, Pillar } from '@saju/core'
import { ohaengHanja, ohaengStyle } from './ohaeng'

interface PillarCardProps {
  label: string
  pillar: Pillar
}

interface CharCellProps {
  char: string
  ohaeng: Ohaeng
}

function CharCell({ char, ohaeng }: CharCellProps) {
  return (
    <div
      className={`flex flex-col items-center rounded-lg border px-2 py-2 ${ohaengStyle(ohaeng)}`}
    >
      <span className="text-2xl font-bold leading-none">{char}</span>
      <span className="mt-1 text-[10px] opacity-80">
        {ohaeng} {ohaengHanja(ohaeng)}
      </span>
    </div>
  )
}

export function PillarCard({ label, pillar }: PillarCardProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <span className="text-sm font-medium text-gray-500">{label}</span>

      <span className="text-xs text-gray-400">{pillar.ganSipSeong}</span>
      <CharCell char={pillar.gan} ohaeng={pillar.ganOhaeng} />
      <CharCell char={pillar.zhi} ohaeng={pillar.zhiOhaeng} />
      <span className="text-xs text-gray-400">{pillar.zhiSipSeong}</span>

      <div className="mt-1 flex flex-col gap-0.5 text-[11px] text-gray-500">
        <span>{pillar.unSeong}</span>
        <span className="text-gray-400">
          지장간 {pillar.jiJangGan.map((j) => j.gan).join('')}
        </span>
        <span className="text-gray-400">{pillar.naEum}</span>
      </div>
    </div>
  )
}
