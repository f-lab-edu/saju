---
name: pr
description: 현재 브랜치의 커밋과 diff를 분석해 한국어 PR 제목·본문을 작성하고, GitHub MCP로 Pull Request를 생성한다. 사용자가 "PR 만들어줘"라고 요청하거나 /pr을 실행할 때 사용한다.
---

# pr

현재 브랜치의 변경을 분석해 PR 제목과 본문(한국어)을 작성하고,
GitHub MCP 서버를 통해 Pull Request를 생성한다.

## 워크플로우

### 1. 컨텍스트 파악
- 현재 브랜치: `git branch --show-current`
- 베이스 브랜치 결정: 원격 기본 브랜치를 확인한다.
  `git remote show origin` 또는 `git symbolic-ref refs/remotes/origin/HEAD`.
  보통 `main`. 애매하면 사용자에게 물어본다.
- 이 브랜치의 커밋: `git log <base>..HEAD --oneline`
- 전체 변경: `git diff <base>...HEAD` — **실제로 읽고** 무엇을/왜 바꿨는지 파악.
- 원격에 브랜치가 없으면 먼저 푸시한다: `git push -u origin <branch>`.
  (PR 생성에는 원격 브랜치가 필요하다.)
- owner/repo 확인: `git remote get-url origin`에서 파싱.

### 2. 제목 작성
- Conventional Commits 스타일: `<type>(<scope>): <요약>`.
- 요약은 **한국어**로 간결하게, 72자 이내, 마침표 없음.
- 커밋이 하나면 그 커밋 제목을 활용, 여러 개면 전체를 아우르는 제목.

### 3. 본문 작성 (한국어)
- **요약(Summary)은 항상 넣는다**: 이 PR이 무엇을·왜 하는지 한두 문단.
- 그다음은 **diff를 읽고 필요한 섹션만 판단해서 추가**한다.
  변경 성격에 맞는 것만 넣고, 해당 없으면 생략한다:
  - `## 변경사항` — 주요 변경이 여러 개일 때 불릿(`-`)으로 정리.
  - `## 테스트 방법` — 로직/동작이 바뀌었을 때. 어떻게 검증했는지,
    리뷰어가 확인할 방법.
  - `## 관련 이슈` — 커밋 메시지나 브랜치 이름에 이슈 번호가 있으면
    `Closes #42`, `Refs #17` 형태로.
  - `## 스크린샷` — UI 변경이면 자리표시자와 함께("스크린샷 첨부 필요").
  - `## Breaking Change` — 호환성 깨지는 변경이 있으면 반드시. 무엇이
    깨지고 어떻게 마이그레이션하는지.
- 억지로 섹션을 채우지 않는다. 자명한 작은 PR은 요약만으로 충분하다.
- "이 PR은 ~한다", "나는/우리는" 같은 군더더기 표현은 쓰지 않는다.

### 4. PR 생성 (GitHub MCP)
- GitHub MCP 서버(`https://api.githubcopilot.com/mcp/`)의 `create_pull_request`
  도구를 사용한다. 스키마가 로드 안 돼 있으면 ToolSearch로 먼저 불러온다:
  `select:` 로 `create_pull_request`(및 필요 시 `get_pull_request`,
  `list_commits`)를 로드.
- 인자: `owner`, `repo`, `base`, `head`(현재 브랜치), `title`, `body`.
  드래프트로 만들라고 하면 `draft: true`.
- 생성 후 반환된 **PR 번호와 URL**을 사용자에게 알려준다.
- GitHub MCP 서버가 연결/인증 안 돼 있으면: PR을 만들지 말고, 제목과
  본문을 코드블록으로 출력해 사용자가 직접 붙여넣게 한다. 그리고 서버
  연결이 필요하다고 알린다.

## 규칙
- 베이스 브랜치가 확실치 않으면 임의로 정하지 말고 확인한다.
- main/master로 force push 하지 않는다. `--force`, hard reset 등 파괴적
  명령은 명시적 요청 없이 쓰지 않는다.
- 요청받지 않으면 AI 표기("Generated with...")를 본문에 넣지 않는다.
  프로젝트 규칙이 요구하면 그때만 푸터로.
- 이미 같은 브랜치로 열린 PR이 있으면, 새로 만들지 말고 알려준다.

## 모드
- 기본은 간결. "자세히" 또는 "verbose"라고 하면 본문 맥락을 더 풍부하게.
- "PR 만들지 말고 본문만"이라고 하면 4단계를 건너뛰고 제목·본문만 출력.

## 예시 본문

```
## 요약
모바일 콜드런치 화면의 LTE 대역폭을 줄이기 위해, 전체 user 페이로드
없이 프로필만 반환하는 경량 엔드포인트를 추가한다.

## 변경사항
- `GET /users/:id/profile` 엔드포인트 추가
- 프로필 전용 직렬화 로직 분리
- 관련 라우트 테스트 추가

## 테스트 방법
- `npm test -- profile` 통과 확인
- 로컬에서 `/users/1/profile` 호출 시 프로필 필드만 반환되는지 확인

## 관련 이슈
Closes #128
```