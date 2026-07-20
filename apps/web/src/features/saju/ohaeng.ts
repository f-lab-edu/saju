import type { Ohaeng } from '@saju/core'

// 오방색(五方色) 오행 팔레트. Tailwind가 스캔할 수 있도록 클래스는 전부 리터럴로.

const OHAENG_HANJA: Record<Ohaeng, string> = {
  목: '木',
  화: '火',
  토: '土',
  금: '金',
  수: '水',
}

/** 오행 글자 색 */
const OHAENG_TEXT: Record<Ohaeng, string> = {
  목: 'text-mok',
  화: 'text-hwa',
  토: 'text-to',
  금: 'text-geum',
  수: 'text-su',
}

/** 옅은 배경 틴트 */
const OHAENG_TINT: Record<Ohaeng, string> = {
  목: 'bg-mok/8',
  화: 'bg-hwa/8',
  토: 'bg-to/8',
  금: 'bg-geum/8',
  수: 'bg-su/8',
}

/** 진한 채움(막대·점) */
const OHAENG_FILL: Record<Ohaeng, string> = {
  목: 'bg-mok',
  화: 'bg-hwa',
  토: 'bg-to',
  금: 'bg-geum',
  수: 'bg-su',
}

/** 테두리 */
const OHAENG_BORDER: Record<Ohaeng, string> = {
  목: 'border-mok/30',
  화: 'border-hwa/30',
  토: 'border-to/30',
  금: 'border-geum/30',
  수: 'border-su/30',
}

export function ohaengHanja(o: Ohaeng): string {
  return OHAENG_HANJA[o]
}
export function ohaengText(o: Ohaeng): string {
  return OHAENG_TEXT[o]
}
export function ohaengTint(o: Ohaeng): string {
  return OHAENG_TINT[o]
}
export function ohaengFill(o: Ohaeng): string {
  return OHAENG_FILL[o]
}
export function ohaengBorder(o: Ohaeng): string {
  return OHAENG_BORDER[o]
}
