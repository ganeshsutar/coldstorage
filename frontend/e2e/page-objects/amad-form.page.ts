import type { Locator, Page } from "@playwright/test";

export class AmadFormPage {
  readonly page: Page;
  readonly title: Locator;
  readonly backButton: Locator;
  readonly error: Locator;
  readonly form: Locator;
  readonly dateInput: Locator;
  readonly typeSelect: Locator;
  readonly partyCombobox: Locator;
  readonly villageSelect: Locator;
  readonly commodityCombobox: Locator;
  readonly roomSelect: Locator;
  readonly marksInput: Locator;
  readonly graceDaysInput: Locator;
  readonly rentRateInput: Locator;
  readonly ewayInput: Locator;
  readonly cancelButton: Locator;
  readonly submitButton: Locator;
  readonly packetCalculator: Locator;
  readonly pkt1Input: Locator;
  readonly pwt1Input: Locator;
  readonly pkt2Input: Locator;
  readonly pwt2Input: Locator;
  readonly pkt3Input: Locator;
  readonly pwt3Input: Locator;
  readonly totalPackets: Locator;
  readonly totalWeight: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId("new-amad-title");
    this.backButton = page.getByTestId("new-amad-back-button");
    this.error = page.getByTestId("new-amad-error");
    this.form = page.getByTestId("amad-form");
    this.dateInput = page.getByTestId("amad-date-input");
    this.typeSelect = page.getByTestId("amad-type-select");
    this.partyCombobox = page.getByTestId("amad-party-combobox");
    this.villageSelect = page.getByTestId("amad-village-select");
    this.commodityCombobox = page.getByTestId("amad-commodity-combobox");
    this.roomSelect = page.getByTestId("amad-room-select");
    this.marksInput = page.getByTestId("amad-marks-input");
    this.graceDaysInput = page.getByTestId("amad-grace-days-input");
    this.rentRateInput = page.getByTestId("amad-rent-rate-input");
    this.ewayInput = page.getByTestId("amad-eway-input");
    this.cancelButton = page.getByTestId("amad-cancel-button");
    this.submitButton = page.getByTestId("amad-submit-button");
    this.packetCalculator = page.getByTestId("amad-packet-calculator");
    this.pkt1Input = page.getByTestId("amad-pkt1-input");
    this.pwt1Input = page.getByTestId("amad-pwt1-input");
    this.pkt2Input = page.getByTestId("amad-pkt2-input");
    this.pwt2Input = page.getByTestId("amad-pwt2-input");
    this.pkt3Input = page.getByTestId("amad-pkt3-input");
    this.pwt3Input = page.getByTestId("amad-pwt3-input");
    this.totalPackets = page.getByTestId("amad-total-packets");
    this.totalWeight = page.getByTestId("amad-total-weight");
  }

  async goto() {
    await this.page.goto("/app/inventory/amad/new");
  }
}
