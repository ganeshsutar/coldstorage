import type { Locator, Page } from "@playwright/test";

export class NikasiListPage {
  readonly page: Page;
  readonly title: Locator;
  readonly newButton: Locator;
  readonly searchInput: Locator;
  readonly filterSelect: Locator;
  readonly kpiTotalDispatches: Locator;
  readonly kpiTotalPackets: Locator;
  readonly kpiTotalRent: Locator;
  readonly table: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId("nikasi-title");
    this.newButton = page.getByTestId("nikasi-new-button");
    this.searchInput = page.getByTestId("nikasi-search-input");
    this.filterSelect = page.getByTestId("nikasi-filter-select");
    this.kpiTotalDispatches = page.getByTestId("nikasi-kpi-total-dispatches");
    this.kpiTotalPackets = page.getByTestId("nikasi-kpi-total-packets");
    this.kpiTotalRent = page.getByTestId("nikasi-kpi-total-rent");
    this.table = page.getByTestId("nikasi-list-table");
    this.emptyState = page.getByTestId("nikasi-list-empty");
  }

  async goto() {
    await this.page.goto("/app/inventory/nikasi");
  }

  getRow(index: number): Locator {
    return this.page.getByTestId(`nikasi-row-${index}`);
  }

  getViewButton(index: number): Locator {
    return this.page.getByTestId(`nikasi-row-view-${index}`);
  }
}
