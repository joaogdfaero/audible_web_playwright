/* import { expect, test } from "../fixtures";

test.beforeEach(async ({ loginPage }) => {
    await loginPage.login();
});

test('Change language from US to ES', async ({ page, homePage }) => {
    // Reset to english if not in english
    if (await homePage.spanishLanguage.isVisible()) {
        await homePage.spanishLanguage.hover();
        await homePage.switchEnglish.click();
    }

    await expect(homePage.libraryButton).toBeVisible();
    await page.waitForLoadState('domcontentloaded'); 
    await homePage.englishLanguage.hover();
    await homePage.switchSpanish.click();
    await page.reload()
    await expect(homePage.libraryButtonES).toBeVisible();

    // Reset to english
    await homePage.spanishLanguage.hover();
    await homePage.switchEnglish.click();
}); */