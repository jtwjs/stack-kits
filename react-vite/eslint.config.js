import js from "@eslint/js";
import boundaries from "eslint-plugin-boundaries";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import { importX } from "eslint-plugin-import-x";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import storybook from "eslint-plugin-storybook";
import testingLibrary from "eslint-plugin-testing-library";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

import { local } from "./eslint-rules/index.js";

// FSD 레이어. 위가 아래를 import 한다 — 아래가 위를 import 하면 lint 에러.
const LAYERS = ["app", "pages", "widgets", "features", "entities", "shared"];
// 슬라이스가 있는 레이어. 같은 레이어의 다른 슬라이스는 import 하지 않는다(entities 는 @x 슬롯만 예외)
const SLICED = ["pages", "widgets", "features", "entities"];
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
const publicApiRule = {
  group: [
    ...SLICED.map((layer) => `@/${layer}/*/**`),
    "@/shared/*/*/**",
    "!@/entities/*/@x",
    "!@/entities/*/@x/*",
  ],
  message:
    "슬라이스 안쪽 파일 대신 슬라이스의 index.ts(public API)에서 import 한다(shared 는 @/shared/<segment>/<module> 까지) — 안쪽 경로에 기대면 슬라이스 안을 고칠 때마다 바깥이 깨진다. entities 교차 import 는 @/entities/<provider>/@x/<consumer> 로",
};
const modelToUiRule = {
  group: ["../ui", "../ui/**", "../../ui/**"],
  message:
    "model 에서 ui 를 import 하지 말고 필요한 타입·계산을 model 로 옮긴다 — model 은 화면 없이 테스트하는 층이라 ui 를 알면 순수 계산이 화면에 묶인다",
};

// no-restricted-imports 는 뒤 설정이 앞 설정을 덮어쓰므로(병합 안 됨) 레이어×(본문|model|테스트) 조합마다 한 블록씩 만든다
const restrictions = LAYERS.flatMap((layer) => {
  const files = [`src/${layer}/**/*.{ts,tsx}`];
  const upper = LAYERS.indexOf(layer) > 0 ? [layerRule(layer)] : [];
  const body = [...upper, fixtureRule, publicApiRule];
  return [
    {
      files,
      ignores: TEST_FILES,
      rules: { "no-restricted-imports": ["error", { patterns: body }] },
    },
    {
      files: [`src/${layer}/**/model/**/*.{ts,tsx}`],
      ignores: TEST_FILES,
      rules: {
        "no-restricted-imports": [
          "error",
          { patterns: [...body, modelToUiRule] },
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

// no-restricted-syntax 도 덮어쓰므로 파일 종류마다 전체 목록을 만든다
const syntax = {
  propsInterface: {
    selector:
      "TSTypeAliasDeclaration[id.name=/(Props|Options)$/] > TSTypeLiteral",
    message:
      "Props · Options 는 type 객체 대신 interface 로 쓴다 — 컴포넌트 · 훅과 호출자 사이의 약속(규격)이라서. 교차 · 유니온이 필요할 때만 type",
  },
  callbackLastInProps: {
    selector:
      "ObjectPattern > Property[key.name=/^on[A-Z]/] ~ Property[key.name!=/^on[A-Z]/]",
    message:
      "on* 콜백을 중간에 두지 말고 구조 분해 맨 뒤로 모은다 — 값과 이벤트가 섞이지 않아 props 를 한눈에 읽는다",
  },
  callbackLastInInterface: {
    selector:
      "TSInterfaceBody > TSPropertySignature[key.name=/^on[A-Z]/] ~ TSPropertySignature[key.name!=/^on[A-Z]/]",
    message:
      "on* 콜백 필드를 중간에 두지 말고 interface 맨 뒤로 모은다 — 값과 이벤트가 섞이지 않아 규격을 한눈에 읽는다",
  },
  noFunctionDeclaration: {
    selector: "FunctionDeclaration",
    message:
      "function 선언 대신 const 화살표 함수를 쓴다 — 함수 모양이 하나면 호이스팅 · this 바인딩 차이를 신경 쓸 일이 없다",
  },
  noFunctionExpression: {
    selector: "FunctionExpression:not(MethodDefinition > FunctionExpression)",
    message:
      "function 표현식 대신 화살표 함수를 쓴다 — 함수 모양이 하나면 this 바인딩 차이를 신경 쓸 일이 없다",
  },
  noTypeAssertion: {
    selector:
      "TSAsExpression > .typeAnnotation:not(TSTypeReference[typeName.name='const']), TSTypeAssertion",
    message:
      "as 단언 대신 타입 가드 · 좁히기(typeof · in · 판별 유니온)로 타입을 증명한다 — 단언은 컴파일러를 끄는 것이라 실제 값이 다르면 런타임에서야 터진다. as const 는 허용",
  },
  noMutationInSetState: {
    selector:
      "CallExpression[callee.name=/^set[A-Z]/] > ArrowFunctionExpression CallExpression[callee.property.name=/^(push|pop|shift|unshift|splice|sort|reverse|fill|copyWithin)$/]",
    message:
      "setState 콜백 안에서 배열을 바꾸지 말고 복사본을 만든다([...prev, item] · prev.filter · toSorted) — 같은 참조를 돌려주면 React 가 바뀐 줄 모르고 다시 그리지 않는다",
  },
  noAssignInSetState: {
    selector:
      "CallExpression[callee.name=/^set[A-Z]/] > ArrowFunctionExpression AssignmentExpression > MemberExpression.left",
    message:
      "setState 콜백 안에서 필드에 대입하지 말고 복사본을 만든다({ ...prev, field }) — 같은 참조를 돌려주면 React 가 바뀐 줄 모르고 다시 그리지 않는다",
  },
  noExportDefault: {
    selector: "ExportDefaultDeclaration",
    message:
      "export default 대신 이름 있는 export 를 쓴다 — 이름이 하나로 고정돼 검색 · 리팩터링이 쉽고 배럴의 export * 에 실린다",
  },
  noMultilineJsxArrow: {
    selector:
      "JSXAttribute > JSXExpressionContainer > ArrowFunctionExpression > BlockStatement",
    message:
      "JSX 속성에 여러 줄 화살표를 쓰지 않는다 — 이름 있는 핸들러로 뺀다(한 줄 위임 () => f(id) 은 허용)",
  },
  noGivenWhenThenPrefix: {
    selector:
      "CallExpression[callee.name=/^(describe|it|test)$/] > Literal.arguments:first-child[value=/^(Given|When|Then):/]",
    message:
      "테스트 이름에 Given: · When: · Then: 접두를 붙이지 말고 문장으로 쓴다 — describe · it 계층이 이미 전제 · 결과를 나눈다",
  },
};
const COMMON_SYNTAX = [
  syntax.propsInterface,
  syntax.callbackLastInProps,
  syntax.callbackLastInInterface,
  syntax.noFunctionDeclaration,
  syntax.noFunctionExpression,
  syntax.noTypeAssertion,
  syntax.noMutationInSetState,
  syntax.noAssignInSetState,
];
const restrictedSyntax = (...extra) => ["error", ...COMMON_SYNTAX, ...extra];

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
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries, "import-x": importX, local },
    settings: {
      ...importX.flatConfigs.typescript.settings,
      "import/resolver": { typescript: { project: "./tsconfig.json" } },
      "import-x/resolver-next": [
        createTypeScriptImportResolver({ project: "./tsconfig.json" }),
      ],
      "boundaries/files": [
        {
          category: "x-slot",
          pattern: "src/entities/*/@x/*.ts",
          capture: ["provider", "consumer"],
        },
      ],
      "boundaries/elements": SLICED.map((layer) => ({
        type: layer,
        pattern: `src/${layer}/*`,
        capture: ["slice"],
      })),
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "allow",
          policies: [
            {
              from: { element: { types: SLICED } },
              disallow: {
                to: {
                  element: {
                    type: "{{ from.element.types.[0] }}",
                    captured: { slice: "!{{ from.element.captured.slice }}" },
                  },
                },
              },
              message:
                "같은 레이어의 다른 슬라이스({{ to.element.captured.slice }})를 import 하지 말고 공용 부분을 아래 레이어로 내린다 — 슬라이스끼리 엮이면 하나를 고칠 때 옆 슬라이스가 같이 깨진다. entities 는 @/entities/<provider>/@x/<consumer> 슬롯으로만",
            },
            {
              from: { element: { type: "entities" } },
              allow: {
                to: {
                  file: {
                    categories: "x-slot",
                    captured: {
                      consumer: "{{ from.element.captured.slice }}",
                    },
                  },
                },
              },
            },
          ],
        },
      ],
      "import-x/no-cycle": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "local/no-comments": "error",
      "local/hooks-order": "error",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: TEST_FILES,
    rules: { "no-restricted-syntax": restrictedSyntax(syntax.noExportDefault) },
  },
  {
    // 호출 자리는 "이름 있는 함수 하나 부르기"만. 여러 줄 로직은 핸들러로 뺀다(harness rules 함수형)
    files: ["src/**/*.tsx"],
    ignores: TEST_FILES,
    rules: {
      "no-restricted-syntax": restrictedSyntax(
        syntax.noExportDefault,
        syntax.noMultilineJsxArrow,
      ),
      "local/one-exported-component": "error",
    },
  },
  {
    files: ["src/**/*.msw.*"],
    rules: { "no-restricted-syntax": restrictedSyntax(syntax.noExportDefault) },
  },
  {
    files: ["src/**/*.test.*"],
    ...testingLibrary.configs["flat/react"],
    rules: {
      ...testingLibrary.configs["flat/react"].rules,
      "no-restricted-syntax": restrictedSyntax(
        syntax.noExportDefault,
        syntax.noGivenWhenThenPrefix,
      ),
    },
  },
  {
    // 스토리는 Storybook CSF 가 default export(meta)를 요구해서 export default 만 허용한다
    files: ["src/**/*.stories.*"],
    rules: { "no-restricted-syntax": restrictedSyntax() },
  },
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
]);
