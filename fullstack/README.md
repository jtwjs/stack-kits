# fullstack kit

웹+서버 모노레포. `apps/api`(Spring Boot 4.1 · Kotlin 2.3 · JDK 21 · MySQL 8.4)와 `apps/web`(React 19 · Vite · TypeScript · Node 24 · pnpm)이 OpenAPI 계약 하나로 묶인다.

```
compose.yaml              로컬 MySQL. apps/api 의 bootRun 이 자동 기동
apps/api/                 kotlin-spring kit 과 같은 뼈대 + 목록 API(GET /api/articles)
apps/web/                 FSD: src/{app,pages,widgets,features,entities,shared}
.github/workflows/ci.yml  degit 후 레포 루트가 되는 전제의 CI (api · web · web-stories · contract · ci-gate)
```

## 로컬 기동

```bash
cd apps/api && ./gradlew bootRun   # :8080. Docker 가 떠 있으면 ../../compose.yaml 의 MySQL 을 자동 기동
cd apps/web && pnpm install && pnpm dev   # :5173. /api 는 vite proxy 가 :8080 으로 넘긴다
```

같은 출처로 붙는다: 브라우저는 `/api/...`만 부르고 dev에서는 vite proxy가, 운영에서는 리버스 프록시가 api로 넘긴다. 그래서 api에 CORS 설정이 없다.

## 계약 파이프라인

```
apps/api 코드 ──(OpenApiContractTest)──▶ apps/api/contracts/openapi.json ──(pnpm gen:api)──▶ apps/web/src/shared/api/generated.ts
```

1. API를 바꾸면 `apps/api`에서 `UPDATE_CONTRACTS=1 ./gradlew test --tests '*OpenApiContractTest'`로 스냅샷을 다시 쓴다. 스냅샷이 코드와 다르면 `./gradlew test`가 실패한다.
2. `apps/web`에서 `pnpm gen:api`로 타입을 다시 만든다. 생성 타입이 스냅샷과 다르면 CI `contract` 잡이 실패한다.
3. 스냅샷과 생성 타입을 같은 커밋에 넣는다.

화면 코드는 `generated.ts`의 타입만 쓴다(손으로 쓴 응답 타입 없음). 호출은 `shared/api/client.ts`의 `api`(openapi-fetch)를 `unwrap()`으로 감싼다. 실패 응답의 ProblemDetail은 `ApiError(status, detail)`로 바뀐다. 에러 응답은 api 컨트롤러의 `@ApiResponse(ProblemDetail)`로 계약에 드러난다.

## 검증 명령

### apps/api

| 단계 | 명령 | 비고 |
|---|---|---|
| format | `./gradlew ktlintCheck` | 고치기는 `./gradlew ktlintFormat` |
| lint | — | detekt는 Kotlin 2.3 안정판 미지원 |
| typecheck | `./gradlew compileKotlin compileTestKotlin` | |
| test | `./gradlew test` | Docker 필요(Testcontainers MySQL). 계약 스냅샷 테스트 포함 |
| build | `./gradlew build -x test` | test와 한 명령에 섞지 않는다 |
| e2e | — | |

JDK 21이 필요하다. 기본 java가 다르면 `JAVA_HOME`을 21로 지정한다.

### apps/web

| 단계 | 명령 | 비고 |
|---|---|---|
| format | `pnpm format:check` | `generated.ts`는 제외 |
| lint | `pnpm lint` | FSD 레이어 방향, 픽스처·MSW 핸들러는 `*.test.*`·`*.stories.*`·`*.msw.*`에서만, JSX 속성에 여러 줄 화살표 금지 |
| typecheck | `pnpm typecheck` | |
| test | `pnpm test` | Vitest `unit` 프로젝트(jsdom, 브라우저 없음). API는 MSW(`src/shared/test/server.ts`). `asyncUtilTimeout` 4초 |
| stories | `pnpm test:stories` | Vitest `storybook` 프로젝트(chromium). `--changed`: 바뀐 파일을 import 하는 스토리만. `.storybook/`이 바뀌면 전부. 전체는 `pnpm test:stories:all`. verify 밖 |
| build | `pnpm build` | |
| e2e | `pnpm test:e2e` | 브라우저 설치 필요(`pnpm exec playwright install chromium`). api는 `page.route`로 고정. verify 밖 |
| 한 번에 | `pnpm verify` | format:check → lint → typecheck → test → build |
| 계약 | `pnpm gen:api && git diff --exit-code src/shared/api/generated.ts` | CI `contract` 잡과 같다 |

설치는 `pnpm install --frozen-lockfile`(CI와 같다). Storybook 화면은 `pnpm storybook`(:6006), 정적 빌드는 `pnpm build-storybook`.

### 테스트 자리 (apps/web)

| 무엇 | 어디서 | 메모 |
|---|---|---|
| `model`·`lib` 계산 | Vitest unit (`*.test.ts`) | 순수 함수. 렌더 없음 |
| `shared/ui`·`entities/ui` | Storybook (`ui/<module>/<module>.stories.tsx`) | 상태별 스토리. 상호작용이 있을 때만 `play` |
| `features` 흐름 | Vitest + Testing Library + MSW | 기능 하나에 하나. `renderWithProviders`(`src/shared/test/render.tsx`)로 그린다 |
| `pages` 여정 | Playwright (`e2e/specs/`) | 몇 개만. `e2e/fixtures`의 `test`·`expect`와 `e2e/pom/`의 Page Object를 쓴다 |

로그인이 생기면 `e2e/setup/`에 storageState를 만드는 setup 프로젝트를 두고 `playwright.config.ts`의 `dependencies`로 건다. kit에는 인증이 없어 두지 않았다.

## 예시 도메인(article) 제거 체크리스트

apps/api
- [ ] `apps/api/src/main/kotlin/dev/stackkits/app/article/` 삭제 (`Article.kt` · `ArticleController.kt` · `ArticleDtos.kt` · `ArticleRepository.kt` · `ArticleService.kt`)
- [ ] `apps/api/src/test/kotlin/dev/stackkits/app/article/` 삭제 (`ArticleApiTest.kt` · `ArticleServiceTest.kt`). `X-Request-Id` 단언은 첫 API 테스트로 옮긴다
- [ ] `apps/api/src/main/resources/db/migration/V1__create_article.sql` 삭제 후 첫 테이블로 `V1__*.sql`을 새로 쓴다 (적용된 적 없을 때만)
- [ ] `apps/api/http/article.http` 삭제
- [ ] 스냅샷 재생성: `UPDATE_CONTRACTS=1 ./gradlew test --tests '*OpenApiContractTest'`
- [ ] `ErrorHandler.kt` · `ArchitectureTest.kt`는 고칠 것 없음

apps/web
- [ ] `apps/web/src/entities/article/` 삭제 (fixtures · `article.msw.ts` · 스토리 포함)
- [ ] `apps/web/src/pages/articles/` 삭제, `src/app/app.tsx`가 그릴 첫 페이지로 바꾼다
- [ ] `pnpm gen:api`로 `generated.ts` 재생성
- [ ] `apps/web/e2e/specs/articles.spec.ts` · `e2e/pom/articles-page.ts`를 새 화면에 맞게 바꾸거나 지운다(`e2e/fixtures/index.ts`의 픽스처도 같이)
- [ ] 스토리가 0개가 되면 `pnpm test:stories:all`이 실패한다. 첫 스토리를 같이 넣는다
- [ ] `src/shared/api`·`src/shared/lib`·`src/shared/test`는 도메인과 무관하니 남긴다
- [ ] 양쪽 검증 명령으로 확인
