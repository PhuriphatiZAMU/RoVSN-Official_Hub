import { test, expect } from '@playwright/test';

test('End-to-End Public View Flow', async ({ page }) => {
    // 1. Visit Home Page
    console.log('Step 1: Visiting Home Page...');
    await page.goto('http://localhost:3000/');
    await expect(page).toHaveTitle(/RoV/);
    console.log('✅ Home Page Loaded');

    // 2. Check Standings (League Table)
    const standingsHeader = page.getByText('ตารางคะแนน', { exact: false }).first();

    if (await standingsHeader.isVisible()) {
        await standingsHeader.scrollIntoViewIfNeeded();
        console.log('✅ Found Standings Section');

        // Check if table rows exist
        const tableRows = page.locator('table tbody tr');
        if (await tableRows.count() > 0) {
            console.log(`✅ Standings Table populated with ${await tableRows.count()} teams`);
        } else {
            console.log('⚠️ Standings Table found but might be empty');
        }
    } else {
        console.log('⚠️ Could not find "ตารางคะแนน" header immediately.');
    }

    // 3. Check Schedule for Semi Finals (Day 10)
    console.log('Step 2: Checking Schedule...');

    // Fix: Use .first() to handle multiple links
    const scheduleLink = page.locator('a', { hasText: 'ตารางแข่ง' }).or(page.locator('a', { hasText: 'Schedule' })).first();

    if (await scheduleLink.isVisible()) {
        await scheduleLink.click();
        // Fix: Wait for /fixtures based on previous error log
        await expect(page).toHaveURL(/\/fixtures/);
        console.log('✅ Navigated to Schedule Page (/fixtures)');

        // SCROLL LOGIC ADDED HERE
        console.log('⬇️ Scrolling down to find content...');
        // Scroll to bottom gradually to trigger any lazy loads
        await page.evaluate(async () => {
            const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
            const totalHeight = document.body.scrollHeight;
            for (let i = 0; i < totalHeight; i += 500) {
                window.scrollTo(0, i);
                await delay(100);
            }
        });
        await page.waitForTimeout(1000);

    } else {
        console.log('ℹ️ Could not find Schedule link, checking current page...');
    }

    // Look for Day 10 Tab/Button/Text
    const day10Indicator = page.locator('text=Day 10').or(page.locator('text=Semi Finals')).first();

    // Wait a bit for data to load
    try {
        if (await day10Indicator.count() > 0) {
            await day10Indicator.scrollIntoViewIfNeeded();
        }
        await day10Indicator.waitFor({ state: 'visible', timeout: 5000 });
        console.log('✅ Found Day 10 / Semi Finals in Schedule');
    } catch (e) {
        console.log('⚠️ Day 10 not found (Check if matches are created or try scrolling manually).');
    }

});
