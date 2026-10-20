import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./src/shared/test/server";

// findBy*·waitFor 기본 1초는 CI 러너에서 간헐 실패를 낸다
configure({ asyncUtilTimeout: 4000 });

// 핸들러 없는 요청은 실패로 — 진짜 네트워크로 새지 않는다 (MSW 3 은 onUnhandledRequest 가 onUnhandledFrame 으로 바뀌었다)
beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
