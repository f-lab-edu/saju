# @saju/core

사주팔자(四柱八字) 계산 코어. 순수 TypeScript, UI 의존성 없음. 웹/모바일이 공유한다.

## 사용법

```ts
import { computeSaju, computeWolUn } from '@saju/core'

const result = computeSaju({
  year: 1990,
  month: 5,
  day: 15,
  hour: 14,
  minute: 30,
  gender: 'male', // 대운 계산에 필요(없으면 daeUn은 undefined)
})
// 각 기둥(year/month/day/hour): { gan, zhi, ganOhaeng, zhiOhaeng,
//   ganSipSeong, zhiSipSeong, jiJangGan[], unSeong, naEum }
// result.gongMang: 공망 두 지지
// result.daeUn: 대운[] (각 대운에 연운[] 중첩)

// 월운은 필요할 때 따로 계산(성별 필요)
const wol = computeWolUn(result.input, 1997) // 1997년 12개월 간지
```

## 산출 항목

기둥별로 다음을 제공한다(엔진 lunar-typescript가 계산):

- 천간/지지와 각 오행
- 십성(十星): 천간 십성(`ganSipSeong`, 일간은 '일원'), 지지 정기 십성(`zhiSipSeong`)
- 지장간(`jiJangGan`): 각 지장간의 천간·오행·십성(정기 우선)
- 12운성(`unSeong`), 납음오행(`naEum`)

사주 전체:

- 공망(`gongMang`)
- 대운(`daeUn`, 성별 필요)과 각 대운의 연운, 그리고 `computeWolUn`으로 월운

아직 없는 것(후속 마일스톤): 오행/십성 분포 통계, 신강신약·용신, 합충형파해, 한국식 신살·길성, 조후.

## 계산 규칙

- 년주(年柱) 경계는 입춘(立春). 양력 1월 1일이나 음력 설이 아니다.
- 월주(月柱) 경계는 12절기(節氣).
- 절기 시각은 근사 공식이 아니라 천문 계산 기반 엔진(lunar-typescript, 6tail)에서 가져온다.

## 옵션

`computeSaju(input, options)`의 `options`:

- `ziPolicy`: 자시(子時, 23:00~00:59) 처리 정책. 기본 `'sameDay'`.
  - `'sameDay'`: 야자시(23:00~24:00) 출생의 일주를 당일로 본다. 주류 유파.
  - `'nextDay'`: 야자시 출생의 일주를 다음 날로 본다.
  - 두 정책은 23:00~24:00 출생의 일주가 갈린다.
- `longitudeCorrectionMinutes`: 태양시 경도 보정(분). 기본 `-30`(한국 관례). `0`이면 보정 안 함.

## 구조

엔진 의존을 어댑터 계층에 격리한다. 나중에 6tail을 자체 절기 테이블이나 KASI 데이터로 교체해도 도메인 코드는 그대로 둔다.

- `engine.ts`: lunar-typescript를 감싸는 유일한 파일. 밖에서는 이 라이브러리를 직접 import하지 않는다.
- `pillars.ts`, `ohaeng.ts`, `tables.ts`, `day-jdn.ts`: 엔진 무관 순수 도메인.
- `compute.ts`: 검증 → 태양시 보정 → 엔진 → 도메인 변환 오케스트레이션.

## 알려진 한계

- 절기 시각 기준: 6tail 엔진은 절기를 동경 120도(중국 표준) 기준으로 산출한다. 절기 순간 전후 수십 분 출생은 국내 만세력(KASI 발표 시각)과 미세하게 어긋날 수 있다. KASI 대조는 후속 과제.
- 서머타임/표준시 이력 미지원: 한국의 과거 UTC+8:30 구간(1908~~1911, 1954~~1961)과 서머타임 시행 시기는 보정하지 않는다. 현대(1961년 이후 KST UTC+9 고정) 구간을 전제로 한다.
- 입력은 양력만 받는다. 음력 입력은 후속 마일스톤.

## 검증

```sh
pnpm --filter @saju/core test       # vitest (경계 케이스 + 일주 오라클 교차검증)
pnpm --filter @saju/core typecheck  # tsgo
```

일주는 JDN(율리우스 적일) 기반 독립 구현(`day-jdn.ts`)을 오라클로 두고 엔진 결과와 교차검증한다.
