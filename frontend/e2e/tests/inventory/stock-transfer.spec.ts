import { test, expect } from "../../fixtures";
import {
  MOCK_AMADS,
  MOCK_PARTY_ACCOUNTS,
} from "../../helpers/test-data";

test.describe("Stock Transfer Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/inventory\/amad/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_AMADS.filter((a) => !a.is_fully_dispatched)),
        });
      } else {
        await route.continue();
      }
    });

    await page.route(/\/api\/accounting\/parties/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_PARTY_ACCOUNTS),
      });
    });
  });

  test("page renders with title and back button", async ({ stockTransferPage }) => {
    await stockTransferPage.goto();
    await expect(stockTransferPage.title).toBeVisible();
    await expect(stockTransferPage.title).toHaveText("Stock Transfer");
    await expect(stockTransferPage.backButton).toBeVisible();
  });

  test("wizard shows step 1 initially with step indicator", async ({ stockTransferPage }) => {
    await stockTransferPage.goto();
    await expect(stockTransferPage.wizard).toBeVisible();
    await expect(stockTransferPage.stepIndicator).toBeVisible();
    await expect(stockTransferPage.sourceParty).toBeVisible();
    await expect(stockTransferPage.sourceAmad).toBeVisible();
  });

  test("step 1: next button disabled without amad selection", async ({ stockTransferPage }) => {
    await stockTransferPage.goto();
    await expect(stockTransferPage.nextButton).toBeDisabled();
  });

  test("step indicator shows 4 steps", async ({ stockTransferPage }) => {
    await stockTransferPage.goto();
    await expect(stockTransferPage.getStep(1)).toBeVisible();
    await expect(stockTransferPage.getStep(2)).toBeVisible();
    await expect(stockTransferPage.getStep(3)).toBeVisible();
    await expect(stockTransferPage.getStep(4)).toBeVisible();
  });

  test("cancel button on step 1 navigates away", async ({ page, stockTransferPage }) => {
    await stockTransferPage.goto();
    await stockTransferPage.prevButton.click();
    await expect(page).toHaveURL(/\/app\/inventory\/amad/);
  });

  test("back button returns to amad list", async ({ page, stockTransferPage }) => {
    await stockTransferPage.goto();
    await stockTransferPage.backButton.click();
    await expect(page).toHaveURL(/\/app\/inventory\/amad/);
  });

  test("source party combobox is visible in step 1", async ({ stockTransferPage }) => {
    await stockTransferPage.goto();
    await expect(stockTransferPage.sourceParty).toBeVisible();
    await expect(stockTransferPage.sourceAmad).toBeVisible();
  });

  test("source detail card not visible without selection", async ({ stockTransferPage }) => {
    await stockTransferPage.goto();
    await expect(stockTransferPage.sourceDetail).not.toBeVisible();
  });

  test("prev button shows Cancel text on step 1", async ({ stockTransferPage }) => {
    await stockTransferPage.goto();
    await expect(stockTransferPage.prevButton).toContainText("Cancel");
  });

  test("next button shows Next text", async ({ stockTransferPage }) => {
    await stockTransferPage.goto();
    await expect(stockTransferPage.nextButton).toContainText("Next");
  });
});
