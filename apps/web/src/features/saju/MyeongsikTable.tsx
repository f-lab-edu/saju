import type { Pillar } from '@saju/core'
import { branchHanja, stemHanja } from './hanja'
import { ohaengBorder, ohaengHanja, ohaengText, ohaengTint } from './ohaeng'

interface MyeongsikTableProps {
  year: Pillar
  month: Pillar
  day: Pillar
  hour: Pillar | null
}

interface Column {
  label: string
  pillar: Pillar | null
  isSelf: boolean
}

// 오행 글자 셀(천간/지지 공용)
function GanZhiCell({
  char,
  hanja,
  pillar,
  which,
  delay,
}: {
  char: string
  hanja: string
  pillar: Pillar
  which: 'gan' | 'zhi'
  delay: number
}) {
  const ohaeng = which === 'gan' ? pillar.ganOhaeng : pillar.zhiOhaeng
  return (
    <div
      className={`rise flex flex-col items-center rounded-md border ${ohaengBorder(ohaeng)} ${ohaengTint(ohaeng)} py-2`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        className={`font-myeongjo text-3xl leading-none font-extrabold sm:text-4xl ${ohaengText(ohaeng)}`}
      >
        {char}
      </span>
      <span className={`mt-1.5 text-[11px] ${ohaengText(ohaeng)} opacity-75`}>
        {hanja} · {ohaeng}
        {ohaengHanja(ohaeng)}
      </span>
    </div>
  )
}

// 한 행: 4칸 그리드, 칸마다 셀 렌더
function Row({
  cols,
  render,
  className,
}: {
  cols: Column[]
  render: (c: Column, index: number) => React.ReactNode
  className?: string
}) {
  return (
    <div className={`grid grid-cols-4 gap-2 ${className ?? ''}`}>
      {cols.map((c, i) => (
        <div key={c.label} className="min-w-0 text-center">
          {render(c, i)}
        </div>
      ))}
    </div>
  )
}

const EMPTY = <span className="text-ink-faint">·</span>

export function MyeongsikTable({
  year,
  month,
  day,
  hour,
}: MyeongsikTableProps) {
  // 전통 만세력 순서: 시 · 일 · 월 · 년 (일주=아신 기준)
  const cols: Column[] = [
    { label: '시주', pillar: hour, isSelf: false },
    { label: '일주', pillar: day, isSelf: true },
    { label: '월주', pillar: month, isSelf: false },
    { label: '년주', pillar: year, isSelf: false },
  ]

  return (
    <section
      aria-label="사주 명식"
      className="rounded-xl border border-line bg-hanji-raised p-4 shadow-[0_1px_0_rgba(35,32,27,0.04)] sm:p-6"
    >
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-myeongjo text-lg font-bold tracking-tight">
          명식 <span className="text-ink-faint">命式</span>
        </h2>
        <span className="text-xs text-ink-soft">시 · 일 · 월 · 년</span>
      </div>

      {/* 기둥 라벨 + 아신 표시 */}
      <Row
        cols={cols}
        className="mb-1"
        render={(c) => (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xs font-medium text-ink-soft">{c.label}</span>
            {c.isSelf && (
              <span className="rounded-full bg-ink px-1.5 text-[10px] font-medium text-hanji">
                아신 我
              </span>
            )}
          </div>
        )}
      />

      {/* 천간 십성 */}
      <Row
        cols={cols}
        className="mb-1"
        render={(c) =>
          c.pillar ? (
            <span className="text-[11px] text-ink-soft">
              {c.pillar.ganSipSeong}
            </span>
          ) : (
            EMPTY
          )
        }
      />

      {/* 천간 */}
      <Row
        cols={cols}
        render={(c, i) =>
          c.pillar ? (
            <GanZhiCell
              char={c.pillar.gan}
              hanja={stemHanja(c.pillar.gan)}
              pillar={c.pillar}
              which="gan"
              delay={i * 60}
            />
          ) : (
            <div className="flex h-[68px] items-center justify-center rounded-md border border-dashed border-line text-xs text-ink-faint">
              시간
              <br />
              모름
            </div>
          )
        }
      />

      {/* 지지 */}
      <Row
        cols={cols}
        className="mt-2"
        render={(c, i) =>
          c.pillar ? (
            <GanZhiCell
              char={c.pillar.zhi}
              hanja={branchHanja(c.pillar.zhi)}
              pillar={c.pillar}
              which="zhi"
              delay={i * 60 + 120}
            />
          ) : (
            <div className="h-[68px]" />
          )
        }
      />

      {/* 지지 십성 */}
      <Row
        cols={cols}
        className="mt-1"
        render={(c) =>
          c.pillar ? (
            <span className="text-[11px] text-ink-soft">
              {c.pillar.zhiSipSeong}
            </span>
          ) : (
            EMPTY
          )
        }
      />

      {/* 12운성 */}
      <Row
        cols={cols}
        className="mt-0.5"
        render={(c) =>
          c.pillar ? (
            <span className="text-[11px] text-ink-faint">
              {c.pillar.unSeong}
            </span>
          ) : (
            EMPTY
          )
        }
      />

      {/* 지장간 · 납음 */}
      <div className="mt-3 border-t border-line pt-2">
        <Row
          cols={cols}
          render={(c) =>
            c.pillar ? (
              <div className="flex flex-col gap-0.5 text-[10px] text-ink-faint">
                <span>{c.pillar.jiJangGan.map((j) => j.gan).join('')}</span>
                <span>{c.pillar.naEum}</span>
              </div>
            ) : (
              EMPTY
            )
          }
        />
      </div>
    </section>
  )
}
