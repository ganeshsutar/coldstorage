import { test, expect } from "../../fixtures";
import {
  MOCK_TAKPATTIS,
  MOCK_AMADS,
  MOCK_ROOMS,
} from "../../helpers/test-data";

test.describe("Takpatti Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/inventory\/takpatti/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_TAKPATTIS),
        });
      } else {
        await route.continue();
      }
    });

    await page.route(/\/api\/inventory\/amad/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_AMADS),
      });
    });

    await page.route(/\/api\/masters\/rooms/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_ROOMS),
      });
    });

    await page.route(/\/api\/system\/next-number/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ next_number: "TP/2025-00003" }),
      });
    });
  });

  test("page renders with title and new button", async ({ takpattiListPage }) => {
    await takpattiListPage.goto();
    await expect(takpattiListPage.title).toBeVisible();
    await expect(takpattiListPage.title).toHaveText("Takpatti");
    await expect(takpattiListPage.newButton).toBeVisible();
  });

  test("table renders rows with correct data", async ({ takpattiListPage }) => {
    await takpattiListPage.goto();
    await expect(takpattiListPage.table).toBeVisible();
    await expect(takpattiListPage.getRow(0)).toBeVisible();
    await expect(takpattiListPage.getRow(0)).toContainText("TP/2025-00001");
    await expect(takpattiListPage.getRow(0)).toContainText("KB/2025-00001");
    await expect(takpattiListPage.getRow(0)).toContainText("Ram Singh");
  });

  test("search filters by takpatti number", async ({ takpattiListPage }) => {
    await takpattiListPage.goto();
    await takpattiListPage.searchInput.fill("TP/2025-00002");
    await expect(takpattiListPage.getRow(0)).toContainText("TP/2025-00002");
  });

  test("empty state when no takpattis", async ({ page, takpattiListPage }) => {
    await page.route(/\/api\/inventory\/takpatti/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });
    await takpattiListPage.goto();
    await expect(takpattiListPage.emptyState).toBeVisible();
    await expect(takpattiListPage.emptyState).toContainText("No takpatti entries found");
  });

  test("new button opens dialog with form", async ({ takpattiListPage, takpattiFormPage }) => {
    await takpattiListPage.goto();
    await takpattiListPage.newButton.click();
    await expect(takpattiListPage.dialog).toBeVisible();
    await expect(takpattiFormPage.form).toBeVisible();
  });

  test("dialog form shows all fields", async ({ takpattiListPage, takpattiFormPage }) => {
    await takpattiListPage.goto();
    await takpattiListPage.newButton.click();
    await expect(takpattiFormPage.dateInput).toBeVisible();
    await expect(takpattiFormPage.amadCombobox).toBeVisible();
    await expect(takpattiFormPage.packetsInput).toBeVisible();
    await expect(takpattiFormPage.grossWeightInput).toBeVisible();
    await expect(takpattiFormPage.tareWeightInput).toBeVisible();
    await expect(takpattiFormPage.netWeight).toBeVisible();
    await expect(takpattiFormPage.roomSelect).toBeVisible();
    await expect(takpattiFormPage.floorInput).toBeVisible();
  });

  test("net weight calculated dynamically", async ({ takpattiListPage, takpattiFormPage }) => {
    await takpattiListPage.goto();
    await takpattiListPage.newButton.click();
    await takpattiFormPage.grossWeightInput.fill("1000");
    await takpattiFormPage.tareWeightInput.fill("50");
    await expect(takpattiFormPage.netWeight).toContainText("950");
  });

  test("delete button shows confirmation dialog", async ({ takpattiListPage }) => {
    await takpattiListPage.goto();
    await takpattiListPage.getRow(0).hover();
    await takpattiListPage.getDeleteButton(0).click();
    await expect(takpattiListPage.deleteConfirm).toBeVisible();
  });

  test("cancel closes dialog", async ({ takpattiListPage, takpattiFormPage }) => {
    await takpattiListPage.goto();
    await takpattiListPage.newButton.click();
    await expect(takpattiListPage.dialog).toBeVisible();
    await takpattiFormPage.cancelButton.click();
    await expect(takpattiListPage.dialog).not.toBeVisible();
  });
});
