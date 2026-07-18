// 오행 생극(生剋) 관계와 일간 기준 오성 매핑. 순수 상수·함수.
import type { Ohaeng, OSeong } from './types'

/** 생(生): 이 오행이 생하는 오행 (목생화 …) */
export const SAENG: Record<Ohaeng, Ohaeng> = {
  목: '화',
  화: '토',
  토: '금',
  금: '수',
  수: '목',
}

/** 극(剋): 이 오행이 극하는 오행 (목극토 …) */
export const GEUK: Record<Ohaeng, Ohaeng> = {
  목: '토',
  토: '수',
  수: '화',
  화: '금',
  금: '목',
}

/**
 * 일간 오행 D 기준으로 오행 o가 어떤 오성인가.
 * 비겁=같음, 식상=내가 생, 재성=내가 극, 관성=나를 극, 인성=나를 생.
 */
export function ohaengToOSeong(dayOhaeng: Ohaeng, o: Ohaeng): OSeong {
  if (o === dayOhaeng) return '비겁'
  if (SAENG[dayOhaeng] === o) return '식상'
  if (GEUK[dayOhaeng] === o) return '재성'
  if (GEUK[o] === dayOhaeng) return '관성'
  return '인성' // SAENG[o] === dayOhaeng
}

/** 일간 오행 D 기준으로 각 오성이 어떤 오행인지 */
export function oSeongToOhaeng(dayOhaeng: Ohaeng): Record<OSeong, Ohaeng> {
  const D = dayOhaeng
  // 관성 = 나를 극하는 오행, 인성 = 나를 생하는 오행 (SAENG/GEUK의 역)
  const gwanSeong = (Object.keys(GEUK) as Ohaeng[]).find(
    (o) => GEUK[o] === D,
  ) as Ohaeng
  const inSeong = (Object.keys(SAENG) as Ohaeng[]).find(
    (o) => SAENG[o] === D,
  ) as Ohaeng
  return {
    비겁: D,
    식상: SAENG[D],
    재성: GEUK[D],
    관성: gwanSeong,
    인성: inSeong,
  }
}
