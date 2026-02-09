import type { Locator, Page } from "@playwright/test";

export class ChartOfAccountsPage {
  readonly page: Page;
  readonly title: Locator;
  readonly addAccountButton: Locator;
  readonly addPartyButton: Locator;

  // Account tree
  readonly accountTree: Locator;
  readonly searchInput: Locator;
  readonly treeEmpty: Locator;

  // Detail panel
  readonly detailPanel: Locator;
  readonly detailCode: Locator;
  readonly detailName: Locator;
  readonly detailType: Locator;
  readonly detailBalance: Locator;
  readonly detailChildrenCount: Locator;
  readonly detailEmpty: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId("chart-of-accounts-title");
    this.addAccountButton = page.getByTestId("coa-add-account-button");
    this.addPartyButton = page.getByTestId("coa-add-party-button");

    this.accountTree = page.getByTestId("account-tree");
    this.searchInput = page.getByTestId("account-tree-search-input");
    this.treeEmpty = page.getByTestId("account-tree-empty");

    this.detailPanel = page.getByTestId("coa-detail-panel");
    this.detailCode = page.getByTestId("coa-detail-code");
    this.detailName = page.getByTestId("coa-detail-name");
    this.detailType = page.getByTestId("coa-detail-type");
    this.detailBalance = page.getByTestId("coa-detail-balance");
    this.detailChildrenCount = page.getByTestId("coa-detail-children-count");
    this.detailEmpty = page.getByTestId("coa-detail-empty");
  }

  async goto() {
    await this.page.goto("/app/accounts/chart-of-accounts");
  }

  async searchAccounts(query: string) {
    await this.searchInput.fill(query);
  }

  getTreeNode(id: string): Locator {
    return this.page.getByTestId(`account-tree-node-${id}`);
  }

  getTreeToggle(id: string): Locator {
    return this.page.getByTestId(`account-tree-toggle-${id}`);
  }

  getTreeName(id: string): Locator {
    return this.page.getByTestId(`account-tree-name-${id}`);
  }

  async selectTreeNode(id: string) {
    await this.getTreeName(id).click();
  }

  async expandTreeNode(id: string) {
    await this.getTreeToggle(id).click();
  }

  async openAddAccountDialog() {
    await this.addAccountButton.click();
  }

  async openAddPartyDialog() {
    await this.addPartyButton.click();
  }
}
