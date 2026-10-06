import { expect, test } from "@playwright/test";

const DEMO_TOKEN = "0xde70a11ce0000001";

test("a visitor can type the demo token and walk the whole product life", async ({ page }) => {
  await page.goto("/verify");
  await page.getByRole("button", { name: "Use the demo token" }).click();
  await expect(page.locator("#token-input")).toHaveValue(DEMO_TOKEN);
  await page.getByRole("button", { name: "Look up" }).click();

  await expect(page).toHaveURL(new RegExp(`/product/${DEMO_TOKEN}$`));
  await expect(page.getByText("Demo journey")).toBeVisible();

  for (const label of ["Ship it", "Receive it", "Shelve it", "Sell it"]) {
    await page.getByRole("button", { name: label }).click();
    await expect(page.getByRole("button", { name: label })).toBeHidden();
  }

  await expect(page.getByText(/sold/i).first()).toBeVisible();
  await page.getByRole("button", { name: "Restart journey" }).click();
  await expect(page.getByRole("button", { name: "Ship it" })).toBeVisible();
});

test("typing the token by hand works the same as the shortcut", async ({ page }) => {
  await page.goto("/verify");
  await page.locator("#token-input").fill(DEMO_TOKEN.toUpperCase().replace("0X", "0x"));
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Ship it" })).toBeVisible();
});

test("a manufacturer can mint without picking a token id", async ({ page }) => {
  await page.goto("/manufacturer");
  await page.getByRole("button", { name: /fill demo data/i }).click();
  await page.getByLabel(/token id/i).fill("");
  await page.getByRole("button", { name: /register & commission/i }).click();
  await expect(page.getByText(/minted and commissioned|QR/i).first()).toBeVisible();
});

test("an unknown token says so instead of hanging", async ({ page }) => {
  await page.goto("/product/0xdoesnotexist");
  await expect(page.getByText(/can.t verify this product/i).first()).toBeVisible();
});
