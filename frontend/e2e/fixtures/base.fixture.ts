import { test as base } from "@playwright/test";
import {
  LoginPage,
  SystemSettingsPage,
  CompanySettingsSection,
  UserManagementSection,
  ConfigurationSection,
} from "../page-objects";

type Fixtures = {
  loginPage: LoginPage;
  systemSettingsPage: SystemSettingsPage;
  companySettings: CompanySettingsSection;
  userManagement: UserManagementSection;
  configuration: ConfigurationSection;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },
  systemSettingsPage: async ({ page }, use) => {
    const settingsPage = new SystemSettingsPage(page);
    await use(settingsPage);
  },
  companySettings: async ({ page }, use) => {
    const companySettings = new CompanySettingsSection(page);
    await use(companySettings);
  },
  userManagement: async ({ page }, use) => {
    const userManagement = new UserManagementSection(page);
    await use(userManagement);
  },
  configuration: async ({ page }, use) => {
    const configuration = new ConfigurationSection(page);
    await use(configuration);
  },
});

export { expect } from "@playwright/test";
