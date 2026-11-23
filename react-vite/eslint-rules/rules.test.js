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
  linterOptions: { noInlineConfig: true },
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
});

tester.run("no-comments", noComments, {
  valid: ["const total = sum(rows);"],
  invalid: [
    {
      code: "// 합계\nconst total = sum(rows);",
      errors: [{ messageId: "noComment" }],
    },
    {
      code: "/* eslint-disable */\nconst a = 1;",
      errors: [
        { message: /has no effect because you have 'noInlineConfig'/ },
        { messageId: "noComment" },
      ],
    },
    {
      code: "// @ts-expect-error\nconst a: number = 'x';",
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
