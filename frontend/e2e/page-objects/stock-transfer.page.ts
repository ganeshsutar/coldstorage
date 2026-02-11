import type { Locator, Page } from "@playwright/test";

export class StockTransferPage {
  readonly page: Page;
  readonly title: Locator;
  readonly backButton: Locator;
  readonly wizard: Locator;
  readonly stepIndicator: Locator;
  readonly error: Locator;
  readonly success: Locator;
  readonly newTransferButton: Locator;
  readonly viewAmadButton: Locator;
  readonly sourceParty: Locator;
  readonly sourceAmad: Locator;
  readonly sourceDetail: Locator;
  readonly destParty: Locator;
  readonly samePartyError: Locator;
  readonly dateInput: Locator;
  readonly packetsInput: Locator;
  readonly weightInput: Locator;
  readonly narrationInput: Locator;
  readonly summary: Locator;
  readonly prevButton: Locator;
  readonly nextButton: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId("transfer-title");
    this.backButton = page.getByTestId("transfer-back-button");
    this.wizard = page.getByTestId("transfer-wizard");
    this.stepIndicator = page.getByTestId("transfer-step-indicator");
    this.error = page.getByTestId("transfer-error");
    this.success = page.getByTestId("transfer-success");
    this.newTransferButton = page.getByTestId("transfer-new-button");
    this.viewAmadButton = page.getByTestId("transfer-view-amad-button");
    this.sourceParty = page.getByTestId("transfer-source-party");
    this.sourceAmad = page.getByTestId("transfer-source-amad");
    this.sourceDetail = page.getByTestId("transfer-source-detail");
    this.destParty = page.getByTestId("transfer-dest-party");
    this.samePartyError = page.getByTestId("transfer-same-party-error");
    this.dateInput = page.getByTestId("transfer-date-input");
    this.packetsInput = page.getByTestId("transfer-packets-input");
    this.weightInput = page.getByTestId("transfer-weight-input");
    this.narrationInput = page.getByTestId("transfer-narration-input");
    this.summary = page.getByTestId("transfer-summary");
    this.prevButton = page.getByTestId("transfer-prev-button");
    this.nextButton = page.getByTestId("transfer-next-button");
    this.confirmButton = page.getByTestId("transfer-confirm-button");
  }

  async goto() {
    await this.page.goto("/app/inventory/stock-transfer");
  }

  getStep(stepNumber: number): Locator {
    return this.page.getByTestId(`transfer-step-${stepNumber}`);
  }
}
