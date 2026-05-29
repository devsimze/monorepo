import { test as base, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import type { SeedResult } from "./seed";

export function loadSeed(): SeedResult {
  const file = path.join(process.cwd(), "e2e/.seed.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, _password: string) {
    await this.page.getByLabel(/email/i).fill(email);
    await this.page.getByRole("button", { name: /send code|continue/i }).click();
    // In test mode the OTP is a fixed value or comes via the test API
    const otp = process.env.TEST_OTP ?? "123456";
    for (const digit of otp.split("")) {
      const input = this.page.locator(`input[data-otp-input]`).first();
      if (await input.isVisible()) {
        await input.fill(otp);
        break;
      }
      await this.page.getByRole("textbox").last().type(digit);
    }
    await this.page.getByRole("button", { name: /verify|confirm/i }).click();
    await this.page.waitForURL(/dashboard/);
  }
}

export const test = base.extend<{ seed: SeedResult }>({
  seed: async ({}, use) => {
    await use(loadSeed());
  },
});

export { expect } from "@playwright/test";
