import { test, expect } from "../../fixtures";
import { MOCK_FLAT_ACCOUNTS, MOCK_NEXT_NUMBER } from "../../helpers/test-data";

test.describe("New Voucher Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/accounting\/accounts/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_FLAT_ACCOUNTS),
        });
      } else {
        await route.continue();
      }
    });
    await page.route(/\/api\/system\/next-number/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_NEXT_NUMBER),
      });
    });
    await page.route(/\/api\/accounting\/vouchers/, async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ id: "new-voucher" }),
        });
      } else {
        await route.continue();
      }
    });
  });

  test("page renders with title and back button", async ({ page, newVoucherPage }) => {
    await newVoucherPage.goto();
    await expect(newVoucherPage.title).toBeVisible();
    await expect(newVoucherPage.title).toHaveText("New Voucher");
    await expect(newVoucherPage.backButton).toBeVisible();
  });

  test("all sections are visible", async ({ page, newVoucherPage }) => {
    await newVoucherPage.goto();
    await expect(newVoucherPage.typeSelector).toBeVisible();
    await expect(newVoucherPage.doubleEntryForm).toBeVisible();
    await expect(newVoucherPage.narrationInput).toBeVisible();
    await expect(newVoucherPage.paymentDetails).toBeVisible();
  });

  test("voucher type selector defaults to CR", async ({ page, newVoucherPage }) => {
    await newVoucherPage.goto();
    await expect(newVoucherPage.typeCR).toHaveAttribute("data-state", "on");
  });

  test("switch to DR type", async ({ page, newVoucherPage }) => {
    await newVoucherPage.goto();
    await newVoucherPage.selectVoucherType("DR");
    await expect(newVoucherPage.typeDR).toHaveAttribute("data-state", "on");
    await expect(newVoucherPage.typeCR).toHaveAttribute("data-state", "off");
  });

  test("switch to JV type", async ({ page, newVoucherPage }) => {
    await newVoucherPage.goto();
    await newVoucherPage.selectVoucherType("JV");
    await expect(newVoucherPage.typeJV).toHaveAttribute("data-state", "on");
  });

  test("voucher type label updates", async ({ page, newVoucherPage }) => {
    await newVoucherPage.goto();
    await expect(newVoucherPage.typeLabel).toBeVisible();
  });

  test("double entry starts with two empty lines", async ({ page, newVoucherPage }) => {
    await newVoucherPage.goto();
    await expect(newVoucherPage.getLineDebitInput(0)).toBeVisible();
    await expect(newVoucherPage.getLineCreditInput(0)).toBeVisible();
    await expect(newVoucherPage.getLineDebitInput(1)).toBeVisible();
    await expect(newVoucherPage.getLineCreditInput(1)).toBeVisible();
  });

  test("add line button adds a new row", async ({ page, newVoucherPage }) => {
    await newVoucherPage.goto();
    await newVoucherPage.addLine();
    await expect(newVoucherPage.getLineDebitInput(2)).toBeVisible();
    await expect(newVoucherPage.getLineCreditInput(2)).toBeVisible();
  });

  test("delete button disabled when only 2 lines", async ({ page, newVoucherPage }) => {
    await newVoucherPage.goto();
    await expect(newVoucherPage.getLineDeleteButton(0)).toBeDisabled();
    await expect(newVoucherPage.getLineDeleteButton(1)).toBeDisabled();
  });

  test("delete button enabled when more than 2 lines", async ({ page, newVoucherPage }) => {
    await newVoucherPage.goto();
    await newVoucherPage.addLine();
    await expect(newVoucherPage.getLineDeleteButton(0)).toBeEnabled();
  });

  test("entering debit disables credit for same line", async ({ page, newVoucherPage }) => {
    await newVoucherPage.goto();
    await newVoucherPage.getLineDebitInput(0).fill("1000");
    await expect(newVoucherPage.getLineCreditInput(0)).toBeDisabled();
  });

  test("entering credit disables debit for same line", async ({ page, newVoucherPage }) => {
    await newVoucherPage.goto();
    await newVoucherPage.getLineCreditInput(0).fill("1000");
    await expect(newVoucherPage.getLineDebitInput(0)).toBeDisabled();
  });

  test("totals and balance indicator visible", async ({ page, newVoucherPage }) => {
    await newVoucherPage.goto();
    await expect(newVoucherPage.totalDebit).toBeVisible();
    await expect(newVoucherPage.totalCredit).toBeVisible();
    await expect(newVoucherPage.balanceIndicator).toBeVisible();
  });

  test("difference text shown when unbalanced", async ({ page, newVoucherPage }) => {
    await newVoucherPage.goto();
    await newVoucherPage.getLineDebitInput(0).fill("1000");
    await expect(newVoucherPage.differenceText).toBeVisible();
    await expect(newVoucherPage.differenceText).toContainText("Difference");
  });

  test("payment mode cheque shows cheque fields", async ({ page, newVoucherPage }) => {
    await newVoucherPage.goto();
    await newVoucherPage.selectPaymentMode("cheque");
    await expect(newVoucherPage.chequeNoInput).toBeVisible();
    await expect(newVoucherPage.chequeDateInput).toBeVisible();
  });

  test("payment mode bank shows bank field", async ({ page, newVoucherPage }) => {
    await newVoucherPage.goto();
    await newVoucherPage.selectPaymentMode("bank");
    await expect(newVoucherPage.bankNameInput).toBeVisible();
  });

  test("payment mode UPI shows UPI field", async ({ page, newVoucherPage }) => {
    await newVoucherPage.goto();
    await newVoucherPage.selectPaymentMode("upi");
    await expect(newVoucherPage.upiRefInput).toBeVisible();
  });

  test("save button disabled when zero or unbalanced", async ({ page, newVoucherPage }) => {
    await newVoucherPage.goto();
    // No amounts entered - should be disabled
    await expect(newVoucherPage.saveButton).toBeDisabled();
    await expect(newVoucherPage.savePrintButton).toBeDisabled();
  });
});
