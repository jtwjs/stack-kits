import { ESLint } from "eslint";
import path from "node:path";
import { describe, expect, it } from "vitest";

// eslint.config.js 의 셀렉터 · import 패턴이 막을 것만 막는지, 실제 설정으로 가상 파일을 lint 해 본다(리뷰 회귀 픽스처)
const eslint = new ESLint({
  cwd: path.join(import.meta.dirname, ".."),
});

const errorsOf = async (code, filePath) => {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.map((m) => m.ruleId);
};

describe("eslint.config.js", () => {
  it("setTimeout 안에서 ref 를 바꾸는 건 통과한다", async () => {
    expect(
      await errorsOf(
        "export const tick = () => setTimeout(() => { ref.current = 1; }, 10);\n",
        "src/shared/lib/tick.ts",
      ),
    ).toEqual([]);
  });

  it("@x 슬롯 경로는 entities 밖에서 깊은 import 로 막힌다", async () => {
    expect(
      await errorsOf(
        'import { a } from "@/entities/user/@x/order";\nexport const b = a;\n',
        "src/features/order-create/model/x.ts",
      ),
    ).toContain("no-restricted-imports");
  });

  it("entities 안의 @x 슬롯 경로는 public API 규칙을 통과한다", async () => {
    expect(
      await errorsOf(
        'import { a } from "@/entities/user/@x/order";\nexport const b = a;\n',
        "src/entities/order/model/x.ts",
      ),
    ).not.toContain("no-restricted-imports");
  });

  it("model 하위 폴더에서 ../../ui 를 import 하면 막힌다", async () => {
    expect(
      await errorsOf(
        'import { List } from "../../ui";\nexport const b = List;\n',
        "src/entities/article/model/sub/x.ts",
      ),
    ).toContain("no-restricted-imports");
  });

  it("객체 메서드 축약은 화살표 함수 규칙에 걸리지 않는다", async () => {
    expect(
      await errorsOf(
        "export const api = { load() { return 1; }, get size() { return 0; } };\n",
        "src/shared/lib/api.ts",
      ),
    ).toEqual([]);
  });

  it("function 표현식은 여전히 막힌다", async () => {
    expect(
      await errorsOf(
        "export const load = function () { return 1; };\n",
        "src/shared/lib/load.ts",
      ),
    ).toContain("no-restricted-syntax");
  });
});
