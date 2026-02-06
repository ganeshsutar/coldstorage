import { test, expect } from "../../fixtures";

test.describe("User Management", () => {
  test.beforeEach(async ({ systemSettingsPage }) => {
    await systemSettingsPage.goto();
    await systemSettingsPage.switchToTab("users");
  });

  test("user list renders with table or empty state", async ({
    userManagement,
  }) => {
    // Either the table or empty state should be visible
    const tableVisible = await userManagement.table
      .isVisible()
      .catch(() => false);
    const emptyVisible = await userManagement.emptyState
      .isVisible()
      .catch(() => false);
    expect(tableVisible || emptyVisible).toBe(true);
  });

  test("add user button is visible", async ({ userManagement }) => {
    await expect(userManagement.addUserButton).toBeVisible();
  });

  test("add user button opens dialog", async ({ userManagement }) => {
    await userManagement.openAddUserDialog();

    await expect(userManagement.dialogEmailInput).toBeVisible();
    await expect(userManagement.dialogFullnameInput).toBeVisible();
    await expect(userManagement.dialogPasswordInput).toBeVisible();
  });

  test("create user dialog renders with all expected fields", async ({
    userManagement,
  }) => {
    await userManagement.openAddUserDialog();

    await expect(userManagement.dialogEmailInput).toBeVisible();
    await expect(userManagement.dialogFullnameInput).toBeVisible();
    await expect(userManagement.dialogPasswordInput).toBeVisible();
    await expect(userManagement.dialogPhoneInput).toBeVisible();
    await expect(userManagement.dialogRoleSelect).toBeVisible();
    await expect(userManagement.dialogLoanLimitInput).toBeVisible();
    await expect(userManagement.dialogBackdateLimitInput).toBeVisible();
    await expect(userManagement.dialogSubmitButton).toBeVisible();
    await expect(userManagement.dialogCancelButton).toBeVisible();
  });

  test("validation: email required on create", async ({
    userManagement,
  }) => {
    await userManagement.openAddUserDialog();
    await userManagement.dialogFullnameInput.fill("Test User");
    await userManagement.dialogPasswordInput.fill("TestPass123");
    await userManagement.submitDialog();

    await expect(
      userManagement.page.getByText("Valid email required")
    ).toBeVisible();
  });

  test("validation: name required on create", async ({
    userManagement,
  }) => {
    await userManagement.openAddUserDialog();
    await userManagement.dialogEmailInput.fill("test@example.com");
    await userManagement.dialogPasswordInput.fill("TestPass123");
    await userManagement.submitDialog();

    await expect(
      userManagement.page.getByText("Name is required")
    ).toBeVisible();
  });

  test("validation: password min 8 chars on create", async ({
    userManagement,
  }) => {
    await userManagement.openAddUserDialog();
    await userManagement.dialogEmailInput.fill("test@example.com");
    await userManagement.dialogFullnameInput.fill("Test User");
    await userManagement.dialogPasswordInput.fill("short");
    await userManagement.submitDialog();

    await expect(
      userManagement.page.getByText("Password must be at least 8 characters")
    ).toBeVisible();
  });

  test("can create a new user with valid data", async ({
    userManagement,
  }) => {
    await userManagement.openAddUserDialog();
    const timestamp = Date.now();
    await userManagement.fillCreateUserForm({
      email: `e2etest+${timestamp}@example.com`,
      fullName: "E2E Test User",
      password: "TestPass123!",
    });
    await userManagement.submitDialog();

    // Dialog should close on success
    await expect(userManagement.dialogEmailInput).not.toBeVisible({
      timeout: 10000,
    });
  });

  test("cancel button closes dialog", async ({ userManagement }) => {
    await userManagement.openAddUserDialog();
    await expect(userManagement.dialogEmailInput).toBeVisible();

    await userManagement.dialogCancelButton.click();
    await expect(userManagement.dialogEmailInput).not.toBeVisible();
  });
});
