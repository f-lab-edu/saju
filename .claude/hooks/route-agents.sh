#!/bin/bash
# UserPromptSubmit hook: 사용자 프롬프트의 키워드를 보고 적절한 서브에이전트 위임을 제안한다.
# stdout 출력(exit 0)은 Claude의 컨텍스트에 추가된다 — 강제가 아니라 힌트.
# 프롬프트에 --no-route가 있으면 건너뛴다.

prompt=$(node -e "
let d = '';
process.stdin.on('data', c => (d += c)).on('end', () => {
  try { console.log((JSON.parse(d).prompt ?? '').toLowerCase()); } catch {}
});
")

[ -z "$prompt" ] && exit 0

case "$prompt" in
  /*) exit 0 ;;               # 슬래시 커맨드는 사용자가 이미 선택함
  *--no-route*) exit 0 ;;     # opt-out
esac

hint=""
case "$prompt" in
  *버그*|*에러*|*디버깅*|*크래시*|*"안 돼"*|*안돼*|*안됨*|*"왜 안"*|*실패*|*error*|*bug*|*debug*|*crash*|*exception*)
    hint="버그/에러 관련 요청으로 보입니다. 원인 진단은 debugger 서브에이전트(진단 전용, 수정 금지)에 위임하는 것을 고려하세요."
    ;;
  *리뷰*|*review*|*"코드 봐"*)
    hint="코드 리뷰 요청으로 보입니다. apps/web 변경이면 frontend-reviewer 서브에이전트에 위임하는 것을 고려하세요."
    ;;
  *만세력*|*간지*|*천간*|*지지*|*입춘*|*절기*|*오행*|*팔자*|*자시*)
    hint="사주 도메인 규칙 관련 요청으로 보입니다. 규칙의 정확성 검증은 saju-master 서브에이전트에 위임하는 것을 고려하세요."
    ;;
esac

if [ -n "$hint" ]; then
  echo "[route-agents] $hint"
fi

exit 0
