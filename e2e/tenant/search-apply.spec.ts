import { test, expect, LoginPage } from "../helpers/fixtures";

test.describe("Tenant property search & application", () => {
  test.beforeEach(async ({ page, seed }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(seed.users.tenant.email, seed.users.tenant.password);
  });

  test("search with filters → view listing → apply → confirmation", async ({
    page,
    seed,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();

    // Apply a filter
    const searchBox = page.getByPlaceholder(/search|find property/i);
    if (await searchBox.isVisible()) {
      await searchBox.fill("Lagos");
      await searchBox.press("Enter");
    }

    // Open the seeded listing
    const card = page.getByText("Test Property").first();
    await expect(card).toBeVisible();
    await card.click();

    // Listing detail page
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByRole("button", { name: /apply|secure/i }).click();

    // Application form
    await page.getByLabel(/employment|income/i).fill("Software Engineer");
    await page.getByLabel(/monthly income/i).fill("250000");
    await page.getByRole("button", { name: /submit|next/i }).click();

    await expect(page.getByText(/application submitted|confirm/i)).toBeVisible();
  });
});
