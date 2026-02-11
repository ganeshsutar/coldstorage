import type { Locator, Page } from "@playwright/test";

export class TakpattiListPage {
  readonly page: Page;
  readonly title: Locator;
  readonly newButton: Locator;
  readonly searchInput: Locator;
  readonly table: Locator;
  readonly emptyState: Locator;
  readonly dialog: Locator;
  readonly dialogError: Locator;
  readonly deleteConfirm: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId("takpatti-title");
    this.newButton = page.getByTestId("takpatti-new-button");
    this.searchInput = page.getByTestId("takpatti-search-input");
    this.table = page.getByTestId("takpatti-list-table");
    this.emptyState = page.getByTestId("takpatti-list-empty");
    this.dialog = page.getByTestId("takpatti-dialog");
    this.dialogError = page.getByTestId("takpatti-dialog-error");
    this.deleteConfirm = page.getByTestId("takpatti-delete-confirm");
  }

  async goto() {
    await this.page.goto("/app/inventory/takpatti");
  }

  getRow(index: number): Locator {
    return this.page.getByTestId(`takpatti-row-${index}`);
  }

  getDeleteButton(index: number): Locator {
    return this.page.getByTestId(`takpatti-row-delete-${index}`);
  }
}
