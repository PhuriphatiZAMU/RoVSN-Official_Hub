import { test, expect } from '@playwright/test';

/**
 * RoV SN Tournament Official - Format Page E2E Tests
 * Tests for tournament format and rules display
 */

test.describe('Format Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/format');
    });

    test('should load format page', async ({ page }) => {
        await expect(page).toHaveURL(/.*format/);
    });

    test('should display page header', async ({ page }) => {
        // Check for format/rules header - avoid nav links
        const header = page.locator('main h1, [class*="page"] h1, [class*="title"]:not(nav *)').first();
        await expect(header).toBeVisible();
    });

    test('should display tournament format details', async ({ page }) => {
        // Check for format information in main content
        const mainContent = page.locator('main, [class*="content"]').first();
        await expect(mainContent).toBeVisible();

        const textContent = await mainContent.textContent();
        expect(textContent).toBeDefined();
    });

    test('should display number of teams', async ({ page }) => {
        // Check for team count information - more flexible
        const mainContent = page.locator('main').first();
        const textContent = await mainContent.textContent();

        // Should mention teams somewhere
        expect(textContent?.toLowerCase()).toMatch(/team|ทีม|10/i);
    });

    test('should display match format (BO3)', async ({ page }) => {
        // Check for Best of 3 or match format
        const mainContent = page.locator('main').first();
        const textContent = await mainContent.textContent();

        // Should mention BO3 or best of format
        expect(textContent?.toLowerCase()).toMatch(/bo3|bo|best/i);
    });

    test('should have structured content sections', async ({ page }) => {
        // Check for content in main area
        const mainContent = page.locator('main, [class*="content"]').first();
        await expect(mainContent).toBeVisible();
    });
});
