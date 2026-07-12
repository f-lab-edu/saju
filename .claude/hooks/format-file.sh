#!/bin/bash
# PostToolUse hook: Claude가 Edit/Write로 수정한 파일을 prettier로 자동 포맷하고,
# apps/web 소스 파일이면 eslint --fix까지 실행. --fix로 못 고치는 lint 오류는
# stderr + exit 2로 Claude에게 피드백된다 (도구 실행 자체는 이미 끝났으므로 차단 아님).
# stdin으로 hook 입력 JSON이 들어온다. (tool_input.file_path에 대상 파일 경로)

file_path=$(node -e "
let d = '';
process.stdin.on('data', c => (d += c)).on('end', () => {
  try { console.log(JSON.parse(d).tool_input.file_path ?? ''); } catch {}
});
")

[ -z "$file_path" ] && exit 0

case "$file_path" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.json|*.css|*.md)
    cd "$CLAUDE_PROJECT_DIR" && pnpm exec prettier --write "$file_path" >/dev/null 2>&1
    ;;
esac

case "$file_path" in
  */apps/web/*.ts|*/apps/web/*.tsx|*/apps/web/*.js|*/apps/web/*.jsx)
    lint_out=$(cd "$CLAUDE_PROJECT_DIR/apps/web" && pnpm exec eslint --fix "$file_path" 2>&1)
    if [ $? -ne 0 ]; then
      echo "[format-file hook] ESLint 오류 (자동수정 불가):" >&2
      echo "$lint_out" >&2
      exit 2
    fi
    ;;
esac

exit 0
