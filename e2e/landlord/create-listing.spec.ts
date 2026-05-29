import { test, expect, LoginPage } from "../helpers/fixtures";

test.describe("Landlord listing creation", () => {
  test.beforeEach(async ({ page, seed }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(seed.users.landlord.email, seed.users.landlord.password);
  });

  test("fill all sections → submit → appears in Pending Review", async ({
    page,
  }) => {
    await page.goto("/dashboard/landlord/properties/new");

    // Step 1 – basic details
    await page.getByLabel(/title|property name/i).fill("E2E Test Property");
    await page.getByLabel(/address/i).fill("456 Playwright Ave, Abuja, NG");
    await page.getByLabel(/bedrooms/i).fill("3");
    await page.getByLabel(/monthly rent/i).fill("350000");
    await page.getByRole("button", { name: /next|continue/i }).click();

    // Step 2 – description / amenities
    const descBox = page.getByLabel(/description/i);
    if (await descBox.isVisible()) {
      await descBox.fill("A spacious 3-bedroom apartment with modern finishes.");
    }
    await page.getByRole("button", { name: /next|continue|skip/i }).click();

    // Step 3 – review & submit
    const submitBtn = page.getByRole("button", { name: /submit|publish|list/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Confirm it is now in pending review
    await expect(
      page.getByText(/pending review|submitted for review/i),
    ).toBeVisible();

    // Navigate to properties list and verify it appears
    await page.goto("/dashboard/landlord/properties");
    await expect(page.getByText("E2E Test Property")).toBeVisible();
  });
});
