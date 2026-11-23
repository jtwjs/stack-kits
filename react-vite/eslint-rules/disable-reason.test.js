import { globSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// 규칙 이름 없이 전부 끄는 eslint-disable 은 local/no-comments 자신까지 꺼서 lint 로는 못 잡는다. 그래서 테스트가 src 를 직접 읽는다.
const DISABLE_COMMENT =
  /(?:\/\/|\/\*)\s*eslint-disable(?:-next-line|-line)?\b[^\n]*?(?:\*\/|$)/gm;

const disablesWithoutReason = (source) =>
  [...source.matchAll(DISABLE_COMMENT)]
    .map(([comment]) => comment)
    .filter((comment) => !/\s--\s*\S/.test(comment));

describe("src 의 eslint-disable", () => {
  it("이유(-- 이유) 없는 것을 찾아낸다", () => {
    expect(
      disablesWithoutReason(
        "/* eslint-disable */\n// eslint-disable-line no-console\n// eslint-disable-next-line no-console -- CLI 출력\n",
      ),
    ).toEqual(["/* eslint-disable */", "// eslint-disable-line no-console"]);
  });

  it("모두 이유가 붙어 있다", () => {
    const offenders = globSync("src/**/*.{ts,tsx}").flatMap((file) =>
      disablesWithoutReason(readFileSync(file, "utf8")).map(
        (comment) => `${file}: ${comment}`,
      ),
    );
    expect(offenders).toEqual([]);
  });
});
