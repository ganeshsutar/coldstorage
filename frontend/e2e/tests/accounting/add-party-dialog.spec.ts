import { test, expect } from "../../fixtures";
import { MOCK_ACCOUNTS_SUMMARY, MOCK_PARTY_ACCOUNTS } from "../../helpers/test-data";

test.describe("Add Party Dialog", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/accounting\/accounts\/summary/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_ACCOUNTS_SUMMARY),
      });
    });
    await page.route(/\/api\/accounting\/parties/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_PARTY_ACCOUNTS),
        });
      } else if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ id: "new-party", ...JSON.parse(route.request().postData() || "{}") }),
        });
      } else {
        await route.continue();
      }
    });
  });

  test("dialog opens with three tabs", async ({ page, partyLedgerPage, addPartyDialog }) => {
    await partyLedgerPage.goto();
    await partyLedgerPage.openAddPartyDialog();
    await expect(addPartyDialog.dialog).toBeVisible();
    await expect(addPartyDialog.tabBasic).toBeVisible();
    await expect(addPartyDialog.tabDetails).toBeVisible();
    await expect(addPartyDialog.tabFinancial).toBeVisible();
  });

  test("basic tab shows all fields", async ({ page, partyLedgerPage, addPartyDialog }) => {
    await partyLedgerPage.goto();
    await partyLedgerPage.openAddPartyDialog();
    await expect(addPartyDialog.codeInput).toBeVisible();
    await expect(addPartyDialog.nameInput).toBeVisible();
    await expect(addPartyDialog.phoneInput).toBeVisible();
    await expect(addPartyDialog.villageInput).toBeVisible();
    await expect(addPartyDialog.typeSelect).toBeVisible();
    await expect(addPartyDialog.guardianNameInput).toBeVisible();
    await expect(addPartyDialog.addressInput).toBeVisible();
  });

  test("identity tab shows all fields", async ({ page, partyLedgerPage, addPartyDialog }) => {
    await partyLedgerPage.goto();
    await partyLedgerPage.openAddPartyDialog();
    await addPartyDialog.switchToTab("details");
    await expect(addPartyDialog.tinInput).toBeVisible();
    await expect(addPartyDialog.guarantorInput).toBeVisible();
    await expect(addPartyDialog.villageHindiInput).toBeVisible();
    await expect(addPartyDialog.remarkInput).toBeVisible();
  });

  test("financial tab shows all fields", async ({ page, partyLedgerPage, addPartyDialog }) => {
    await partyLedgerPage.goto();
    await partyLedgerPage.openAddPartyDialog();
    await addPartyDialog.switchToTab("financial");
    await expect(addPartyDialog.creditLimitInput).toBeVisible();
    await expect(addPartyDialog.drLimitInput).toBeVisible();
    await expect(addPartyDialog.depreciationRateInput).toBeVisible();
    await expect(addPartyDialog.interestBardanaSelect).toBeVisible();
    await expect(addPartyDialog.chargeInterestFromInput).toBeVisible();
    await expect(addPartyDialog.dueDaysInput).toBeVisible();
    await expect(addPartyDialog.saudaLimitInput).toBeVisible();
  });

  test("tab switching works correctly", async ({ page, partyLedgerPage, addPartyDialog }) => {
    await partyLedgerPage.goto();
    await partyLedgerPage.openAddPartyDialog();

    // Basic tab active by default
    await expect(addPartyDialog.tabBasic).toHaveAttribute("data-state", "active");

    // Switch to details
    await addPartyDialog.switchToTab("details");
    await expect(addPartyDialog.tabDetails).toHaveAttribute("data-state", "active");

    // Switch to financial
    await addPartyDialog.switchToTab("financial");
    await expect(addPartyDialog.tabFinancial).toHaveAttribute("data-state", "active");

    // Back to basic
    await addPartyDialog.switchToTab("basic");
    await expect(addPartyDialog.tabBasic).toHaveAttribute("data-state", "active");
  });

  test("validation - code required", async ({ page, partyLedgerPage, addPartyDialog }) => {
    await partyLedgerPage.goto();
    await partyLedgerPage.openAddPartyDialog();
    await addPartyDialog.nameInput.fill("Test Party");
    await addPartyDialog.submit();
    await expect(addPartyDialog.codeError).toBeVisible();
  });

  test("validation - name required", async ({ page, partyLedgerPage, addPartyDialog }) => {
    await partyLedgerPage.goto();
    await partyLedgerPage.openAddPartyDialog();
    await addPartyDialog.codeInput.fill("9001");
    await addPartyDialog.submit();
    await expect(addPartyDialog.nameError).toBeVisible();
  });

  test("submit and cancel buttons visible", async ({ page, partyLedgerPage, addPartyDialog }) => {
    await partyLedgerPage.goto();
    await partyLedgerPage.openAddPartyDialog();
    await expect(addPartyDialog.submitButton).toBeVisible();
    await expect(addPartyDialog.cancelButton).toBeVisible();
  });

  test("cancel closes dialog", async ({ page, partyLedgerPage, addPartyDialog }) => {
    await partyLedgerPage.goto();
    await partyLedgerPage.openAddPartyDialog();
    await expect(addPartyDialog.dialog).toBeVisible();
    await addPartyDialog.cancel();
    await expect(addPartyDialog.dialog).not.toBeVisible();
  });

  test("create party with valid data closes dialog", async ({ page, partyLedgerPage, addPartyDialog }) => {
    await partyLedgerPage.goto();
    await partyLedgerPage.openAddPartyDialog();
    await addPartyDialog.fillBasicInfo({ code: "9001", name: "New Test Party", phone: "1234567890" });
    await addPartyDialog.submit();
    // Dialog should close after successful creation
    await expect(addPartyDialog.dialog).not.toBeVisible({ timeout: 5000 });
  });
});
