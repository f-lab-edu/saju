import type {
  JohuYongSin,
  SajuStrengthAnalysis,
  YongSinRelation,
} from '@saju/core'
import { ohaengHanja, ohaengStyle } from './ohaeng'

interface StrengthPanelProps {
  strength: SajuStrengthAnalysis
  johu: JohuYongSin
  yongSinRelation: YongSinRelation
}

interface DukChipProps {
  label: string
  ok: boolean
}

function DukChip({ label, ok }: DukChipProps) {
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs ${
        ok ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-400'
      }`}
    >
      {label} {ok ? 'O' : 'X'}
    </span>
  )
}

const RELATION_LABEL: Record<YongSinRelation, string> = {
  aligned: '억부와 일치 (신뢰도 높음)',
  partial: '억부와 상생·보조',
  conflict: '억부와 상충 (강약 vs 한난)',
}

const RELATION_STYLE: Record<YongSinRelation, string> = {
  aligned: 'text-emerald-600',
  partial: 'text-gray-400',
  conflict: 'text-rose-600',
}

export function StrengthPanel({
  strength,
  johu,
  yongSinRelation,
}: StrengthPanelProps) {
  const { sinGangYak, yongSin, ilganOhaeng } = strength

  return (
    <section aria-label="신강신약·용신" className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-gray-700">신강 / 신약</h2>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-gray-900 px-3 py-1 text-sm font-bold text-white">
          {sinGangYak.level}
        </span>
        <span className="text-xs text-gray-500">
          일간 {ilganOhaeng}
          {ohaengHanja(ilganOhaeng)} · 돕는 세력 {sinGangYak.supportRatio}%
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <DukChip label="득령" ok={sinGangYak.duk.deukRyeong} />
        <DukChip label="득지" ok={sinGangYak.duk.deukJi} />
        <DukChip label="득시" ok={sinGangYak.duk.deukSi} />
        <DukChip label="득세" ok={sinGangYak.duk.deukSe} />
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="w-16 shrink-0 text-gray-500">억부용신</span>
        <span
          className={`rounded-md border px-2.5 py-1 font-bold ${ohaengStyle(yongSin.yongSin)}`}
        >
          {yongSin.yongSin}
          {ohaengHanja(yongSin.yongSin)}
        </span>
        <span className="text-xs text-gray-400">
          희신 {yongSin.huiSin}
          {ohaengHanja(yongSin.huiSin)} · {yongSin.direction}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="w-16 shrink-0 text-gray-500">조후용신</span>
        <span
          className={`rounded-md border px-2.5 py-1 font-bold ${ohaengStyle(johu.primary)}`}
        >
          {johu.primary}
          {ohaengHanja(johu.primary)}
        </span>
        <span className="text-xs text-gray-400">
          {johu.secondary.length > 0 && `보조 ${johu.secondary.join('·')} · `}
          {johu.urgent ? '조후 시급' : '조후 완만'}
        </span>
      </div>

      <p className={`text-xs ${RELATION_STYLE[yongSinRelation]}`}>
        {RELATION_LABEL[yongSinRelation]}
      </p>
    </section>
  )
}
