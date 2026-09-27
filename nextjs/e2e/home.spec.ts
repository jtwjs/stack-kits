import { expect, test } from "@playwright/test";

test("홈에 기사 상태 뱃지가 보인다", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("초안")).toBeVisible();
});
