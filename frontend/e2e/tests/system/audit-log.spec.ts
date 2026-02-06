import { test, expect } from "../../fixtures";

test.describe("Audit Log", () => {
  test.beforeEach(async ({ systemSettingsPage, page }) => {
    // Mock the audit log API to ensure the component renders
    // regardless of backend availability
    await page.route(/\/api\/system\/audit-log\//, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });
    await systemSettingsPage.goto();
    await systemSettingsPage.switchToTab("audit");
  });

  test("audit log renders with filter controls", async ({ page }) => {
    const searchInput = page.getByTestId("audit-search-input");
    const userFilter = page.getByTestId("audit-user-filter");
    const actionFilter = page.getByTestId("audit-action-filter");
    const moduleFilter = page.getByTestId("audit-module-filter");

    await expect(searchInput).toBeVisible();
    await expect(userFilter).toBeVisible();
    await expect(actionFilter).toBeVisible();
    await expect(moduleFilter).toBeVisible();
  });

  test("date range inputs are visible", async ({ page }) => {
    const fromDate = page.getByTestId("audit-from-date-input");
    const toDate = page.getByTestId("audit-to-date-input");

    await expect(fromDate).toBeVisible();
    await expect(toDate).toBeVisible();
  });

  test("activity table renders or shows empty state", async ({ page }) => {
    const table = page.getByTestId("audit-log-table");
    const empty = page.getByTestId("audit-log-empty");

    const tableVisible = await table.isVisible().catch(() => false);
    const emptyVisible = await empty.isVisible().catch(() => false);

    // One of them should be visible
    expect(tableVisible || emptyVisible).toBe(true);
  });

  test("search input is interactive", async ({ page }) => {
    const searchInput = page.getByTestId("audit-search-input");
    await searchInput.fill("test search");
    await expect(searchInput).toHaveValue("test search");
  });

  test("filter controls are interactive", async ({ page }) => {
    const userFilter = page.getByTestId("audit-user-filter");
    await expect(userFilter).toBeEnabled();

    const actionFilter = page.getByTestId("audit-action-filter");
    await expect(actionFilter).toBeEnabled();

    const moduleFilter = page.getByTestId("audit-module-filter");
    await expect(moduleFilter).toBeEnabled();
  });
});
