#!/bin/bash
# PostToolUse hook: apps/web은 React Compiler가 켜져 있으므로
# 수동 메모이제이션(useMemo/useCallback/React.memo)이 새로 들어오면 Claude에게 경고한다.
# exit 2 → stderr 내용이 Claude에게 피드백으로 전달된다 (툴 실행 자체는 이미 완료된 상태).

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

matches=$(grep -nE 'useMemo\(|useCallback\(|React\.memo\(|[^a-zA-Z]memo\(' "$file_path" | head -5)

if [ -n "$matches" ]; then
  echo "[check-manual-memo] apps/web은 React Compiler가 활성화되어 있어 수동 메모이제이션이 불필요합니다. 아래 사용처를 확인하고, 컴파일러가 처리할 수 있다면 제거하세요 (외부 라이브러리 요구 등 정당한 사유가 있으면 유지하고 주석으로 이유를 남기세요):" >&2
  echo "$matches" >&2
  exit 2
fi

exit 0
