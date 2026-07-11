#!/bin/bash
# PreToolUse hook: .env 파일에 대한 Read/Edit/Write를 차단.
# permissionDecision: "deny"를 JSON으로 출력하면 해당 툴 호출이 거부된다.

file_path=$(node -e "
let d = '';
process.stdin.on('data', c => (d += c)).on('end', () => {
  try { console.log(JSON.parse(d).tool_input.file_path ?? ''); } catch {}
});
")

if [[ "$(basename "$file_path")" == .env* ]]; then
  cat <<'EOF'
{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":".env 파일 접근은 hook으로 차단되어 있습니다. 시크릿은 사용자가 직접 관리합니다."}}
EOF
fi

exit 0
