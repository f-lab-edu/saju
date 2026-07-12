#!/bin/bash
# PreToolUse(Bash) hook: git commit이 실행되기 전에 변경된 워크스페이스의
# 타입체크/테스트를 강제한다. 실패하면 커밋 자체를 deny로 차단한다.

command=$(node -e "
let d = '';
process.stdin.on('data', c => (d += c)).on('end', () => {
  try { console.log(JSON.parse(d).tool_input.command ?? ''); } catch {}
});
")

case "$command" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

cd "$CLAUDE_PROJECT_DIR" || exit 0

deny() {
  node -e "
const reason = process.argv[1];
console.log(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'PreToolUse',
    permissionDecision: 'deny',
    permissionDecisionReason: reason,
  },
}));
" "$1"
  exit 0
}

# 커밋 대상 파악: staged가 있으면 staged 기준, 없으면(git add와 한 명령으로 묶인 경우) 전체 변경 기준
# -uall: untracked 디렉토리를 개별 파일로 펼침 (없으면 "apps/"로 접혀서 경로 매칭이 안 됨)
changed=$(git diff --cached --name-only)
[ -z "$changed" ] && changed=$(git status --porcelain -uall | awk '{print $NF}')

log=$(mktemp)
trap 'rm -f "$log"' EXIT

if echo "$changed" | grep -q "^apps/web/"; then
  if ! pnpm --filter web exec tsc --noEmit >"$log" 2>&1; then
    deny "[pre-commit-check] 커밋 차단 — apps/web 타입체크 실패. 오류를 고친 뒤 다시 커밋하세요:
$(head -15 "$log")"
  fi
  if ! pnpm --filter web lint >"$log" 2>&1; then
    deny "[pre-commit-check] 커밋 차단 — apps/web lint 실패. 오류를 고친 뒤 다시 커밋하세요:
$(grep -vE "^>|^$" "$log" | head -15)"
  fi
  if ! pnpm --filter web exec vitest run >"$log" 2>&1; then
    deny "[pre-commit-check] 커밋 차단 — apps/web 테스트 실패. 실패한 테스트를 고친 뒤 다시 커밋하세요:
$(grep -E "FAIL|✕|Tests" "$log" | head -10)"
  fi
fi

if echo "$changed" | grep -q "^apps/mobile/"; then
  if ! (cd apps/mobile && pnpm exec tsc --noEmit) >"$log" 2>&1; then
    deny "[pre-commit-check] 커밋 차단 — apps/mobile 타입체크 실패:
$(head -15 "$log")"
  fi
fi

exit 0
