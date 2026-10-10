# stack-kits

새 프로젝트의 코드 뼈대다. 디렉터리 하나가 kit 하나다. AI 작업 환경(`CLAUDE.md`, `.claude/`, 훅)은 claude-harness가 맡는다.

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

Claude Code에서는 `/claude-harness:project-new`를 쓴다. 손으로 받을 때는 태그를 고정한다.

```bash
npx degit jtwjs/stack-kits/kotlin-spring#v0.2.1 my-api   # 또는 nextjs · fullstack
cd my-api && git init
```

최신 태그는 `gh api repos/jtwjs/stack-kits/tags --jq '.[0].name'`로 확인한다.

## 무엇이 들었나

| kit | 스택 | 특징 |
|---|---|---|
| `kotlin-spring/` | Spring Boot 4.1 · Kotlin 2.3 · JDK 21 · MySQL 8.4 | Flyway, OpenAPI 계약 스냅샷 테스트, Testcontainers, ArchUnit 레이어 규칙 |
| `nextjs/` | Next.js 16 (App Router) · React 19 · Node 24 · pnpm | Tailwind 4, Vitest, Playwright E2E |
| `fullstack/` | `apps/api`(kotlin-spring과 같은 스택) + `apps/web`(React 19 · Vite · Node 24 · pnpm) | OpenAPI 계약 → 생성 타입 파이프라인, FSD 레이어 규칙, 모노레포 CI |

## 어떻게 도나

예시 도메인은 기사(article) 하나다. 새 프로젝트에서는 kit README의 제거 체크리스트대로 지운다.

검증 명령은 kit README에 있다: [kotlin-spring](kotlin-spring/README.md#검증-명령) · [nextjs](nextjs/README.md#검증-명령) · [fullstack](fullstack/README.md#검증-명령)

## 원칙·안전장치

- kit에는 `.claude/`를 넣지 않는다. `nextjs/AGENTS.md`의 `nextjs-agent-rules` 블록은 예외다(`next dev`가 다시 써 넣는다).
- web과 server를 같이 쓰면 `fullstack` 하나로 받는다. 단일 kit 두 개를 겹치면 레포 안에 레포가 생긴다.
- 버전은 안정판(GA)만 쓴다. 의존성은 Dependabot이 올린다.

## 관리자용

- kit를 바꿔 루트 CI(`.github/workflows/ci.yml`의 `ci-gate`)가 초록이면 `vMAJOR.MINOR.PATCH` 태그를 올린다.
- kit에 스택 규칙을 추가하면 claude-harness `templates/stacks/`도 맞춘다.
