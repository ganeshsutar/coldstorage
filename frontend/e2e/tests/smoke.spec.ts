import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Smoke tests", () => {
  test("app loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ColdVault|Cold Storage/i);
  });

  test("login page renders with form elements", async ({ page }) => {
    await page.goto("/auth/login");

    await expect(page.getByTestId("login-email-input")).toBeVisible();
    await expect(page.getByTestId("login-password-input")).toBeVisible();
    await expect(page.getByTestId("login-submit-button")).toBeVisible();
  });
});
