import { expect, Locator, Page } from '@playwright/test';

export class CartPage {

    private page: Page;
    private openCartButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.openCartButton = page.getByRole('link', { name: 'Shopping cart. Items in cart:' });
    }

    async openCart() {
        await this.page.getByRole('link', { name: /^Shopping cart\./ }).click();
    }

    async removeBookFromCart(bookName: string) {
        await this.page.waitForLoadState('domcontentloaded', { timeout: 40000 });
        // the button's accessible name comes HTML-escaped from the site (e.g. "Remove Frodo&#39;s Journey"),
        // so locate it inside the cart row of the book instead of by the title
        const removeBtn = this.page.getByRole('row')
            .filter({ has: this.page.getByRole('link', { name: bookName, exact: true }) })
            .getByRole('button', { name: /^Remove / });
        await removeBtn.waitFor({ state: 'visible' });
        await removeBtn.scrollIntoViewIfNeeded();     
        await expect(removeBtn).toBeVisible();
        await removeBtn.click({ force: true });
    }

    async verifyBookIsInCart(bookName: string) {
        await expect(this.page.getByRole('link', { name: bookName, exact: true })).toBeVisible();
    }

    async verifyBookIsNotInCart(bookName: string) {
        await expect(this.page.getByRole('link', { name: bookName, exact: true })).toBeHidden();
    }
}
