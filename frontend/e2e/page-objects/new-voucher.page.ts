import type { Locator, Page } from "@playwright/test";

export class NewVoucherPage {
  readonly page: Page;
  readonly title: Locator;
  readonly backButton: Locator;
  readonly datePicker: Locator;
  readonly numberInput: Locator;
  readonly narrationInput: Locator;
  readonly saveButton: Locator;
  readonly savePrintButton: Locator;
  readonly cancelButton: Locator;

  // Voucher type selector
  readonly typeSelector: Locator;
  readonly typeCR: Locator;
  readonly typeDR: Locator;
  readonly typeJV: Locator;
  readonly typeCV: Locator;
  readonly typeBH: Locator;
  readonly typeLabel: Locator;

  // Double entry form
  readonly doubleEntryForm: Locator;
  readonly doubleEntryTable: Locator;
  readonly totalDebit: Locator;
  readonly totalCredit: Locator;
  readonly balanceIndicator: Locator;
  readonly addLineButton: Locator;
  readonly differenceText: Locator;

  // Payment details
  readonly paymentDetails: Locator;
  readonly paymentModeCash: Locator;
  readonly paymentModeCheque: Locator;
  readonly paymentModeBank: Locator;
  readonly paymentModeUpi: Locator;
  readonly chequeNoInput: Locator;
  readonly chequeDateInput: Locator;
  readonly bankNameInput: Locator;
  readonly upiRefInput: Locator;

  // Amount in words
  readonly amountInWords: Locator;
  readonly amountInWordsValue: Locator;
  readonly amountInWordsText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId("new-voucher-title");
    this.backButton = page.getByTestId("new-voucher-back-button");
    this.datePicker = page.getByTestId("new-voucher-date-picker");
    this.numberInput = page.getByTestId("new-voucher-number-input");
    this.narrationInput = page.getByTestId("new-voucher-narration-input");
    this.saveButton = page.getByTestId("new-voucher-save-button");
    this.savePrintButton = page.getByTestId("new-voucher-save-print-button");
    this.cancelButton = page.getByTestId("new-voucher-cancel-button");

    this.typeSelector = page.getByTestId("voucher-type-selector");
    this.typeCR = page.getByTestId("voucher-type-CR");
    this.typeDR = page.getByTestId("voucher-type-DR");
    this.typeJV = page.getByTestId("voucher-type-JV");
    this.typeCV = page.getByTestId("voucher-type-CV");
    this.typeBH = page.getByTestId("voucher-type-BH");
    this.typeLabel = page.getByTestId("voucher-type-label");

    this.doubleEntryForm = page.getByTestId("double-entry-form");
    this.doubleEntryTable = page.getByTestId("double-entry-table");
    this.totalDebit = page.getByTestId("voucher-total-debit");
    this.totalCredit = page.getByTestId("voucher-total-credit");
    this.balanceIndicator = page.getByTestId("voucher-balance-indicator");
    this.addLineButton = page.getByTestId("voucher-add-line-button");
    this.differenceText = page.getByTestId("voucher-difference-text");

    this.paymentDetails = page.getByTestId("payment-details");
    this.paymentModeCash = page.getByTestId("payment-mode-cash");
    this.paymentModeCheque = page.getByTestId("payment-mode-cheque");
    this.paymentModeBank = page.getByTestId("payment-mode-bank");
    this.paymentModeUpi = page.getByTestId("payment-mode-upi");
    this.chequeNoInput = page.getByTestId("payment-cheque-no-input");
    this.chequeDateInput = page.getByTestId("payment-cheque-date-input");
    this.bankNameInput = page.getByTestId("payment-bank-name-input");
    this.upiRefInput = page.getByTestId("payment-upi-ref-input");

    this.amountInWords = page.getByTestId("amount-in-words");
    this.amountInWordsValue = page.getByTestId("amount-in-words-value");
    this.amountInWordsText = page.getByTestId("amount-in-words-text");
  }

  async goto() {
    await this.page.goto("/app/accounts/vouchers/new");
  }

  async selectVoucherType(type: "CR" | "DR" | "JV" | "CV" | "BH") {
    const typeMap = {
      CR: this.typeCR,
      DR: this.typeDR,
      JV: this.typeJV,
      CV: this.typeCV,
      BH: this.typeBH,
    };
    await typeMap[type].click();
  }

  getLineAccountButton(index: number): Locator {
    return this.page.getByTestId(`voucher-line-account-${index}`);
  }

  getLineDebitInput(index: number): Locator {
    return this.page.getByTestId(`voucher-line-debit-${index}`);
  }

  getLineCreditInput(index: number): Locator {
    return this.page.getByTestId(`voucher-line-credit-${index}`);
  }

  getLineDeleteButton(index: number): Locator {
    return this.page.getByTestId(`voucher-line-delete-${index}`);
  }

  async addLine() {
    await this.addLineButton.click();
  }

  async setNarration(text: string) {
    await this.narrationInput.fill(text);
  }

  async selectPaymentMode(mode: "cash" | "cheque" | "bank" | "upi") {
    const modeMap = {
      cash: this.paymentModeCash,
      cheque: this.paymentModeCheque,
      bank: this.paymentModeBank,
      upi: this.paymentModeUpi,
    };
    await modeMap[mode].click();
  }

  async save() {
    await this.saveButton.click();
  }
}
