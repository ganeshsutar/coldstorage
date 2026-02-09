import { test, expect } from "../../fixtures";
import { MOCK_VOUCHERS } from "../../helpers/test-data";

test.describe("Voucher List Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/accounting\/vouchers/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_VOUCHERS),
        });
      } else {
        await route.continue();
      }
    });
  });

  test("page renders with title and new voucher button", async ({ page, voucherListPage }) => {
    await voucherListPage.goto();
    await expect(voucherListPage.title).toBeVisible();
    await expect(voucherListPage.title).toHaveText("Vouchers");
    await expect(voucherListPage.newVoucherButton).toBeVisible();
  });

  test("voucher table renders with mock data", async ({ page, voucherListPage }) => {
    await voucherListPage.goto();
    await expect(voucherListPage.table).toBeVisible();
    await expect(voucherListPage.getVoucherRow(0)).toBeVisible();
    await expect(voucherListPage.getVoucherRow(1)).toBeVisible();
    await expect(voucherListPage.getVoucherRow(2)).toBeVisible();
  });

  test("voucher row displays correct data", async ({ page, voucherListPage }) => {
    await voucherListPage.goto();
    const firstRow = voucherListPage.getVoucherRow(0);
    await expect(firstRow).toContainText("CR/2025-00001");
    await expect(firstRow).toContainText("CR");
  });

  test("all tabs are visible with counts", async ({ page, voucherListPage }) => {
    await voucherListPage.goto();
    await expect(voucherListPage.tabAll).toBeVisible();
    await expect(voucherListPage.tabReceipts).toBeVisible();
    await expect(voucherListPage.tabPayments).toBeVisible();
    await expect(voucherListPage.tabJournal).toBeVisible();
  });

  test("tab filtering - receipts tab activates", async ({ page, voucherListPage }) => {
    await voucherListPage.goto();
    await voucherListPage.switchToTab("receipts");
    await expect(voucherListPage.tabReceipts).toHaveAttribute("data-state", "active");
  });

  test("tab filtering - payments tab activates", async ({ page, voucherListPage }) => {
    await voucherListPage.goto();
    await voucherListPage.switchToTab("payments");
    await expect(voucherListPage.tabPayments).toHaveAttribute("data-state", "active");
  });

  test("tab filtering - journal tab activates", async ({ page, voucherListPage }) => {
    await voucherListPage.goto();
    await voucherListPage.switchToTab("journal");
    await expect(voucherListPage.tabJournal).toHaveAttribute("data-state", "active");
  });

  test("empty state when no vouchers", async ({ page, voucherListPage }) => {
    await page.route(/\/api\/accounting\/vouchers/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });
    await voucherListPage.goto();
    await expect(voucherListPage.emptyState).toBeVisible();
    await expect(voucherListPage.emptyState).toContainText("No vouchers found");
  });

  test("new voucher button navigates to new voucher page", async ({ page, voucherListPage }) => {
    await voucherListPage.goto();
    await voucherListPage.clickNewVoucher();
    await expect(page).toHaveURL(/\/app\/accounts\/vouchers\/new/);
  });
});
