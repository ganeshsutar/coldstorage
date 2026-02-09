import type { Locator, Page } from "@playwright/test";

export class AddAccountDialog {
  readonly page: Page;
  readonly dialog: Locator;
  readonly codeInput: Locator;
  readonly nameInput: Locator;
  readonly typeSelect: Locator;
  readonly categorySelect: Locator;
  readonly parentSelect: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly codeError: Locator;
  readonly nameError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByTestId("add-account-dialog");
    this.codeInput = page.getByTestId("add-account-code-input");
    this.nameInput = page.getByTestId("add-account-name-input");
    this.typeSelect = page.getByTestId("add-account-type-select");
    this.categorySelect = page.getByTestId("add-account-category-select");
    this.parentSelect = page.getByTestId("add-account-parent-select");
    this.submitButton = page.getByTestId("add-account-submit-button");
    this.cancelButton = page.getByTestId("add-account-cancel-button");
    this.codeError = page.getByTestId("add-account-code-error");
    this.nameError = page.getByTestId("add-account-name-error");
  }

  async fillForm(data: { code: string; name: string }) {
    await this.codeInput.fill(data.code);
    await this.nameInput.fill(data.name);
  }

  async submit() {
    await this.submitButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }
}
