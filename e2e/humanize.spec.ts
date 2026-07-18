import { test, expect } from "@playwright/test";

test("paste text -> humanize -> copy output -> save to library", async ({ page }) => {
  await page.goto("/dashboard/humanize?e2e=true");

  const textarea = page.locator("textarea");
  await expect(textarea).toBeVisible();

  const testText =
    "The utilization of AI technology has increased significantly in recent years. Many studies demonstrate its effectiveness.";
  await textarea.fill(testText);

  await page.getByRole("button", { name: "Humanize Text" }).click();

  // Output populated: the AI-detection meter only renders once scores return.
  await expect(page.getByText("AI Detection Score")).toBeVisible({ timeout: 15000 });

  const copyBtn = page.getByRole("button", { name: "Copy", exact: true });
  await expect(copyBtn).toBeVisible();
  await copyBtn.click();
  await expect(page.getByText("Copied")).toBeVisible();

  // Open the save modal and store the document.
  await page.getByRole("button", { name: "Save", exact: true }).click();
  const nameInput = page.getByPlaceholder("e.g. Sociology Thesis Revision");
  await expect(nameInput).toBeVisible();
  await nameInput.fill("E2E Test Document");
  await page.getByRole("button", { name: "Save Document" }).click();
  await expect(page.getByText("Saved Successfully")).toBeVisible();

  // Verify it now appears in the saved library.
  await page.goto("/dashboard/documents?e2e=true");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.getByText("E2E Test Document")).toBeVisible();
});
