# stack-kits

새 프로젝트의 **코드 뼈대**. 디렉터리 하나가 kit 하나이고, kit마다 CI에서 스스로 초록이어야 한다.

AI 작업 환경(`CLAUDE.md`·`.claude/rules`·훅·CI 게이트)은 여기 없다. 정본은 [claude-harness](https://github.com/jtwjs/claude-harness)의 스택 팩이고, 새 프로젝트를 만든 뒤 `harness-init`이 실제로 돌려 본 명령으로 채운다.

## 쓰는 법

```bash
npx degit jtwjs/stack-kits/kotlin-spring my-api   # 또는 nextjs · fullstack
cd my-api && git init
# Claude Code 에서: /claude-harness:harness-new 를 쓰면 위 두 줄 + harness-init 을 한 번에
```

## kit

| kit | 스택 | 들어 있는 것 |
|---|---|---|
| `kotlin-spring/` | Spring Boot 4.1 · Kotlin 2.3 · JDK 21 · MySQL 8.4 | Flyway `V1` + `ddl-auto: validate` · `compose.yaml`(bootRun 때 자동 기동) · 로컬 SQL·바인딩 로그 · 운영 JSON 로그 + `X-Request-Id` · springdoc → `contracts/openapi.json` 스냅샷 테스트 · Kotlin non-null → `required` 변환기 · Testcontainers 통합 테스트 · MockK 단위 테스트 · ArchUnit 레이어 규칙 · ktlint · `http/*.http` |
| `nextjs/` | Next.js 16 (App Router) · React 19 · Node 24 · pnpm | Tailwind 4 · Vitest + Testing Library · Playwright E2E · ESLint · Prettier · `typecheck` 스크립트 |
| `fullstack/` | `apps/api`(kotlin-spring과 같은 스택) + `apps/web`(React 19 · Vite · TypeScript · Node 24 · pnpm) | 계약 파이프라인 `openapi.json` → `openapi-typescript` → `openapi-fetch` + `unwrap()`(ProblemDetail → `ApiError`) · FSD 레이아웃과 ESLint 레이어 규칙 · vite proxy 같은 출처 · 시간대 명시 포맷 · 모노레포 CI(api · web · contract · ci-gate) |

예시 도메인은 모두 **기사(article)** 하나다: 초안 작성 → 조회 → 발행, 이미 발행이면 409. 레이어·마이그레이션·상태 전이·계약이 한 흐름에 다 나온다. 새 프로젝트에서는 지우고 시작한다. 지울 파일 목록은 kit README의 체크리스트에 있다.

## 검증 명령

kit마다 README에 표가 있다. degit으로 kit 폴더만 받아도 그대로 쓴다.

- [kotlin-spring](kotlin-spring/README.md#검증-명령)
- [nextjs](nextjs/README.md#검증-명령)
- [fullstack](fullstack/README.md#검증-명령)

## 원칙

- kit에는 `.claude/`를 넣지 않는다. 단 `nextjs/AGENTS.md`의 `nextjs-agent-rules` 블록은 `next dev`가 다시 써 넣는 Next 공식 안내라 그대로 둔다.
- 버전은 안정판(GA)만. 의존성은 Dependabot이 주 1회 올린다.
