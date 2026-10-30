import { Page, Locator, expect } from '@playwright/test';
import { clickUntilRequestSent } from '../utils/helpers';

export class HomePage {
  private page: Page;
  public libraryButton: Locator;
  public libraryButtonES: Locator;
  private hiUserName: Locator;
  private signout: Locator;
  private allBooksLink: Promise<Locator[]>;
  public bookName: string;
  private searchBox: Locator;
  public firstAddToWishlist: Locator;
  private plusCatalog: Locator;
  public unabrigedCheckbox: Locator;
  private bookLinks: Locator
  public firstAddToCart: Locator;
  public englishLanguage: Locator;
  public switchSpanish: Locator;
  public spanishLanguage: Locator;
  public switchEnglish: Locator;

  constructor(page: Page) {
    this.page = page;
    this.libraryButton = page.getByRole('link', { name: 'Library' });
    this.libraryButtonES = page.getByRole('link', { name: 'Biblioteca' });
    this.hiUserName = page.locator('button[aria-controls="nav-menu-1"]:has-text("Hi, ")');
    this.signout = page.getByRole('link', { name: 'Sign out' });
    this.allBooksLink = page.locator('a[href*="/pd/"]').all();
    this.bookLinks = page.locator('a[href*="/pd/"]');
    this.bookName = "";
    this.searchBox = page.getByRole('combobox', {name: /(?:Search for an audiobook,|Find your next great listen)/i});
    this.englishLanguage = page.getByRole('button', { name: 'English - USD' });
    this.switchSpanish = page.getByRole('radio', { name: 'Español' });
    this.spanishLanguage = page.getByRole('button', { name: 'Español - USD' });
    this.switchEnglish = page.getByRole('radio', { name: 'English' });

    this.firstAddToWishlist = page.locator('span.adblAddToWishlistButton:not(.bc-hidden) button[title*="Add"][title*="to your Wish List"]')
      .filter({ has: page.locator('span.adblAddToWishlistText', { hasText: 'Add to Wish List' }) })
      .first();

    this.firstAddToCart = page.locator(
      'span.adblAddToCartButton:not(.bc-hidden) button[title*="Add"][title*="to cart"]'
    ).filter({
      has: page.locator('span.adblAddToCartText', { hasText: 'Add to cart' })
    }).first();

    this.plusCatalog = page.getByRole('link', { name: 'Included' });
    this.unabrigedCheckbox = page.getByRole('link', { name: 'Unabridged Unabridged' });
  }

  async logout(): Promise<void> {
    //await this.page.pause();
    await this.hiUserName.hover();
    await this.signout.click();
  }

  async goToPlusCatalog() {
    await this.plusCatalog.click();
  }

  async firstAddToWishlistClick() {
    await this.page.waitForTimeout(4000) // add delay to tryn solve weird error
    await this.page.waitForLoadState('domcontentloaded', { timeout: 40000 });
    const addBtn = this.firstAddToWishlist;
    await addBtn.waitFor({ state: 'visible' });
    await addBtn.scrollIntoViewIfNeeded();
    await clickUntilRequestSent(this.page, addBtn, '/wish-list/add');
  }

  async firstAddToCartClick() {
    await this.page.waitForLoadState('domcontentloaded', { timeout: 40000 });
    const addCartBtn = this.firstAddToCart;
    await addCartBtn.waitFor({ state: 'visible' });
    await addCartBtn.scrollIntoViewIfNeeded();
    await clickUntilRequestSent(this.page, addCartBtn, '/cart/add');
  }

  async openRandomBook(alreadyTried: string[] = []) {
    await this.page.waitForLoadState('domcontentloaded');

    await this.page.waitForSelector('a[href*="/pd/"]:visible');

    const loc = this.page.locator('a[href*="/pd/"]:visible');
    const count = await loc.count();
    let foundBook = false;

    console.log(`Found ${count} book links`);

    // choose a random index that isn't already tried
    let randomIndex = -1;
    for (let i = 0; i < count; i++) {

      const text = (await loc.nth(i).textContent())?.trim() ?? '';
      let isVisible = await loc.nth(i).isVisible();

      if (text && !alreadyTried.includes(text) && isVisible) {
        randomIndex = i;
        this.bookName = text;

        console.log(`Clicking book index ${randomIndex}: ${this.bookName}`);

        // Move mouse away from anything that might trigger a popup
        await this.page.mouse.move(0, 0);

        await loc.nth(randomIndex).waitFor({ state: 'visible' });
        const href = await loc.nth(randomIndex).getAttribute('href');
        
        if (!href) {
          throw new Error('Selected book link has no href');
        }

        const bookUrl = href.startsWith('http') ? href : new URL(href, this.page.url()).toString();
        await this.page.goto(bookUrl, { waitUntil: 'domcontentloaded', timeout: 40000 });

        foundBook = true;

        break;
      }
    }

    if (!foundBook) {
      await this.page.reload();
      throw new Error('No suitable book found, possible code problem');
    }
  }


  async searchForBook(bookName: string) {
    await this.page.waitForLoadState('domcontentloaded', { timeout: 40000 });
    await this.searchBox.waitFor({ state: 'visible', timeout: 20000 });
    await this.searchBox.click({ force: true });
    await this.searchBox.fill(bookName);
    await this.searchBox.press('Enter');
    await this.page.waitForLoadState('domcontentloaded', { timeout: 40000 });
  }

  async getTitleFromAddToWishlistButton(addToWishlistButton: Locator): Promise<string> {
    await this.page.waitForLoadState('domcontentloaded', { timeout: 40000 });

    // Extrai o título completo do atributo title (ex: "Add Harry Potter ... to your Wish List")
    const fullTitle = await addToWishlistButton.getAttribute('title') ?? "";

    // Extrai só o nome do livro usando regex
    // "Add (.*) to your Wish List" captura o nome do livro
    const bookNameMatch = fullTitle.match(/Add (.*) to your Wish List/);
    const bookName = bookNameMatch ? bookNameMatch[1].trim() : "";

    console.log("Book to be added = " + bookName)

    return bookName;
  }

  async getTitleFromAddToCartButton(addToCartButton: Locator): Promise<string> {
    // Extrai o título completo do atributo title (ex: "Add The Book Thief to cart")
    const fullTitle = await addToCartButton.getAttribute('title') ?? "";

    // Extrai só o nome do livro usando regex
    // "Add (.*) to cart" captura o nome do livro
    const bookNameMatch = fullTitle.match(/Add (.*) to cart/i);
    const bookName = bookNameMatch ? bookNameMatch[1].trim() : "";

    console.log("Book to be added to cart = " + bookName);

    return bookName;
  }

  async openBook(bookName: string) {
    await this.page.waitForLoadState('domcontentloaded', { timeout: 40000 });
    // titles can repeat in search results (different editions), so open the link from the
    // same product card as the "Add to cart" button the title was taken from
    const bookLink = this.page.locator('[id^="product-list-item-"]')
      .filter({ has: this.firstAddToCart })
      .first()
      .getByRole('link', { name: bookName, exact: true })
      .first();
    await bookLink.waitFor({ state: 'visible' });
    await bookLink.scrollIntoViewIfNeeded();
    await bookLink.click({ force: true });
  }
}
