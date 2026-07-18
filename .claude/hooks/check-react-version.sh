#!/bin/bash
# PostToolUse hook: apps/web 또는 apps/mobile의 package.json이 수정되면
# react / react-dom 버전이 두 앱에서 정확히 일치하는지 검사한다.
# node-linker=hoisted로 web·mobile이 react를 공유하므로, 버전이 어긋나면
# 웹 서버가 "Incompatible React versions"로 죽는다 (CLAUDE.md 주의사항).
# 어긋나면 exit 2로 Claude에게 경고를 피드백한다. 통과면 조용히 종료.

file_path=$(node -e "
let d = '';
process.stdin.on('data', c => (d += c)).on('end', () => {
  try { console.log(JSON.parse(d).tool_input.file_path ?? ''); } catch {}
});
")

case "$file_path" in
  */apps/web/package.json|*/apps/mobile/package.json) ;;
  *) exit 0 ;;
esac

cd "$CLAUDE_PROJECT_DIR" || exit 0

report=$(node -e "
const fs = require('fs');
const read = (p) => {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
};
const dep = (pkg, name) => pkg && ((pkg.dependencies && pkg.dependencies[name]) || (pkg.devDependencies && pkg.devDependencies[name]));

const web = read('apps/web/package.json');
const mobile = read('apps/mobile/package.json');
if (!web || !mobile) process.exit(0);

const versions = {
  'apps/web react': dep(web, 'react'),
  'apps/web react-dom': dep(web, 'react-dom'),
  'apps/mobile react': dep(mobile, 'react'),
};

const present = Object.entries(versions).filter(([, v]) => v);
const uniq = [...new Set(present.map(([, v]) => v))];
if (uniq.length <= 1) process.exit(0); // 모두 일치 → 통과

const lines = present.map(([k, v]) => '  ' + k + ': ' + v).join('\n');
console.log(lines);
")

if [ -n "$report" ]; then
  echo "[check-react-version] web과 mobile의 react/react-dom 버전이 어긋났습니다. node-linker=hoisted로 두 앱이 react를 공유하므로 버전이 다르면 웹 서버가 죽습니다. 두 앱을 같은 버전으로 맞추세요 (exact 고정):" >&2
  echo "$report" >&2
  exit 2
fi

exit 0
