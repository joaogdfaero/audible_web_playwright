import { getRandomBookFirstName } from "../../utils/helpers";
import { test } from "../fixtures";

test.beforeEach(async ({ loginPage, page }) => {
  await loginPage.login();
  await loginPage.validateUserLogin();
});

test.describe('Wishlist testing', () => {

  test('Add and remove a random item to wishlist from homepage', async ({ page, homePage, productsPage, libraryPage }) => {

    let addedBook: boolean = false;
    let alreadyTried: string[] = [];
    let bookName: string = '';

    while (!addedBook) {
      await homePage.openRandomBook(alreadyTried);

      addedBook = await productsPage.addToWishlist();

      bookName = homePage.bookName;

      if (!addedBook) {
        alreadyTried.push(bookName)
        await page.goBack();
      }
    }

    await productsPage.goToLibrary();
    await libraryPage.goToWishlist();
    await libraryPage.verifyBookIsInWishlist(bookName);
    await libraryPage.removeBookFromWishlist(bookName);
    await libraryPage.verifyBookIsNotInWishlist(bookName);

  });

  test('Search item than add and remove it from wishlist', async ({ page, homePage, libraryPage, productsPage }) => {

      await homePage.searchForBook(getRandomBookFirstName());

      // Pega o primeiro botão "Add to Wish List" visivel na pagina
      const bookName = await homePage.getTitleFromAddToWishlistButton(homePage.firstAddToWishlist);

      await homePage.firstAddToWishlistClick();
      await productsPage.goToLibrary();
      await libraryPage.goToWishlist();
      await libraryPage.verifyBookIsInWishlist(bookName);
      await libraryPage.removeBookFromWishlist(bookName);
      await libraryPage.verifyBookIsNotInWishlist(bookName);

    })
})





