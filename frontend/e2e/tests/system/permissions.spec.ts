import { test, expect } from "../../fixtures";

test.describe("Permissions", () => {
  test.beforeEach(async ({ systemSettingsPage, page }) => {
    const mockUsers = [
      {
        id: "user-1",
        user: {
          id: "u1",
          email: "admin@example.com",
          full_name: "Admin User",
          phone: null,
          avatar_url: null,
          is_active: true,
          last_login_at: null,
          created_at: "2024-01-01T00:00:00Z",
        },
        role: "ADMIN",
        role_display: "Admin",
        status: "ACTIVE",
        status_display: "Active",
        is_default: true,
        permissions: {
          add: true,
          modify: true,
          delete: true,
          print: true,
          change_settings: true,
          inventory: true,
          accounts: true,
          billing: true,
          trading: true,
          bardana: true,
          loans: true,
          payroll: true,
          reports: true,
          system: true,
          backdate_entry: false,
          approve_loans: false,
          year_end_close: false,
          user_management: true,
          multi_room: false,
        },
        loan_per_bag_limit: null,
        backdate_entry_limit: null,
        joined_at: "2024-01-01T00:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "user-2",
        user: {
          id: "u2",
          email: "operator@example.com",
          full_name: "Operator User",
          phone: null,
          avatar_url: null,
          is_active: true,
          last_login_at: null,
          created_at: "2024-01-01T00:00:00Z",
        },
        role: "OPERATOR",
        role_display: "Operator",
        status: "ACTIVE",
        status_display: "Active",
        is_default: false,
        permissions: {
          add: true,
          modify: true,
          delete: false,
          print: true,
          change_settings: false,
          inventory: true,
          accounts: false,
          billing: true,
          trading: false,
          bardana: false,
          loans: false,
          payroll: false,
          reports: false,
          system: false,
          backdate_entry: false,
          approve_loans: false,
          year_end_close: false,
          user_management: false,
          multi_room: false,
        },
        loan_per_bag_limit: null,
        backdate_entry_limit: null,
        joined_at: "2024-01-01T00:00:00Z",
        created_at: "2024-01-01T00:00:00Z",
      },
    ];

    // Mock users list API
    await page.route(/\/api\/system\/users\//, async (route) => {
      const method = route.request().method();
      const url = route.request().url();

      if (method === "GET" && !url.includes("/permissions/")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockUsers),
        });
      } else if (method === "PATCH" && url.includes("/permissions/")) {
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
    const table = page.getByTestId("permission-table");
    await expect(table.getByText("Add Records")).toBeVisible();
    await expect(table.getByText("Modify Records")).toBeVisible();
    await expect(table.getByText("Delete Records")).toBeVisible();
    await expect(table.getByText("Inventory")).toBeVisible();
    await expect(table.getByText("Billing")).toBeVisible();
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
