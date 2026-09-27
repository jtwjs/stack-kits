# stack-kits

새 프로젝트의 **코드 뼈대**. 디렉터리 하나가 kit 하나이고, kit마다 CI에서 스스로 초록이어야 한다.

AI 작업 환경(`CLAUDE.md`·`.claude/rules`·훅·CI 게이트)은 여기 없다. 정본은 [claude-harness](https://github.com/jtwjs/claude-harness)의 스택 팩이고, 새 프로젝트를 만든 뒤 `harness-init`이 실제로 돌려 본 명령으로 채운다.

## 쓰는 법

```bash
npx degit jtwjs/stack-kits/kotlin-spring my-api   # 또는 nextjs
cd my-api && git init
# Claude Code 에서: /claude-harness:harness-new 를 쓰면 위 두 줄 + harness-init 을 한 번에
```

## kit

| kit | 스택 | 들어 있는 것 |
|---|---|---|
| `kotlin-spring/` | Spring Boot 4.1 · Kotlin 2.3 · JDK 21 · MySQL 8.4 | Flyway `V1` + `ddl-auto: validate` · `compose.yaml`(bootRun 때 자동 기동) · 로컬 SQL·바인딩 로그 · 운영 JSON 로그 + `X-Request-Id` · springdoc → `contracts/openapi.json` 스냅샷 테스트 · Kotlin non-null → `required` 변환기 · Testcontainers 통합 테스트 · MockK 단위 테스트 · ArchUnit 레이어 규칙 · ktlint · `http/*.http` |
| `nextjs/` | Next.js 16 (App Router) · React 19 · Node 24 · pnpm | Tailwind 4 · Vitest + Testing Library · Playwright E2E · ESLint · Prettier · `typecheck` 스크립트 |

예시 도메인은 둘 다 **기사(article)** 하나다: 초안 작성 → 조회 → 발행, 이미 발행이면 409. 레이어·마이그레이션·상태 전이·계약이 한 흐름에 다 나온다. 새 프로젝트에서는 지우고 시작한다.

## 검증 명령

| kit | format | lint | typecheck | test | build |
|---|---|---|---|---|---|
| kotlin-spring | `./gradlew ktlintCheck` | — (detekt는 Kotlin 2.3 안정판 미지원) | `./gradlew compileKotlin compileTestKotlin` | `./gradlew test` (Docker 필요) | `./gradlew build -x test` |
| nextjs | `pnpm format:check` | `pnpm lint` | `pnpm typecheck` | `pnpm test` | `pnpm build` |

- `./gradlew build -x test`를 `test`와 한 명령에 섞지 않는다. `-x`는 그래프 전체에서 test를 뺀다.
- API를 바꿨으면 `UPDATE_CONTRACTS=1 ./gradlew test --tests '*OpenApiContractTest'`로 `contracts/openapi.json`을 다시 쓰고 같이 커밋한다.

## 원칙

- kit에는 `.claude/`를 넣지 않는다. 단 `nextjs/AGENTS.md`의 `nextjs-agent-rules` 블록은 `next dev`가 다시 써 넣는 Next 공식 안내라 그대로 둔다.
- 버전은 안정판(GA)만. 의존성은 Dependabot이 주 1회 올린다.
