import type { Locator, Page } from "@playwright/test";

export class PartyLedgerPage {
  readonly page: Page;
  readonly title: Locator;
  readonly addPartyButton: Locator;
  readonly searchInput: Locator;
  readonly filterSelect: Locator;

  // KPI cards
  readonly kpiDebtors: Locator;
  readonly kpiCreditors: Locator;
  readonly kpiTodaysReceipts: Locator;
  readonly kpiPendingInterest: Locator;

  // Party table
  readonly partyTable: Locator;
  readonly partyEmpty: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId("party-ledger-title");
    this.addPartyButton = page.getByTestId("party-ledger-add-button");
    this.searchInput = page.getByTestId("party-ledger-search-input");
    this.filterSelect = page.getByTestId("party-ledger-filter-select");

    this.kpiDebtors = page.getByTestId("kpi-debtors");
    this.kpiCreditors = page.getByTestId("kpi-creditors");
    this.kpiTodaysReceipts = page.getByTestId("kpi-todays-receipts");
    this.kpiPendingInterest = page.getByTestId("kpi-pending-interest");

    this.partyTable = page.getByTestId("party-list-table");
    this.partyEmpty = page.getByTestId("party-list-empty");
  }

  async goto() {
    await this.page.goto("/app/accounts/party-ledger");
  }

  async searchParty(query: string) {
    await this.searchInput.fill(query);
  }

  async filterParties(filter: "all" | "debtors" | "creditors") {
    await this.filterSelect.click();
    const labels = { all: "All Parties", debtors: "Debtors Only", creditors: "Creditors Only" };
    await this.page.getByRole("option", { name: labels[filter] }).click();
  }

  getPartyRow(index: number): Locator {
    return this.page.getByTestId(`party-row-${index}`);
  }

  getExpandButton(index: number): Locator {
    return this.page.getByTestId(`party-row-expand-${index}`);
  }

  getViewButton(index: number): Locator {
    return this.page.getByTestId(`party-row-view-${index}`);
  }

  getBreakdownRow(index: number): Locator {
    return this.page.getByTestId(`party-row-breakdown-${index}`);
  }

  async expandPartyRow(index: number) {
    await this.getExpandButton(index).click();
  }

  async viewPartyDetail(index: number) {
    await this.getViewButton(index).click();
  }

  async openAddPartyDialog() {
    await this.addPartyButton.click();
  }
}
