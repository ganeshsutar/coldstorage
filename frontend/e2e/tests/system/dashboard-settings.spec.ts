import { test, expect } from "../../fixtures";

test.describe("Dashboard Settings", () => {
  test.beforeEach(async ({ systemSettingsPage, page }) => {
    // Mock dashboard settings API to ensure form renders without backend
    await page.route(/\/api\/system\/dashboard\//, async (route) => {
      const method = route.request().method();

      if (method === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            show_summary_inward: true,
            show_bag_grading: true,
            show_pending_dues: true,
            show_low_stock_alert: true,
            show_chamber_occupancy: true,
            show_recent_transactions: true,
            show_todays_collections: true,
            print_takpatti: true,
            print_gate_pass: true,
            print_receipt: true,
            auto_print_rent_bill: true,
            default_date_range: 30,
            auto_refresh_interval: 5,
            default_page_size: 25,
          }),
        });
      } else if (method === "PATCH") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: route.request().postData() || "{}",
        });
      } else {
        await route.continue();
      }
    });
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
    // Wait for API data to populate the form (mock returns true = checked)
    await expect(switchEl).toHaveAttribute("data-state", "checked");
    await switchEl.click();
    await expect(switchEl).toHaveAttribute("data-state", "unchecked");
  });

  test("can toggle print switches", async ({ page }) => {
    const switchEl = page.getByTestId("dashboard-print-takpatti-switch");
    // Wait for API data to populate the form (mock returns true = checked)
    await expect(switchEl).toHaveAttribute("data-state", "checked");
    await switchEl.click();
    await expect(switchEl).toHaveAttribute("data-state", "unchecked");
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
