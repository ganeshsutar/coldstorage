import type { Locator, Page } from "@playwright/test";

export class ConfigurationSection {
  readonly page: Page;

  // General config
  readonly generalSoftwareModeSelect: Locator;
  readonly generalMarkaOnSelect: Locator;
  readonly generalRackQuantityInput: Locator;
  readonly generalMultiChamberSwitch: Locator;
  readonly generalPartialLotSwitch: Locator;
  readonly generalMapRequiredSwitch: Locator;
  readonly generalSeparateVoucherSwitch: Locator;
  readonly generalSubmitButton: Locator;
  readonly generalErrorMessage: Locator;
  readonly generalSuccessMessage: Locator;

  // Rent config
  readonly rentOnRadio: Locator;
  readonly rentOnQ: Locator;
  readonly rentOnP: Locator;
  readonly rentOnW: Locator;
  readonly rentThroughRadio: Locator;
  readonly rentThroughL: Locator;
  readonly rentThroughB: Locator;
  readonly rentDaysInput: Locator;
  readonly rentSubmitButton: Locator;
  readonly rentErrorMessage: Locator;
  readonly rentSuccessMessage: Locator;

  // Interest config
  readonly interestRateInput: Locator;
  readonly interestDaysInput: Locator;
  readonly interestCalculateSwitch: Locator;
  readonly interestOnRentSwitch: Locator;
  readonly interestOnLoanSwitch: Locator;
  readonly interestOnBardanaSwitch: Locator;
  readonly interestSubmitButton: Locator;
  readonly interestErrorMessage: Locator;
  readonly interestSuccessMessage: Locator;

  // Packets config
  readonly packetsPkt1NameInput: Locator;
  readonly packetsPkt1WeightInput: Locator;
  readonly packetsPkt2NameInput: Locator;
  readonly packetsPkt2WeightInput: Locator;
  readonly packetsPkt3NameInput: Locator;
  readonly packetsPkt3WeightInput: Locator;
  readonly packetsMixSwitch: Locator;
  readonly packetsSubmitButton: Locator;
  readonly packetsErrorMessage: Locator;
  readonly packetsSuccessMessage: Locator;

  // Charges config
  readonly chargesKatai1Input: Locator;
  readonly chargesKatai2Input: Locator;
  readonly chargesKatai3Input: Locator;
  readonly chargesLoad1Input: Locator;
  readonly chargesLoad2Input: Locator;
  readonly chargesLoad3Input: Locator;
  readonly chargesUnload1Input: Locator;
  readonly chargesUnload2Input: Locator;
  readonly chargesUnload3Input: Locator;
  readonly chargesReload1Input: Locator;
  readonly chargesReload2Input: Locator;
  readonly chargesReload3Input: Locator;
  readonly chargesSubmitButton: Locator;
  readonly chargesErrorMessage: Locator;
  readonly chargesSuccessMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // General config
    this.generalSoftwareModeSelect = page.getByTestId(
      "general-software-mode-select"
    );
    this.generalMarkaOnSelect = page.getByTestId("general-marka-on-select");
    this.generalRackQuantityInput = page.getByTestId(
      "general-rack-quantity-input"
    );
    this.generalMultiChamberSwitch = page.getByTestId(
      "general-multi-chamber-switch"
    );
    this.generalPartialLotSwitch = page.getByTestId(
      "general-partial-lot-switch"
    );
    this.generalMapRequiredSwitch = page.getByTestId(
      "general-map-required-switch"
    );
    this.generalSeparateVoucherSwitch = page.getByTestId(
      "general-separate-voucher-switch"
    );
    this.generalSubmitButton = page.getByTestId("general-submit-button");
    this.generalErrorMessage = page.getByTestId("general-error-message");
    this.generalSuccessMessage = page.getByTestId("general-success-message");

    // Rent config
    this.rentOnRadio = page.getByTestId("rent-on-radio");
    this.rentOnQ = page.getByTestId("rent-on-Q");
    this.rentOnP = page.getByTestId("rent-on-P");
    this.rentOnW = page.getByTestId("rent-on-W");
    this.rentThroughRadio = page.getByTestId("rent-through-radio");
    this.rentThroughL = page.getByTestId("rent-through-L");
    this.rentThroughB = page.getByTestId("rent-through-B");
    this.rentDaysInput = page.getByTestId("rent-days-input");
    this.rentSubmitButton = page.getByTestId("rent-submit-button");
    this.rentErrorMessage = page.getByTestId("rent-error-message");
    this.rentSuccessMessage = page.getByTestId("rent-success-message");

    // Interest config
    this.interestRateInput = page.getByTestId("interest-rate-input");
    this.interestDaysInput = page.getByTestId("interest-days-input");
    this.interestCalculateSwitch = page.getByTestId(
      "interest-calculate-switch"
    );
    this.interestOnRentSwitch = page.getByTestId("interest-on-rent-switch");
    this.interestOnLoanSwitch = page.getByTestId("interest-on-loan-switch");
    this.interestOnBardanaSwitch = page.getByTestId(
      "interest-on-bardana-switch"
    );
    this.interestSubmitButton = page.getByTestId("interest-submit-button");
    this.interestErrorMessage = page.getByTestId("interest-error-message");
    this.interestSuccessMessage = page.getByTestId("interest-success-message");

    // Packets config
    this.packetsPkt1NameInput = page.getByTestId("packets-pkt1-name-input");
    this.packetsPkt1WeightInput = page.getByTestId(
      "packets-pkt1-weight-input"
    );
    this.packetsPkt2NameInput = page.getByTestId("packets-pkt2-name-input");
    this.packetsPkt2WeightInput = page.getByTestId(
      "packets-pkt2-weight-input"
    );
    this.packetsPkt3NameInput = page.getByTestId("packets-pkt3-name-input");
    this.packetsPkt3WeightInput = page.getByTestId(
      "packets-pkt3-weight-input"
    );
    this.packetsMixSwitch = page.getByTestId("packets-mix-switch");
    this.packetsSubmitButton = page.getByTestId("packets-submit-button");
    this.packetsErrorMessage = page.getByTestId("packets-error-message");
    this.packetsSuccessMessage = page.getByTestId("packets-success-message");

    // Charges config
    this.chargesKatai1Input = page.getByTestId("charges-katai1-input");
    this.chargesKatai2Input = page.getByTestId("charges-katai2-input");
    this.chargesKatai3Input = page.getByTestId("charges-katai3-input");
    this.chargesLoad1Input = page.getByTestId("charges-load1-input");
    this.chargesLoad2Input = page.getByTestId("charges-load2-input");
    this.chargesLoad3Input = page.getByTestId("charges-load3-input");
    this.chargesUnload1Input = page.getByTestId("charges-unload1-input");
    this.chargesUnload2Input = page.getByTestId("charges-unload2-input");
    this.chargesUnload3Input = page.getByTestId("charges-unload3-input");
    this.chargesReload1Input = page.getByTestId("charges-reload1-input");
    this.chargesReload2Input = page.getByTestId("charges-reload2-input");
    this.chargesReload3Input = page.getByTestId("charges-reload3-input");
    this.chargesSubmitButton = page.getByTestId("charges-submit-button");
    this.chargesErrorMessage = page.getByTestId("charges-error-message");
    this.chargesSuccessMessage = page.getByTestId("charges-success-message");
  }
}
