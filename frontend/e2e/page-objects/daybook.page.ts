import type { Locator, Page } from "@playwright/test";

export class DaybookPage {
  readonly page: Page;
  readonly title: Locator;
  readonly closeDayButton: Locator;
  readonly dayClosedBadge: Locator;

  // Date navigator
  readonly dateNavigator: Locator;
  readonly prevButton: Locator;
  readonly nextButton: Locator;
  readonly todayButton: Locator;
  readonly datePicker: Locator;

  // Summary cards
  readonly summaryCards: Locator;
  readonly cashCard: Locator;
  readonly bankCard: Locator;
  readonly cashOpening: Locator;
  readonly cashReceipts: Locator;
  readonly cashPayments: Locator;
  readonly cashClosing: Locator;
  readonly bankOpening: Locator;
  readonly bankReceipts: Locator;
  readonly bankPayments: Locator;
  readonly bankClosing: Locator;

  // Transaction filters
  readonly filterAll: Locator;
  readonly filterReceipts: Locator;
  readonly filterPayments: Locator;
  readonly filterJournal: Locator;

  // Transaction table
  readonly transactionTable: Locator;
  readonly transactionEmpty: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId("daybook-title");
    this.closeDayButton = page.getByTestId("daybook-close-day-button");
    this.dayClosedBadge = page.getByTestId("daybook-day-closed-badge");

    this.dateNavigator = page.getByTestId("date-navigator");
    this.prevButton = page.getByTestId("date-navigator-prev-button");
    this.nextButton = page.getByTestId("date-navigator-next-button");
    this.todayButton = page.getByTestId("date-navigator-today-button");
    this.datePicker = page.getByTestId("date-navigator-date-picker");

    this.summaryCards = page.getByTestId("daily-summary-cards");
    this.cashCard = page.getByTestId("daily-summary-cash-card");
    this.bankCard = page.getByTestId("daily-summary-bank-card");
    this.cashOpening = page.getByTestId("daily-summary-cash-opening");
    this.cashReceipts = page.getByTestId("daily-summary-cash-receipts");
    this.cashPayments = page.getByTestId("daily-summary-cash-payments");
    this.cashClosing = page.getByTestId("daily-summary-cash-closing");
    this.bankOpening = page.getByTestId("daily-summary-bank-opening");
    this.bankReceipts = page.getByTestId("daily-summary-bank-receipts");
    this.bankPayments = page.getByTestId("daily-summary-bank-payments");
    this.bankClosing = page.getByTestId("daily-summary-bank-closing");

    this.filterAll = page.getByTestId("daybook-filter-all");
    this.filterReceipts = page.getByTestId("daybook-filter-receipts");
    this.filterPayments = page.getByTestId("daybook-filter-payments");
    this.filterJournal = page.getByTestId("daybook-filter-journal");

    this.transactionTable = page.getByTestId("daybook-transaction-table");
    this.transactionEmpty = page.getByTestId("daybook-transaction-empty");
  }

  async goto() {
    await this.page.goto("/app/accounts/daybook");
  }

  async navigatePrev() {
    await this.prevButton.click();
  }

  async navigateNext() {
    await this.nextButton.click();
  }

  async navigateToday() {
    await this.todayButton.click();
  }

  async switchFilter(filter: "all" | "receipts" | "payments" | "journal") {
    const filterMap = {
      all: this.filterAll,
      receipts: this.filterReceipts,
      payments: this.filterPayments,
      journal: this.filterJournal,
    };
    await filterMap[filter].click();
  }

  getTransactionRow(index: number): Locator {
    return this.page.getByTestId(`daybook-transaction-row-${index}`);
  }
}
