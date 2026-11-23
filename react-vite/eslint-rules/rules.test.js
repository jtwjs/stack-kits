import { RuleTester } from "eslint";
import tseslint from "typescript-eslint";
import { afterAll, describe, it } from "vitest";

import { hooksOrder } from "./hooks-order.js";
import { noComments } from "./no-comments.js";
import { noMutationInSetState } from "./no-mutation-in-set-state.js";
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
      errors: [{ messageId: "disableAll" }],
    },
    {
      code: "// eslint-disable-next-line no-console\nconsole.log(1);",
      errors: [{ messageId: "disableWithoutReason" }],
    },
    {
      code: "// prettier 설정 메모\nconst a = 1;",
      errors: [{ messageId: "noComment" }],
    },
    {
      code: "// eslint-disable-next-line -- 이유\nconst a = 1;",
      errors: [{ messageId: "disableAll" }],
    },
    {
      code: "/* eslint no-console: off */\nconst a = 1;",
      errors: [{ messageId: "inlineConfig" }],
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
    `const Foo = () => {
      const ref = useRef(null);
      const initial = useContext(Ctx);
      const [n] = useState(initial);
      return n;
    };`,
    `const Foo = () => {
      const { data } = useArticles();
      const first = data[0];
      const [selected] = useState(first);
      return selected;
    };`,
    `const Foo = () => {
      useEffect(() => {}, []);
      server.use(handler);
      vi.useFakeTimers();
      return null;
    };`,
    `const Foo = () => {
      const [state, action] = useActionState(fn, null);
      const query = useArticles();
      useImperativeHandle(ref, () => ({}));
      return null;
    };`,
    `const Foo = () => {
      const total = useMemo(() => 1, []);
      const [n] = useState({ total });
      return n;
    };`,
    `const Foo = () => {
      const total = useMemo(() => 1, []);
      const [n] = useState(cfg[total]);
      return n;
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
    {
      code: `const Foo = () => {
        const id = useId();
        const initial = useContext(Ctx);
        const [n] = useState(0);
        return n;
      };`,
      errors: [{ messageId: "outOfOrder" }],
    },
    {
      code: `const Foo = () => {
        useImperativeHandle(ref, () => ({}));
        const [optimistic] = useOptimistic(items);
        return null;
      };`,
      errors: [{ messageId: "outOfOrder" }],
    },
    {
      code: `const Foo = () => {
        const total = useMemo(() => 1, []);
        const [n] = useState(cfg.total);
        return n;
      };`,
      errors: [{ messageId: "outOfOrder" }],
    },
    {
      code: `const Foo = () => {
        const total = useMemo(() => 1, []);
        const [n] = useState({ total: 0 });
        return n;
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
    `export const ArticlesRoute = lazy(() => import("./articles"));
     export const SettingsRoute = lazy(() => import("./settings"));`,
    `const Table = () => null;
     const COLUMNS = ["a"];
     export { Table, COLUMNS };`,
    `const Table = () => null;
     export { Table, Table as DataTable };`,
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
    {
      code: `const A = () => null;
             const B = () => null;
             export { A, B };`,
      errors: [{ messageId: "tooMany", data: { name: "B" } }],
    },
  ],
});

const STATE = [
  "const [items, setItems] = useState([]);",
  "const [user, setUser] = React.useState({});",
  "const [count, setCount] = useState(0);",
  "const [map, setMap] = useReducer(reducer, {});",
].join("\n");

tester.run("no-mutation-in-set-state", noMutationInSetState, {
  valid: [
    `${STATE}\nsetItems((prev) => [...prev, item]);`,
    `${STATE}\nsetItems((p) => [...p].sort());`,
    `${STATE}\nsetItems((p) => p.filter(isActive).sort());`,
    `${STATE}\nsetItems((prev) => { const next = [...prev]; next.push(item); return next; });`,
    `${STATE}\nsetUser((prev) => ({ ...prev, name }));`,
    `${STATE}\nsetTimeout(() => { ref.current = count; }, 10);`,
    `${STATE}\nsetInterval(() => queue.shift(), 10);`,
    `${STATE}\nsetItems(items.toSorted());`,
    "setHandler((e) => { e.v = 1; });",
    "const [a, b] = pair; b((x) => { x.push(1); });",
    `${STATE}\nsetMap((prev) => new Map(prev).set(key, value));`,
    `${STATE}\nsetUser((prev) => Object.assign({}, prev, { name }));`,
    `${STATE}\nsetUser(({ items }) => ({ items: [...items, item] }));`,
  ],
  invalid: [
    {
      code: `${STATE}\nsetItems((prev) => { prev.push(item); return prev; });`,
      errors: [{ messageId: "mutated", data: { name: "prev" } }],
    },
    {
      code: `${STATE}\nsetUser((prev) => { prev.profile.name = name; return prev; });`,
      errors: [{ messageId: "mutated", data: { name: "prev" } }],
    },
    {
      code: `${STATE}\nsetCount(function (prev) { prev.n++; return prev; });`,
      errors: [{ messageId: "mutated", data: { name: "prev" } }],
    },
    {
      code: `${STATE}\nsetMap((m) => { delete m.key; return m; });`,
      errors: [{ messageId: "mutated", data: { name: "m" } }],
    },
    ...["set(key, value)", "add(key)", "delete(key)", "clear()"].map(
      (call) => ({
        code: `${STATE}\nsetMap((prev) => { prev.${call}; return prev; });`,
        errors: [{ messageId: "mutated", data: { name: "prev" } }],
      }),
    ),
    {
      code: `${STATE}\nsetUser((prev) => Object.assign(prev, { name }));`,
      errors: [{ messageId: "mutated", data: { name: "prev" } }],
    },
    {
      code: `${STATE}\nsetUser(({ items }) => { items.push(item); return { items }; });`,
      errors: [{ messageId: "mutated", data: { name: "items" } }],
    },
    {
      code: `${STATE}\nsetUser(({ profile }) => { profile.name = name; return { profile }; });`,
      errors: [{ messageId: "mutated", data: { name: "profile" } }],
    },
  ],
});
