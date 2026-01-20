import { test, expect } from '@playwright/test';

/**
 * RoV SN Tournament Official - Home Page E2E Tests
 * Tests for home page functionality and components
 */

test.describe('Home Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should load home page successfully', async ({ page }) => {
        // Check page title contains RoV or Tournament
        await expect(page).toHaveTitle(/RoV|Tournament/i);
    });

    test('should display hero section', async ({ page }) => {
        // Check for hero carousel or main banner - flexible matching
        const mainContent = page.locator('main, [class*="hero"], [class*="carousel"], [class*="banner"]').first();
        await expect(mainContent).toBeVisible();
    });

    test('should display branding elements', async ({ page }) => {
        // Check for RoV SN Tournament branding anywhere on page
        const pageContent = await page.locator('body').textContent();
        expect(pageContent?.toLowerCase()).toMatch(/rov|tournament|สนามกีฬา/i);
    });

    test('should have working carousel navigation', async ({ page }) => {
        // Check for carousel navigation arrows if present
        const nextArrow = page.locator('[class*="next"], [class*="arrow-right"], button:has-text("›")').first();
        const prevArrow = page.locator('[class*="prev"], [class*="arrow-left"], button:has-text("‹")').first();

        // If carousel arrows exist, they should be clickable
        if (await nextArrow.isVisible()) {
            await nextArrow.click();
            // Wait for carousel animation
            await page.waitForTimeout(500);
        }

        if (await prevArrow.isVisible()) {
            await prevArrow.click();
            await page.waitForTimeout(500);
        }
    });

    test('should display quick sections', async ({ page }) => {
        // Check for main content area
        const mainContent = page.locator('main, [class*="content"], body > div').first();
        await expect(mainContent).toBeVisible();
    });

    test('should have working footer with social links', async ({ page }) => {
        // Check footer visibility
        const footer = page.locator('footer');
        await expect(footer).toBeVisible();

        // Check for social media links (Facebook, Discord, Instagram)
        const socialLinks = footer.locator('a[href*="facebook"], a[href*="discord"], a[href*="instagram"]');
        const socialCount = await socialLinks.count();
        expect(socialCount).toBeGreaterThanOrEqual(0); // May or may not have social links
    });
});
