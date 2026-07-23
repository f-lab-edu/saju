import type { Gender, ZiPolicy } from '@saju/core'
import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { SelectedPlace } from './PlaceSearchField'
import { PlaceSearchField } from './PlaceSearchField'

export interface BirthFormValues {
  /** 명식 구분용 표시 이름. 계산에는 쓰이지 않는다. */
  name: string
  year: number
  month: number
  day: number
  hour: number
  minute: number
  gender: Gender | ''
  ziPolicy: ZiPolicy
  /** 경도(도). '' = 기본(-30분) */
  longitude: number | ''
  /** 선택한 출생 지역 표시 이름 */
  place: string
  timeUnknown: boolean
}

/** react-hook-form이 다루는 내부 필드. 제출 시 BirthFormValues로 변환한다. */
interface RawFields {
  name: string
  date: string
  time: string
}

interface BirthInputFormProps {
  defaultValues: Partial<BirthFormValues>
  onSubmit: (values: BirthFormValues) => void
}

const SECTION_LABEL = 'text-sm font-bold text-ink'
const FIELD_CLASS =
  'rounded-lg border border-line bg-hanji px-3 py-2 text-ink focus:border-ink focus:outline-none disabled:bg-line/25 disabled:text-ink-faint'
const LINK_BUTTON =
  'text-xs text-ink-soft underline underline-offset-2 hover:text-ink'

// 12간지 시간대. 태양시 보정 후 시각 기준.
const ZI_HOURS = [
  { ji: '자 子', range: '23시 ~ 01시' },
  { ji: '축 丑', range: '01시 ~ 03시' },
  { ji: '인 寅', range: '03시 ~ 05시' },
  { ji: '묘 卯', range: '05시 ~ 07시' },
  { ji: '진 辰', range: '07시 ~ 09시' },
  { ji: '사 巳', range: '09시 ~ 11시' },
  { ji: '오 午', range: '11시 ~ 13시' },
  { ji: '미 未', range: '13시 ~ 15시' },
  { ji: '신 申', range: '15시 ~ 17시' },
  { ji: '유 酉', range: '17시 ~ 19시' },
  { ji: '술 戌', range: '19시 ~ 21시' },
  { ji: '해 亥', range: '21시 ~ 23시' },
]

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

export function BirthInputForm({
  defaultValues,
  onSubmit,
}: BirthInputFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RawFields>({
    defaultValues: {
      name: defaultValues.name ?? '',
      date:
        defaultValues.year !== undefined &&
        defaultValues.month !== undefined &&
        defaultValues.day !== undefined
          ? `${defaultValues.year}-${pad2(defaultValues.month)}-${pad2(defaultValues.day)}`
          : '',
      time: `${pad2(defaultValues.hour ?? 12)}:${pad2(defaultValues.minute ?? 0)}`,
    },
  })

  // 아래 값들은 register로 다룰 수 없는 커스텀 위젯이라 로컬 상태로 들고 제출 시 합친다.
  // '시간 모름'은 시간 입력 비활성화에 즉시 반응해야 하는데 react-hook-form의
  // watch가 React Compiler와 호환되지 않는 사정도 있다.
  const [gender, setGender] = useState<Gender>(
    defaultValues.gender === 'male' ? 'male' : 'female',
  )
  const [timeUnknown, setTimeUnknown] = useState(
    defaultValues.timeUnknown ?? false,
  )
  // 자시 정책: 기본은 야자시(23~24시) 일주를 당일로 보는 주류 유파(sameDay).
  // 체크하면 다음날로 계산(nextDay).
  const [nextDayZi, setNextDayZi] = useState(
    defaultValues.ziPolicy === 'nextDay',
  )
  const [place, setPlace] = useState<SelectedPlace | null>(
    defaultValues.longitude === '' || defaultValues.longitude === undefined
      ? null
      : {
          name: defaultValues.place || '선택한 지역',
          longitude: defaultValues.longitude,
        },
  )
  const [info, setInfo] = useState<'hours' | 'zi' | null>(null)

  // 시간을 모르면 야자시(23~24시) 해당 여부도 알 수 없으므로 서로 배타적으로 둔다.
  function handleTimeUnknown(checked: boolean) {
    setTimeUnknown(checked)
    if (checked) setNextDayZi(false)
  }
  function handleNextDayZi(checked: boolean) {
    setNextDayZi(checked)
    if (checked) setTimeUnknown(false)
  }

  return (
    <form
      onSubmit={handleSubmit((raw) => {
        const [year, month, day] = raw.date.split('-').map(Number)
        const [hour, minute] = timeUnknown
          ? [12, 0]
          : raw.time.split(':').map(Number)
        onSubmit({
          name: raw.name,
          year,
          month,
          day,
          hour,
          minute,
          gender,
          ziPolicy: nextDayZi ? 'nextDay' : 'sameDay',
          longitude: place?.longitude ?? '',
          place: place?.name ?? '',
          timeUnknown,
        })
      })}
      className="flex flex-col gap-5 rounded-xl border border-line bg-hanji-raised p-4 sm:p-5"
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className={SECTION_LABEL}>
          이름
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="최대 12글자 이내로 입력하세요"
          className={FIELD_CLASS}
          {...register('name', {
            maxLength: { value: 12, message: '12자 이하로 입력하세요' },
          })}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" role="alert" className="text-xs text-hwa">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={SECTION_LABEL}>성별</span>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ['female', '여자'],
              ['male', '남자'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={gender === value}
              onClick={() => setGender(value)}
              className={
                gender === value
                  ? 'rounded-lg border-2 border-ink bg-hanji py-2 font-bold text-ink'
                  : 'rounded-lg border-2 border-line/70 bg-hanji py-2 text-ink-faint transition-colors hover:border-line hover:text-ink-soft'
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className={SECTION_LABEL}>생년월일시</span>
          <button
            type="button"
            onClick={() => setInfo('hours')}
            className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
          >
            12간지 시간표
            <InfoMark />
          </button>
        </div>

        <div className="flex gap-2">
          <select
            aria-label="달력 종류"
            defaultValue="solar"
            className={`${FIELD_CLASS} shrink-0`}
          >
            <option value="solar">양력</option>
            <option value="lunar" disabled>
              음력 (준비 중)
            </option>
          </select>
          <input
            type="date"
            aria-label="생년월일"
            min="1900-01-01"
            max="2100-12-31"
            className={`${FIELD_CLASS} min-w-0 flex-[1.4] text-center`}
            {...register('date', {
              required: '생년월일을 입력하세요',
              validate: (value) => {
                const year = Number(value.slice(0, 4))
                return (
                  (year >= 1900 && year <= 2100) ||
                  '1900~2100년 사이여야 합니다'
                )
              },
            })}
            aria-invalid={errors.date ? true : undefined}
            aria-describedby={errors.date ? 'date-error' : undefined}
          />
          <input
            type="time"
            aria-label="태어난 시간"
            disabled={timeUnknown}
            className={`${FIELD_CLASS} min-w-0 flex-1 text-center`}
            {...register('time', {
              required: timeUnknown ? false : '시간을 입력하세요',
            })}
            aria-invalid={errors.time ? true : undefined}
            aria-describedby={errors.time ? 'time-error' : undefined}
          />
        </div>
        {errors.date && (
          <p id="date-error" role="alert" className="text-xs text-hwa">
            {errors.date.message}
          </p>
        )}
        {!timeUnknown && errors.time && (
          <p id="time-error" role="alert" className="text-xs text-hwa">
            {errors.time.message}
          </p>
        )}

        <div className="flex items-center gap-5 pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              className="accent-ink"
              checked={timeUnknown}
              onChange={(e) => handleTimeUnknown(e.target.checked)}
            />
            시간 모름
          </label>
          <div className="flex items-center gap-1.5">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                className="accent-ink"
                checked={nextDayZi}
                onChange={(e) => handleNextDayZi(e.target.checked)}
              />
              야자시/조자시
            </label>
            <button
              type="button"
              aria-label="야자시·조자시 설명"
              onClick={() => setInfo('zi')}
            >
              <InfoMark />
            </button>
          </div>
        </div>
      </div>

      <PlaceSearchField value={place} onChange={setPlace} />

      <button
        type="submit"
        className="rounded-lg bg-ink px-4 py-2.5 font-medium text-hanji transition-colors hover:bg-ink/85 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-hanji-raised"
      >
        사주 보기
      </button>

      {info === 'hours' && (
        <InfoDialog title="12간지 시간표" onClose={() => setInfo(null)}>
          <p className="text-xs text-ink-faint">
            태양시 보정을 거친 시각 기준입니다. 자시는 하루 경계에 걸쳐
            있습니다.
          </p>
          <ul className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-sm">
            {ZI_HOURS.map(({ ji, range }) => (
              <li key={ji} className="flex items-baseline justify-between">
                <span className="text-ink">{ji}</span>
                <span className="text-xs text-ink-soft">{range}</span>
              </li>
            ))}
          </ul>
        </InfoDialog>
      )}
      {info === 'zi' && (
        <InfoDialog title="야자시 · 조자시" onClose={() => setInfo(null)}>
          <div className="flex flex-col gap-2 text-sm text-ink-soft">
            <p>
              자시(23시~01시)는 하루 경계에 걸쳐 있어 23~24시를 야자시(夜子時),
              00~01시를 조자시(朝子時)로 나눕니다.
            </p>
            <p>
              기본은 야자시 출생의 일주를 당일로 계산하는 주류 방식입니다.
              체크하면 야자시 출생을 다음날 일주로 계산합니다.
            </p>
          </div>
        </InfoDialog>
      )}
    </form>
  )
}

function InfoMark() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-hanji"
    >
      i
    </span>
  )
}

interface InfoDialogProps {
  title: string
  onClose: () => void
  children: ReactNode
}

function InfoDialog({ title, onClose, children }: InfoDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  return (
    <dialog
      // 마운트 시점에 모달로 연다. 리렌더마다 ref 콜백이 다시 불려도 이미 열려
      // 있으면 showModal이 던지므로 open 상태를 확인한다.
      ref={(node) => {
        dialogRef.current = node
        if (node && !node.open) node.showModal()
      }}
      onClose={onClose}
      // 패널 밖(백드롭) 클릭은 dialog 요소 자신이 target으로 잡힌다.
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close()
      }}
      className="m-auto w-[min(92vw,22rem)] rounded-xl border border-line bg-hanji-raised p-0 backdrop:bg-ink/40"
    >
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-ink">{title}</h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className={LINK_BUTTON}
          >
            닫기
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
