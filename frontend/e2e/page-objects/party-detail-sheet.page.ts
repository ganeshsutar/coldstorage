import type { Locator, Page } from "@playwright/test";

export class PartyDetailSheet {
  readonly page: Page;
  readonly sheet: Locator;
  readonly partyName: Locator;
  readonly partyCode: Locator;
  readonly balance: Locator;
  readonly contactSection: Locator;
  readonly creditLimitSection: Locator;
  readonly breakdownSection: Locator;
  readonly transactionsTable: Locator;
  readonly noTransactions: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sheet = page.getByTestId("party-detail-sheet");
    this.partyName = page.getByTestId("party-detail-name");
    this.partyCode = page.getByTestId("party-detail-code");
    this.balance = page.getByTestId("party-detail-balance");
    this.contactSection = page.getByTestId("party-detail-contact");
    this.creditLimitSection = page.getByTestId("party-detail-credit-limit");
    this.breakdownSection = page.getByTestId("party-detail-breakdown");
    this.transactionsTable = page.getByTestId("party-detail-transactions");
    this.noTransactions = page.getByTestId("party-detail-no-transactions");
  }

  async isVisible(): Promise<boolean> {
    try {
      await this.sheet.waitFor({ timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }

  async getPartyName(): Promise<string | null> {
    return this.partyName.textContent();
  }

  async getBalance(): Promise<string | null> {
    return this.balance.textContent();
  }
}
