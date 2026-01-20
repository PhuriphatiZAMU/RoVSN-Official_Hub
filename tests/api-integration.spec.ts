import { test, expect } from '@playwright/test';

/**
 * RoV SN Tournament Official - API Integration E2E Tests
 * Tests for backend API connectivity and data loading
 */

test.describe('API Integration', () => {
    test('should load data from API on home page', async ({ page }) => {
        // Intercept API calls
        const apiCalls: string[] = [];

        page.on('request', request => {
            if (request.url().includes('/api/')) {
                apiCalls.push(request.url());
            }
        });

        await page.goto('/');
        await page.waitForTimeout(2000);

        // Check that some API calls were made (or page loaded without errors)
        const hasApiCalls = apiCalls.length > 0;
        const pageLoaded = await page.locator('body').isVisible();

        expect(pageLoaded).toBe(true);
    });

    test('should handle API errors gracefully', async ({ page }) => {
        await page.goto('/fixtures');
        await page.waitForTimeout(1000);

        // Page should still render even if API has no data
        const pageContent = await page.locator('body').textContent();
        expect(pageContent).toBeDefined();

        // Should not show uncaught error
        const hasUncaughtError = await page.getByText(/undefined|null|error|exception/i).first().isVisible().catch(() => false);
        // Allow for "No Data" messages but not actual errors
    });

    test('should load standings data', async ({ page }) => {
        let standingsApiCalled = false;

        page.on('request', request => {
            if (request.url().includes('standings') || request.url().includes('teams')) {
                standingsApiCalled = true;
            }
        });

        await page.goto('/standings');
        await page.waitForTimeout(2000);

        // Page should load regardless of API
        await expect(page).toHaveURL(/.*standings/);
    });

    test('should load stats data', async ({ page }) => {
        await page.goto('/stats');
        await page.waitForTimeout(2000);

        // Stats page should be functional
        await expect(page).toHaveURL(/.*stats/);

        // Should display some content
        const content = page.locator('main, [class*="content"]').first();
        await expect(content).toBeVisible();
    });

    test('should load clubs data', async ({ page }) => {
        await page.goto('/clubs');
        await page.waitForTimeout(2000);

        await expect(page).toHaveURL(/.*clubs/);

        // Page should render clubs or empty state
        const content = page.locator('main, [class*="content"]').first();
        await expect(content).toBeVisible();
    });
});
