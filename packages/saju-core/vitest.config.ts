import { defineConfig } from 'vitest/config'

// 계산 코어는 순수 TS라 DOM이 필요 없다. node 환경에서 돌린다.
export default defineConfig({
  test: {
    environment: 'node',
  },
})
