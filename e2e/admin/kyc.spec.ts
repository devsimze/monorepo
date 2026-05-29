import { test, expect, LoginPage } from "../helpers/fixtures";

test.describe("Admin KYC review", () => {
  test.beforeEach(async ({ page, seed }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(seed.users.admin.email, seed.users.admin.password);
  });

  test("open pending KYC submission → approve → status changes", async ({
    page,
  }) => {
    await page.goto("/admin/kyc");
    await expect(page.getByRole("heading", { name: /kyc/i })).toBeVisible();

    const pendingRow = page.getByText(/pending/i).first();
    if (!(await pendingRow.isVisible())) {
      // No pending KYC submissions in the test environment — assert empty state
      await expect(
        page.getByText(/no pending|empty|no records/i),
      ).toBeVisible();
      return;
    }

    await pendingRow.click();
    await expect(page).toHaveURL(/admin\/kyc\/.+/);

    const approveBtn = page.getByRole("button", { name: /approve/i });
    await expect(approveBtn).toBeVisible();
    await approveBtn.click();

    // Confirm dialog if present
    const confirmBtn = page.getByRole("button", { name: /confirm|yes/i });
    if (await confirmBtn.isVisible({ timeout: 2_000 })) {
      await confirmBtn.click();
    }

    await expect(page.getByText(/approved|status.*approved/i)).toBeVisible();
  });
});
