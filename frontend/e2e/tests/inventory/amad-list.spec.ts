import { test, expect } from "../../fixtures";
import {
  MOCK_AMADS,
  MOCK_STOCK_SUMMARY,
  MOCK_TODAY_SUMMARY,
} from "../../helpers/test-data";

test.describe("Amad List Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/inventory\/amad\/summary/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_STOCK_SUMMARY),
      });
    });

    await page.route(/\/api\/inventory\/amad\/today_summary/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_TODAY_SUMMARY),
      });
    });

    await page.route(/\/api\/inventory\/amad\/(\?|$)/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_AMADS),
        });
      } else {
        await route.continue();
      }
    });
  });

  test("page renders with title and new button", async ({ amadListPage }) => {
    await amadListPage.goto();
    await expect(amadListPage.title).toBeVisible();
    await expect(amadListPage.title).toHaveText("Amad (Goods Arrival)");
    await expect(amadListPage.newButton).toBeVisible();
  });

  test("KPI cards display summary data", async ({ amadListPage }) => {
    await amadListPage.goto();
    await expect(amadListPage.kpiTodayInward).toBeVisible();
    await expect(amadListPage.kpiTotalStock).toBeVisible();
    await expect(amadListPage.kpiActiveAmads).toBeVisible();
    await expect(amadListPage.kpiFullyDispatched).toBeVisible();
  });

  test("table renders rows with correct data", async ({ amadListPage }) => {
    await amadListPage.goto();
    await expect(amadListPage.table).toBeVisible();
    await expect(amadListPage.getRow(0)).toBeVisible();
    await expect(amadListPage.getRow(0)).toContainText("KB/2025-00001");
    await expect(amadListPage.getRow(0)).toContainText("Ram Singh");
    await expect(amadListPage.getRow(0)).toContainText("Wheat");
  });

  test("table shows all mock amad rows", async ({ amadListPage }) => {
    await amadListPage.goto();
    await expect(amadListPage.getRow(0)).toBeVisible();
    await expect(amadListPage.getRow(1)).toBeVisible();
    await expect(amadListPage.getRow(2)).toBeVisible();
  });

  test("search filters by party name", async ({ amadListPage }) => {
    await amadListPage.goto();
    await amadListPage.searchInput.fill("Shyam");
    await expect(amadListPage.getRow(0)).toContainText("Shyam Kumar");
  });

  test("search filters by amad number", async ({ amadListPage }) => {
    await amadListPage.goto();
    await amadListPage.searchInput.fill("KB/2025-00002");
    await expect(amadListPage.getRow(0)).toContainText("KB/2025-00002");
  });

  test("empty state when no amads", async ({ page, amadListPage }) => {
    await page.route(/\/api\/inventory\/amad\/(\?|$)/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });
    await amadListPage.goto();
    await expect(amadListPage.emptyState).toBeVisible();
    await expect(amadListPage.emptyState).toContainText("No amad entries found");
  });

  test("new button navigates to new amad page", async ({ page, amadListPage }) => {
    await amadListPage.goto();
    await amadListPage.newButton.click();
    await expect(page).toHaveURL(/\/app\/inventory\/amad\/new/);
  });

  test("view action button visible on row hover", async ({ amadListPage }) => {
    await amadListPage.goto();
    await amadListPage.getRow(0).hover();
    await expect(amadListPage.getViewButton(0)).toBeVisible();
  });

  test("dispatch button visible only for active amads", async ({ amadListPage }) => {
    await amadListPage.goto();
    // Row 0 is active - should have dispatch button
    await amadListPage.getRow(0).hover();
    await expect(amadListPage.getDispatchButton(0)).toBeVisible();
    // Row 2 is fully dispatched - dispatch button should not exist
    await amadListPage.getRow(2).hover();
    await expect(amadListPage.getDispatchButton(2)).not.toBeVisible();
  });

  test("completed amad shows Completed badge", async ({ amadListPage }) => {
    await amadListPage.goto();
    await expect(amadListPage.getRow(2)).toContainText("Completed");
  });
});
