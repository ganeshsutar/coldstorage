import type { Locator, Page } from "@playwright/test";

export class TakpattiFormPage {
  readonly page: Page;
  readonly form: Locator;
  readonly dateInput: Locator;
  readonly amadCombobox: Locator;
  readonly packetsInput: Locator;
  readonly grossWeightInput: Locator;
  readonly tareWeightInput: Locator;
  readonly netWeight: Locator;
  readonly roomSelect: Locator;
  readonly floorInput: Locator;
  readonly cancelButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.getByTestId("takpatti-form");
    this.dateInput = page.getByTestId("takpatti-date-input");
    this.amadCombobox = page.getByTestId("takpatti-amad-combobox");
    this.packetsInput = page.getByTestId("takpatti-packets-input");
    this.grossWeightInput = page.getByTestId("takpatti-gross-weight-input");
    this.tareWeightInput = page.getByTestId("takpatti-tare-weight-input");
    this.netWeight = page.getByTestId("takpatti-net-weight");
    this.roomSelect = page.getByTestId("takpatti-room-select");
    this.floorInput = page.getByTestId("takpatti-floor-input");
    this.cancelButton = page.getByTestId("takpatti-cancel-button");
    this.submitButton = page.getByTestId("takpatti-submit-button");
  }
}
