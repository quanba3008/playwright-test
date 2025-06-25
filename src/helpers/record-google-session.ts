import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false }); 
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://stg-cloak.ecbo.io/en/users/sign_in');

  console.log('🧪 Open google by browser');
  console.log('👉 After login, back to terminal, press Enter!');

  process.stdin.once('data', async () => {
    await context.storageState({ path: 'storageState.json' });
    await browser.close();
    console.log('✅ Saved session into storageState.json');
  });
})();