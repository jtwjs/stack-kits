import { test as base } from "@playwright/test";
import { type ArticlesPage, createArticlesPage } from "../pom/articles-page";

// spec 은 @playwright/test 대신 여기서 test·expect 를 받는다. Page Object 는 픽스처로 주입한다.
// 두 번째 인자 이름을 use 로 두면 react-hooks 규칙이 훅으로 오인한다 — provide 로 쓴다.
type Fixtures = { articlesPage: ArticlesPage };

export const test = base.extend<Fixtures>({
  articlesPage: async ({ page }, provide) => {
    await provide(createArticlesPage(page));
  },
});

export { expect } from "@playwright/test";
