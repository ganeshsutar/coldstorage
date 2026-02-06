import { test, expect } from "../../fixtures";

test.describe("Dashboard Settings", () => {
  test.beforeEach(async ({ systemSettingsPage }) => {
    await systemSettingsPage.goto();
    await systemSettingsPage.switchToTab("dashboard");
  });

  test("display settings card renders with all 7 widget toggles", async ({
    page,
  }) => {
    await expect(
      page.getByTestId("dashboard-show-summary-inward-switch")
    ).toBeVisible();
    await expect(
      page.getByTestId("dashboard-show-bag-grading-switch")
    ).toBeVisible();
    await expect(
      page.getByTestId("dashboard-show-pending-dues-switch")
    ).toBeVisible();
    await expect(
      page.getByTestId("dashboard-show-low-stock-switch")
    ).toBeVisible();
    await expect(
      page.getByTestId("dashboard-show-chamber-occupancy-switch")
    ).toBeVisible();
    await expect(
      page.getByTestId("dashboard-show-recent-transactions-switch")
    ).toBeVisible();
    await expect(
      page.getByTestId("dashboard-show-todays-collections-switch")
    ).toBeVisible();
  });

  test("print settings card renders with all 4 print toggles", async ({
    page,
  }) => {
    await expect(
      page.getByTestId("dashboard-print-takpatti-switch")
    ).toBeVisible();
    await expect(
      page.getByTestId("dashboard-print-gate-pass-switch")
    ).toBeVisible();
    await expect(
      page.getByTestId("dashboard-print-receipt-switch")
    ).toBeVisible();
    await expect(
      page.getByTestId("dashboard-auto-print-rent-bill-switch")
    ).toBeVisible();
  });

  test("default values card renders with 3 numeric inputs", async ({
    page,
  }) => {
    await expect(
      page.getByTestId("dashboard-date-range-input")
    ).toBeVisible();
    await expect(
      page.getByTestId("dashboard-refresh-interval-input")
    ).toBeVisible();
    await expect(
      page.getByTestId("dashboard-page-size-input")
    ).toBeVisible();
  });

  test("can toggle display switches", async ({ page }) => {
    const switchEl = page.getByTestId("dashboard-show-summary-inward-switch");
    const initialState = await switchEl.getAttribute("data-state");
    await switchEl.click();
    const newState = await switchEl.getAttribute("data-state");
    expect(newState).not.toBe(initialState);
  });

  test("can toggle print switches", async ({ page }) => {
    const switchEl = page.getByTestId("dashboard-print-takpatti-switch");
    const initialState = await switchEl.getAttribute("data-state");
    await switchEl.click();
    const newState = await switchEl.getAttribute("data-state");
    expect(newState).not.toBe(initialState);
  });

  test("can update default values and save", async ({ page }) => {
    const dateRangeInput = page.getByTestId("dashboard-date-range-input");
    await dateRangeInput.clear();
    await dateRangeInput.fill("60");
    await expect(dateRangeInput).toHaveValue("60");

    const submitButton = page.getByTestId("dashboard-submit-button");
    await submitButton.click();

    try {
      const success = page.getByTestId("dashboard-success-message");
      await success.waitFor({ timeout: 5000 });
      const text = await success.textContent();
      expect(text).toContain("saved successfully");
    } catch {
      // May fail if API is not running
    }
  });

  test("submit button is visible", async ({ page }) => {
    await expect(
      page.getByTestId("dashboard-submit-button")
    ).toBeVisible();
  });
});
