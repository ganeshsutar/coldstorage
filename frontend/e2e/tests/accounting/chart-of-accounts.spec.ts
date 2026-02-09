import { test, expect } from "../../fixtures";
import { MOCK_ACCOUNT_TREE, MOCK_FLAT_ACCOUNTS } from "../../helpers/test-data";

test.describe("Chart of Accounts Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/api\/accounting\/accounts\/tree/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_ACCOUNT_TREE),
      });
    });
    await page.route(/\/api\/accounting\/accounts(?!\/tree)/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_FLAT_ACCOUNTS),
        });
      } else if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ id: "new-acc", ...JSON.parse(route.request().postData() || "{}") }),
        });
      } else {
        await route.continue();
      }
    });
  });

  test("page renders with title and buttons", async ({ page, chartOfAccountsPage }) => {
    await chartOfAccountsPage.goto();
    await expect(chartOfAccountsPage.title).toBeVisible();
    await expect(chartOfAccountsPage.title).toHaveText("Chart of Accounts");
    await expect(chartOfAccountsPage.addAccountButton).toBeVisible();
    await expect(chartOfAccountsPage.addPartyButton).toBeVisible();
  });

  test("account tree renders with hierarchy", async ({ page, chartOfAccountsPage }) => {
    await chartOfAccountsPage.goto();
    await expect(chartOfAccountsPage.accountTree).toBeVisible();
    await expect(chartOfAccountsPage.getTreeNode("grp-assets")).toBeVisible();
    await expect(chartOfAccountsPage.getTreeName("grp-assets")).toContainText("Assets");
  });

  test("child accounts are visible in expanded groups", async ({ page, chartOfAccountsPage }) => {
    await chartOfAccountsPage.goto();
    // Assets group should be expanded by default (level < 2)
    await expect(chartOfAccountsPage.getTreeNode("acc-cash")).toBeVisible();
    await expect(chartOfAccountsPage.getTreeName("acc-cash")).toContainText("Cash in Hand");
  });

  test("search filters accounts", async ({ page, chartOfAccountsPage }) => {
    await chartOfAccountsPage.goto();
    await chartOfAccountsPage.searchAccounts("Cash");
    await expect(chartOfAccountsPage.getTreeName("acc-cash")).toBeVisible();
  });

  test("search shows empty when no match", async ({ page, chartOfAccountsPage }) => {
    await chartOfAccountsPage.goto();
    await chartOfAccountsPage.searchAccounts("ZZZZNOTFOUND");
    await expect(chartOfAccountsPage.treeEmpty).toBeVisible();
    await expect(chartOfAccountsPage.treeEmpty).toContainText("No accounts found");
  });

  test("clicking node shows details in sidebar", async ({ page, chartOfAccountsPage }) => {
    await chartOfAccountsPage.goto();
    await chartOfAccountsPage.selectTreeNode("acc-cash");
    await expect(chartOfAccountsPage.detailCode).toBeVisible();
    await expect(chartOfAccountsPage.detailCode).toContainText("1001");
    await expect(chartOfAccountsPage.detailName).toContainText("Cash in Hand");
    await expect(chartOfAccountsPage.detailType).toContainText("Account");
  });

  test("group node shows sub-accounts count", async ({ page, chartOfAccountsPage }) => {
    await chartOfAccountsPage.goto();
    await chartOfAccountsPage.selectTreeNode("grp-assets");
    await expect(chartOfAccountsPage.detailType).toContainText("Group");
    await expect(chartOfAccountsPage.detailChildrenCount).toBeVisible();
    await expect(chartOfAccountsPage.detailChildrenCount).toContainText("2 accounts");
  });

  test("empty placeholder when no selection", async ({ page, chartOfAccountsPage }) => {
    await chartOfAccountsPage.goto();
    await expect(chartOfAccountsPage.detailEmpty).toBeVisible();
    await expect(chartOfAccountsPage.detailEmpty).toContainText("Select an account to view details");
  });

  test("add account dialog opens with all fields", async ({ page, chartOfAccountsPage, addAccountDialog }) => {
    await chartOfAccountsPage.goto();
    await chartOfAccountsPage.openAddAccountDialog();
    await expect(addAccountDialog.dialog).toBeVisible();
    await expect(addAccountDialog.codeInput).toBeVisible();
    await expect(addAccountDialog.nameInput).toBeVisible();
    await expect(addAccountDialog.typeSelect).toBeVisible();
    await expect(addAccountDialog.categorySelect).toBeVisible();
    await expect(addAccountDialog.parentSelect).toBeVisible();
  });

  test("add account validation - code and name required", async ({ page, chartOfAccountsPage, addAccountDialog }) => {
    await chartOfAccountsPage.goto();
    await chartOfAccountsPage.openAddAccountDialog();
    await addAccountDialog.submit();
    await expect(addAccountDialog.codeError).toBeVisible();
    await expect(addAccountDialog.nameError).toBeVisible();
  });

  test("add account dialog cancel closes it", async ({ page, chartOfAccountsPage, addAccountDialog }) => {
    await chartOfAccountsPage.goto();
    await chartOfAccountsPage.openAddAccountDialog();
    await expect(addAccountDialog.dialog).toBeVisible();
    await addAccountDialog.cancel();
    await expect(addAccountDialog.dialog).not.toBeVisible();
  });

  test("add party dialog opens from chart of accounts", async ({ page, chartOfAccountsPage, addPartyDialog }) => {
    await chartOfAccountsPage.goto();
    await chartOfAccountsPage.openAddPartyDialog();
    await expect(addPartyDialog.dialog).toBeVisible();
  });
});
