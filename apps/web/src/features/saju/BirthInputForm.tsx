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
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        type="number"
        inputMode="numeric"
        placeholder={placeholder}
        disabled={disabled}
        className="rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
        {...register(name, {
          required: disabled ? false : `${label}을(를) 입력하세요`,
          valueAsNumber: true,
          min: { value: min, message: `${min} 이상이어야 합니다` },
          max: { value: max, message: `${max} 이하여야 합니다` },
        })}
      />
      {errors[name] && (
        <p role="alert" className="text-xs text-red-600">
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
    defaultValues: {
      hour: 12,
      minute: 0,
      gender: '',
      ziPolicy: 'sameDay',
      longitude: REGIONS[0].longitude,
      ...defaultValues,
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
      className="flex flex-col gap-4"
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
          <label htmlFor="gender" className="text-sm font-medium text-gray-700">
            성별
          </label>
          <select
            id="gender"
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none"
            {...register('gender')}
          >
            <option value="">선택 안 함</option>
            <option value="male">남</option>
            <option value="female">여</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={timeUnknown}
          onChange={(e) => setTimeUnknown(e.target.checked)}
        />
        시간 모름 (년·월·일주만 계산)
      </label>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="ziPolicy"
            className="text-sm font-medium text-gray-700"
          >
            자시 정책
          </label>
          <select
            id="ziPolicy"
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none"
            {...register('ziPolicy')}
          >
            <option value="sameDay">23~24시는 당일 (기본)</option>
            <option value="nextDay">23~24시는 다음날 (야자시설)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="longitude"
            className="text-sm font-medium text-gray-700"
          >
            출생 지역
          </label>
          <select
            id="longitude"
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none"
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
        className="rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white hover:bg-gray-700"
      >
        사주 보기
      </button>
    </form>
  )
}
