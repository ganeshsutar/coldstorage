import type { Page } from "@playwright/test";
import { LoginPage } from "../page-objects";

export async function authenticateUser(
  page: Page,
  email: string,
  password: string,
  storageStatePath?: string
) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(email, password);
  await page.waitForURL("**/app/**", { timeout: 10000 });

  if (storageStatePath) {
    await page.context().storageState({ path: storageStatePath });
  }
}
