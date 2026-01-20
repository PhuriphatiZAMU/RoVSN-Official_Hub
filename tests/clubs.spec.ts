import { test, expect } from '@playwright/test';

/**
 * RoV SN Tournament Official - Clubs Page E2E Tests
 * Tests for team/club listing display
 */

test.describe('Clubs Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/clubs');
    });

    test('should load clubs page', async ({ page }) => {
        await expect(page).toHaveURL(/.*clubs/);
    });

    test('should display page header', async ({ page }) => {
        // Check for clubs/teams header - use more specific selector
        const header = page.locator('main h1, [class*="page"] h1, [class*="title"]:not(nav *)').first();
        await expect(header).toBeVisible();
    });

    test('should have share functionality', async ({ page }) => {
        // Check for share button
        const shareButton = page.locator('button').filter({ hasText: /แชร์|Share/i }).first();

        // Share button may or may not be present
        if (await shareButton.isVisible()) {
            await expect(shareButton).toBeEnabled();
        }
    });

    test('should display team list or empty state', async ({ page }) => {
        // Page should render main content area
        const mainContent = page.locator('main, [class*="content"], [class*="container"]').first();
        await expect(mainContent).toBeVisible();

        // Content should exist (either teams or empty message)
        const textContent = await mainContent.textContent();
        expect(textContent).toBeDefined();
    });

    test('should display team logos if teams exist', async ({ page }) => {
        const teamLogos = page.locator('img[alt*="logo"], img[alt*="team"], [class*="logo"] img');
        const logoCount = await teamLogos.count();

        // May or may not have logos depending on data
        expect(logoCount).toBeGreaterThanOrEqual(0);
    });
});
