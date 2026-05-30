import { test, expect } from "@playwright/test";

test("paste text → humanize → copy output", async ({ page }) => {
  await page.goto("/dashboard/humanize?e2e=true");

  await page.screenshot({ path: "test-results/debug.png", fullPage: true });
  console.log("Page URL:", page.url());
  console.log("Page content:", await page.textContent("body"));

  const textarea = page.locator("textarea");
  await expect(textarea).toBeVisible();

  const testText = "The utilization of AI technology has increased significantly in recent years.";
  await textarea.fill(testText);

  await page.getByRole("button", { name: "Humanize", exact: true }).click();

  await expect(page.getByText("Original")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Humanized")).toBeVisible();

  const copyBtn = page.getByRole("button", { name: "Copy output" });
  await expect(copyBtn).toBeVisible();
  await copyBtn.click();

  await expect(page.getByText("Copied!")).toBeVisible();

  await page.goto("/dashboard/documents?e2e=true");
  await expect(page.locator("h1")).toBeVisible();
});
