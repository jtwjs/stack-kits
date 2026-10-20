import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import path from "node:path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  server: {
    // 같은 출처: 브라우저는 /api 로만 부르고 dev 서버가 api 로 넘긴다. 그래서 api 에 CORS 설정이 없다.
    // 운영도 같은 출처(리버스 프록시가 /api 를 api 로)로 둔다.
    proxy: { "/api": "http://localhost:8080" },
  },
  test: {
    // --changed 는 import 그래프로 고른다. .storybook/ 은 스토리가 import 하지 않아 바뀌어도 아무것도 안 돈다 — 전체를 돌린다
    forceRerunTriggers: [
      ...configDefaults.forceRerunTriggers,
      "**/.storybook/**",
    ],
    projects: [
      {
        // pnpm test — jsdom, 브라우저 없이 빠르게
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          setupFiles: ["./vitest.setup.ts"],
          include: ["src/**/*.test.{ts,tsx}"],
        },
      },
      {
        // pnpm test:stories — *.stories.tsx 를 실제 chromium 에서 렌더하고 play 를 돌린다
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(import.meta.dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
