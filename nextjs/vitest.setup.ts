import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";

// findBy*·waitFor 기본 1초는 CI 러너에서 간헐 실패를 낸다
configure({ asyncUtilTimeout: 4000 });
