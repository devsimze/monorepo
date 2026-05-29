import { test, expect, LoginPage } from "../helpers/fixtures";

test.describe("Tenant auth flow", () => {
  test("sign up with email → OTP → dashboard", async ({ page, seed }) => {
    const email = `new_${Date.now()}@shelterflex.test`;
    await page.goto("/signup");
    await page.getByLabel(/email/i).fill(email);
    await page.getByRole("button", { name: /sign up|continue/i }).click();

    await expect(page.getByText(/verification code|OTP/i)).toBeVisible();

    const otp = process.env.TEST_OTP ?? "123456";
    await page.getByRole("textbox", { name: /code/i }).fill(otp);
    await page.getByRole("button", { name: /verify|confirm/i }).click();

    await expect(page).toHaveURL(/onboarding|dashboard/);
  });

  test("login with existing credentials → dashboard", async ({ page, seed }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(seed.users.tenant.email, seed.users.tenant.password);
    await expect(page).toHaveURL(/dashboard/);
  });

  test("forgot password flow shows confirmation", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel(/email/i).fill("tenant@shelterflex.test");
    await page.getByRole("button", { name: /reset|send/i }).click();
    await expect(
      page.getByText(/check your email|reset link sent/i),
    ).toBeVisible();
  });
});
