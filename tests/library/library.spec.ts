import { test, expect } from "../fixtures";

// Account to be used
test.use({ accountIndex: 1 });

test.beforeEach(async ({ loginPage }, testInfo) => {

    await loginPage.login();
    await loginPage.validateUserLogin();

});

test('Add new book to library', async ({ page, homePage, productsPage, libraryPage }) => {

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
        } else {
            await productsPage.addToLibrary();
        }
    }

    await productsPage.goToLibrary();

    await page.waitForTimeout(10000); // bug workaround,  library sometimes takes a while to update after adding a book
    await page.reload({ waitUntil: 'domcontentloaded' }); // server delay
    await page.waitForTimeout(5000); // bug workaround, click doesnt register right after refresh


    await expect(async () => {
        await libraryPage.verifyBookIsInLibrary(bookName);
        await libraryPage.removeFirstBookInLibrary();
        await libraryPage.verifyBookIsNotInLibrary(bookName);
    }).toPass()
});

