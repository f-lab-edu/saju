import type { Gender, SajuInput } from '@saju/core'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { BirthFormValues } from '#/features/saju/BirthInputForm'
import { BirthInputForm } from '#/features/saju/BirthInputForm'
import { SajuResult } from '#/features/saju/SajuResult'

// 공유 가능한 화면 상태(생년월일시)는 URL search params에 담는다.
interface SajuSearch {
  year?: number
  month?: number
  day?: number
  hour?: number
  minute?: number
  gender?: Gender
}

function toNumber(value: unknown): number | undefined {
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

function validateSearch(search: Record<string, unknown>): SajuSearch {
  const gender =
    search.gender === 'male' || search.gender === 'female'
      ? search.gender
      : undefined
  return {
    year: toNumber(search.year),
    month: toNumber(search.month),
    day: toNumber(search.day),
    hour: toNumber(search.hour),
    minute: toNumber(search.minute),
    gender,
  }
}

export const Route = createFileRoute('/')({
  component: Home,
  validateSearch,
})

// search에 생년월일시가 모두 있으면 SajuInput으로, 아니면 null.
function toInput(search: SajuSearch): SajuInput | null {
  const { year, month, day, hour, minute, gender } = search
  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    hour === undefined ||
    minute === undefined
  ) {
    return null
  }
  return { year, month, day, hour, minute, gender }
}

function Home() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const input = toInput(search)

  function handleSubmit(values: BirthFormValues) {
    navigate({
      search: {
        year: values.year,
        month: values.month,
        day: values.day,
        hour: values.hour,
        minute: values.minute,
        gender: values.gender === '' ? undefined : values.gender,
      },
    })
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-8 p-6">
      <header>
        <h1 className="text-2xl font-bold">사주팔자</h1>
        <p className="mt-1 text-sm text-gray-500">
          생년월일시를 입력하면 사주 네 기둥과 오행을 보여줍니다.
        </p>
      </header>

      <BirthInputForm defaultValues={search} onSubmit={handleSubmit} />

      {input && <SajuResult input={input} />}
    </main>
  )
}
