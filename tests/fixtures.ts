import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { ProductsPage } from '../pages/ProductsPage';
import { LibraryPage } from '../pages/LibraryPage';
import { CartPage } from '../pages/CartPage';
import { maskEmail } from '../utils/helpers';

type Fixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  libraryPage: LibraryPage;
  productsPage: ProductsPage;
  cartPage: CartPage;
  failOnJSError: boolean;
};

// extends Playwright's base test and adds custom fixtures
export const test = base.extend<Fixtures & { accountIndex: number }>({
  
  // control of account being used. if no control is used, parallel index is used instead to select the account
  accountIndex: [
    async ({ }, use, testInfo) => {
      const annotation = testInfo.annotations.find(
        (a) => a.type === 'accountIndex'
      );
      let index: number;

      if (annotation?.description) {
        index = Number(annotation.description);
      } else {
        // parallelIndex stays between 0 and workers-1 (workerIndex grows every time a worker restarts after a failure)
        index = testInfo.parallelIndex;
      }

      await use(index);
    },
    { option: true },
  ],

  loginPage: async ({ page, accountIndex }, use, testInfo) => {
    const email = process.env[`US_EMAIL_${accountIndex}`] ?? process.env.US_EMAIL ?? '';
    const password = process.env[`US_PASSWORD_${accountIndex}`] ?? process.env.US_PASSWORD ?? '';

    if (!email || !password) {
      throw new Error('Missing credentials: set US_EMAIL and US_PASSWORD in your .env file (see .env.example)');
    }

    console.log(`TEST ${testInfo.title} | INDEX = ${accountIndex} | EMAIL = ${maskEmail(email)}`);

    const loginPage = new LoginPage(page, email, password);
    await use(loginPage);
  },

  homePage: async ({ page }, use, testInfo) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  libraryPage: async ({ page }, use) => {
    const libraryPage = new LibraryPage(page);
    await use(libraryPage);
  },

  productsPage: async ({ page }, use) => {
    const productsPage = new ProductsPage(page);
    await use(productsPage);
  },

  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  failOnJSError: [false, { option: true }],

  page: async ({ page, failOnJSError }, use) => {
    // Check for javascript errors in any test
    const errors: Array<Error> = []

    page.addListener("pageerror", (error) => {
      errors.push(error)
    })


    await use(page);

    if (failOnJSError) {
      expect(errors).toHaveLength(0);
    }

  },


});

export { expect } from '@playwright/test';
