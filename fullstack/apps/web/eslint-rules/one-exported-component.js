// 파일 하나에 export 컴포넌트 하나. export 하지 않는 보조 컴포넌트는 세지 않는다(같은 파일에 두는 게 기본).
const isPascal = (name) => /^[A-Z]/.test(name);

const isComponentInit = (init) => {
  if (!init) return false;
  if (
    init.type === "ArrowFunctionExpression" ||
    init.type === "FunctionExpression"
  )
    return true;
  if (init.type === "CallExpression") {
    const { callee } = init;
    const name =
      callee.type === "Identifier"
        ? callee.name
        : callee.type === "MemberExpression" &&
            callee.property.type === "Identifier"
          ? callee.property.name
          : null;
    return (
      (name === "memo" || name === "forwardRef" || name === "lazy") &&
      init.arguments.length > 0
    );
  }
  return false;
};

const exportedComponents = (declaration) => {
  if (!declaration) return [];
  if (declaration.type === "FunctionDeclaration")
    return declaration.id && isPascal(declaration.id.name) ? [declaration] : [];
  if (declaration.type === "VariableDeclaration")
    return declaration.declarations.filter(
      (d) =>
        d.id.type === "Identifier" &&
        isPascal(d.id.name) &&
        isComponentInit(d.init),
    );
  return [];
};

export const oneExportedComponent = {
  meta: {
    type: "suggestion",
    docs: { description: "파일 하나에 export 컴포넌트는 하나만" },
    schema: [],
    messages: {
      tooMany:
        "export 컴포넌트를 한 파일에 둘 이상 두지 말고 {{ name }} 를 자기 모듈 폴더로 옮긴다 — 파일 이름만 보고 컴포넌트를 찾을 수 있어야 한다. 이 파일에서만 쓰는 보조 컴포넌트라면 export 를 뗀다",
    },
  },
  create(context) {
    let seen = 0;
    return {
      ExportNamedDeclaration(node) {
        for (const component of exportedComponents(node.declaration)) {
          seen += 1;
          if (seen > 1)
            context.report({
              node: component,
              messageId: "tooMany",
              data: { name: component.id.name },
            });
        }
      },
    };
  },
};
