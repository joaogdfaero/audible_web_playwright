import { Page, Locator, expect } from '@playwright/test'
import { clickUntilRequestSent } from '../utils/helpers';

export class LibraryPage {

    private page: Page;
    private wishlist: Locator;
    private removeFromLibraryBtn: Locator;
    private listenNow: Locator;

    constructor(page: Page) {
        this.page = page;
        this.wishlist = page.getByRole('tab', { name: 'Wish List' });
        this.removeFromLibraryBtn = this.page.getByRole('button', { name: 'Remove' });
        this.listenNow = page.getByRole('button', { name: 'Listen now' });
    }

    async verifyBookIsInWishlist(bookName: string) {

        await this.page.waitForTimeout(10000); // server delay to save in wishlist
        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.page.getByRole('link', { name: bookName, exact: false }).first()).toBeVisible();
        console.log("Book added to wishlist: " + bookName);

    }

    async verifyBookIsInLibrary(bookName: string) {

        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.page.getByRole('link', { name: bookName, exact: false }).first()).toBeVisible();
        console.log("Book added to library: " + bookName);

    }

    async verifyBookIsNotInLibrary(bookName: string) {

        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.page.getByRole('link', { name: bookName, exact: false }).first()).toBeHidden();
        console.log("Book not in library: " + bookName);

    }

    async verifyBookIsNotInWishlist(bookName: string) {
        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.page.getByRole('link', { name: bookName, exact: true }).first()).toBeHidden();
        console.log("Book not in wishlist: " + bookName);
    }

    async firstListenNowClick() {
        await this.page.waitForLoadState('load'); // Wait for network to stabilize
        await this.page.waitForTimeout(10000); // necessary timeout for click to register, bug workaround
        const listenBtn = this.listenNow.first();
        await listenBtn.scrollIntoViewIfNeeded();
        await listenBtn.waitFor({ state: 'visible' });
        await expect(listenBtn).toBeVisible();
        await listenBtn.click();
    }

    async removeBookFromWishlist(bookName: string) {
        const removeBtn = this.page.getByTitle(`Remove ${bookName} from Wish List`);

        await removeBtn.waitFor({ state: 'visible' });
        await removeBtn.scrollIntoViewIfNeeded();
        await expect(removeBtn).toBeVisible();
        await clickUntilRequestSent(this.page, removeBtn, '/wish-list/remove');

        await this.page.waitForTimeout(3000); // necessary timeout for click to register, bug workaround
    }

    async addToCart(bookName: string) {
        const addBtn = this.page.getByRole('button', { name: `Add ${bookName} to cart` });

        await addBtn.waitFor({ state: 'visible' });
        await addBtn.scrollIntoViewIfNeeded();
        await expect(addBtn).toBeVisible();
        await clickUntilRequestSent(this.page, addBtn, '/cart/add');
    }

    async goToWishlist() {
        const goToWishlist = this.wishlist;
        
        await goToWishlist.waitFor({ state: 'visible' });
        await goToWishlist.scrollIntoViewIfNeeded();
        await expect(goToWishlist ).toBeVisible();
        await goToWishlist.click({ force: true });
    }

    async removeFirstBookInLibrary() {
        const removeButton = this.removeFromLibraryBtn.nth(0);
        await removeButton.scrollIntoViewIfNeeded();
        await removeButton.waitFor({ state: 'visible' });
        await expect(removeButton).toBeVisible();
        await removeButton.click({ force: true });
    }

}