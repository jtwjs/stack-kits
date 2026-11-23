# react-vite kit

FE 단독 보일러플레이트. React 19 · Vite 8 · TypeScript · Node 24 · pnpm. 백엔드는 다른 레포에 있고, 그 OpenAPI 계약 스냅샷(`contracts/openapi.json`)으로 타입을 만든다. 서버까지 한 레포에 두면 `fullstack/` kit을 쓴다.

fullstack/apps/web 과 같은 뼈대다 — 한쪽을 고치면 다른 쪽도 같이 고친다.

```bash
npx degit jtwjs/stack-kits/react-vite#<태그> my-web
cd my-web && git init && pnpm install
pnpm dev   # :5173. /api 는 vite proxy 가 http://localhost:8080 으로 넘긴다(vite.config.ts 에서 바꾼다)
```

```
contracts/openapi.json    백엔드 계약 스냅샷(예시). pnpm gen:api 의 입력
src/                      FSD: {app,pages,widgets,features,entities,shared}
.storybook/               Storybook 10 (react-vite). 스토리는 Vitest storybook 프로젝트로도 돈다
e2e/{specs,fixtures,pom}  Playwright. spec 은 fixtures 의 test·expect 와 pom 의 Page Object 를 쓴다
.github/workflows/ci.yml  degit 후 레포 루트가 되는 전제의 CI (web · stories · ci-gate)
```

## 계약 → 타입

화면 코드는 `src/shared/api/generated.ts`의 타입만 쓴다. 호출은 `shared/api/client.ts`의 `api`(openapi-fetch)를 `unwrap()`으로 감싸고, 실패 응답의 ProblemDetail은 `ApiError(status, detail)`로 바뀐다.

1. 백엔드 계약이 바뀌면 `contracts/openapi.json`을 새 스냅샷으로 덮는다.
2. `pnpm gen:api`로 `generated.ts`를 다시 만든다. 커밋본과 다르면 CI `contract` 단계가 실패한다.
3. 스냅샷과 생성 타입을 같은 커밋에 넣는다.

## 검증 명령

| 단계      | 명령                                                               | 비고                                                                                                                                                                                                                                                                                             |
| --------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| format    | `pnpm format:check`                                                | `generated.ts`·`contracts/openapi.json`은 제외                                                                                                                                                                                                                                                   |
| lint      | `pnpm lint`                                                        | 규칙과 이유는 `eslint.config.js`의 메시지에 있다. 커스텀 규칙은 `eslint-rules/`(테스트는 `pnpm test`가 같이 돈다). `src`에는 주석을 쓰지 않는다. 도구 지시 주석(eslint-disable · `@ts-expect-error` · `/// <reference>` · `prettier-ignore` 등)만 예외이고, eslint-disable 은 `-- 이유`를 붙인다 |
| typecheck | `pnpm typecheck`                                                   |                                                                                                                                                                                                                                                                                                  |
| test      | `pnpm test`                                                        | Vitest `unit` 프로젝트(jsdom, 브라우저 없음). API는 MSW(`src/shared/test/server.ts`). `asyncUtilTimeout` 4초                                                                                                                                                                                     |
| stories   | `pnpm test:stories`                                                | Vitest `storybook` 프로젝트(chromium). `--changed`: 바뀐 파일을 import 하는 스토리만. `.storybook/`이 바뀌면 전부. 전체는 `pnpm test:stories:all`. verify 밖, CI 별도 잡                                                                                                                         |
| build     | `pnpm build`                                                       |                                                                                                                                                                                                                                                                                                  |
| e2e       | `pnpm test:e2e`                                                    | 브라우저 설치 필요(`pnpm exec playwright install chromium`). api는 `page.route`로 고정. verify 밖                                                                                                                                                                                                |
| 한 번에   | `pnpm verify`                                                      | format:check → lint → typecheck → test → build                                                                                                                                                                                                                                                   |
| 계약      | `pnpm gen:api && git diff --exit-code src/shared/api/generated.ts` | CI `contract` 단계와 같다                                                                                                                                                                                                                                                                        |

설치는 `pnpm install --frozen-lockfile`(CI와 같다). Storybook 화면은 `pnpm storybook`(:6006), 정적 빌드는 `pnpm build-storybook`.

## 코드 메모

`src`에 주석을 쓰지 않는 대신, 코드만 봐서는 모를 것을 여기 둔다.

- `shared/api/client.ts` `fetchAtCallTime`: openapi-fetch는 생성 때 받은 fetch를 붙잡는다. 호출 시점에 `globalThis.fetch`를 찾아야 테스트의 `vi.stubGlobal`이 먹는다
- `shared/api/client.ts` `problemMessage`: 실패 응답은 RFC 9457 고정 필드(`detail` → `title`)만 읽는다. 계약의 ProblemDetail 스키마에 기대지 않아, 예시 도메인을 지워도 컴파일된다
- `shared/lib/format.ts` `APP_TIME_ZONE`: 화면 시각은 서비스 시간대로 고정한다. 런타임 TZ에 기대면 브라우저 · CI마다 다르게 찍힌다
- `entities/*/api/*.msw.ts`: 테스트 · 스토리 전용. 경로 앞 `*`는 jsdom origin과 브라우저 origin을 둘 다 맞춘다
- `shared/test/server.ts`: 기본 핸들러를 두지 않는다. shared는 entities를 import 하지 못하니 테스트가 `server.use(...)`로 붙인다
- `entities/*/model/types.ts`: 응답 타입은 계약에서 생성된 것만 쓴다

## 테스트 자리

| 무엇                      | 어디서                                         | 메모                                                                           |
| ------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------ |
| `model`·`lib` 계산        | Vitest unit (`*.test.ts`)                      | 순수 함수. 렌더 없음                                                           |
| `shared/ui`·`entities/ui` | Storybook (`ui/<module>/<module>.stories.tsx`) | 상태별 스토리. 상호작용이 있을 때만 `play`                                     |
| `features` 흐름           | Vitest + Testing Library + MSW                 | 기능 하나에 하나. `renderWithProviders`(`src/shared/test/render.tsx`)로 그린다 |
| `pages` 여정              | Playwright (`e2e/specs/`)                      | 몇 개만                                                                        |

로그인이 생기면 `e2e/setup/`에 storageState를 만드는 setup 프로젝트를 두고 `playwright.config.ts`의 `dependencies`로 건다. kit에는 인증이 없어 두지 않았다.

## 제거 체크리스트

예시 도메인(article)

- [ ] `src/entities/article/` 삭제 (fixtures · `article.msw.ts` · 스토리 포함)
- [ ] `src/pages/articles/` 삭제, `src/app/app.tsx`가 그릴 첫 페이지로 바꾼다
- [ ] `e2e/specs/articles.spec.ts` · `e2e/pom/articles-page.ts`를 새 화면에 맞게 바꾸거나 지운다(`e2e/fixtures/index.ts`의 픽스처도 같이)
- [ ] 테스트·스토리가 0개가 되면 `pnpm test`·`pnpm test:stories:all`이 실패한다. 첫 테스트·스토리를 같이 넣는다
- [ ] `src/shared/api`·`src/shared/lib`·`src/shared/test`는 도메인과 무관하니 남긴다

계약 스냅샷

- [ ] `contracts/openapi.json`을 우리 백엔드 계약으로 바꾸고 `pnpm gen:api`
- [ ] 백엔드 계약이 없으면 `contracts/`·`gen:api` 스크립트·`src/shared/api/generated.ts`를 지우고, `shared/api`의 `paths`·`components` 타입을 손으로 쓴 타입으로 바꾼다. CI의 `contract` 단계도 지운다
- [ ] `vite.config.ts`의 `/api` proxy 주소를 백엔드 로컬 포트로 바꾼다
- [ ] 검증 명령으로 확인
