import { test, expect } from "@playwright/test";
import { RegisterPage } from "../../page-objects";
import { AUTH_ROUTES } from "../../helpers";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Registration", () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test("register form renders with all expected elements", async () => {
    await expect(registerPage.fullNameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.confirmPasswordInput).toBeVisible();
    await expect(registerPage.submitButton).toBeVisible();
    await expect(registerPage.signInLink).toBeVisible();
  });

  test("password mismatch shows validation error", async ({ page }) => {
    await registerPage.fullNameInput.fill("Test User");
    await registerPage.emailInput.fill("newuser@example.com");
    await registerPage.passwordInput.fill("password123");
    await registerPage.confirmPasswordInput.fill("differentpassword");
    await registerPage.submitButton.click();

    await expect(
      page.getByText("Passwords do not match")
    ).toBeVisible({ timeout: 5000 });
  });

  test("short password shows validation error", async ({ page }) => {
    await registerPage.fullNameInput.fill("Test User");
    await registerPage.emailInput.fill("newuser@example.com");
    await registerPage.passwordInput.fill("short");
    await registerPage.confirmPasswordInput.fill("short");
    await registerPage.submitButton.click();

    await expect(
      page.getByText("Password must be at least 8 characters")
    ).toBeVisible({ timeout: 5000 });
  });

  test("successful registration redirects to dashboard", async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    await registerPage.register("New Test User", uniqueEmail, "securepass123");

    await page.waitForURL(`**${AUTH_ROUTES.dashboard}`, { timeout: 10000 });
    await expect(page).toHaveURL(new RegExp(AUTH_ROUTES.dashboard));
  });
});
