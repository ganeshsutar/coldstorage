import { test as base } from "@playwright/test";
import {
  LoginPage,
  SystemSettingsPage,
  CompanySettingsSection,
  UserManagementSection,
  ConfigurationSection,
  VoucherListPage,
  NewVoucherPage,
  DaybookPage,
  ChartOfAccountsPage,
  AddAccountDialog,
  PartyLedgerPage,
  PartyDetailSheet,
  AddPartyDialog,
  InterestCalculationPage,
} from "../page-objects";

type Fixtures = {
  loginPage: LoginPage;
  systemSettingsPage: SystemSettingsPage;
  companySettings: CompanySettingsSection;
  userManagement: UserManagementSection;
  configuration: ConfigurationSection;
  voucherListPage: VoucherListPage;
  newVoucherPage: NewVoucherPage;
  daybookPage: DaybookPage;
  chartOfAccountsPage: ChartOfAccountsPage;
  addAccountDialog: AddAccountDialog;
  partyLedgerPage: PartyLedgerPage;
  partyDetailSheet: PartyDetailSheet;
  addPartyDialog: AddPartyDialog;
  interestCalculationPage: InterestCalculationPage;
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
  voucherListPage: async ({ page }, use) => {
    await use(new VoucherListPage(page));
  },
  newVoucherPage: async ({ page }, use) => {
    await use(new NewVoucherPage(page));
  },
  daybookPage: async ({ page }, use) => {
    await use(new DaybookPage(page));
  },
  chartOfAccountsPage: async ({ page }, use) => {
    await use(new ChartOfAccountsPage(page));
  },
  addAccountDialog: async ({ page }, use) => {
    await use(new AddAccountDialog(page));
  },
  partyLedgerPage: async ({ page }, use) => {
    await use(new PartyLedgerPage(page));
  },
  partyDetailSheet: async ({ page }, use) => {
    await use(new PartyDetailSheet(page));
  },
  addPartyDialog: async ({ page }, use) => {
    await use(new AddPartyDialog(page));
  },
  interestCalculationPage: async ({ page }, use) => {
    await use(new InterestCalculationPage(page));
  },
});

export { expect } from "@playwright/test";
