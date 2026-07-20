import type {
  JohuYongSin,
  Ohaeng,
  SajuStrengthAnalysis,
  YongSinRelation,
} from '@saju/core'
import { ohaengBorder, ohaengHanja, ohaengText, ohaengTint } from './ohaeng'
import { Panel } from './Panel'

interface StrengthPanelProps {
  strength: SajuStrengthAnalysis
  johu: JohuYongSin
  yongSinRelation: YongSinRelation
}

function DukChip({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className={`rounded px-2 py-1 text-xs ${
        ok
          ? 'bg-ink text-hanji'
          : 'border border-line text-ink-faint line-through'
      }`}
    >
      {label}
    </span>
  )
}

function YongSinTile({ ohaeng }: { ohaeng: Ohaeng }) {
  return (
    <span
      className={`inline-flex items-baseline gap-1 rounded-md border ${ohaengBorder(ohaeng)} ${ohaengTint(ohaeng)} px-2.5 py-1`}
    >
      <span className={`font-myeongjo text-lg font-bold ${ohaengText(ohaeng)}`}>
        {ohaeng}
      </span>
      <span className={`text-xs ${ohaengText(ohaeng)} opacity-70`}>
        {ohaengHanja(ohaeng)}
      </span>
    </span>
  )
}

const RELATION: Record<YongSinRelation, { label: string; className: string }> =
  {
    aligned: { label: '억부·조후 일치 — 신뢰도 높음', className: 'text-mok' },
    partial: { label: '억부·조후 상생·보조', className: 'text-ink-soft' },
    conflict: { label: '억부·조후 상충 — 강약 vs 한난', className: 'text-hwa' },
  }

export function StrengthPanel({
  strength,
  johu,
  yongSinRelation,
}: StrengthPanelProps) {
  const { sinGangYak, yongSin, ilganOhaeng } = strength
  const rel = RELATION[yongSinRelation]

  return (
    <Panel title="신강 · 신약" hanja="身强弱" ariaLabel="신강신약·용신">
      <div className="flex flex-col gap-4">
        <div className="flex items-end gap-3">
          <span className="font-myeongjo text-3xl leading-none font-extrabold">
            {sinGangYak.level}
          </span>
          <span className="pb-1 text-xs text-ink-soft">
            일간 {ilganOhaeng}
            {ohaengHanja(ilganOhaeng)} · 방조 {sinGangYak.supportRatio}%
          </span>
        </div>

        {/* 세력 게이지 */}
        <div className="h-1.5 overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-ink"
            style={{ width: `${sinGangYak.supportRatio}%` }}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <DukChip label="득령" ok={sinGangYak.duk.deukRyeong} />
          <DukChip label="득지" ok={sinGangYak.duk.deukJi} />
          <DukChip label="득시" ok={sinGangYak.duk.deukSi} />
          <DukChip label="득세" ok={sinGangYak.duk.deukSe} />
        </div>

        <div className="flex flex-col gap-2 border-t border-line pt-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-14 shrink-0 text-ink-soft">억부용신</span>
            <YongSinTile ohaeng={yongSin.yongSin} />
            <span className="text-xs text-ink-faint">
              희신 {yongSin.huiSin}
              {ohaengHanja(yongSin.huiSin)} · {yongSin.direction}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-14 shrink-0 text-ink-soft">조후용신</span>
            <YongSinTile ohaeng={johu.primary} />
            <span className="text-xs text-ink-faint">
              {johu.secondary.length > 0 &&
                `보조 ${johu.secondary.join('·')} · `}
              {johu.urgent ? '조후 시급' : '조후 완만'}
            </span>
          </div>
          <p className={`text-xs ${rel.className}`}>{rel.label}</p>
        </div>
      </div>
    </Panel>
  )
}
