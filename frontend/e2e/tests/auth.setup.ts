import { test as base } from "@playwright/test";
import { authenticateUser } from "../fixtures";
import { TEST_USERS } from "../helpers";

const authFile = "e2e/.auth/user.json";

base("authenticate", async ({ page }) => {
  await authenticateUser(
    page,
    TEST_USERS.default.email,
    TEST_USERS.default.password,
    authFile
  );
});
