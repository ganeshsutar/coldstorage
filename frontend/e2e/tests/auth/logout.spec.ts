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

    // Find and click the logout button/link
    const logoutButton = page.getByRole("button", { name: /logout|sign out/i });
    const logoutMenuItem = page.getByRole("menuitem", { name: /logout|sign out/i });

    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();
    } else if (await logoutMenuItem.isVisible().catch(() => false)) {
      await logoutMenuItem.click();
    } else {
      // Try opening user menu first
      const userMenu = page.getByRole("button", { name: /user|account|profile/i });
      if (await userMenu.isVisible().catch(() => false)) {
        await userMenu.click();
        await page.getByText(/logout|sign out/i).first().click();
      }
    }

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

    // Trigger logout via navigation or API
    const logoutButton = page.getByRole("button", { name: /logout|sign out/i });
    const logoutMenuItem = page.getByRole("menuitem", { name: /logout|sign out/i });

    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();
    } else if (await logoutMenuItem.isVisible().catch(() => false)) {
      await logoutMenuItem.click();
    } else {
      const userMenu = page.getByRole("button", { name: /user|account|profile/i });
      if (await userMenu.isVisible().catch(() => false)) {
        await userMenu.click();
        await page.getByText(/logout|sign out/i).first().click();
      }
    }

    await page.waitForURL(`**${AUTH_ROUTES.login}`, { timeout: 10000 });

    const authAfter = await page.evaluate(() =>
      localStorage.getItem("cold-storage-auth-user")
    );
    expect(authAfter).toBeNull();
  });
});
