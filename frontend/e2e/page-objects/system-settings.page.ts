import type { Locator, Page } from "@playwright/test";

export class SystemSettingsPage {
  readonly page: Page;

  // Main tab locators
  readonly companyTab: Locator;
  readonly usersTab: Locator;
  readonly permissionsTab: Locator;
  readonly configurationTab: Locator;
  readonly auditTab: Locator;
  readonly dashboardTab: Locator;

  // Config sub-tab locators
  readonly generalTab: Locator;
  readonly rentTab: Locator;
  readonly interestTab: Locator;
  readonly packetsTab: Locator;
  readonly chargesTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.companyTab = page.getByTestId("system-tab-company");
    this.usersTab = page.getByTestId("system-tab-users");
    this.permissionsTab = page.getByTestId("system-tab-permissions");
    this.configurationTab = page.getByTestId("system-tab-configuration");
    this.auditTab = page.getByTestId("system-tab-audit");
    this.dashboardTab = page.getByTestId("system-tab-dashboard");

    this.generalTab = page.getByTestId("config-tab-general");
    this.rentTab = page.getByTestId("config-tab-rent");
    this.interestTab = page.getByTestId("config-tab-interest");
    this.packetsTab = page.getByTestId("config-tab-packets");
    this.chargesTab = page.getByTestId("config-tab-charges");
  }

  async goto() {
    await this.page.goto("/app/system/settings");
  }

  async switchToTab(
    tabName:
      | "company"
      | "users"
      | "permissions"
      | "configuration"
      | "audit"
      | "dashboard"
  ) {
    const tabMap = {
      company: this.companyTab,
      users: this.usersTab,
      permissions: this.permissionsTab,
      configuration: this.configurationTab,
      audit: this.auditTab,
      dashboard: this.dashboardTab,
    };
    await tabMap[tabName].click();
  }

  async switchToConfigTab(
    tabName: "general" | "rent" | "interest" | "packets" | "charges"
  ) {
    const tabMap = {
      general: this.generalTab,
      rent: this.rentTab,
      interest: this.interestTab,
      packets: this.packetsTab,
      charges: this.chargesTab,
    };
    await tabMap[tabName].click();
  }
}
