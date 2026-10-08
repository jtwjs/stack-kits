import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

// FSD 레이어. 위가 아래를 import 한다 — 아래가 위를 import 하면 lint 에러.
const LAYERS = ["app", "pages", "widgets", "features", "entities", "shared"];
const TEST_FILES = ["**/*.test.*", "**/*.stories.*"];

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
  group: ["**/fixtures", "**/fixtures.*", "**/fixtures/**"],
  message: "픽스처는 *.test.* · *.stories.* 에서만 import 한다.",
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
  ...restrictions,
]);
