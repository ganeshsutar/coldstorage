import type { Locator, Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly signUpLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.submitButton = page.getByRole("button", { name: /login/i });
    this.errorMessage = page.locator(".text-destructive").first();
    this.signUpLink = page.getByRole("link", { name: /sign up/i });
  }

  async goto() {
    await this.page.goto("/auth/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorText(): Promise<string | null> {
    try {
      await this.errorMessage.waitFor({ timeout: 5000 });
      return this.errorMessage.textContent();
    } catch {
      return null;
    }
  }
}
