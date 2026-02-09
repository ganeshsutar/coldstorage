import { test, expect } from "../../fixtures";
import { MOCK_INTEREST_RESULT } from "../../helpers/test-data";

test.describe("Interest Calculation Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/accounting\/interest\/calculate/, async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_INTEREST_RESULT),
        });
      } else {
        await route.continue();
      }
    });
    await page.route(/\/api\/accounting\/interest\/post/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });
  });

  test("page renders with title and calculate button", async ({ page, interestCalculationPage }) => {
    await interestCalculationPage.goto();
    await expect(interestCalculationPage.title).toBeVisible();
    await expect(interestCalculationPage.title).toHaveText("Interest Calculation");
    await expect(interestCalculationPage.calculateButton).toBeVisible();
  });

  test("parameter fields are visible", async ({ page, interestCalculationPage }) => {
    await interestCalculationPage.goto();
    await expect(interestCalculationPage.calculationParams).toBeVisible();
    await expect(interestCalculationPage.rateInput).toBeVisible();
    await expect(interestCalculationPage.daysInYearSelect).toBeVisible();
  });

  test("party selection radios are visible", async ({ page, interestCalculationPage }) => {
    await interestCalculationPage.goto();
    await expect(interestCalculationPage.partySelector).toBeVisible();
    await expect(interestCalculationPage.partyAllRadio).toBeVisible();
    await expect(interestCalculationPage.partySelectedRadio).toBeVisible();
  });

  test("component checkboxes are visible", async ({ page, interestCalculationPage }) => {
    await interestCalculationPage.goto();
    await expect(interestCalculationPage.componentCheckboxes).toBeVisible();
    await expect(interestCalculationPage.componentRent).toBeVisible();
    await expect(interestCalculationPage.componentLoan).toBeVisible();
    await expect(interestCalculationPage.componentBardana).toBeVisible();
    await expect(interestCalculationPage.componentOther).toBeVisible();
  });

  test("rent checkbox is checked by default", async ({ page, interestCalculationPage }) => {
    await interestCalculationPage.goto();
    await expect(interestCalculationPage.componentRent).toHaveAttribute("data-state", "checked");
  });

  test("loan checkbox is checked by default", async ({ page, interestCalculationPage }) => {
    await interestCalculationPage.goto();
    await expect(interestCalculationPage.componentLoan).toHaveAttribute("data-state", "checked");
  });

  test("bardana checkbox is checked by default", async ({ page, interestCalculationPage }) => {
    await interestCalculationPage.goto();
    await expect(interestCalculationPage.componentBardana).toHaveAttribute("data-state", "checked");
  });

  test("other checkbox is unchecked by default", async ({ page, interestCalculationPage }) => {
    await interestCalculationPage.goto();
    await expect(interestCalculationPage.componentOther).toHaveAttribute("data-state", "unchecked");
  });

  test("toggle component checkbox works", async ({ page, interestCalculationPage }) => {
    await interestCalculationPage.goto();
    // Toggle other on
    await interestCalculationPage.toggleComponent("other");
    await expect(interestCalculationPage.componentOther).toHaveAttribute("data-state", "checked");
    // Toggle other off
    await interestCalculationPage.toggleComponent("other");
    await expect(interestCalculationPage.componentOther).toHaveAttribute("data-state", "unchecked");
  });

  test("results card appears after calculation", async ({ page, interestCalculationPage }) => {
    await interestCalculationPage.goto();
    await interestCalculationPage.calculate();
    await expect(interestCalculationPage.resultsCard).toBeVisible();
    await expect(interestCalculationPage.totalAmount).toBeVisible();
  });

  test("result table shows party rows", async ({ page, interestCalculationPage }) => {
    await interestCalculationPage.goto();
    await interestCalculationPage.calculate();
    await expect(interestCalculationPage.resultTable).toBeVisible();
    await expect(interestCalculationPage.getResultRow(0)).toBeVisible();
    await expect(interestCalculationPage.getResultRow(0)).toContainText("Ram Singh");
    await expect(interestCalculationPage.getResultRow(1)).toBeVisible();
    await expect(interestCalculationPage.getResultRow(1)).toContainText("Shyam Kumar");
  });

  test("result footer shows totals", async ({ page, interestCalculationPage }) => {
    await interestCalculationPage.goto();
    await interestCalculationPage.calculate();
    await expect(interestCalculationPage.totalPrincipal).toBeVisible();
    await expect(interestCalculationPage.totalInterest).toBeVisible();
  });

  test("preview and post buttons visible after calculation", async ({ page, interestCalculationPage }) => {
    await interestCalculationPage.goto();
    await interestCalculationPage.calculate();
    await expect(interestCalculationPage.previewButton).toBeVisible();
    await expect(interestCalculationPage.postButton).toBeVisible();
  });

  test("error message shown on calculation failure", async ({ page, interestCalculationPage }) => {
    await page.route(/\/api\/accounting\/interest\/calculate/, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Calculation failed" }),
      });
    });
    await interestCalculationPage.goto();
    await interestCalculationPage.calculate();
    await expect(interestCalculationPage.errorMessage).toBeVisible({ timeout: 5000 });
  });
});
