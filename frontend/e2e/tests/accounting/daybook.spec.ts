import { test, expect } from "../../fixtures";
import { MOCK_DAYBOOK_SUMMARY, MOCK_DAYBOOK_TRANSACTIONS } from "../../helpers/test-data";

test.describe("Daybook Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/accounting\/daybook/, async (route) => {
      const url = route.request().url();
      if (route.request().method() === "GET") {
        if (url.includes("transactions")) {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(MOCK_DAYBOOK_TRANSACTIONS),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(MOCK_DAYBOOK_SUMMARY),
          });
        }
      } else {
        await route.continue();
      }
    });
  });

  test("page renders with title", async ({ page, daybookPage }) => {
    await daybookPage.goto();
    await expect(daybookPage.title).toBeVisible();
    await expect(daybookPage.title).toHaveText("Daybook");
  });

  test("date navigator is visible with all controls", async ({ page, daybookPage }) => {
    await daybookPage.goto();
    await expect(daybookPage.dateNavigator).toBeVisible();
    await expect(daybookPage.prevButton).toBeVisible();
    await expect(daybookPage.nextButton).toBeVisible();
    await expect(daybookPage.todayButton).toBeVisible();
  });

  test("cash summary card renders with values", async ({ page, daybookPage }) => {
    await daybookPage.goto();
    await expect(daybookPage.cashCard).toBeVisible();
    await expect(daybookPage.cashOpening).toBeVisible();
    await expect(daybookPage.cashReceipts).toBeVisible();
    await expect(daybookPage.cashPayments).toBeVisible();
    await expect(daybookPage.cashClosing).toBeVisible();
  });

  test("bank summary card renders with values", async ({ page, daybookPage }) => {
    await daybookPage.goto();
    await expect(daybookPage.bankCard).toBeVisible();
    await expect(daybookPage.bankOpening).toBeVisible();
    await expect(daybookPage.bankReceipts).toBeVisible();
    await expect(daybookPage.bankPayments).toBeVisible();
    await expect(daybookPage.bankClosing).toBeVisible();
  });

  test("transaction table renders with data", async ({ page, daybookPage }) => {
    await daybookPage.goto();
    await expect(daybookPage.transactionTable).toBeVisible();
    await expect(daybookPage.getTransactionRow(0)).toBeVisible();
    await expect(daybookPage.getTransactionRow(1)).toBeVisible();
    await expect(daybookPage.getTransactionRow(2)).toBeVisible();
  });

  test("transaction row displays correct data", async ({ page, daybookPage }) => {
    await daybookPage.goto();
    const firstRow = daybookPage.getTransactionRow(0);
    await expect(firstRow).toContainText("CR/2025-00001");
    await expect(firstRow).toContainText("Cash in Hand");
  });

  test("transaction filter tabs are visible", async ({ page, daybookPage }) => {
    await daybookPage.goto();
    await expect(daybookPage.filterAll).toBeVisible();
    await expect(daybookPage.filterReceipts).toBeVisible();
    await expect(daybookPage.filterPayments).toBeVisible();
    await expect(daybookPage.filterJournal).toBeVisible();
  });

  test("receipts filter activates on click", async ({ page, daybookPage }) => {
    await daybookPage.goto();
    await expect(daybookPage.transactionTable).toBeVisible();
    await daybookPage.switchFilter("receipts");
    await expect(daybookPage.filterReceipts).toHaveAttribute("data-state", "active");
  });

  test("payments filter activates on click", async ({ page, daybookPage }) => {
    await daybookPage.goto();
    await expect(daybookPage.transactionTable).toBeVisible();
    await daybookPage.switchFilter("payments");
    await expect(daybookPage.filterPayments).toHaveAttribute("data-state", "active");
  });

  test("close day button is visible when day is not closed", async ({ page, daybookPage }) => {
    await daybookPage.goto();
    await expect(daybookPage.closeDayButton).toBeVisible();
  });

  test("day closed badge shown when day is closed", async ({ page, daybookPage }) => {
    await page.route(/\/api\/accounting\/daybook/, async (route) => {
      const url = route.request().url();
      if (url.includes("transactions")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_DAYBOOK_TRANSACTIONS),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ...MOCK_DAYBOOK_SUMMARY, is_closed: true }),
        });
      }
    });
    await daybookPage.goto();
    await expect(daybookPage.dayClosedBadge).toBeVisible();
    await expect(daybookPage.dayClosedBadge).toContainText("Day Closed");
  });

  test("empty state when no transactions", async ({ page, daybookPage }) => {
    await page.route(/\/api\/accounting\/daybook/, async (route) => {
      const url = route.request().url();
      if (url.includes("transactions")) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_DAYBOOK_SUMMARY),
        });
      }
    });
    await daybookPage.goto();
    await expect(daybookPage.transactionEmpty).toBeVisible();
    await expect(daybookPage.transactionEmpty).toContainText("No transactions for this date");
  });
});
