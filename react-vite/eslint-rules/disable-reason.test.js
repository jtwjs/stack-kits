import { globSync, readFileSync } from "node:fs";
import path from "node:path";
import tseslint from "typescript-eslint";
import { describe, expect, it } from "vitest";

import { DISABLE, hasReason, INLINE_CONFIG } from "./no-comments.js";

// 규칙 이름 없는 eslint-disable · 규칙 설정 주석(/* eslint local/no-comments: off */)은 local/no-comments 자신까지 꺼서
// lint 로는 못 잡는다. 그래서 테스트가 src 를 직접 파싱해 주석 단위로 본다.
const KIT_ROOT = path.join(import.meta.dirname, "..");

const forbiddenDirectives = (source, filePath = "fixture.ts") =>
  tseslint.parser
    .parseForESLint(source, { filePath, comment: true, range: true })
    .ast.comments.map((comment) => comment.value.trim())
    .filter(
      (text) =>
        (DISABLE.test(text) && !hasReason(text)) || INLINE_CONFIG.test(text),
    );

describe("src 의 eslint 지시 주석", () => {
  it("이유 없는 disable 과 규칙 설정 주석만 골라낸다", () => {
    expect(
      forbiddenDirectives(
        [
          "/* eslint-disable */",
          "// eslint-disable-line no-console",
          "// eslint-disable-next-line no-console -- CLI 출력",
          "/* eslint-disable no-console",
          "   -- 여러 줄 이유 */",
          "/* eslint local/no-comments: off */",
          'const text = "// eslint-disable";',
        ].join("\n"),
      ),
    ).toEqual([
      "eslint-disable",
      "eslint-disable-line no-console",
      "eslint local/no-comments: off",
    ]);
  });

  it("src 에는 하나도 없다", () => {
    const files = globSync("src/**/*.{ts,tsx}", { cwd: KIT_ROOT });
    expect(files.length).toBeGreaterThan(0);
    const offenders = files.flatMap((file) =>
      forbiddenDirectives(
        readFileSync(path.join(KIT_ROOT, file), "utf8"),
        file,
      ).map((text) => `${file}: ${text}`),
    );
    expect(offenders).toEqual([]);
  });
});
