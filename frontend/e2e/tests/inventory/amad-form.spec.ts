import { test, expect } from "../../fixtures";
import {
  MOCK_COMMODITIES,
  MOCK_ROOMS,
  MOCK_VILLAGES,
  MOCK_PARTY_ACCOUNTS,
} from "../../helpers/test-data";

test.describe("Amad Form Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/masters\/commodities/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_COMMODITIES),
      });
    });

    await page.route(/\/api\/masters\/rooms/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_ROOMS),
      });
    });

    await page.route(/\/api\/masters\/villages/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_VILLAGES),
      });
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
        body: JSON.stringify({ next_number: "KB/2025-00004" }),
      });
    });
  });

  test("page renders with title and back button", async ({ amadFormPage }) => {
    await amadFormPage.goto();
    await expect(amadFormPage.title).toBeVisible();
    await expect(amadFormPage.title).toHaveText("New Amad Entry");
    await expect(amadFormPage.backButton).toBeVisible();
  });

  test("form shows all required fields", async ({ amadFormPage }) => {
    await amadFormPage.goto();
    await expect(amadFormPage.form).toBeVisible();
    await expect(amadFormPage.dateInput).toBeVisible();
    await expect(amadFormPage.typeSelect).toBeVisible();
    await expect(amadFormPage.partyCombobox).toBeVisible();
    await expect(amadFormPage.commodityCombobox).toBeVisible();
    await expect(amadFormPage.submitButton).toBeVisible();
  });

  test("date defaults to today", async ({ amadFormPage }) => {
    await amadFormPage.goto();
    const today = new Date().toISOString().split("T")[0];
    await expect(amadFormPage.dateInput).toHaveValue(today);
  });

  test("amad type defaults to SEEDHI", async ({ amadFormPage }) => {
    await amadFormPage.goto();
    await expect(amadFormPage.typeSelect).toContainText("Seedhi");
  });

  test("packet calculator shows 3 rows with inputs", async ({ amadFormPage }) => {
    await amadFormPage.goto();
    await expect(amadFormPage.packetCalculator).toBeVisible();
    await expect(amadFormPage.pkt1Input).toBeVisible();
    await expect(amadFormPage.pwt1Input).toBeVisible();
    await expect(amadFormPage.pkt2Input).toBeVisible();
    await expect(amadFormPage.pwt2Input).toBeVisible();
    await expect(amadFormPage.pkt3Input).toBeVisible();
    await expect(amadFormPage.pwt3Input).toBeVisible();
  });

  test("packet calculator totals update on input", async ({ amadFormPage }) => {
    await amadFormPage.goto();
    await amadFormPage.pkt1Input.fill("10");
    await amadFormPage.pwt1Input.fill("500");
    await amadFormPage.pkt2Input.fill("5");
    await amadFormPage.pwt2Input.fill("250");
    await expect(amadFormPage.totalPackets).toContainText("15");
    await expect(amadFormPage.totalWeight).toContainText("750");
  });

  test("cancel navigates back", async ({ page, amadFormPage }) => {
    await amadFormPage.goto();
    await amadFormPage.cancelButton.click();
    await expect(page).toHaveURL(/\/app\/inventory\/amad$/);
  });

  test("optional fields are present", async ({ amadFormPage }) => {
    await amadFormPage.goto();
    await expect(amadFormPage.marksInput).toBeVisible();
    await expect(amadFormPage.graceDaysInput).toBeVisible();
    await expect(amadFormPage.rentRateInput).toBeVisible();
    await expect(amadFormPage.villageSelect).toBeVisible();
    await expect(amadFormPage.roomSelect).toBeVisible();
    await expect(amadFormPage.ewayInput).toBeVisible();
  });

  test("back button navigates to amad list", async ({ page, amadFormPage }) => {
    await amadFormPage.goto();
    await amadFormPage.backButton.click();
    await expect(page).toHaveURL(/\/app\/inventory\/amad$/);
  });

  test("submit button is visible with correct text", async ({ amadFormPage }) => {
    await amadFormPage.goto();
    await expect(amadFormPage.submitButton).toBeVisible();
    await expect(amadFormPage.submitButton).toContainText("Save Amad");
  });
});
