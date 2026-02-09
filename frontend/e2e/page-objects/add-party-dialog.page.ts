import type { Locator, Page } from "@playwright/test";

export class AddPartyDialog {
  readonly page: Page;
  readonly dialog: Locator;

  // Tabs
  readonly tabBasic: Locator;
  readonly tabDetails: Locator;
  readonly tabFinancial: Locator;

  // Basic tab
  readonly codeInput: Locator;
  readonly nameInput: Locator;
  readonly phoneInput: Locator;
  readonly villageInput: Locator;
  readonly typeSelect: Locator;
  readonly guardianNameInput: Locator;
  readonly guardianRelationSelect: Locator;
  readonly addressInput: Locator;
  readonly codeError: Locator;
  readonly nameError: Locator;

  // Details tab
  readonly tinInput: Locator;
  readonly guarantorInput: Locator;
  readonly villageHindiInput: Locator;
  readonly remarkInput: Locator;

  // Financial tab
  readonly creditLimitInput: Locator;
  readonly drLimitInput: Locator;
  readonly depreciationRateInput: Locator;
  readonly interestBardanaSelect: Locator;
  readonly chargeInterestFromInput: Locator;
  readonly dueDaysInput: Locator;
  readonly saudaLimitInput: Locator;

  // Actions
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByTestId("add-party-dialog");

    this.tabBasic = page.getByTestId("add-party-tab-basic");
    this.tabDetails = page.getByTestId("add-party-tab-details");
    this.tabFinancial = page.getByTestId("add-party-tab-financial");

    this.codeInput = page.getByTestId("add-party-code-input");
    this.nameInput = page.getByTestId("add-party-name-input");
    this.phoneInput = page.getByTestId("add-party-phone-input");
    this.villageInput = page.getByTestId("add-party-village-input");
    this.typeSelect = page.getByTestId("add-party-type-select");
    this.guardianNameInput = page.getByTestId("add-party-guardian-name-input");
    this.guardianRelationSelect = page.getByTestId("add-party-guardian-relation-select");
    this.addressInput = page.getByTestId("add-party-address-input");
    this.codeError = page.getByTestId("add-party-code-error");
    this.nameError = page.getByTestId("add-party-name-error");

    this.tinInput = page.getByTestId("add-party-tin-input");
    this.guarantorInput = page.getByTestId("add-party-guarantor-input");
    this.villageHindiInput = page.getByTestId("add-party-village-hindi-input");
    this.remarkInput = page.getByTestId("add-party-remark-input");

    this.creditLimitInput = page.getByTestId("add-party-credit-limit-input");
    this.drLimitInput = page.getByTestId("add-party-dr-limit-input");
    this.depreciationRateInput = page.getByTestId("add-party-depreciation-rate-input");
    this.interestBardanaSelect = page.getByTestId("add-party-interest-bardana-select");
    this.chargeInterestFromInput = page.getByTestId("add-party-charge-interest-from-input");
    this.dueDaysInput = page.getByTestId("add-party-due-days-input");
    this.saudaLimitInput = page.getByTestId("add-party-sauda-limit-input");

    this.submitButton = page.getByTestId("add-party-submit-button");
    this.cancelButton = page.getByTestId("add-party-cancel-button");
  }

  async switchToTab(tab: "basic" | "details" | "financial") {
    const tabMap = {
      basic: this.tabBasic,
      details: this.tabDetails,
      financial: this.tabFinancial,
    };
    await tabMap[tab].click();
  }

  async fillBasicInfo(data: { code: string; name: string; phone?: string; village?: string }) {
    await this.codeInput.fill(data.code);
    await this.nameInput.fill(data.name);
    if (data.phone) await this.phoneInput.fill(data.phone);
    if (data.village) await this.villageInput.fill(data.village);
  }

  async fillIdentityDetails(data: { tin?: string; guarantor?: string; villageHindi?: string; remark?: string }) {
    await this.switchToTab("details");
    if (data.tin) await this.tinInput.fill(data.tin);
    if (data.guarantor) await this.guarantorInput.fill(data.guarantor);
    if (data.villageHindi) await this.villageHindiInput.fill(data.villageHindi);
    if (data.remark) await this.remarkInput.fill(data.remark);
  }

  async fillFinancialSettings(data: { creditLimit?: string; drLimit?: string; dueDays?: string }) {
    await this.switchToTab("financial");
    if (data.creditLimit) {
      await this.creditLimitInput.clear();
      await this.creditLimitInput.fill(data.creditLimit);
    }
    if (data.drLimit) {
      await this.drLimitInput.clear();
      await this.drLimitInput.fill(data.drLimit);
    }
    if (data.dueDays) {
      await this.dueDaysInput.clear();
      await this.dueDaysInput.fill(data.dueDays);
    }
  }

  async submit() {
    await this.submitButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }
}
