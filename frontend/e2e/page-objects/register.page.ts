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
    this.fullNameInput = page.getByLabel("Full Name");
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password", { exact: true });
    this.confirmPasswordInput = page.getByLabel("Confirm Password");
    this.submitButton = page.getByRole("button", { name: /create account/i });
    this.generalError = page.locator(".bg-destructive\\/10");
    this.signInLink = page.getByRole("link", { name: /sign in/i });
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
