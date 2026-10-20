import type { Page } from "@playwright/test";

// 기사 목록 화면의 Page Object. 위치(locator)와 이동만 둔다 — 단언은 spec 이 한다.
export const createArticlesPage = (page: Page) => ({
  goto: () => page.goto("/"),
  item: (text: string) => page.getByText(text),
});

export type ArticlesPage = ReturnType<typeof createArticlesPage>;
