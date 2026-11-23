// 키트 로컬 ESLint 규칙. 기존 규칙(no-restricted-syntax 등)으로 못 막는 것만 여기 둔다.
// 키트는 폴더 하나만 복사되므로 패키지로 빼지 않고 키트 안에 둔다.
import { hooksOrder } from "./hooks-order.js";
import { noComments } from "./no-comments.js";
import { oneExportedComponent } from "./one-exported-component.js";

export const local = {
  meta: { name: "local" },
  rules: {
    "hooks-order": hooksOrder,
    "no-comments": noComments,
    "one-exported-component": oneExportedComponent,
  },
};
