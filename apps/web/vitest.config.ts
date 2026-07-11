import babel from '@rolldown/plugin-babel'
import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// vite.config.ts는 nitro/tanstackStart 등 서버 번들용 플러그인을 포함하므로
// 테스트는 React 플러그인만 얹은 별도 설정으로 돌린다.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [viteReact(), babel({ presets: [reactCompilerPreset()] })],
  test: {
    environment: 'jsdom',
    // globals가 없으면 RTL이 afterEach(cleanup)을 등록하지 못해 렌더 트리가 테스트 간에 누적된다
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
