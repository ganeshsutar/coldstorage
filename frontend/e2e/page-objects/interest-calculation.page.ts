import type { Locator, Page } from "@playwright/test";

export class InterestCalculationPage {
  readonly page: Page;
  readonly title: Locator;
  readonly calculateButton: Locator;
  readonly errorMessage: Locator;

  // Calculation params
  readonly calculationParams: Locator;
  readonly fromDatePicker: Locator;
  readonly toDatePicker: Locator;
  readonly rateInput: Locator;
  readonly daysInYearSelect: Locator;

  // Party selector
  readonly partySelector: Locator;
  readonly partyAllRadio: Locator;
  readonly partySelectedRadio: Locator;

  // Component checkboxes
  readonly componentCheckboxes: Locator;
  readonly componentRent: Locator;
  readonly componentLoan: Locator;
  readonly componentBardana: Locator;
  readonly componentOther: Locator;

  // Results
  readonly resultsCard: Locator;
  readonly totalAmount: Locator;
  readonly resultTable: Locator;
  readonly resultEmpty: Locator;
  readonly totalPrincipal: Locator;
  readonly totalInterest: Locator;
  readonly previewButton: Locator;
  readonly postButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId("interest-title");
    this.calculateButton = page.getByTestId("interest-calculate-button");
    this.errorMessage = page.getByTestId("interest-error-message");

    this.calculationParams = page.getByTestId("calculation-params");
    this.fromDatePicker = page.getByTestId("interest-from-date-picker");
    this.toDatePicker = page.getByTestId("interest-to-date-picker");
    this.rateInput = page.getByTestId("interest-rate-input");
    this.daysInYearSelect = page.getByTestId("interest-days-in-year-select");

    this.partySelector = page.getByTestId("party-selector");
    this.partyAllRadio = page.getByTestId("interest-party-all-radio");
    this.partySelectedRadio = page.getByTestId("interest-party-selected-radio");

    this.componentCheckboxes = page.getByTestId("component-checkboxes");
    this.componentRent = page.getByTestId("interest-component-rent");
    this.componentLoan = page.getByTestId("interest-component-loan");
    this.componentBardana = page.getByTestId("interest-component-bardana");
    this.componentOther = page.getByTestId("interest-component-other");

    this.resultsCard = page.getByTestId("interest-results-card");
    this.totalAmount = page.getByTestId("interest-total-amount");
    this.resultTable = page.getByTestId("interest-result-table");
    this.resultEmpty = page.getByTestId("interest-result-empty");
    this.totalPrincipal = page.getByTestId("interest-result-total-principal");
    this.totalInterest = page.getByTestId("interest-result-total-interest");
    this.previewButton = page.getByTestId("interest-preview-button");
    this.postButton = page.getByTestId("interest-post-button");
  }

  async goto() {
    await this.page.goto("/app/accounts/interest");
  }

  async setRate(rate: string) {
    await this.rateInput.clear();
    await this.rateInput.fill(rate);
  }

  async selectDaysInYear(days: "360" | "365") {
    await this.daysInYearSelect.click();
    await this.page.getByRole("option", { name: `${days} Days` }).click();
  }

  async toggleComponent(component: "rent" | "loan" | "bardana" | "other") {
    const componentMap = {
      rent: this.componentRent,
      loan: this.componentLoan,
      bardana: this.componentBardana,
      other: this.componentOther,
    };
    await componentMap[component].click();
  }

  async calculate() {
    await this.calculateButton.click();
  }

  getResultRow(index: number): Locator {
    return this.page.getByTestId(`interest-result-row-${index}`);
  }

  getResultExpandButton(index: number): Locator {
    return this.page.getByTestId(`interest-result-expand-${index}`);
  }

  async postInterest() {
    await this.postButton.click();
  }
}
