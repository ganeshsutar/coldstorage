import type { Locator, Page } from "@playwright/test";

export class AmadListPage {
  readonly page: Page;
  readonly title: Locator;
  readonly newButton: Locator;
  readonly searchInput: Locator;
  readonly filterSelect: Locator;
  readonly kpiTodayInward: Locator;
  readonly kpiTotalStock: Locator;
  readonly kpiActiveAmads: Locator;
  readonly kpiFullyDispatched: Locator;
  readonly table: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId("amad-title");
    this.newButton = page.getByTestId("amad-new-button");
    this.searchInput = page.getByTestId("amad-search-input");
    this.filterSelect = page.getByTestId("amad-filter-select");
    this.kpiTodayInward = page.getByTestId("amad-kpi-today-inward");
    this.kpiTotalStock = page.getByTestId("amad-kpi-total-stock");
    this.kpiActiveAmads = page.getByTestId("amad-kpi-active-amads");
    this.kpiFullyDispatched = page.getByTestId("amad-kpi-fully-dispatched");
    this.table = page.getByTestId("amad-list-table");
    this.emptyState = page.getByTestId("amad-list-empty");
  }

  async goto() {
    await this.page.goto("/app/inventory/amad");
  }

  getRow(index: number): Locator {
    return this.page.getByTestId(`amad-row-${index}`);
  }

  getViewButton(index: number): Locator {
    return this.page.getByTestId(`amad-row-view-${index}`);
  }

  getDispatchButton(index: number): Locator {
    return this.page.getByTestId(`amad-row-dispatch-${index}`);
  }
}
