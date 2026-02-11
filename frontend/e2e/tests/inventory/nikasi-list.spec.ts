import { test, expect } from "../../fixtures";
import { MOCK_RENTS } from "../../helpers/test-data";

test.describe("Nikasi List Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/inventory\/rent/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_RENTS),
        });
      } else {
        await route.continue();
      }
    });
  });

  test("page renders with title and new dispatch button", async ({ nikasiListPage }) => {
    await nikasiListPage.goto();
    await expect(nikasiListPage.title).toBeVisible();
    await expect(nikasiListPage.title).toHaveText("Nikasi (Goods Dispatch)");
    await expect(nikasiListPage.newButton).toBeVisible();
  });

  test("stat cards display computed values", async ({ nikasiListPage }) => {
    await nikasiListPage.goto();
    await expect(nikasiListPage.kpiTotalDispatches).toBeVisible();
    await expect(nikasiListPage.kpiTotalPackets).toBeVisible();
    await expect(nikasiListPage.kpiTotalRent).toBeVisible();
  });

  test("table renders rows with correct data", async ({ nikasiListPage }) => {
    await nikasiListPage.goto();
    await expect(nikasiListPage.table).toBeVisible();
    await expect(nikasiListPage.getRow(0)).toBeVisible();
    await expect(nikasiListPage.getRow(0)).toContainText("NK/2025-00001");
    await expect(nikasiListPage.getRow(0)).toContainText("Ram Singh");
    await expect(nikasiListPage.getRow(1)).toContainText("NK/2025-00002");
    await expect(nikasiListPage.getRow(1)).toContainText("KATAI");
  });

  test("search filters dispatches", async ({ nikasiListPage }) => {
    await nikasiListPage.goto();
    await nikasiListPage.searchInput.fill("Shyam");
    await expect(nikasiListPage.getRow(0)).toContainText("Shyam Kumar");
  });

  test("empty state when no dispatches", async ({ page, nikasiListPage }) => {
    await page.route(/\/api\/inventory\/rent/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });
    await nikasiListPage.goto();
    await expect(nikasiListPage.emptyState).toBeVisible();
    await expect(nikasiListPage.emptyState).toContainText("No dispatch entries found");
  });

  test("new dispatch button navigates to form", async ({ page, nikasiListPage }) => {
    await nikasiListPage.goto();
    await nikasiListPage.newButton.click();
    await expect(page).toHaveURL(/\/app\/inventory\/nikasi\/new/);
  });

  test("SEEDHI dispatch shows correct badge", async ({ nikasiListPage }) => {
    await nikasiListPage.goto();
    await expect(nikasiListPage.getRow(0)).toContainText("SEEDHI");
  });

  test("view button visible on row hover", async ({ nikasiListPage }) => {
    await nikasiListPage.goto();
    await nikasiListPage.getRow(0).hover();
    await expect(nikasiListPage.getViewButton(0)).toBeVisible();
  });
});
