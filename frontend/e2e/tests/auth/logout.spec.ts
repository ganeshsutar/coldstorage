import { test, expect } from "@playwright/test";
import { AUTH_ROUTES } from "../../helpers";

test.describe("Logout & Session", () => {
  test("authenticated user can access dashboard", async ({ page }) => {
    await page.goto(AUTH_ROUTES.dashboard);
    await expect(page).toHaveURL(new RegExp(AUTH_ROUTES.dashboard));
  });

  test("after logout, user is redirected to login", async ({ page }) => {
    await page.goto(AUTH_ROUTES.dashboard);
    await expect(page).toHaveURL(new RegExp(AUTH_ROUTES.dashboard));

    // Open user menu
    await page.getByTestId("sidebar-user-button").click();

    // Click logout
    await page.getByTestId("sidebar-logout-menuitem").click();

    await page.waitForURL(`**${AUTH_ROUTES.login}`, { timeout: 10000 });
    await expect(page).toHaveURL(new RegExp(AUTH_ROUTES.login));
  });

  test("after logout, localStorage auth is cleared", async ({ page }) => {
    await page.goto(AUTH_ROUTES.dashboard);
    await expect(page).toHaveURL(new RegExp(AUTH_ROUTES.dashboard));

    // Check auth exists before logout
    const authBefore = await page.evaluate(() =>
      localStorage.getItem("cold-storage-auth-user")
    );
    expect(authBefore).toBeTruthy();

    // Open user menu
    await page.getByTestId("sidebar-user-button").click();

    // Click logout
    await page.getByTestId("sidebar-logout-menuitem").click();

    await page.waitForURL(`**${AUTH_ROUTES.login}`, { timeout: 10000 });

    const authAfter = await page.evaluate(() =>
      localStorage.getItem("cold-storage-auth-user")
    );
    expect(authAfter).toBeNull();
  });
});
