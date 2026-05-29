import { test, expect, LoginPage } from "../helpers/fixtures";

test.describe("Whistleblower report submission", () => {
  test.beforeEach(async ({ page, seed }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(
      seed.users.whistleblower.email,
      seed.users.whistleblower.password,
    );
  });

  test("submit a report against a listing → confirmation shown", async ({
    page,
    seed,
  }) => {
    // Navigate to the seeded listing
    await page.goto(`/listings/${seed.listingId}`);
    await expect(page.getByRole("main")).toBeVisible();

    const reportBtn = page.getByRole("button", { name: /report|flag/i });
    await expect(reportBtn).toBeVisible();
    await reportBtn.click();

    // Fill in the report form
    await page.getByLabel(/reason|description/i).fill(
      "This listing contains false information about the property size.",
    );

    const submitBtn = page.getByRole("button", { name: /submit report|send/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    await expect(
      page.getByText(/report submitted|thank you|under review/i),
    ).toBeVisible();
  });
});
