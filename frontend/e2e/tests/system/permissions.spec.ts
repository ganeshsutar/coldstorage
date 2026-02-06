import { test, expect } from "../../fixtures";

test.describe("Permissions", () => {
  test.beforeEach(async ({ systemSettingsPage }) => {
    await systemSettingsPage.goto();
    await systemSettingsPage.switchToTab("permissions");
  });

  test("permission matrix renders with table", async ({ page }) => {
    const table = page.getByTestId("permission-table");
    await expect(table).toBeVisible();
  });

  test("save permissions button exists and is visible", async ({ page }) => {
    const saveButton = page.getByTestId("permission-save-button");
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeEnabled();
  });

  test("permission categories are displayed", async ({ page }) => {
    await expect(page.getByText("Basic Permissions")).toBeVisible();
    await expect(page.getByText("Module Access")).toBeVisible();
    await expect(page.getByText("Special Permissions")).toBeVisible();
  });

  test("permission rows include expected labels", async ({ page }) => {
    await expect(page.getByText("Add Records")).toBeVisible();
    await expect(page.getByText("Modify Records")).toBeVisible();
    await expect(page.getByText("Delete Records")).toBeVisible();
    await expect(page.getByText("Inventory")).toBeVisible();
    await expect(page.getByText("Billing")).toBeVisible();
  });

  test("checkboxes are interactive", async ({ page }) => {
    const table = page.getByTestId("permission-table");
    const firstCheckbox = table.locator('button[role="checkbox"]').first();
    await expect(firstCheckbox).toBeVisible();

    // Toggle the checkbox
    const initialState = await firstCheckbox.getAttribute("data-state");
    await firstCheckbox.click();
    const newState = await firstCheckbox.getAttribute("data-state");
    expect(newState).not.toBe(initialState);
  });
});
