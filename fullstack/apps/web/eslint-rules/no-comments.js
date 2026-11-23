// 주석은 코드와 따로 썩는다. 이름 · 타입 · 테스트로 의도를 드러내고, 남길 지식은 문서로 옮긴다.
// 예외: 도구가 읽는 지시 주석. 그중 규칙을 끄는 eslint-disable 계열은 규칙 이름과 "-- 이유" 가 있어야 한다(이름 없으면 전부 꺼져 이유가 있어도 막는다).
// 규칙 설정 주석(/* eslint rule: off */)은 막는다(eslint-env 는 ESLint 10 이 이미 파싱 에러로 막는다) — 규칙 설정은 eslint.config.js 한 곳에서만.
export const DISABLE = /^eslint-disable(-next-line|-line)?(\s|$)/;
export const INLINE_CONFIG = /^eslint\s/;
export const hasReason = (text) => /\s--\s*\S/.test(text);
export const namesRule = (text) =>
  text
    .split(/\s--\s/)[0]
    .replace(DISABLE, "")
    .trim().length > 0;
const TOOL_DIRECTIVES = [
  /^eslint-enable(\s|$)/,
  /^@ts-(expect-error|ignore|nocheck|check)(\s|:|$)/,
  /^\/\s*<(reference|amd-module)\s/,
  /^prettier-ignore(\s|$)/,
  /^(istanbul|c8|v8) ignore(\s|$)/,
  /^@vite-ignore$/,
  /^webpack(ChunkName|Ignore|Prefetch|Preload|Mode|Exports|Include|Exclude):/,
  /^[#@]__(PURE|NO_SIDE_EFFECTS)__$/,
  /^@vitest-environment\s/,
];

export const noComments = {
  meta: {
    type: "suggestion",
    docs: {
      description: "src 코드에 주석을 쓰지 않는다(도구 지시 주석은 예외)",
    },
    schema: [],
    messages: {
      noComment:
        "주석 대신 이름 · 타입 · 테스트로 의도를 드러낸다 — 주석은 코드가 바뀔 때 같이 안 바뀌어 거짓말이 된다. 남길 지식은 README · 문서로 옮긴다",
      inlineConfig:
        "주석으로 규칙 설정을 바꾸지 말고 eslint.config.js 에서 고친다 — 파일마다 규칙이 달라지면 lint 결과를 믿을 수 없다. 한 줄만 끌 때는 eslint-disable-next-line <규칙> -- 이유",
      disableAll:
        "규칙 이름 없이 eslint-disable 하지 말고 끌 규칙을 적는다(예: // eslint-disable-next-line no-console -- CLI 출력) — 이름이 없으면 주석 · FSD · as 금지까지 모든 규칙이 꺼진다",
      disableWithoutReason:
        "이유 없이 규칙을 끄지 말고 `-- 이유` 를 붙인다(예: // eslint-disable-next-line no-console -- CLI 출력) — 왜 껐는지 남아야 리뷰어가 판단하고, 같은 이유가 쌓이면 규칙을 고친다",
    },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          const text = comment.value.trim();
          if (DISABLE.test(text)) {
            if (!namesRule(text))
              context.report({ loc: comment.loc, messageId: "disableAll" });
            else if (!hasReason(text))
              context.report({
                loc: comment.loc,
                messageId: "disableWithoutReason",
              });
            continue;
          }
          if (INLINE_CONFIG.test(text)) {
            context.report({ loc: comment.loc, messageId: "inlineConfig" });
            continue;
          }
          if (TOOL_DIRECTIVES.some((directive) => directive.test(text)))
            continue;
          context.report({ loc: comment.loc, messageId: "noComment" });
        }
      },
    };
  },
};
