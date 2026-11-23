// 주석은 코드와 따로 썩는다. 이름 · 타입 · 테스트로 의도를 드러내고, 남길 지식은 문서로 옮긴다.
// eslint-disable · @ts-expect-error 도 주석이라 같이 막힌다(예외 없음).
export const noComments = {
  meta: {
    type: "suggestion",
    docs: { description: "src 코드에 주석을 쓰지 않는다" },
    schema: [],
    messages: {
      noComment:
        "주석 대신 이름 · 타입 · 테스트로 의도를 드러낸다 — 주석은 코드가 바뀔 때 같이 안 바뀌어 거짓말이 된다. 남길 지식은 README · 문서로 옮긴다",
    },
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          context.report({ loc: comment.loc, messageId: "noComment" });
        }
      },
    };
  },
};
