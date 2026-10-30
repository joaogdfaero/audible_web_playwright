/* import { expect, test } from "../fixtures";

test.beforeEach(async ({ loginPage }) => {
    await loginPage.login();
    await loginPage.validateUserLogin();
});

test('Remove book from listen history', async ({ productsPage, libraryPage, page }) => {
    await test.step('Play book from library (to have a listen history)', async ( ) => {
        await productsPage.goToLibrary();
        const playerPagePromise = page.waitForEvent('popup');
        await libraryPage.firstListenNowClick();
        const playerPage = await playerPagePromise;
        await expect(playerPage.locator('#overlay')).toBeVisible();
    });

    await test.step('Remove book from listen history', async () => {
        // todo
        await page.bringToFront();
        await page.pause();
    });
}); */