// setState 업데이터 콜백이 받은 이전 상태(prev)를 직접 바꾸지 못하게 한다.
// setter 는 useState · useReducer 구조 분해 두 번째 원소로 선언된 이름만 본다(setHandler 같은 일반 함수는 제외).
// 콜백 인자에 닿는 변이만 잡는다 — 복사본([...prev] · prev.filter())을 정렬하거나 setTimeout 안에서 ref 를 바꾸는 건 통과.
const MUTATING = new Set([
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse",
  "fill",
  "copyWithin",
]);
const STATE_HOOKS = new Set(["useState", "useReducer"]);

const rootName = (node) => {
  let current = node;
  while (current?.type === "MemberExpression") current = current.object;
  return current?.type === "Identifier" ? current.name : null;
};

const stateHookName = (init) => {
  if (init?.type !== "CallExpression") return null;
  const { callee } = init;
  if (callee.type === "Identifier") return callee.name;
  return callee.type === "MemberExpression" &&
    callee.object.type === "Identifier" &&
    callee.object.name === "React" &&
    callee.property.type === "Identifier"
    ? callee.property.name
    : null;
};

const updaterParam = (call, setters) => {
  const { callee } = call;
  if (callee.type !== "Identifier" || !setters.has(callee.name)) return null;
  const updater = call.arguments[0];
  if (
    updater?.type !== "ArrowFunctionExpression" &&
    updater?.type !== "FunctionExpression"
  )
    return null;
  const param = updater.params[0];
  return param?.type === "Identifier" ? { updater, name: param.name } : null;
};

export const noMutationInSetState = {
  meta: {
    type: "problem",
    docs: { description: "setState 업데이터에서 이전 상태를 바꾸지 않는다" },
    schema: [],
    messages: {
      mutated:
        "setState 콜백의 {{ name }} 를 직접 바꾸지 말고 복사본을 만든다([...prev, item] · { ...prev, field } · toSorted) — 같은 참조를 돌려주면 React 가 바뀐 줄 모르고 다시 그리지 않는다",
    },
  },
  create(context) {
    const setters = new Set();
    const updaters = [];
    const touchesPrev = (node) => {
      const root = rootName(node);
      return updaters.find(
        ({ name, updater }) =>
          name === root &&
          node.range[0] >= updater.range[0] &&
          node.range[1] <= updater.range[1],
      );
    };
    const report = (node, target) => {
      const hit = touchesPrev(target);
      if (hit)
        context.report({
          node,
          messageId: "mutated",
          data: { name: hit.name },
        });
    };
    return {
      VariableDeclarator(node) {
        const setter = node.id.type === "ArrayPattern" && node.id.elements[1];
        if (
          setter?.type === "Identifier" &&
          STATE_HOOKS.has(stateHookName(node.init))
        )
          setters.add(setter.name);
      },
      CallExpression(node) {
        const found = updaterParam(node, setters);
        if (found) updaters.push(found);
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.property.type === "Identifier" &&
          MUTATING.has(node.callee.property.name)
        )
          report(node, node.callee.object);
      },
      "CallExpression:exit"(node) {
        if (updaters.at(-1)?.updater === node.arguments[0]) updaters.pop();
      },
      AssignmentExpression(node) {
        if (node.left.type === "MemberExpression") report(node, node.left);
      },
      UpdateExpression(node) {
        if (node.argument.type === "MemberExpression")
          report(node, node.argument);
      },
      UnaryExpression(node) {
        if (node.operator === "delete") report(node, node.argument);
      },
    };
  },
};
