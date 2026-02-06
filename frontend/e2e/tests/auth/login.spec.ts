import { test, expect } from "../../fixtures";
import { TEST_USERS, AUTH_ROUTES } from "../../helpers";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Login", () => {
  test("login form renders with all expected elements", async ({
    loginPage,
  }) => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.signUpLink).toBeVisible();
  });

  test("successful login redirects to dashboard", async ({ loginPage }) => {
    await loginPage.login(
      TEST_USERS.default.email,
      TEST_USERS.default.password
    );

    await loginPage.page.waitForURL(`**${AUTH_ROUTES.dashboard}`, {
      timeout: 10000,
    });
    await expect(loginPage.page).toHaveURL(
      new RegExp(AUTH_ROUTES.dashboard)
    );
  });

  test("invalid credentials show error message", async ({ loginPage }) => {
    await loginPage.login("wrong@example.com", "wrongpassword");

    const error = await loginPage.getErrorText();
    expect(error).toBeTruthy();
  });

  test("empty form submission shows validation feedback", async ({
    loginPage,
  }) => {
    await loginPage.submitButton.click();

    // HTML5 validation should prevent submission — email field should be invalid
    const emailValid = await loginPage.emailInput.evaluate(
      (el: HTMLInputElement) => el.validity.valid
    );
    expect(emailValid).toBe(false);
  });
});
