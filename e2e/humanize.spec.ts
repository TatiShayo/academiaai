import { test, expect } from "@playwright/test";

test("paste text → humanize → copy output → save to library", async ({ page }) => {
  await page.goto("/dashboard/humanize?e2e=true");

  const textarea = page.locator("textarea");
  await expect(textarea).toBeVisible();

  const testText = "The utilization of AI technology has increased significantly in recent years. Many studies demonstrate its effectiveness.";
  await textarea.fill(testText);

  await page.getByRole("button", { name: "Humanize", exact: true }).click();

  await expect(page.locator("text=words humanized")).toBeVisible({ timeout: 10000 });

  const copyBtn = page.getByRole("button", { name: "Copy output" });
  await expect(copyBtn).toBeVisible();
  await copyBtn.click();
  await expect(page.getByText("Copied!")).toBeVisible();

  const nameInput = page.getByPlaceholder("Document name...");
  await expect(nameInput).toBeVisible();
  await nameInput.fill("E2E Test Document");
  await page.getByRole("button", { name: "Save to documents" }).click();
  await expect(page.getByText("Saved!")).toBeVisible();

  await page.goto("/dashboard/documents?e2e=true");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.getByText("E2E Test Document")).toBeVisible();
});
