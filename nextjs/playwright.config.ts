import { defineConfig, devices } from "@playwright/test";

// E2E 는 verify 에 넣지 않고 CI 별도 잡으로 돈다 (브라우저 설치가 필요하다)
export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3000" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm build && pnpm start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
