import type { Locator, Page } from "@playwright/test";

export class UserManagementSection {
  readonly page: Page;

  // User list
  readonly addUserButton: Locator;
  readonly table: Locator;
  readonly emptyState: Locator;

  // Create user dialog
  readonly dialogEmailInput: Locator;
  readonly dialogFullnameInput: Locator;
  readonly dialogPasswordInput: Locator;
  readonly dialogPhoneInput: Locator;
  readonly dialogRoleSelect: Locator;
  readonly dialogLoanLimitInput: Locator;
  readonly dialogBackdateLimitInput: Locator;

  // Edit user dialog
  readonly dialogEditFullnameInput: Locator;
  readonly dialogEditPhoneInput: Locator;
  readonly dialogEditRoleSelect: Locator;
  readonly dialogEditStatusSelect: Locator;
  readonly dialogEditLoanLimitInput: Locator;
  readonly dialogEditBackdateLimitInput: Locator;

  // Shared dialog controls
  readonly dialogSubmitButton: Locator;
  readonly dialogCancelButton: Locator;
  readonly dialogErrorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // User list
    this.addUserButton = page.getByTestId("user-list-add-button");
    this.table = page.getByTestId("user-list-table");
    this.emptyState = page.getByTestId("user-list-empty");

    // Create dialog
    this.dialogEmailInput = page.getByTestId("user-dialog-email-input");
    this.dialogFullnameInput = page.getByTestId("user-dialog-fullname-input");
    this.dialogPasswordInput = page.getByTestId("user-dialog-password-input");
    this.dialogPhoneInput = page.getByTestId("user-dialog-phone-input");
    this.dialogRoleSelect = page.getByTestId("user-dialog-role-select");
    this.dialogLoanLimitInput = page.getByTestId(
      "user-dialog-loan-limit-input"
    );
    this.dialogBackdateLimitInput = page.getByTestId(
      "user-dialog-backdate-limit-input"
    );

    // Edit dialog
    this.dialogEditFullnameInput = page.getByTestId(
      "user-dialog-edit-fullname-input"
    );
    this.dialogEditPhoneInput = page.getByTestId(
      "user-dialog-edit-phone-input"
    );
    this.dialogEditRoleSelect = page.getByTestId(
      "user-dialog-edit-role-select"
    );
    this.dialogEditStatusSelect = page.getByTestId(
      "user-dialog-edit-status-select"
    );
    this.dialogEditLoanLimitInput = page.getByTestId(
      "user-dialog-edit-loan-limit-input"
    );
    this.dialogEditBackdateLimitInput = page.getByTestId(
      "user-dialog-edit-backdate-limit-input"
    );

    // Shared
    this.dialogSubmitButton = page.getByTestId("user-dialog-submit-button");
    this.dialogCancelButton = page.getByTestId("user-dialog-cancel-button");
    this.dialogErrorMessage = page.getByTestId("user-dialog-error-message");
  }

  async openAddUserDialog() {
    await this.addUserButton.click();
  }

  async fillCreateUserForm(data: {
    email: string;
    fullName: string;
    password: string;
    phone?: string;
  }) {
    await this.dialogEmailInput.fill(data.email);
    await this.dialogFullnameInput.fill(data.fullName);
    await this.dialogPasswordInput.fill(data.password);
    if (data.phone) {
      await this.dialogPhoneInput.fill(data.phone);
    }
  }

  async submitDialog() {
    await this.dialogSubmitButton.click();
  }

  getUserRow(index: number): Locator {
    return this.page.getByTestId(`user-row-${index}`);
  }

  getUserRowMenu(index: number): Locator {
    return this.page.getByTestId(`user-row-menu-${index}`);
  }

  getUserRowEdit(index: number): Locator {
    return this.page.getByTestId(`user-row-edit-${index}`);
  }

  getUserRowDelete(index: number): Locator {
    return this.page.getByTestId(`user-row-delete-${index}`);
  }

  async getUserRowCount(): Promise<number> {
    try {
      await this.table.waitFor({ timeout: 5000 });
      const rows = this.page.locator('[data-testid^="user-row-"]:not([data-testid*="menu"]):not([data-testid*="edit"]):not([data-testid*="delete"])');
      return rows.count();
    } catch {
      return 0;
    }
  }
}
