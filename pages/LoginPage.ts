import { Page, Locator, expect } from '@playwright/test';
import { ensureCorretMarketplace, maskEmail } from '../utils/helpers';

const US_MARKETPLACE = 'https://www.audible.com/';

export class LoginPage {
  private page: Page;
  private url: string;
  private email: string;
  private password: string;

  private signInLink: Locator;
  private emailField: Locator;
  private continueButton: Locator;
  private passwordField: Locator;
  private signInButton: Locator;
  private libraryButton: Locator;
  private incorrectPassword: Locator;
  private hiUserName: Locator;
  private signout: Locator;
  private continueShoppingButton: Locator;

  constructor(page: Page, email: string, password: string) {
    this.page = page;
    this.url = US_MARKETPLACE;
    this.email = email;
    this.password = password;
    this.signInLink = page.getByRole('link', { name: 'Sign in' });
    this.emailField = page.getByRole('textbox', { name: 'Enter mobile number or email' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.passwordField = page.getByRole('textbox', { name: 'Password' });
    this.signInButton = page.locator('input#signInSubmit');
    this.libraryButton = page.getByRole('link', { name: 'Library', exact: true });
    this.incorrectPassword = page.getByText('Your password is incorrect');
    this.hiUserName = page.locator('xpath=//*[@id="navigation-barker-link"]/span');
    this.signout = page.locator('//*[@id="navigation-sign-out-link"]');
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue shopping' });
  }

  async goToUsMarketplace(): Promise<void> {
    await this.page.goto(this.url, { waitUntil: "domcontentloaded" });
  }

  async login(): Promise<void> {
    await this.goToUsMarketplace();
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});

    await ensureCorretMarketplace(this.page, this.url);
    await this.closeOfferPopUp();

    console.log(`Logging in with email: ${maskEmail(this.email)}`);

    await this.signInLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.signInLink.click();
    await this.openSignInForm();
    
    await this.emailField.fill(this.email);
    await this.continueButton.click();
    
    await this.passwordField.waitFor({ state: 'visible', timeout: 10000 });
    await this.passwordField.fill(this.password);
    await this.signInButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.signInButton.click();
    
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  }

  // Amazon sometimes shows an interstitial ("Click the button below to continue shopping")
  // instead of the sign-in form when many logins happen in a short time
  async openSignInForm(): Promise<void> {
    await expect(async () => {
      if (await this.continueShoppingButton.isVisible()) {
        await this.continueShoppingButton.click();
        await this.page.waitForLoadState('domcontentloaded');
      } else if (await this.signInLink.isVisible()) {
        await this.signInLink.click();
      }
      await expect(this.emailField).toBeVisible({ timeout: 10000 });
    }).toPass({ timeout: 90_000 });
  }

  async validateUserLogin(): Promise<void> {
    await this.closeHarryPotterPopUp();
    await expect(this.libraryButton).toBeVisible();
  }

  async validateUserNotLoggedIn(): Promise<void> {
    await expect(this.libraryButton).not.toBeVisible();
  }

  async closeOfferPopUp() {
    await this.page.waitForLoadState('domcontentloaded'); // Wait for network to stabilize
    if (await this.page.getByText('Limited Time Offer: Save over').isVisible()) {
      await this.page.getByRole('button', { name: 'Close' }).click();
    }
  }


  async closeHarryPotterPopUp() {
    await this.page.waitForLoadState('domcontentloaded'); // Wait for network to stabilize
    await this.page.waitForTimeout(5000); // necessary timeout for popup to appear
    if (await this.page.getByText('×').isVisible()) {
      await this.page.getByText('×').click();

    }
  }

  async logout(): Promise<void> {
    await this.hiUserName.hover();
    await this.signout.click();
  }
}
