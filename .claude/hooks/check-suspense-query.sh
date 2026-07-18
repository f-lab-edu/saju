#!/bin/bash
# PostToolUse hook: apps/web에서는 useSuspenseQuery + AsyncBoundary가 기본 패턴이므로
# useQuery가 새로 들어오면 Claude에게 경고한다. (useSuspenseQuery는 매칭되지 않음)
# exit 2 → stderr 내용이 Claude에게 피드백으로 전달된다.

file_path=$(node -e "
let d = '';
process.stdin.on('data', c => (d += c)).on('end', () => {
  try { console.log(JSON.parse(d).tool_input.file_path ?? ''); } catch {}
});
")

case "$file_path" in
  */apps/web/src/*.tsx|*/apps/web/src/*.ts) ;;
  *) exit 0 ;;
esac

[ -f "$file_path" ] || exit 0

matches=$(grep -nE '(^|[^[:alnum:]_])useQuery\(' "$file_path" | head -5)

if [ -n "$matches" ]; then
  echo "[check-suspense-query] apps/web의 데이터 조회 기본 패턴은 useSuspenseQuery + AsyncBoundary입니다 (apps/web/CLAUDE.md 참조). 아래 useQuery 사용처를 확인하세요. 폴링·조건부 조회(enabled)처럼 정당한 예외라면 유지하되 이유를 주석으로 남기세요:" >&2
  echo "$matches" >&2
  exit 2
fi

exit 0
