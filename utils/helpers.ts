import { Locator, Page, expect } from '@playwright/test';

/**
 * Garante que o usuário esteja no marketplace correto.
 *
 * Caso a URL atual da página não contenha o `targetUrl`, 
 * o teste clica no link de redirecionamento do banner de notificação 
 * e valida que a navegação foi feita para o destino esperado.
 *
 * @async
 * @function ensureCorretMarketplace
 * @param {Page} page - Instância da página Playwright em execução.
 * @param {string} targetUrl - URL do marketplace alvo que deve ser garantido.
 * @returns {Promise<void>} - Não retorna valor, apenas garante a navegação correta.
 */
export async function ensureCorretMarketplace(page: Page, targetUrl: string): Promise<void> {
  if (!page.url().includes(targetUrl)) {
    await page.locator('//*[@id="notification-banner-message"]/span/a').click();
    await expect(page).toHaveURL(new RegExp(targetUrl));
  }
}

/**
 * Clica no botão e garante que a ação foi enviada ao backend.
 *
 * Se a página ainda não terminou de registrar os handlers JS, o clique é
 * ignorado silenciosamente e nenhuma requisição é feita. Nesse caso o clique
 * é repetido. Se a requisição for enviada mas o backend responder com erro,
 * o teste falha.
 *
 * @async
 * @function clickUntilRequestSent
 * @param {Page} page - Instância da página Playwright em execução.
 * @param {Locator} button - Botão que dispara a ação.
 * @param {string} urlPart - Trecho da URL da requisição POST esperada (ex: '/cart/add').
 * @returns {Promise<void>}
 */
export async function clickUntilRequestSent(page: Page, button: Locator, urlPart: string): Promise<void> {
  await expect(async () => {
    const requestPromise = page.waitForRequest(
      (req) => req.url().includes(urlPart) && req.method() === 'POST',
      { timeout: 10_000 }
    );
    await button.click({ force: true });
    const response = await (await requestPromise).response();
    expect(response?.ok(), `POST ${urlPart} failed with status ${response?.status()}`).toBeTruthy();
  }).toPass({ timeout: 60_000 });
}

/**
 * Retorna a primeira palavra de um título de livro conhecido.
 *
 * Exemplo: "Project Hail Mary" retorna "project".
 *
 * @returns {string} - Primeira palavra do título selecionado aleatoriamente.
 */
export function getRandomBookFirstName(): string {
  
  const names = [
    'harry',    // Harry Potter
    'sherlock', // Sherlock Holmes
    'game',     // Game of Thrones
    'frodo',    // The Lord of the Rings
    'alice',    // Alice in Wonderland
    'dorothy',  // The Wizard of Oz
    'hobbit',   // The Hobbit
    'great',    // The Great Gatsby
    'jane',     // Jane Eyre
    'oliver',   // Oliver Twist
    'robin',    // Robin Hood
    'catcher',  // The Catcher in the Rye
    'frankenstein',
    'divine',   // Divine Comedy
    'mockingbird', // To Kill a Mockingbird
    'emma',     // Emma
    'much',     // Much Ado About Nothing
    'scarlet',  // The Scarlet Letter
    'gone',     // Gone with the Wind
    'project',  // Project Hail Mary
  ];

  return names[Math.floor(Math.random() * names.length)];
}


/**
 * Masks an e-mail so it can be safely printed in public CI logs.
 *
 * Example: "jane.doe@example.com" returns "ja***@example.com".
 *
 * @param {string} email - E-mail to be masked.
 * @returns {string} - Masked e-mail.
 */
export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return '***';
  return `${user.slice(0, 2)}***@${domain}`;
}
