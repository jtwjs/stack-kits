import { defineConfig, devices } from "@playwright/test";

// E2E 는 verify 에 넣지 않는다 (브라우저 설치가 필요하다). api 응답은 page.route 로 고정해 api 없이 돈다.
export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:4173" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm build && pnpm preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
