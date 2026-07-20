import type { Gender, ZiPolicy } from '@saju/core'
import { useState } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { REGIONS } from './regions'

export interface BirthFormValues {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  gender: Gender | ''
  ziPolicy: ZiPolicy
  /** 경도(도). '' = 기본(-30분) */
  longitude: number | ''
  timeUnknown: boolean
}

interface BirthInputFormProps {
  defaultValues: Partial<BirthFormValues>
  onSubmit: (values: BirthFormValues) => void
}

const FIELD_LABEL = 'text-sm font-medium text-ink-soft'
const FIELD_CLASS =
  'rounded-lg border border-line bg-hanji px-3 py-2 text-ink focus:border-ink focus:outline-none disabled:bg-line/25 disabled:text-ink-faint'

type NumberFieldName = 'year' | 'month' | 'day' | 'hour' | 'minute'

interface NumberFieldProps {
  label: string
  name: NumberFieldName
  min: number
  max: number
  placeholder?: string
  disabled?: boolean
  register: UseFormRegister<BirthFormValues>
  errors: FieldErrors<BirthFormValues>
}

function NumberField({
  label,
  name,
  min,
  max,
  placeholder,
  disabled,
  register,
  errors,
}: NumberFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className={FIELD_LABEL}>
        {label}
      </label>
      <input
        id={name}
        type="number"
        inputMode="numeric"
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        className={FIELD_CLASS}
        {...register(name, {
          required: disabled ? false : `${label}을(를) 입력하세요`,
          valueAsNumber: true,
          min: { value: min, message: `${min} 이상이어야 합니다` },
          max: { value: max, message: `${max} 이하여야 합니다` },
        })}
      />
      {errors[name] && (
        <p id={`${name}-error`} role="alert" className="text-xs text-hwa">
          {errors[name]?.message}
        </p>
      )}
    </div>
  )
}

export function BirthInputForm({
  defaultValues,
  onSubmit,
}: BirthInputFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BirthFormValues>({
    // 필드별 nullish 병합. defaultValues를 통째로 스프레드하면 undefined 값이
    // 폴백(hour:12 등)을 덮어써서 신규 진입 시 빈칸이 된다.
    defaultValues: {
      year: defaultValues.year,
      month: defaultValues.month,
      day: defaultValues.day,
      hour: defaultValues.hour ?? 12,
      minute: defaultValues.minute ?? 0,
      gender: defaultValues.gender ?? '',
      ziPolicy: defaultValues.ziPolicy ?? 'sameDay',
      longitude: defaultValues.longitude ?? '',
    },
  })

  // '시간 모름'은 시/분 입력 비활성화에 즉시 반응해야 해서 로컬 상태로 둔다
  // (react-hook-form의 watch는 React Compiler와 호환되지 않아 회피).
  const [timeUnknown, setTimeUnknown] = useState(
    defaultValues.timeUnknown ?? false,
  )

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit({ ...values, timeUnknown }))}
      className="flex flex-col gap-4 rounded-xl border border-line bg-hanji-raised p-4 sm:p-5"
      noValidate
    >
      <div className="grid grid-cols-3 gap-3">
        <NumberField
          label="년"
          name="year"
          min={1900}
          max={2100}
          placeholder="1990"
          register={register}
          errors={errors}
        />
        <NumberField
          label="월"
          name="month"
          min={1}
          max={12}
          placeholder="1"
          register={register}
          errors={errors}
        />
        <NumberField
          label="일"
          name="day"
          min={1}
          max={31}
          placeholder="1"
          register={register}
          errors={errors}
        />
        <NumberField
          label="시"
          name="hour"
          min={0}
          max={23}
          disabled={timeUnknown}
          register={register}
          errors={errors}
        />
        <NumberField
          label="분"
          name="minute"
          min={0}
          max={59}
          disabled={timeUnknown}
          register={register}
          errors={errors}
        />
        <div className="flex flex-col gap-1">
          <label htmlFor="gender" className={FIELD_LABEL}>
            성별
          </label>
          <select id="gender" className={FIELD_CLASS} {...register('gender')}>
            <option value="">선택 안 함</option>
            <option value="male">남</option>
            <option value="female">여</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-soft">
        <input
          type="checkbox"
          className="accent-ink"
          checked={timeUnknown}
          onChange={(e) => setTimeUnknown(e.target.checked)}
        />
        시간 모름 (년·월·일주만 계산)
      </label>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="ziPolicy" className={FIELD_LABEL}>
            자시 정책
          </label>
          <select
            id="ziPolicy"
            className={FIELD_CLASS}
            {...register('ziPolicy')}
          >
            <option value="sameDay">23~24시는 당일 (기본)</option>
            <option value="nextDay">23~24시는 다음날 (야자시설)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="longitude" className={FIELD_LABEL}>
            출생 지역
          </label>
          <select
            id="longitude"
            className={FIELD_CLASS}
            {...register('longitude', {
              setValueAs: (v) => (v === '' ? '' : Number(v)),
            })}
          >
            <option value="">기본 (-30분)</option>
            {REGIONS.map((r) => (
              <option key={r.name} value={r.longitude}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-ink px-4 py-2.5 font-medium text-hanji transition-colors hover:bg-ink/85 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-hanji-raised"
      >
        사주 보기
      </button>
    </form>
  )
}
