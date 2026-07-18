import type { Ohaeng } from '@saju/core'

// 오행별 색상. 전통 오행색(목=청, 화=적, 토=황, 금=백, 수=흑)을 웹 가독성에 맞게 옮겼다.
const OHAENG_STYLE: Record<Ohaeng, string> = {
  목: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  화: 'bg-red-100 text-red-900 border-red-300',
  토: 'bg-amber-100 text-amber-900 border-amber-300',
  금: 'bg-stone-100 text-stone-800 border-stone-300',
  수: 'bg-sky-100 text-sky-900 border-sky-300',
}

const OHAENG_HANJA: Record<Ohaeng, string> = {
  목: '木',
  화: '火',
  토: '土',
  금: '金',
  수: '水',
}

// 막대 그래프용 진한 채움색
const OHAENG_BAR: Record<Ohaeng, string> = {
  목: 'bg-emerald-500',
  화: 'bg-red-500',
  토: 'bg-amber-500',
  금: 'bg-stone-400',
  수: 'bg-sky-500',
}

export function ohaengStyle(ohaeng: Ohaeng): string {
  return OHAENG_STYLE[ohaeng]
}

export function ohaengBar(ohaeng: Ohaeng): string {
  return OHAENG_BAR[ohaeng]
}

export function ohaengHanja(ohaeng: Ohaeng): string {
  return OHAENG_HANJA[ohaeng]
}
