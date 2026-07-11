#!/bin/bash
# PostToolUse hook: Claude가 Edit/Write로 수정한 파일을 prettier로 자동 포맷.
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

exit 0
