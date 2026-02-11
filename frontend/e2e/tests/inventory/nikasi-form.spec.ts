import { test, expect } from "../../fixtures";
import {
  MOCK_AMADS,
  MOCK_PARTY_ACCOUNTS,
} from "../../helpers/test-data";

test.describe("Nikasi Form Page", () => {
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

    await page.route(/\/api\/system\/next-number/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ next_number: "NK/2025-00003" }),
      });
    });

    await page.route(/\/api\/inventory\/rent\/calculate_rent/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          amad_no: "KB/2025-00001",
          amad_date: "2025-01-10",
          dispatch_date: "2025-01-20",
          packets: 40,
          weight: 2000,
          weight_quintals: 20.0,
          storage_days: 10,
          grace_days: 15,
          billable_days: 0,
          rent_rate: 12.5,
          rent_amount: 833.33,
          gst_percent: 18,
          gst_amount: 150,
          total_amount: 983.33,
        }),
      });
    });
  });

  test("page renders with title and back button", async ({ nikasiFormPage }) => {
    await nikasiFormPage.goto();
    await expect(nikasiFormPage.title).toBeVisible();
    await expect(nikasiFormPage.title).toHaveText("New Dispatch Entry");
    await expect(nikasiFormPage.backButton).toBeVisible();
  });

  test("form shows all required fields", async ({ nikasiFormPage }) => {
    await nikasiFormPage.goto();
    await expect(nikasiFormPage.form).toBeVisible();
    await expect(nikasiFormPage.dateInput).toBeVisible();
    await expect(nikasiFormPage.typeSelect).toBeVisible();
    await expect(nikasiFormPage.partyCombobox).toBeVisible();
    await expect(nikasiFormPage.amadCombobox).toBeVisible();
  });

  test("rent calculation card shows empty state initially", async ({ nikasiFormPage }) => {
    await nikasiFormPage.goto();
    await expect(nikasiFormPage.rentCalculationEmpty).toBeVisible();
    await expect(nikasiFormPage.rentCalculationEmpty).toContainText("Select an amad");
  });

  test("optional fields present", async ({ nikasiFormPage }) => {
    await nikasiFormPage.goto();
    await expect(nikasiFormPage.vehicleInput).toBeVisible();
    await expect(nikasiFormPage.receiverInput).toBeVisible();
    await expect(nikasiFormPage.narrationInput).toBeVisible();
  });

  test("submit button shows correct text", async ({ nikasiFormPage }) => {
    await nikasiFormPage.goto();
    await expect(nikasiFormPage.submitButton).toBeVisible();
    await expect(nikasiFormPage.submitButton).toContainText("Create Dispatch");
  });

  test("cancel navigates back", async ({ page, nikasiFormPage }) => {
    await nikasiFormPage.goto();
    await nikasiFormPage.cancelButton.click();
    await expect(page).toHaveURL(/\/app\/inventory\/nikasi$/);
  });

  test("back button navigates to nikasi list", async ({ page, nikasiFormPage }) => {
    await nikasiFormPage.goto();
    await nikasiFormPage.backButton.click();
    await expect(page).toHaveURL(/\/app\/inventory\/nikasi$/);
  });
});
