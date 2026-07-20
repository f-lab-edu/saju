interface PanelProps {
  title: string
  hanja?: string
  right?: React.ReactNode
  children: React.ReactNode
  ariaLabel?: string
}

// 분석 카드 공통 껍데기: 한지 카드 + 명조체 제목 + 한자 곁말.
export function Panel({
  title,
  hanja,
  right,
  children,
  ariaLabel,
}: PanelProps) {
  return (
    <section
      aria-label={ariaLabel ?? title}
      className="rounded-xl border border-line bg-hanji-raised p-4 sm:p-5"
    >
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="font-myeongjo text-base font-bold tracking-tight">
          {title}
          {hanja && (
            <span className="ml-1 text-sm text-ink-faint">{hanja}</span>
          )}
        </h2>
        {right}
      </div>
      {children}
    </section>
  )
}
