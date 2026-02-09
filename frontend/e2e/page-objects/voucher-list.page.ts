import type { Locator, Page } from "@playwright/test";

export class VoucherListPage {
  readonly page: Page;
  readonly title: Locator;
  readonly newVoucherButton: Locator;
  readonly tabAll: Locator;
  readonly tabReceipts: Locator;
  readonly tabPayments: Locator;
  readonly tabJournal: Locator;
  readonly table: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId("vouchers-title");
    this.newVoucherButton = page.getByTestId("vouchers-new-button");
    this.tabAll = page.getByTestId("vouchers-tab-all");
    this.tabReceipts = page.getByTestId("vouchers-tab-receipts");
    this.tabPayments = page.getByTestId("vouchers-tab-payments");
    this.tabJournal = page.getByTestId("vouchers-tab-journal");
    this.table = page.getByTestId("voucher-list-table");
    this.emptyState = page.getByTestId("voucher-list-empty");
  }

  async goto() {
    await this.page.goto("/app/accounts/vouchers");
  }

  async switchToTab(tab: "all" | "receipts" | "payments" | "journal") {
    const tabMap = {
      all: this.tabAll,
      receipts: this.tabReceipts,
      payments: this.tabPayments,
      journal: this.tabJournal,
    };
    await tabMap[tab].click();
  }

  getVoucherRow(index: number): Locator {
    return this.page.getByTestId(`voucher-row-${index}`);
  }

  async clickNewVoucher() {
    await this.newVoucherButton.click();
  }
}
