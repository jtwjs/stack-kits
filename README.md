# stack-kits

새 프로젝트의 코드 뼈대다. 디렉터리 하나가 kit 하나이고, kit마다 CI에서 스스로 초록이어야 한다. AI 작업 환경(`CLAUDE.md`, `.claude/rules`, 훅, CI 게이트)은 여기 없고 claude-harness가 맡는다.

## 세 레포의 관계

```
새 맥       claude-dotfiles  ./sync.sh  →  ~/.claude 설정 + 플러그인 자동 설치(claude-harness 포함)
새 프로젝트  /project-new  →  stack-kits 코드 뼈대(degit)  →  /harness-init
기존 레포    /harness-init
```

| 레포 | 맡는 것 | 어디에 남나 | |
|---|---|---|---|
| [claude-dotfiles](https://github.com/jtwjs/claude-dotfiles) | 내 맥의 Claude Code 환경: 전역 CLAUDE.md, 상태줄, 플러그인 목록, 개인 스킬 | `~/.claude/` | |
| [claude-harness](https://github.com/jtwjs/claude-harness) | 레포에서 AI와 일하는 방식: 스킬, 에이전트, 훅, 템플릿 | 플러그인 + 각 레포의 `.claude/`·`_brain/` | |
| [stack-kits](https://github.com/jtwjs/stack-kits) | 새 프로젝트의 코드 뼈대: kotlin-spring, nextjs, fullstack | 새 레포의 코드 | 📍 지금 여기 |

## 빠른 시작

Claude Code에서는 `/claude-harness:project-new` 한 줄이면 된다. kit와 태그를 레포에서 읽어 고르게 하고, 받은 뒤 `git init`과 `harness-init`까지 돌린다.

손으로 받을 때는 태그를 고정한다. 태그 없이 받으면 받는 날의 main이 들어와 같은 명령이 다른 결과를 낸다.

```bash
npx degit jtwjs/stack-kits/kotlin-spring#v0.2.1 my-api   # 또는 nextjs · fullstack
cd my-api && git init
```

최신 태그는 `gh api repos/jtwjs/stack-kits/tags --jq '.[0].name'`로 확인한다.

## 무엇이 들었나

| kit | 스택 | 들어 있는 것 |
|---|---|---|
| `kotlin-spring/` | Spring Boot 4.1 · Kotlin 2.3 · JDK 21 · MySQL 8.4 | Flyway `V1` + `ddl-auto: validate`, `compose.yaml`(bootRun 때 자동 기동), 로컬 SQL·바인딩 로그, 운영 JSON 로그 + `X-Request-Id`, springdoc → `contracts/openapi.json` 스냅샷 테스트, Kotlin non-null → `required` 변환기, Testcontainers 통합 테스트, MockK 단위 테스트, ArchUnit 레이어 규칙, ktlint, `http/*.http` |
| `nextjs/` | Next.js 16 (App Router) · React 19 · Node 24 · pnpm | Tailwind 4, Vitest + Testing Library, Playwright E2E, ESLint 9, Prettier, `typecheck` 스크립트 |
| `fullstack/` | `apps/api`(kotlin-spring과 같은 스택) + `apps/web`(React 19 · Vite · TypeScript · Node 24 · pnpm) | 계약 파이프라인 `openapi.json` → `openapi-typescript` → `openapi-fetch` + `unwrap()`(ProblemDetail → `ApiError`), FSD 레이아웃과 ESLint 10 레이어 규칙, vite proxy 같은 출처, 시간대 명시 포맷, 모노레포 CI(api · web · contract · ci-gate) |

## 어떻게 도나

예시 도메인은 모두 기사(article) 하나다. 초안 작성 → 조회 → 발행으로 흐르고, 이미 발행된 기사를 다시 발행하면 409다. 레이어, 마이그레이션, 상태 전이, 계약이 한 흐름에 다 나온다. 새 프로젝트에서는 지우고 시작하고, 지울 파일 목록은 kit README의 체크리스트에 있다.

검증 명령은 kit마다 README에 표로 있다. degit으로 kit 폴더만 받아도 그대로 쓴다.

- [kotlin-spring](kotlin-spring/README.md#검증-명령)
- [nextjs](nextjs/README.md#검증-명령)
- [fullstack](fullstack/README.md#검증-명령)

## 원칙·안전장치

- kit에는 `.claude/`를 넣지 않는다. 단 `nextjs/AGENTS.md`의 `nextjs-agent-rules` 블록은 `next dev`가 다시 써 넣는 Next 공식 안내라 그대로 둔다.
- web과 server를 함께 쓰면 `fullstack` kit 하나로 받는다. 단일 kit 두 개를 한 폴더에 겹치면 kit마다 `git init`이 돌아 레포 안에 레포가 생긴다.
- 버전은 안정판(GA)만 쓴다. 의존성은 Dependabot이 주 1회 올린다.

## 관리자용

- kit를 바꿔 루트 CI(`.github/workflows/ci.yml`)가 초록이면 태그를 올린다. 태그가 곧 degit ref이고, claude-harness의 `project-new`는 최신 태그를 제안한다.
- 태그 형식은 `vMAJOR.MINOR.PATCH`다(지금 v0.2.0, v0.2.1).
- kit에 스택 규칙을 실측으로 추가하면 claude-harness의 스택 팩(`templates/stacks/`)도 같이 맞춘다. 팩 규칙은 kit에서 실측한 것으로 쓴다.
