// 컴포넌트 · 커스텀 훅 본문의 훅 호출 순서:
// useRef → useState · useReducer → 그 밖의 훅(context · 라우터 · Query · 커스텀) → useMemo → useCallback → effect
const RANK = {
  useRef: 0,
  useState: 1,
  useReducer: 1,
  useMemo: 3,
  useCallback: 4,
  useEffect: 5,
  useLayoutEffect: 5,
  useInsertionEffect: 5,
};
const ORDER =
  "useRef → useState → 그 밖의 훅 → useMemo → useCallback → useEffect";

const hookName = (node) => {
  if (node?.type !== "CallExpression") return null;
  const { callee } = node;
  const name =
    callee.type === "Identifier"
      ? callee.name
      : callee.type === "MemberExpression" &&
          callee.property.type === "Identifier"
        ? callee.property.name
        : null;
  return name && /^use([A-Z0-9].*)?$/.test(name) ? name : null;
};

const rankOf = (name) => RANK[name] ?? 2;

const callOf = (statement) => {
  if (statement.type === "ExpressionStatement") return statement.expression;
  if (statement.type === "VariableDeclaration")
    return statement.declarations.length === 1
      ? statement.declarations[0].init
      : null;
  return null;
};

export const hooksOrder = {
  meta: {
    type: "suggestion",
    docs: { description: "훅 호출 순서를 고정한다" },
    schema: [],
    messages: {
      outOfOrder:
        "{{ current }} 를 {{ previous }} 뒤가 아니라 앞에 둔다 — 순서({{ order }})가 같으면 어느 파일이든 같은 자리에서 상태 · 파생 값 · effect 를 찾는다",
    },
  },
  create(context) {
    const checkBody = (fn) => {
      if (fn.body.type !== "BlockStatement") return;
      let previous = null;
      for (const statement of fn.body.body) {
        const name = hookName(callOf(statement));
        if (!name) continue;
        if (previous && rankOf(name) < rankOf(previous)) {
          context.report({
            node: statement,
            messageId: "outOfOrder",
            data: { current: name, previous, order: ORDER },
          });
          continue;
        }
        previous = name;
      }
    };
    return {
      ArrowFunctionExpression: checkBody,
      FunctionExpression: checkBody,
      FunctionDeclaration: checkBody,
    };
  },
};
