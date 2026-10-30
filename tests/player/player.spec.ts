import { test, expect } from "../fixtures";

test.beforeEach(async ({ loginPage }, testInfo) => {
    await loginPage.login();
    await loginPage.validateUserLogin();
});

test('Open book preview player from PDP', async ({ page, homePage, productsPage }) => {

    await homePage.openRandomBook();

    const previewPagePromise = page.waitForEvent('popup');
    await productsPage.openBookPreview();

    const previewPage = await previewPagePromise;
    await expect(previewPage).toHaveURL(/webplayer/);

})

test('Open player from library', async ({ productsPage, libraryPage, page }) => {

    await productsPage.goToLibrary();

    // flaky test workaround
    await expect(async () => {
        const playerPagePromise = page.waitForEvent('popup');
        await libraryPage.firstListenNowClick();
        const playerPage = await playerPagePromise;
        await expect(playerPage).toHaveURL(/webplayer/);
    }).toPass()
    
})

test('Open player from PDP', { annotation: { type: 'accountIndex', description: '9' } }, async ({ homePage, productsPage, page, loginPage }) => {

    let canAdd: boolean = false;
    let alreadyTried: string[] = [];
    let bookName: string = '';

    await homePage.goToPlusCatalog();

    while (!canAdd) {
        await homePage.openRandomBook(alreadyTried);

        canAdd = await productsPage.addToLibraryIsVisible();
        bookName = homePage.bookName;

        if (!canAdd) {
            alreadyTried.push(bookName)
            await page.goBack();
        }
    }

    const playerPromise = page.waitForEvent('popup');
    await productsPage.playBookClick();
    const playerPage = await playerPromise;
    await expect(playerPage).toHaveURL(/webplayer/);
})