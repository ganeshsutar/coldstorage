import type { Locator, Page } from "@playwright/test";

export class NikasiFormPage {
  readonly page: Page;
  readonly title: Locator;
  readonly backButton: Locator;
  readonly error: Locator;
  readonly form: Locator;
  readonly dateInput: Locator;
  readonly typeSelect: Locator;
  readonly partyCombobox: Locator;
  readonly amadCombobox: Locator;
  readonly packetsInput: Locator;
  readonly weightInput: Locator;
  readonly vehicleInput: Locator;
  readonly receiverInput: Locator;
  readonly narrationInput: Locator;
  readonly cancelButton: Locator;
  readonly submitButton: Locator;
  readonly rentCalculationCard: Locator;
  readonly rentCalculationEmpty: Locator;
  readonly rentCalculationTotal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId("new-nikasi-title");
    this.backButton = page.getByTestId("new-nikasi-back-button");
    this.error = page.getByTestId("new-nikasi-error");
    this.form = page.getByTestId("nikasi-form");
    this.dateInput = page.getByTestId("nikasi-date-input");
    this.typeSelect = page.getByTestId("nikasi-type-select");
    this.partyCombobox = page.getByTestId("nikasi-party-combobox");
    this.amadCombobox = page.getByTestId("nikasi-amad-combobox");
    this.packetsInput = page.getByTestId("nikasi-packets-input");
    this.weightInput = page.getByTestId("nikasi-weight-input");
    this.vehicleInput = page.getByTestId("nikasi-vehicle-input");
    this.receiverInput = page.getByTestId("nikasi-receiver-input");
    this.narrationInput = page.getByTestId("nikasi-narration-input");
    this.cancelButton = page.getByTestId("nikasi-cancel-button");
    this.submitButton = page.getByTestId("nikasi-submit-button");
    this.rentCalculationCard = page.getByTestId("rent-calculation-card");
    this.rentCalculationEmpty = page.getByTestId("rent-calculation-empty");
    this.rentCalculationTotal = page.getByTestId("rent-calculation-total");
  }

  async goto() {
    await this.page.goto("/app/inventory/nikasi/new");
  }
}
