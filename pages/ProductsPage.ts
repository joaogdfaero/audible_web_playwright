import { Page, Locator, expect } from '@playwright/test'
import { clickUntilRequestSent } from '../utils/helpers';

export class ProductsPage {
    private page: Page;
    private moreOptions: Locator;
    private addToWhislist: Locator;
    private closeOptions: Locator;
    private libraryButton: Locator;
    public addToLibraryButton: Locator;
    private previewButton: Locator;
    private playButton: Locator;
    private addToCartButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.moreOptions = page.getByRole('button', { name: 'More options' });
        this.addToWhislist = page.getByRole('button', { name: 'Add to Wish List' });
        this.closeOptions = page.getByLabel('More options').getByRole('button', { name: 'Close' })
        this.libraryButton = page.getByRole('link', { name: 'Library', exact: true });
        this.addToLibraryButton = page.getByRole('button', { name: 'Add to Library' })
        this.previewButton = page.getByRole('button', { name: 'Preview' });
        this.playButton = page.getByRole('button', { name: 'Play', exact: true });
        this.addToCartButton = page.getByRole('button', { name: 'Add to cart' });
    }
    async addToWishlist() {
        await this.page.waitForLoadState('domcontentloaded');

        const btnOptions = this.moreOptions;
        await btnOptions.waitFor({ state: 'visible' });
        await btnOptions.scrollIntoViewIfNeeded();
        await expect(btnOptions).toBeVisible();
        await btnOptions.click({ force: true });

        if (await this.addToWhislist.isVisible()) {
            await this.addToWhislist.waitFor({ state: 'visible' });
            await this.addToWhislist.scrollIntoViewIfNeeded();
            await expect(this.addToWhislist).toBeVisible();
            await clickUntilRequestSent(this.page, this.addToWhislist, '/wish-list/add');

            await this.closeOptions.waitFor({ state: 'visible' });
            await this.closeOptions.scrollIntoViewIfNeeded();
            await expect(this.closeOptions).toBeVisible();
            await this.closeOptions.click({ force: true });

            return true;
        }

        return false;
    }


    async addToLibraryIsVisible() {
        await this.page.waitForLoadState('domcontentloaded');
        const btnAddToLibrary = this.addToLibraryButton;
        return await btnAddToLibrary.isVisible();
    }

    async addToLibrary() {
        await this.page.waitForLoadState('domcontentloaded');
        const btnAddToLibrary = this.addToLibraryButton;

        await btnAddToLibrary.waitFor({ state: 'visible' });
        await btnAddToLibrary.scrollIntoViewIfNeeded();
        await expect(btnAddToLibrary).toBeVisible();
        await btnAddToLibrary.click({ force: true });

        await this.page.waitForTimeout(3000); // wait for animation to complete
    }

    async addToCart() {
        await this.page.waitForLoadState('domcontentloaded');
        const btnAddToCart = this.addToCartButton;

        await btnAddToCart.waitFor({ state: 'visible' });
        await btnAddToCart.scrollIntoViewIfNeeded();
        await expect(btnAddToCart).toBeVisible();
        await clickUntilRequestSent(this.page, btnAddToCart, '/cart/add');

        await this.page.waitForTimeout(3000); // wait for animation to complete
    }

    async playBookClick() {
        await this.page.waitForLoadState('domcontentloaded');
        const btnPlay = this.playButton.first();

        await btnPlay.waitFor({ state: 'visible' });
        await btnPlay.scrollIntoViewIfNeeded();
        await expect(btnPlay).toBeVisible();
        await btnPlay.click({ force: true });
    }

    async openBookPreview() {
        await this.page.waitForLoadState('load');
        const btnPreview = this.previewButton;

        await btnPreview.waitFor({ state: 'visible' });
        await btnPreview.scrollIntoViewIfNeeded();
        await expect(btnPreview).toBeVisible();
        await btnPreview.click({ force: true });
    }

    async goToLibrary() {
        const btnLibrary = this.libraryButton;
        await btnLibrary.waitFor({ state: 'attached' });
        await btnLibrary.waitFor({ state: 'visible' });
        await expect(btnLibrary).toBeVisible();
        await btnLibrary.click({ force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }


    async canBuyBook() {
        await this.page.waitForTimeout(5000); // necessary timeout for buttons to show
        const isHidden = await this.addToLibraryButton.isHidden();
        return isHidden;
    }

}