import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  server: {
    // 같은 출처: 브라우저는 /api 로만 부르고 dev 서버가 api 로 넘긴다. 그래서 api 에 CORS 설정이 없다.
    // 운영도 같은 출처(리버스 프록시가 /api 를 api 로)로 둔다.
    proxy: { "/api": "http://localhost:8080" },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
