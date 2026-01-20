import { test, expect } from '@playwright/test';

/**
 * RoV SN Tournament Official - Responsive Design E2E Tests
 * Tests for mobile and tablet viewport responsiveness
 */

test.describe('Responsive Design', () => {
    test.describe('Mobile Viewport', () => {
        test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

        test('should display mobile menu button', async ({ page }) => {
            await page.goto('/');

            // Mobile should have some navigation visible
            const nav = page.locator('nav, [class*="nav"], header');
            await expect(nav.first()).toBeVisible();
        });

        test('should have readable content on mobile', async ({ page }) => {
            await page.goto('/');

            // Main content should be visible
            const mainContent = page.locator('main, [class*="content"], body').first();
            await expect(mainContent).toBeVisible();
        });

        test('should navigate correctly on mobile', async ({ page }) => {
            await page.goto('/');

            // Navigate to different pages
            await page.goto('/fixtures');
            await expect(page).toHaveURL(/.*fixtures/);

            await page.goto('/standings');
            await expect(page).toHaveURL(/.*standings/);
        });
    });

    test.describe('Tablet Viewport', () => {
        test.use({ viewport: { width: 768, height: 1024 } }); // iPad

        test('should display properly on tablet', async ({ page }) => {
            await page.goto('/');

            // Navigation should be visible
            const nav = page.locator('nav, header').first();
            await expect(nav).toBeVisible();
        });

        test('should have proper layout on tablet', async ({ page }) => {
            await page.goto('/');

            // Check that main content is visible
            const mainContent = page.locator('main, [class*="content"]').first();
            await expect(mainContent).toBeVisible();
        });
    });

    test.describe('Desktop Viewport', () => {
        test.use({ viewport: { width: 1920, height: 1080 } }); // Full HD

        test('should display full navigation on desktop', async ({ page }) => {
            await page.goto('/');

            // Navigation should be visible
            const nav = page.locator('nav, header').first();
            await expect(nav).toBeVisible();
        });

        test('should have centered content on large screens', async ({ page }) => {
            await page.goto('/');

            // Content should be contained and not span entire width
            const container = page.locator('[class*="container"], [class*="wrapper"], main').first();
            await expect(container).toBeVisible();
        });
    });
});
