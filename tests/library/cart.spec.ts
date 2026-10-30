import { getRandomBookFirstName } from "../../utils/helpers";
import { test } from "../fixtures";

test.beforeEach(async ({ loginPage }) => {
    await loginPage.login();
    await loginPage.validateUserLogin();
});

test('Add to cart from wishlist', async ({ page, homePage, productsPage, libraryPage, cartPage }) => {

    await homePage.searchForBook(getRandomBookFirstName());
    await homePage.unabrigedCheckbox.click();

    const bookName = await homePage.getTitleFromAddToWishlistButton(homePage.firstAddToWishlist);
    await homePage.firstAddToWishlistClick();

    await productsPage.goToLibrary();
    await libraryPage.goToWishlist();
    await libraryPage.verifyBookIsInWishlist(bookName);

    await libraryPage.addToCart(bookName);
    await libraryPage.removeBookFromWishlist(bookName);

    await cartPage.openCart();
    await page.waitForTimeout(5000) // add delay to tryn solve weird error
    await cartPage.verifyBookIsInCart(bookName);
    await cartPage.removeBookFromCart(bookName);
    await cartPage.verifyBookIsNotInCart(bookName);
})

test('Add to cart from search page', async ({ homePage, cartPage }) => {

    await homePage.searchForBook(getRandomBookFirstName());
    await homePage.unabrigedCheckbox.click();

    const bookName = await homePage.getTitleFromAddToCartButton(homePage.firstAddToCart);
    await homePage.firstAddToCartClick();

    await cartPage.openCart();
    await cartPage.verifyBookIsInCart(bookName);
    await cartPage.removeBookFromCart(bookName);
    await cartPage.verifyBookIsNotInCart(bookName);
    
})

test('Add to cart from PDP', async ({ homePage, cartPage, productsPage }) => {

    await homePage.searchForBook(getRandomBookFirstName());
    await homePage.unabrigedCheckbox.click();

    const bookName = await homePage.getTitleFromAddToCartButton(homePage.firstAddToCart);

    await homePage.openBook(bookName);

    await productsPage.addToCart();
    await cartPage.openCart();
    await cartPage.verifyBookIsInCart(bookName);

    await cartPage.removeBookFromCart(bookName);
    await cartPage.verifyBookIsNotInCart(bookName);

})