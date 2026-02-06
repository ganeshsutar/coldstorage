import type { Locator, Page } from "@playwright/test";

export class RegisterPage {
  readonly page: Page;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly generalError: Locator;
  readonly signInLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fullNameInput = page.getByTestId("register-fullname-input");
    this.emailInput = page.getByTestId("register-email-input");
    this.passwordInput = page.getByTestId("register-password-input");
    this.confirmPasswordInput = page.getByTestId("register-confirm-password-input");
    this.submitButton = page.getByTestId("register-submit-button");
    this.generalError = page.getByTestId("register-error-message");
    this.signInLink = page.getByTestId("register-signin-link");
  }

  async goto() {
    await this.page.goto("/auth/register");
  }

  async register(fullName: string, email: string, password: string) {
    await this.fullNameInput.fill(fullName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorText(): Promise<string | null> {
    try {
      await this.generalError.waitFor({ timeout: 5000 });
      return this.generalError.textContent();
    } catch {
      return null;
    }
  }
}
