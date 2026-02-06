import { test, expect } from '@playwright/test';

test('End-to-End Tournament Admin Flow', async ({ page }) => {
    // 1. Login
    console.log('Step 1: Logging in...');
    await page.goto('http://localhost:3000/login');

    // Wait for inputs
    await page.waitForSelector('input[type="text"]');

    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'Lastfreedom4_');

    // Click Login Button using Thai text or type
    await page.click('button[type="submit"]');

    // Wait for navigation (increased timeout)
    await expect(page).toHaveURL(/\/admin/, { timeout: 15000 });
    console.log('✅ Login Successful');

    // Wait for Dashboard to stabilize
    await page.waitForTimeout(2000);

    // 3. Go to Results Page
    console.log('Step 3: Checking Results Page...');
    await page.goto('http://localhost:3000/admin/results');

    // 4. Verify Day 10 Button Exists and Click it
    // Using partial text matching for robustness: "Day 10" and "Semi Finals"
    const day10Btn = page.locator('button', { hasText: 'Day 10 (Semi Finals BO5)' });

    // Wait specifically for this button to ensure data is loaded
    await day10Btn.waitFor({ state: 'visible', timeout: 10000 });
    await day10Btn.click();
    console.log('✅ Selected Day 10');

    // 5. Select a Match (Game 1)
    // Wait for matches list Update
    await page.waitForTimeout(2000);

    // Find a match button. They usually have "vs" text or specific class. 
    // Code uses: button.group
    const matchButton = page.locator('button.group').first();
    await expect(matchButton).toBeVisible();
    await matchButton.click();
    console.log('✅ Selected a Match');

    // 6. Verify Old UI Removed
    const oldMvpInput = page.locator('input[placeholder="ระบุชื่อ MVP..."]');
    await expect(oldMvpInput).toBeHidden();
    console.log('✅ Verified: Old MVP Input is removed');

    // 7. Click Game 1 Button
    const game1Btn = page.locator('button', { hasText: 'Game 1' }).first();
    await expect(game1Btn).toBeVisible({ timeout: 5000 });
    await game1Btn.click();
    console.log('✅ Clicked Game 1 Button');

    // 8. Verify Modal Content
    const modal = page.locator('.fixed.inset-0');
    await expect(modal).toBeVisible();

    // Check Winner Radio
    await expect(page.locator('text=ทีมที่ชนะ:')).toBeVisible();

    // Check MVP Select (Dropdown)
    const mvpSelect = page.locator('select').first();
    await expect(mvpSelect).toBeVisible();

    console.log('✅ Game Stats Modal Verified Successfully');
});
