import { computeSaju } from '@saju/core'
import type {
  SajuInput,
  SajuOptions,
  SajuResult as SajuResultType,
} from '@saju/core'
import { AnalysisPanel } from './AnalysisPanel'
import { DaeUnTable } from './DaeUnTable'
import { MyeongsikTable } from './MyeongsikTable'
import { RelationsPanel } from './RelationsPanel'
import { SinSalPanel } from './SinSalPanel'
import { StrengthPanel } from './StrengthPanel'

interface SajuResultProps {
  input: SajuInput
  options?: SajuOptions
}

// computeSaju는 렌더 중 호출되는 순수 동기 계산이라, 잘못된 입력으로 던지는 예외를
// 전역 경계로 흘려보내지 않고 이 자리에서 결과/에러로 표현한다.
type ComputeState =
  | { ok: true; result: SajuResultType }
  | { ok: false; message: string }

function safeCompute(input: SajuInput, options?: SajuOptions): ComputeState {
  try {
    return { ok: true, result: computeSaju(input, options) }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '계산 중 오류가 발생했습니다.'
    return { ok: false, message }
  }
}

export function SajuResult({ input, options }: SajuResultProps) {
  const state = safeCompute(input, options)

  if (!state.ok) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-hwa/30 bg-hwa/8 p-4 text-sm text-hwa"
      >
        {state.message}
      </p>
    )
  }

  const { result } = state

  return (
    <div className="flex flex-col gap-4">
      <MyeongsikTable
        year={result.year}
        month={result.month}
        day={result.day}
        hour={result.hour}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <StrengthPanel
          strength={result.strength}
          johu={result.johu}
          yongSinRelation={result.yongSinRelation}
        />
        <AnalysisPanel analysis={result.analysis} />
        <RelationsPanel relations={result.relations} />
        <SinSalPanel sinSal={result.sinSal} />
      </div>

      {result.daeUn ? (
        <DaeUnTable daeUn={result.daeUn} />
      ) : (
        <p className="rounded-lg border border-line bg-hanji-raised px-4 py-3 text-xs text-ink-soft">
          성별을 선택하면 대운을 볼 수 있습니다.
        </p>
      )}

      <p className="px-1 text-xs text-ink-faint">
        공망 {result.gongMang.join('·')} · 자시{' '}
        {result.options.ziPolicy === 'sameDay' ? '당일' : '다음날'} · 태양시{' '}
        {result.options.longitudeCorrectionMinutes}분 · 자오선{' '}
        {result.options.standardMeridian}°
        {result.options.dstApplied && ' · 서머타임 −60분'}
        {result.options.timeUnknown && ' · 시간 모름'}
      </p>
    </div>
  )
}
