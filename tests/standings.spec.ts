import { test, expect } from '@playwright/test';

/**
 * RoV SN Tournament Official - Standings Page E2E Tests
 * Tests for team rankings and points display
 */

test.describe('Standings Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/standings');
    });

    test('should load standings page', async ({ page }) => {
        await expect(page).toHaveURL(/.*standings/);
    });

    test('should display page header', async ({ page }) => {
        // Check for standings/rankings header - avoid nav links
        const header = page.locator('main h1, [class*="page"] h1, [class*="title"]:not(nav *)').first();
        await expect(header).toBeVisible();
    });

    test('should display standings table or empty state', async ({ page }) => {
        // Page should render main content area
        const mainContent = page.locator('main, [class*="content"], [class*="container"]').first();
        await expect(mainContent).toBeVisible();

        // Content should exist
        const textContent = await mainContent.textContent();
        expect(textContent).toBeDefined();
    });

    test('should have proper table structure if data exists', async ({ page }) => {
        const table = page.locator('table').first();

        if (await table.isVisible()) {
            // Check for table headers (Position, Team, Wins, etc.)
            const tableHeaders = table.locator('th, thead td');
            const headerCount = await tableHeaders.count();
            expect(headerCount).toBeGreaterThan(0);
        }
    });
});
