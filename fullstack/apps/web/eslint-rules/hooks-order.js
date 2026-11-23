// 컴포넌트 · 커스텀 훅 본문의 훅 호출 순서:
// useRef → useState · useReducer → 그 밖의 훅(context · 라우터 · Query · 커스텀) → useMemo → useCallback → effect
// 뒤 훅이 앞에서 만든 값을 인자로 받아 옮길 수 없으면(옮기면 선언 전 참조가 된다) 검사하지 않는다.
const RANK = {
  useRef: 0,
  useState: 1,
  useReducer: 1,
  useActionState: 1,
  useOptimistic: 1,
  useMemo: 3,
  useCallback: 4,
  useEffect: 5,
  useLayoutEffect: 5,
  useInsertionEffect: 5,
  useImperativeHandle: 5,
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
          callee.object.type === "Identifier" &&
          callee.object.name === "React" &&
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

const patternNames = (pattern) => {
  if (!pattern) return [];
  if (pattern.type === "Identifier") return [pattern.name];
  if (pattern.type === "ObjectPattern")
    return pattern.properties.flatMap((p) =>
      patternNames(p.type === "RestElement" ? p.argument : p.value),
    );
  if (pattern.type === "ArrayPattern")
    return pattern.elements.flatMap((e) =>
      patternNames(e?.type === "RestElement" ? e.argument : e),
    );
  if (pattern.type === "AssignmentPattern") return patternNames(pattern.left);
  return [];
};

const declaredNames = (statement) =>
  statement.type === "VariableDeclaration"
    ? statement.declarations.flatMap((d) => patternNames(d.id))
    : [];

const referencedNames = (node, found = new Set()) => {
  if (!node || typeof node.type !== "string") return found;
  if (node.type === "Identifier") found.add(node.name);
  for (const [key, value] of Object.entries(node)) {
    if (key === "parent") continue;
    if (
      node.type === "MemberExpression" &&
      key === "property" &&
      !node.computed
    )
      continue;
    if (
      node.type === "Property" &&
      key === "key" &&
      !node.shorthand &&
      !node.computed
    )
      continue;
    for (const child of Array.isArray(value) ? value : [value])
      if (child && typeof child.type === "string")
        referencedNames(child, found);
  }
  return found;
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
      const statements = fn.body.body;
      const hooks = [];
      statements.forEach((statement, index) => {
        const name = hookName(callOf(statement));
        if (!name) return;
        const rank = rankOf(name);
        const blocker = hooks.find((hook) => hook.rank > rank);
        if (blocker) {
          const movedAbove = new Set(
            statements
              .slice(blocker.index, index)
              .flatMap((s) => declaredNames(s)),
          );
          const needsLater = [...referencedNames(callOf(statement))].some(
            (ref) => movedAbove.has(ref),
          );
          if (!needsLater)
            context.report({
              node: statement,
              messageId: "outOfOrder",
              data: { current: name, previous: blocker.name, order: ORDER },
            });
          return;
        }
        hooks.push({ name, rank, index });
      });
    };
    return {
      ArrowFunctionExpression: checkBody,
      FunctionExpression: checkBody,
      FunctionDeclaration: checkBody,
    };
  },
};
