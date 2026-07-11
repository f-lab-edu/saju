#!/bin/bash
# Stop hook: Claude가 응답(턴)을 마칠 때 macOS 알림을 띄운다.

osascript -e 'display notification "작업이 끝났습니다" with title "Claude Code — saju" sound name "Glass"' >/dev/null 2>&1

exit 0
