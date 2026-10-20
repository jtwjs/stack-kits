import { setupServer } from "msw/node";

// Vitest(jsdom) 용 MSW 서버. 시작·리셋·종료는 vitest.setup.ts 가 한다.
// 기본 핸들러는 두지 않는다 — shared 는 entities 를 import 할 수 없으니 테스트가 server.use(...) 로 붙인다.
export const server = setupServer();
