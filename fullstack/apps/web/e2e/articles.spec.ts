import { expect, test } from "@playwright/test";

test("기사 목록이 보인다", async ({ page }) => {
  await page.route("**/api/articles", (route) =>
    route.fulfill({
      json: [{ id: 1, title: "첫 기사", status: "DRAFT", publishedAt: null }],
    }),
  );
  await page.goto("/");
  await expect(page.getByText("첫 기사")).toBeVisible();
  await expect(page.getByText("초안")).toBeVisible();
});
