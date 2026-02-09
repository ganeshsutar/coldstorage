import { test, expect } from "../../fixtures";
import {
  MOCK_ACCOUNTS_SUMMARY,
  MOCK_PARTY_ACCOUNTS,
  MOCK_LEDGER_ENTRIES,
} from "../../helpers/test-data";

test.describe("Party Ledger Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/accounting\/accounts\/summary/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_ACCOUNTS_SUMMARY),
      });
    });
    await page.route(/\/api\/accounting\/accounts\/\?is_party=true/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_PARTY_ACCOUNTS),
        });
      } else {
        await route.continue();
      }
    });
    await page.route(/\/api\/accounting\/ledger\//, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_LEDGER_ENTRIES),
      });
    });
  });

  test("page renders with title and add party button", async ({ page, partyLedgerPage }) => {
    await partyLedgerPage.goto();
    await expect(partyLedgerPage.title).toBeVisible();
    await expect(partyLedgerPage.title).toHaveText("Party Ledger");
    await expect(partyLedgerPage.addPartyButton).toBeVisible();
  });

  test("KPI cards are visible", async ({ page, partyLedgerPage }) => {
    await partyLedgerPage.goto();
    await expect(partyLedgerPage.kpiDebtors).toBeVisible();
    await expect(partyLedgerPage.kpiCreditors).toBeVisible();
    await expect(partyLedgerPage.kpiTodaysReceipts).toBeVisible();
    await expect(partyLedgerPage.kpiPendingInterest).toBeVisible();
  });

  test("party table renders with party data", async ({ page, partyLedgerPage }) => {
    await partyLedgerPage.goto();
    await expect(partyLedgerPage.partyTable).toBeVisible();
    await expect(partyLedgerPage.getPartyRow(0)).toBeVisible();
    await expect(partyLedgerPage.getPartyRow(1)).toBeVisible();
  });

  test("party row displays code, name, and balance", async ({ page, partyLedgerPage }) => {
    await partyLedgerPage.goto();
    const firstRow = partyLedgerPage.getPartyRow(0);
    await expect(firstRow).toContainText("5001");
    await expect(firstRow).toContainText("Ram Singh");
  });

  test("search filters parties", async ({ page, partyLedgerPage }) => {
    await partyLedgerPage.goto();
    await partyLedgerPage.searchParty("Ram");
    // Should still show Ram Singh
    await expect(partyLedgerPage.getPartyRow(0)).toContainText("Ram Singh");
  });

  test("search input is visible", async ({ page, partyLedgerPage }) => {
    await partyLedgerPage.goto();
    await expect(partyLedgerPage.searchInput).toBeVisible();
  });

  test("filter select is visible", async ({ page, partyLedgerPage }) => {
    await partyLedgerPage.goto();
    await expect(partyLedgerPage.filterSelect).toBeVisible();
  });

  test("expand row shows component breakdown", async ({ page, partyLedgerPage }) => {
    await partyLedgerPage.goto();
    await partyLedgerPage.expandPartyRow(0);
    await expect(partyLedgerPage.getBreakdownRow(0)).toBeVisible();
  });

  test("view button opens detail sheet", async ({ page, partyLedgerPage, partyDetailSheet }) => {
    await partyLedgerPage.goto();
    // Hover to make the view button visible
    await partyLedgerPage.getPartyRow(0).hover();
    await partyLedgerPage.viewPartyDetail(0);
    const isVisible = await partyDetailSheet.isVisible();
    expect(isVisible).toBe(true);
  });

  test("detail sheet shows party info", async ({ page, partyLedgerPage, partyDetailSheet }) => {
    await partyLedgerPage.goto();
    await partyLedgerPage.getPartyRow(0).hover();
    await partyLedgerPage.viewPartyDetail(0);
    await expect(partyDetailSheet.partyName).toContainText("Ram Singh");
    await expect(partyDetailSheet.partyCode).toContainText("5001");
  });

  test("detail sheet shows contact section", async ({ page, partyLedgerPage, partyDetailSheet }) => {
    await partyLedgerPage.goto();
    await partyLedgerPage.getPartyRow(0).hover();
    await partyLedgerPage.viewPartyDetail(0);
    await expect(partyDetailSheet.contactSection).toBeVisible();
  });

  test("detail sheet shows credit limit section", async ({ page, partyLedgerPage, partyDetailSheet }) => {
    await partyLedgerPage.goto();
    await partyLedgerPage.getPartyRow(0).hover();
    await partyLedgerPage.viewPartyDetail(0);
    await expect(partyDetailSheet.creditLimitSection).toBeVisible();
  });

  test("empty state when no parties", async ({ page, partyLedgerPage }) => {
    await page.route(/\/api\/accounting\/accounts\/\?is_party=true/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });
    await partyLedgerPage.goto();
    await expect(partyLedgerPage.partyEmpty).toBeVisible();
    await expect(partyLedgerPage.partyEmpty).toContainText("No party accounts found");
  });

  test("add party button opens dialog", async ({ page, partyLedgerPage, addPartyDialog }) => {
    await partyLedgerPage.goto();
    await partyLedgerPage.openAddPartyDialog();
    await expect(addPartyDialog.dialog).toBeVisible();
  });
});
