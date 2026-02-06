import type { Locator, Page } from "@playwright/test";

export class CompanySettingsSection {
  readonly page: Page;

  // Company info inputs
  readonly nameInput: Locator;
  readonly nameHindiInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly phoneInput: Locator;
  readonly faxInput: Locator;
  readonly emailInput: Locator;

  // Tax inputs
  readonly gstInput: Locator;
  readonly panInput: Locator;
  readonly tanInput: Locator;
  readonly cinInput: Locator;

  // Owner inputs
  readonly ownerNameInput: Locator;
  readonly ownerAadharInput: Locator;
  readonly upiInput: Locator;

  // Form controls
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  // Tax settings form
  readonly taxCgstInput: Locator;
  readonly taxSgstInput: Locator;
  readonly taxIgstInput: Locator;
  readonly taxSubmitButton: Locator;
  readonly taxErrorMessage: Locator;
  readonly taxSuccessMessage: Locator;

  // Bank settings form
  readonly bankNameInput: Locator;
  readonly bankBranchInput: Locator;
  readonly bankAccountInput: Locator;
  readonly bankIfscInput: Locator;
  readonly bankSubmitButton: Locator;
  readonly bankErrorMessage: Locator;
  readonly bankSuccessMessage: Locator;

  // Financial year form
  readonly fyStartMonthSelect: Locator;
  readonly fyCurrentYearInput: Locator;
  readonly fyFromDateInput: Locator;
  readonly fyToDateInput: Locator;
  readonly fySubmitButton: Locator;
  readonly fyErrorMessage: Locator;
  readonly fySuccessMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    // Company info
    this.nameInput = page.getByTestId("company-name-input");
    this.nameHindiInput = page.getByTestId("company-name-hindi-input");
    this.addressInput = page.getByTestId("company-address-input");
    this.cityInput = page.getByTestId("company-city-input");
    this.stateInput = page.getByTestId("company-state-input");
    this.phoneInput = page.getByTestId("company-phone-input");
    this.faxInput = page.getByTestId("company-fax-input");
    this.emailInput = page.getByTestId("company-email-input");

    // Tax info
    this.gstInput = page.getByTestId("company-gst-input");
    this.panInput = page.getByTestId("company-pan-input");
    this.tanInput = page.getByTestId("company-tan-input");
    this.cinInput = page.getByTestId("company-cin-input");

    // Owner info
    this.ownerNameInput = page.getByTestId("company-owner-name-input");
    this.ownerAadharInput = page.getByTestId("company-owner-aadhar-input");
    this.upiInput = page.getByTestId("company-upi-input");

    // Form controls
    this.submitButton = page.getByTestId("company-submit-button");
    this.errorMessage = page.getByTestId("company-error-message");
    this.successMessage = page.getByTestId("company-success-message");

    // Tax settings
    this.taxCgstInput = page.getByTestId("tax-cgst-input");
    this.taxSgstInput = page.getByTestId("tax-sgst-input");
    this.taxIgstInput = page.getByTestId("tax-igst-input");
    this.taxSubmitButton = page.getByTestId("tax-submit-button");
    this.taxErrorMessage = page.getByTestId("tax-error-message");
    this.taxSuccessMessage = page.getByTestId("tax-success-message");

    // Bank settings
    this.bankNameInput = page.getByTestId("bank-name-input");
    this.bankBranchInput = page.getByTestId("bank-branch-input");
    this.bankAccountInput = page.getByTestId("bank-account-input");
    this.bankIfscInput = page.getByTestId("bank-ifsc-input");
    this.bankSubmitButton = page.getByTestId("bank-submit-button");
    this.bankErrorMessage = page.getByTestId("bank-error-message");
    this.bankSuccessMessage = page.getByTestId("bank-success-message");

    // Financial year
    this.fyStartMonthSelect = page.getByTestId("fy-start-month-select");
    this.fyCurrentYearInput = page.getByTestId("fy-current-year-input");
    this.fyFromDateInput = page.getByTestId("fy-from-date-input");
    this.fyToDateInput = page.getByTestId("fy-to-date-input");
    this.fySubmitButton = page.getByTestId("fy-submit-button");
    this.fyErrorMessage = page.getByTestId("fy-error-message");
    this.fySuccessMessage = page.getByTestId("fy-success-message");
  }

  async fillCompanyInfo(data: {
    name?: string;
    nameHindi?: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
    email?: string;
  }) {
    if (data.name !== undefined) {
      await this.nameInput.clear();
      await this.nameInput.fill(data.name);
    }
    if (data.nameHindi !== undefined) {
      await this.nameHindiInput.clear();
      await this.nameHindiInput.fill(data.nameHindi);
    }
    if (data.address !== undefined) {
      await this.addressInput.clear();
      await this.addressInput.fill(data.address);
    }
    if (data.city !== undefined) {
      await this.cityInput.clear();
      await this.cityInput.fill(data.city);
    }
    if (data.state !== undefined) {
      await this.stateInput.clear();
      await this.stateInput.fill(data.state);
    }
    if (data.phone !== undefined) {
      await this.phoneInput.clear();
      await this.phoneInput.fill(data.phone);
    }
    if (data.email !== undefined) {
      await this.emailInput.clear();
      await this.emailInput.fill(data.email);
    }
  }

  async getSuccessText(): Promise<string | null> {
    try {
      await this.successMessage.waitFor({ timeout: 5000 });
      return this.successMessage.textContent();
    } catch {
      return null;
    }
  }

  async getErrorText(): Promise<string | null> {
    try {
      await this.errorMessage.waitFor({ timeout: 5000 });
      return this.errorMessage.textContent();
    } catch {
      return null;
    }
  }
}
