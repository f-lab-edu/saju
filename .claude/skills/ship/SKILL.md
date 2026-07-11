---
name: ship
description: 변경사항을 검증 → 커밋 → (필요시 브랜치 생성) → 머지 또는 PR까지 처리하는 워크플로. "커밋해줘", "머지해줘", "PR/MR 만들어줘", "배포 준비" 요청 시 사용.
---

# /ship — 검증 → 커밋 → 머지/PR

단계를 건너뛰지 말 것. 특히 1단계(검증) 전에 커밋하지 않는다 — pre-commit-check hook이 어차피 차단한다.

## 1. 검증 (실패 시 여기서 중단)

변경 파일을 파악하고(`git status --porcelain`), 변경된 워크스페이스만 검사한다:

| 변경 위치 | 실행할 검사 |
|---|---|
| `apps/web/` | `pnpm --filter web exec tsc --noEmit` → `pnpm --filter web exec vitest run` |
| `apps/mobile/` | `cd apps/mobile && pnpm exec tsc --noEmit` |
| `packages/` | 해당 패키지의 tsc + 테스트 |
| 루트 설정만 | 검사 생략 가능 (`.claude/`, `*.md`, 설정 파일) |

실패하면 **커밋하지 말고** 오류를 사용자에게 보고한다. 수정 요청을 받으면 고친 뒤 1단계부터 다시.

## 2. 브랜치

- `git branch --show-current`로 현재 브랜치 확인.
- **main이면** 새 브랜치를 만든다: `git switch -c <type>/<간단한-설명>` (예: `feat/birth-form`, `fix/ipchun-boundary`)
  - type: feat / fix / refactor / chore / docs / test
- 이미 작업 브랜치면 그대로 진행.
- 예외: 저장소에 커밋이 하나도 없으면(초기 상태) main에 직접 커밋해도 된다.

## 3. 커밋

- 이번 작업과 관련된 파일만 스테이징한다. 무관한 변경이 섞여 있으면 커밋을 분리한다.
- Conventional Commits 형식: `<type>(<scope>): <제목>`
  - scope: `web` | `mobile` | `core` | `claude`(설정) | 생략 가능
  - 제목은 한국어로, 무엇을 왜 했는지가 드러나게.
- 예: `feat(web): 생년월일 입력 폼 추가`, `fix(core): 입춘 경계에서 년주 계산 오류 수정`

## 4. 머지 / PR

리모트 유무로 분기한다 (`git remote -v`):

**리모트 없음 (현재 상태)** — 로컬 머지:
```bash
git switch main
git merge --no-ff <작업브랜치> -m "merge: <작업브랜치>"
git branch -d <작업브랜치>
```

**리모트 있음** — push 후 PR:
```bash
git push -u origin <작업브랜치>
gh pr create --title "<커밋 제목과 동일>" --body "<요약 + 검증 결과>"
```
- PR 본문에는: 변경 요약, 1단계 검증 결과(통과한 검사 목록), 테스트 방법.
- GitLab 리모트면 `gh` 대신 `glab mr create`.

## 확인이 필요한 지점

- push와 PR 생성은 외부 공개 작업이다 — 사용자가 명시적으로 요청하지 않았다면 실행 전에 확인받는다.
- main으로의 로컬 머지는 이 워크플로 안에서는 확인 없이 진행해도 된다 (사용자가 /ship으로 의도를 밝힌 것).

## 완료 보고

커밋 해시, 브랜치, 머지/PR 링크, 실행한 검증 목록을 한 번에 보고한다.
