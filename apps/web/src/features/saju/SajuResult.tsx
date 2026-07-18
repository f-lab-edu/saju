import { computeSaju } from '@saju/core'
import type { SajuInput, SajuResult as SajuResultType } from '@saju/core'
import { DaeUnTable } from './DaeUnTable'
import { PillarCard } from './PillarCard'

interface SajuResultProps {
  input: SajuInput
}

// computeSaju는 렌더 중 호출되는 순수 동기 계산이라, 잘못된 입력으로 던지는 예외를
// 전역 경계로 흘려보내지 않고 이 자리에서 결과/에러로 표현한다.
type ComputeState =
  | { ok: true; result: SajuResultType }
  | { ok: false; message: string }

function safeCompute(input: SajuInput): ComputeState {
  try {
    return { ok: true, result: computeSaju(input) }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '계산 중 오류가 발생했습니다.'
    return { ok: false, message }
  }
}

export function SajuResult({ input }: SajuResultProps) {
  const state = safeCompute(input)

  if (!state.ok) {
    return (
      <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">
        {state.message}
      </p>
    )
  }

  const { result } = state

  return (
    <section aria-label="사주 결과" className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        <PillarCard label="년주" pillar={result.year} />
        <PillarCard label="월주" pillar={result.month} />
        <PillarCard label="일주" pillar={result.day} />
        <PillarCard label="시주" pillar={result.hour} />
      </div>

      <p className="text-xs text-gray-500">공망: {result.gongMang.join('·')}</p>

      {result.daeUn ? (
        <DaeUnTable daeUn={result.daeUn} />
      ) : (
        <p className="text-xs text-gray-400">
          성별을 선택하면 대운을 볼 수 있습니다.
        </p>
      )}

      <p className="text-xs text-gray-400">
        자시 정책:{' '}
        {result.options.ziPolicy === 'sameDay'
          ? '야자시(당일)'
          : '야자시(다음날)'}{' '}
        · 태양시 보정 {result.options.longitudeCorrectionMinutes}분
      </p>
    </section>
  )
}
