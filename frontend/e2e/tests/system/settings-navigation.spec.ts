import { test, expect } from "../../fixtures";
import { SYSTEM_ROUTES } from "../../helpers";

test.describe("Settings Navigation", () => {
  test.beforeEach(async ({ systemSettingsPage }) => {
    await systemSettingsPage.goto();
  });

  test("settings page loads successfully with all tabs visible", async ({
    systemSettingsPage,
  }) => {
    await expect(systemSettingsPage.companyTab).toBeVisible();
    await expect(systemSettingsPage.usersTab).toBeVisible();
    await expect(systemSettingsPage.permissionsTab).toBeVisible();
    await expect(systemSettingsPage.configurationTab).toBeVisible();
    await expect(systemSettingsPage.auditTab).toBeVisible();
    await expect(systemSettingsPage.dashboardTab).toBeVisible();
  });

  test("can navigate to Company Info tab", async ({ systemSettingsPage }) => {
    await systemSettingsPage.switchToTab("company");
    await expect(systemSettingsPage.companyTab).toHaveAttribute(
      "data-state",
      "active"
    );
  });

  test("can navigate to Users tab", async ({ systemSettingsPage }) => {
    await systemSettingsPage.switchToTab("users");
    await expect(systemSettingsPage.usersTab).toHaveAttribute(
      "data-state",
      "active"
    );
  });

  test("can navigate to Permissions tab", async ({ systemSettingsPage }) => {
    await systemSettingsPage.switchToTab("permissions");
    await expect(systemSettingsPage.permissionsTab).toHaveAttribute(
      "data-state",
      "active"
    );
  });

  test("can navigate to Configuration tab", async ({
    systemSettingsPage,
  }) => {
    await systemSettingsPage.switchToTab("configuration");
    await expect(systemSettingsPage.configurationTab).toHaveAttribute(
      "data-state",
      "active"
    );
  });

  test("can navigate to Audit Log tab", async ({ systemSettingsPage }) => {
    await systemSettingsPage.switchToTab("audit");
    await expect(systemSettingsPage.auditTab).toHaveAttribute(
      "data-state",
      "active"
    );
  });

  test("can navigate to Dashboard tab", async ({ systemSettingsPage }) => {
    await systemSettingsPage.switchToTab("dashboard");
    await expect(systemSettingsPage.dashboardTab).toHaveAttribute(
      "data-state",
      "active"
    );
  });

  test("configuration tab shows sub-tabs", async ({ systemSettingsPage }) => {
    await systemSettingsPage.switchToTab("configuration");

    await expect(systemSettingsPage.generalTab).toBeVisible();
    await expect(systemSettingsPage.rentTab).toBeVisible();
    await expect(systemSettingsPage.interestTab).toBeVisible();
    await expect(systemSettingsPage.packetsTab).toBeVisible();
    await expect(systemSettingsPage.chargesTab).toBeVisible();
  });

  test("can navigate between configuration sub-tabs", async ({
    systemSettingsPage,
  }) => {
    await systemSettingsPage.switchToTab("configuration");

    await systemSettingsPage.switchToConfigTab("rent");
    await expect(systemSettingsPage.rentTab).toHaveAttribute(
      "data-state",
      "active"
    );

    await systemSettingsPage.switchToConfigTab("interest");
    await expect(systemSettingsPage.interestTab).toHaveAttribute(
      "data-state",
      "active"
    );

    await systemSettingsPage.switchToConfigTab("packets");
    await expect(systemSettingsPage.packetsTab).toHaveAttribute(
      "data-state",
      "active"
    );

    await systemSettingsPage.switchToConfigTab("charges");
    await expect(systemSettingsPage.chargesTab).toHaveAttribute(
      "data-state",
      "active"
    );

    await systemSettingsPage.switchToConfigTab("general");
    await expect(systemSettingsPage.generalTab).toHaveAttribute(
      "data-state",
      "active"
    );
  });
});
