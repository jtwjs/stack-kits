import { expect, test } from "../fixtures";

test("기사 목록이 보인다", async ({ page, articlesPage }) => {
  await page.route("**/api/articles", (route) =>
    route.fulfill({
      json: [{ id: 1, title: "첫 기사", status: "DRAFT", publishedAt: null }],
    }),
  );
  await articlesPage.goto();
  await expect(articlesPage.item("첫 기사")).toBeVisible();
  await expect(articlesPage.item("초안")).toBeVisible();
});
