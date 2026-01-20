import { test, expect } from '@playwright/test';

/**
 * RoV SN Tournament Official - Navigation E2E Tests
 * Tests for all public pages and navigation functionality
 */

test.describe('Navigation', () => {
    test('should have all main navigation links', async ({ page }) => {
        await page.goto('/');

        // Check all navigation links exist
        await expect(page.locator('nav')).toBeVisible();
        await expect(page.getByRole('link', { name: /หน้าแรก|Home/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /ตารางแข่ง|Fixtures/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /ตารางคะแนน|Standings/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /สถิติ|Stats/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /ทีม|Clubs/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /รูปแบบแข่ง|Format/i })).toBeVisible();
    });

    test('should navigate to all pages correctly', async ({ page }) => {
        await page.goto('/');

        // Helper to click nav link
        const clickNavLink = async (nameRegex: RegExp | string) => {
            // Target links specifically within the navigation menu
            await page.locator('nav').getByRole('link', { name: nameRegex }).click();
        };

        // Navigate to Fixtures
        await clickNavLink(/ตารางแข่ง|Fixtures/i);
        await expect(page).toHaveURL(/.*fixtures/);

        // Navigate to Standings
        await clickNavLink(/ตารางคะแนน|Standings/i);
        await expect(page).toHaveURL(/.*standings/);

        // Navigate to Stats
        await clickNavLink(/สถิติ|Stats/i);
        await expect(page).toHaveURL(/.*stats/);

        // Navigate to Clubs
        await clickNavLink(/ทีม|Clubs/i);
        await expect(page).toHaveURL(/.*clubs/);

        // Navigate to Format
        await clickNavLink(/รูปแบบแข่ง|Format/i);
        await expect(page).toHaveURL(/.*format/);

        // Navigate back to Home
        await clickNavLink(/หน้าแรก|Home/i);
        await expect(page).toHaveURL('/');
    });
});
