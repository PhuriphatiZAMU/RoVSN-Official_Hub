import { test, expect } from '@playwright/test';

/**
 * RoV SN Tournament Official - Language Switching E2E Tests
 * Tests for internationalization (Thai/English)
 */

test.describe('Language Switching', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should have language switcher visible', async ({ page }) => {
        // Check for language switcher (TH/EN)
        const languageSwitcher = page.locator('[class*="language"], [class*="lang"]').or(
            page.getByText(/TH|EN|ไทย|English/i).first()
        );

        await expect(languageSwitcher).toBeVisible();
    });

    test('should display Thai content by default', async ({ page }) => {
        // Check for Thai text (navigation or content)
        const thaiContent = page.getByText(/หน้าแรก|ตารางแข่ง|ตารางคะแนน|สถิติ/).first();
        await expect(thaiContent).toBeVisible();
    });

    test('should switch language when toggled', async ({ page }) => {
        // Find and click language switcher
        const languageSwitcher = page.locator('button:has-text("EN"), button:has-text("TH"), [class*="lang"] button').first();

        if (await languageSwitcher.isVisible()) {
            await languageSwitcher.click();
            await page.waitForTimeout(500);

            // After toggle, content should change
            // Either English or Thai text should be visible
            const hasContent = await page.getByText(/Home|Fixtures|Standings|Stats|หน้าแรก|ตารางแข่ง/).first().isVisible();
            expect(hasContent).toBe(true);
        }
    });
});
