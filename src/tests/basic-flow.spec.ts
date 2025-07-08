import { test, expect, Locator } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

test.use({ storageState: 'storageState.json' });

test('Search space and booking...', async ({ page, context }) => {
  // await context.storageState({ path: 'storageState.json' });
  // console.log('✅ Save session into storageState.json');
  await page.goto(process.env.WEB_URL!)
  const menuButton = page.locator('[class^="HeaderComponent_hamburgerMenu"]');
  await expect(menuButton).toBeVisible();
  await menuButton.click();
  console.log('📂 Click menu button');

  const searchLink = page.locator('a[href="/en/locations"]');
  await expect(searchLink).toBeVisible();
  await searchLink.click();
  console.log('🔍 Click search menu');
  await page.waitForTimeout(500); 

  const areaInput = page.locator('input[placeholder="Enter area"]');
  await expect(areaInput).toBeVisible();
  await areaInput.fill(process.env.TEST_STATION!);
  console.log(`🔎 Type ${process.env.TEST_STATION!} into Search input`);
  await page.waitForTimeout(500); 

  // List area
  const suggestionItems = page.locator('li[class^="SearchForm_suggestText"]');
  await expect(suggestionItems.first()).toBeVisible();
  await page.waitForTimeout(500); 

  // Click first item area
  await suggestionItems.first().click();
  console.log('📌 Click first area item');
  await page.waitForTimeout(500); 

  const searchButton = page.locator('button[class^="SearchForm_searchBtn"]');
  await expect(searchButton).toBeVisible();
  await searchButton.click();
  console.log('🔍 Click Search button');
  await page.waitForTimeout(500);
  await expect(page.locator('strong[class^="SpaceCard_nameText"]').first()).toBeVisible({ timeout: 10000 });

  const allSpaces = await page.locator('strong[class^="SpaceCard_nameText"]').allTextContents();
  console.log('🧾 Found spaces:', allSpaces);

  // Select correct card based on name and click directly
  let selectCard: Locator | null = null;
  const cards = page.locator('a[class^="SpaceCard_spaceLink"]');
  const countCards = await cards.count();

  for (let i = 0; i < countCards; i++) {
    const card = cards.nth(i);
    const name = await card.locator('strong[class^="SpaceCard_nameText"]').textContent();
    const trimmedName = name?.trim();

    if (trimmedName === process.env.TEST_SPACE) {
      console.log(`🔍 Found matching card: "${trimmedName}" at index ${i}`);

      await card.scrollIntoViewIfNeeded();
      await expect(card).toBeVisible({ timeout: 3000 });
      await card.click();

      console.log(`📍 Clicked space card: "${trimmedName}"`);
      selectCard = card;
      break;
    }
  }

  if (!selectCard) {
    throw new Error(`❌ No matching space card found: "${process.env.TEST_SPACE}"`);
  }

  await page.waitForTimeout(500); 

  // Open datepicker
  const calendarIcon = page.locator('img[alt="calendar"]');
  await expect(calendarIcon).toBeVisible();
  await calendarIcon.locator('..').click();
  await page.waitForTimeout(300); 

  // Move to next month
  const nextArrow = page.locator('img[src*="arrow-right"]').locator('..');
  await expect(nextArrow).toBeVisible();
  await nextArrow.click();
  await page.waitForTimeout(500); 

  // Find active date to select
  const day = page.locator(
    'td.CalendarDay[role="button"]:not([aria-disabled="true"])' +
    ':has(img[src*="circle.png"])'
  );

  // Count available dates
  const count = await day.count();
  console.log('🎯 Available dates count:', count);

  // If not available dates
  if (count === 0) {
    throw new Error('❌ Not available dates');
  }

  // Click first available date
  const first = day.first();
  await first.waitFor({ state: 'visible' });
  await expect(first).toBeVisible({ timeout: 500 });
  await expect(first).toBeEnabled();
  await first.scrollIntoViewIfNeeded();
  await first.click();

  console.log('✅ Click successfully!');

  // Close datepicker
  await page.mouse.click(0, 0);
  console.log('📅 Close datepicker');

  //  Deposit time
  const depositPicker = page.locator('//div[contains(text(), "Deposit time")]/following-sibling::div//div[contains(@class, "picker")]');
  await depositPicker.waitFor({ state: 'visible' });
  await expect(depositPicker).toBeVisible();
  await depositPicker.click();
  console.log('🟢 Opened Deposit Time dropdown');

  const time8 = page.locator('#time-8');
  await time8.waitFor({ state: 'visible' });
  await expect(time8).toBeVisible();
  await time8.click();
  console.log('⏰ Select start time');

  // Pick-up Time
  const pickupPicker = page.locator('//div[contains(text(), "Pick-up time")]/following-sibling::div//div[contains(@class, "picker")]');
  await pickupPicker.waitFor({ state: 'visible' });
  await expect(pickupPicker).toBeVisible();
  await pickupPicker.click();
  console.log('🟢 Opened Pick-up Time dropdown');

  const time10 = page.locator('#time-10');
  await time10.waitFor({ state: 'visible' });
  await expect(time10).toBeVisible();
  await time10.click();
  console.log('⏰ Select end time');
  await page.waitForTimeout(500);

  const depositTime = page.locator('text=Deposit time').locator('..').locator('..').locator('[class*="pickedTime"]').first();
  await expect(depositTime).toHaveText(/^\d{1,2}:\d{2}$/);

  const pickupTime = page.locator('text=Pick-up time').locator('..').locator('..').locator('[class*="pickedTime"]').first();
  await expect(pickupTime).toHaveText(/^\d{1,2}:\d{2}$/);

  await page.waitForTimeout(500);

  // Click increment amount button
  const incrementAmountButtons = page.locator('[class^="LuggageButtonComponent_countDownButton"]');
  await expect(incrementAmountButtons.nth(1)).toBeEnabled();
  await incrementAmountButtons.nth(1).click();
  console.log('✅ Increment amount');

  // Click Create booking button
  const bookingButton = page.locator('[class^="BookingColumnComponent_bookingButton"]');
  await expect(bookingButton.nth(1)).toBeEnabled();
  await bookingButton.nth(1).click();
  console.log('✅ Booking...');

  await expect(bookingButton.nth(1)).toBeVisible();

  await page.click('[class^="BookingColumnComponent_bookingButton"]')
  await page.waitForTimeout(300);

  const confirmModalButton = page.getByRole('button', { name: 'Create a reservation' });

  if (await confirmModalButton.isVisible()) {
    console.log('📋 Modal show, click Create a reservation');
    await confirmModalButton.click();
  } else {
    // console.log('✅ Model not show!');
  }
  await page.waitForTimeout(300);
  
  await expect(
    page.getByRole('button', { name: 'Pay by credit card - failure_testing' })
  ).toBeVisible();
  
  //////// Booking step //////////////////////////////////////////////////////////////
  // await page.locator('input[type="checkbox"][class^="TermsSection_checkBox"]').check();
  // await expect(page.locator('input[type="checkbox"][class^="TermsSection_checkBox"]')).toBeChecked();

  // const payButton = page.getByRole('button', { name: 'Pay by credit card' });
  // await expect(payButton).toBeVisible();

  // // 3. Click "Pay by credit card"
  // await payButton.click();
  // console.log('💳 click  "Pay by credit card" button');
  // await page.waitForTimeout(500);
  // await expect(
  //   page.getByRole('button', { name: 'Cancel Reservation' })
  // ).toBeVisible();
  // console.log('❎ Cancel Reservation button is shown');
  

  // const cancelBtn = page.getByRole('button', { name: 'Cancel Reservation' });
  // await expect(cancelBtn).toBeVisible();
  // await cancelBtn.click();
  // console.log('🗑️ Click Cancel Reservation');
  // await page.waitForTimeout(500);

  // const confirmCancelBtn = page.locator('[class^="BookingDetailPage_cancelButton"]', { hasText: 'Cancel' });
  // await expect(confirmCancelBtn).toBeVisible();
  // await confirmCancelBtn.click();

  // console.log('🗑️ Confirm cancle booking.');


  // await expect(
  //   page.getByRole('link', { name: 'Your reservation has been canceled successfully.' })
  // ).toBeVisible();
  
  // console.log('✅ Cancle successfully.');
  // await page.waitForTimeout(5000);
  //////// Booking step //////////////////////////////////////////////////////////////
});
