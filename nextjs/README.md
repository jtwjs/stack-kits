# nextjs kit

Next.js 16 App Router 보일러플레이트. React 19 · Node 24 · pnpm · Tailwind 4. 서버가 없는 단일 kit이다. 서버 계약 타입까지 필요하면 `fullstack/` kit을 쓴다.

```bash
pnpm install
pnpm dev
```

## 검증 명령

| 단계      | 명령                | 비고                                                                               |
| --------- | ------------------- | ---------------------------------------------------------------------------------- |
| format    | `pnpm format:check` | 고치기는 `pnpm format`                                                             |
| lint      | `pnpm lint`         |                                                                                    |
| typecheck | `pnpm typecheck`    | `next typegen`을 먼저 돌려 `.next` 없이도 된다                                     |
| test      | `pnpm test`         | Vitest + Testing Library. `asyncUtilTimeout` 4초(`vitest.setup.ts`)                |
| build     | `pnpm build`        |                                                                                    |
| e2e       | `pnpm test:e2e`     | 브라우저 설치 필요(`pnpm exec playwright install chromium`). verify 밖, CI 별도 잡 |

설치는 `pnpm install --frozen-lockfile`(CI와 같다).

## 예시 도메인(article) 제거 체크리스트

- [ ] `src/lib/article-status.ts` · `src/lib/article-status.test.ts` 삭제
- [ ] `src/components/status-badge.tsx` · `src/components/status-badge.test.tsx` 삭제
- [ ] `src/app/page.tsx`에서 `StatusBadge` import와 사용처 제거
- [ ] `e2e/home.spec.ts`의 "초안" 단언을 새 홈 화면에 맞게 바꾼다
- [ ] 테스트 파일이 0개가 되면 `vitest run`이 실패한다. 첫 테스트를 같이 넣는다
- [ ] `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build`로 확인

## ESLint 9에 머무는 이유 (2026-10-08)

`eslint-config-next`가 끌어오는 `eslint-plugin-react`(7.37.5) · `eslint-plugin-jsx-a11y`(6.10.2) · `eslint-plugin-import`(2.32.0)는 최신판도 peer가 ESLint 9까지다. ESLint 10으로 올리면 `react/display-name` 규칙이 ESLint 10에서 없어진 `context.getFilename()`을 불러 lint 자체가 깨진다(실측).

세 플러그인이 ESLint 10을 peer에 넣으면 `pnpm add -D eslint@^10`으로 올린다. `fullstack` kit은 이 플러그인들을 쓰지 않아 ESLint 10이다.

