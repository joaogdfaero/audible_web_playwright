import { test } from '../fixtures';

test.describe('Authorization tests', () => {
  test('Login successfully on US marketplace', async ({ loginPage }) => {
    await loginPage.login();
    await loginPage.validateUserLogin();
  });

  test('Login invalid on US marketplace', async ({ loginPage }) => {
    // set invalid password
    (loginPage as any).password = '12321123invalidpassword'; 
    await loginPage.login();
    await loginPage.validateUserNotLoggedIn();
  });

// FALHA NA PIPELINE  
   test('Logout successfully from US marketplace', async ({ loginPage, homePage }) => {
    //test.setTimeout(60_000); // 60 seconds for this test only
    await loginPage.login();
    await loginPage.validateUserLogin();
    await homePage.logout();
    await loginPage.validateUserNotLoggedIn();
  });
});
