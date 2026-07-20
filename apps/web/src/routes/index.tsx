import type { Gender, SajuInput, SajuOptions, ZiPolicy } from '@saju/core'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import type { BirthFormValues } from '#/features/saju/BirthInputForm'
import { BirthInputForm } from '#/features/saju/BirthInputForm'
import { SajuResult } from '#/features/saju/SajuResult'

// 공유 가능한 화면 상태(생년월일시 + 옵션)는 URL search params에 담는다.
interface SajuSearch {
  year?: number
  month?: number
  day?: number
  hour?: number
  minute?: number
  gender?: Gender
  zi?: ZiPolicy
  lon?: number
  noTime?: boolean
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
  const zi =
    search.zi === 'sameDay' || search.zi === 'nextDay' ? search.zi : undefined
  return {
    year: toNumber(search.year),
    month: toNumber(search.month),
    day: toNumber(search.day),
    hour: toNumber(search.hour),
    minute: toNumber(search.minute),
    gender,
    zi,
    lon: toNumber(search.lon),
    noTime:
      search.noTime === true || search.noTime === 'true' ? true : undefined,
  }
}

export const Route = createFileRoute('/')({
  component: Home,
  validateSearch,
})

// search로부터 계산에 필요한 입력과 옵션을 만든다. 필수값이 없으면 null.
function toRequest(
  search: SajuSearch,
): { input: SajuInput; options: SajuOptions } | null {
  const { year, month, day, hour, minute, gender, zi, lon, noTime } = search
  if (year === undefined || month === undefined || day === undefined) {
    return null
  }
  const timeUnknown = noTime ?? false
  if (!timeUnknown && (hour === undefined || minute === undefined)) {
    return null
  }
  return {
    input: {
      year,
      month,
      day,
      hour: hour ?? 0,
      minute: minute ?? 0,
      gender,
    },
    options: {
      ziPolicy: zi,
      longitude: lon,
      timeUnknown,
    },
  }
}

function Home() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const request = toRequest(search)

  function handleSubmit(values: BirthFormValues) {
    navigate({
      search: {
        year: values.year,
        month: values.month,
        day: values.day,
        hour: values.timeUnknown ? undefined : values.hour,
        minute: values.timeUnknown ? undefined : values.minute,
        gender: values.gender === '' ? undefined : values.gender,
        zi: values.ziPolicy,
        lon: values.longitude === '' ? undefined : values.longitude,
        noTime: values.timeUnknown ? true : undefined,
      },
    })
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="border-b border-line pb-5">
        <p className="text-xs tracking-[0.3em] text-ink-faint uppercase">
          萬歲曆
        </p>
        <h1 className="mt-1 font-myeongjo text-4xl font-extrabold tracking-tight">
          사주팔자
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          생년월일시로 사주 네 기둥과 오행, 신강신약과 용신까지 풀어 봅니다.
        </p>
      </header>

      <BirthInputForm
        defaultValues={{
          year: search.year,
          month: search.month,
          day: search.day,
          hour: search.hour,
          minute: search.minute,
          gender: search.gender,
          ziPolicy: search.zi,
          longitude: search.lon ?? '',
          timeUnknown: search.noTime,
        }}
        onSubmit={handleSubmit}
      />

      {request && (
        <SajuResult input={request.input} options={request.options} />
      )}
    </main>
  )
}
