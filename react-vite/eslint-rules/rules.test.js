import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import { afterAll, describe, it } from "vitest";

import { hooksOrder } from "./hooks-order.js";
import { noComments } from "./no-comments.js";
import { oneExportedComponent } from "./one-exported-component.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run("no-comments", noComments, {
  valid: [
    "const total = sum(rows);",
    "// eslint-disable-next-line no-console -- CLI 출력\nconsole.log(1);",
    "/* eslint-disable no-console -- 스크립트 */\nconsole.log(1);",
    "// @ts-expect-error 라이브러리 타입 누락\nconst a: number = 'x';",
    '/// <reference types="vite/client" />\nconst a = 1;',
    "// prettier-ignore\nconst m = [1,0,0,1];",
    "const page = import(/* @vite-ignore */ path);",
    "const v = /* #__PURE__ */ make();",
    "/* istanbul ignore next */\nconst a = 1;",
  ],
  invalid: [
    {
      code: "// 합계\nconst total = sum(rows);",
      errors: [{ messageId: "noComment" }],
    },
    {
      code: "// eslint-disable-next-line\nconsole.log(1);",
      errors: [{ messageId: "disableWithoutReason" }],
    },
    {
      code: "// eslint-disable-next-line no-console\nconsole.log(1);",
      errors: [{ messageId: "disableWithoutReason" }],
    },
    {
      code: "// prettier 설정 메모\nconst a = 1;",
      errors: [{ messageId: "noComment" }],
    },
  ],
});

tester.run("hooks-order", hooksOrder, {
  valid: [
    `const Foo = () => {
      const ref = useRef(null);
      const [a, setA] = useState(0);
      const query = useArticles();
      const total = useMemo(() => a + 1, [a]);
      const handle = useCallback(() => setA(1), []);
      useEffect(() => {}, []);
      return null;
    };`,
    `const useThing = () => {
      const user = getUser();
      const [a] = useState(0);
      return a;
    };`,
  ],
  invalid: [
    {
      code: `const Foo = () => {
        const [a] = useState(0);
        const ref = useRef(null);
        return null;
      };`,
      errors: [{ messageId: "outOfOrder" }],
    },
    {
      code: `const Foo = () => {
        useEffect(() => {}, []);
        const data = useArticles();
        return null;
      };`,
      errors: [{ messageId: "outOfOrder" }],
    },
    {
      code: `const Foo = () => {
        const total = useMemo(() => 1, []);
        const [a] = React.useState(0);
        return null;
      };`,
      errors: [{ messageId: "outOfOrder" }],
    },
  ],
});

tester.run("one-exported-component", oneExportedComponent, {
  valid: [
    `const Row = () => null;
     export const Table = () => <Row />;`,
    `export const Table = () => null;
     export const COLUMNS = ["a"];
     export const formatRow = (row) => row;`,
  ],
  invalid: [
    {
      code: `export const Table = () => null;
             export const Row = () => null;`,
      errors: [{ messageId: "tooMany", data: { name: "Row" } }],
    },
    {
      code: `export const Table = () => null;
             export const Cell = memo(() => null);`,
      errors: [{ messageId: "tooMany", data: { name: "Cell" } }],
    },
  ],
});
