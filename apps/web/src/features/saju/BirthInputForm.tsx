import type { Gender } from '@saju/core'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { useForm } from 'react-hook-form'

export interface BirthFormValues {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  gender: Gender | ''
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
  register: UseFormRegister<BirthFormValues>
  errors: FieldErrors<BirthFormValues>
}

function NumberField({
  label,
  name,
  min,
  max,
  placeholder,
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
        className="rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none"
        {...register(name, {
          required: `${label}을(를) 입력하세요`,
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
      ...defaultValues,
    },
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
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
          register={register}
          errors={errors}
        />
        <NumberField
          label="분"
          name="minute"
          min={0}
          max={59}
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
      <button
        type="submit"
        className="rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white hover:bg-gray-700"
      >
        사주 보기
      </button>
    </form>
  )
}
