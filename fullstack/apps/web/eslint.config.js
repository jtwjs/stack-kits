import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import storybook from "eslint-plugin-storybook";
import globals from "globals";
import tseslint from "typescript-eslint";

// FSD 레이어. 위가 아래를 import 한다 — 아래가 위를 import 하면 lint 에러.
const LAYERS = ["app", "pages", "widgets", "features", "entities", "shared"];
// *.msw.* 는 테스트·스토리가 쓰는 MSW 핸들러. 픽스처를 import 하고 번들에 들어가지 않는다
const TEST_FILES = ["**/*.test.*", "**/*.stories.*", "**/*.msw.*"];
// 300줄 경고에서 빼는 것: 테스트·스토리·MSW + 큰 픽스처 데이터
const MAX_LINES_IGNORES = [...TEST_FILES, "**/fixtures.ts", "**/*.fixture.ts"];

const layerRule = (layer) => ({
  group: LAYERS.slice(0, LAYERS.indexOf(layer)).flatMap((upper) => [
    `@/${upper}`,
    `@/${upper}/**`,
    `**/${upper}`,
    `**/${upper}/**`,
  ]),
  message: `FSD: ${layer} 는 위 레이어(${LAYERS.slice(0, LAYERS.indexOf(layer)).join(", ")})를 import 하지 않는다.`,
});
const fixtureRule = {
  group: [
    "**/fixtures",
    "**/fixtures.*",
    "**/fixtures/**",
    "**/*.msw",
    "**/*.msw.*",
  ],
  message:
    "픽스처·MSW 핸들러는 *.test.* · *.stories.* · *.msw.* 에서만 import 한다.",
};

// no-restricted-imports 는 뒤 설정이 앞 설정을 덮어쓰므로(병합 안 됨) 레이어×(본문|테스트) 조합마다 한 블록씩 만든다
const restrictions = LAYERS.flatMap((layer) => {
  const files = [`src/${layer}/**/*.{ts,tsx}`];
  const upper = LAYERS.indexOf(layer) > 0 ? [layerRule(layer)] : [];
  return [
    {
      files,
      ignores: TEST_FILES,
      rules: {
        "no-restricted-imports": [
          "error",
          { patterns: [...upper, fixtureRule] },
        ],
      },
    },
    ...(upper.length
      ? [
          {
            files: TEST_FILES.map((t) => `src/${layer}/${t}`),
            rules: { "no-restricted-imports": ["error", { patterns: upper }] },
          },
        ]
      : []),
  ];
});

export default defineConfig([
  globalIgnores([
    "dist",
    "playwright-report",
    "test-results",
    "storybook-static",
    "src/shared/api/generated.ts",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: { globals: globals.browser },
  },
  ...storybook.configs["flat/recommended"],
  ...restrictions,
  {
    // 300줄(빈 줄·주석 제외) 넘으면 경고만 — 섹션·훅·model 계산을 뺄 신호다(harness rules/fsd.md §6)
    files: ["src/**/*.{ts,tsx}"],
    ignores: MAX_LINES_IGNORES,
    rules: {
      "max-lines": [
        "warn",
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    // 호출 자리는 "이름 있는 함수 하나 부르기"만. 여러 줄 로직은 핸들러로 뺀다(harness rules 함수형)
    files: ["src/**/*.tsx"],
    ignores: TEST_FILES,
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXAttribute > JSXExpressionContainer > ArrowFunctionExpression > BlockStatement",
          message:
            "JSX 속성에 여러 줄 화살표를 쓰지 않는다 — 이름 있는 핸들러로 뺀다(한 줄 위임 () => f(id) 은 허용)",
        },
      ],
    },
  },
]);
