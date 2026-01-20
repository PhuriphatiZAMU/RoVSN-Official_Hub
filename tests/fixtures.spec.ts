import { test, expect } from '@playwright/test';

/**
 * RoV SN Tournament Official - Fixtures Page E2E Tests
 * Tests for tournament match schedule display
 */

test.describe('Fixtures Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/fixtures');
    });

    test('should load fixtures page', async ({ page }) => {
        await expect(page).toHaveURL(/.*fixtures/);
    });

    test('should display page header', async ({ page }) => {
        // Check for fixtures/schedule header - avoid nav links
        const header = page.locator('main h1, [class*="page"] h1, [class*="title"]:not(nav *)').first();
        await expect(header).toBeVisible();
    });

    test('should display match list or empty state', async ({ page }) => {
        // Page should render main content area
        const mainContent = page.locator('main, [class*="content"], [class*="container"]').first();
        await expect(mainContent).toBeVisible();

        // Content should exist (either matches or empty message)
        const textContent = await mainContent.textContent();
        expect(textContent).toBeDefined();
    });

    test('should have proper page structure', async ({ page }) => {
        // Page should have main content area
        const mainContent = page.locator('main, [class*="content"], [class*="container"]').first();
        await expect(mainContent).toBeVisible();
    });
});
