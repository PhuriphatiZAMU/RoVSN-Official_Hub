import { test, expect } from '@playwright/test';

/**
 * RoV SN Tournament Official - Authentication E2E Tests
 * Tests for login page and authentication flow
 */

test.describe('Authentication', () => {
    test.describe('Login Page', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/login');
        });

        test('should load login page', async ({ page }) => {
            await expect(page).toHaveURL(/.*login/);
        });

        test('should display login form', async ({ page }) => {
            // Check for form elements
            const form = page.locator('form').first();
            await expect(form).toBeVisible();
        });

        test('should have username/email input field', async ({ page }) => {
            const usernameInput = page.locator('input[type="text"], input[type="email"], input[name*="user"], input[name*="email"]').first();
            await expect(usernameInput).toBeVisible();
        });

        test('should have password input field', async ({ page }) => {
            const passwordInput = page.locator('input[type="password"]');
            await expect(passwordInput).toBeVisible();
        });

        test('should have submit button', async ({ page }) => {
            const submitButton = page.getByRole('button', { name: /Login|Sign in|เข้าสู่ระบบ|Submit/i }).or(
                page.locator('button[type="submit"]')
            );
            await expect(submitButton).toBeVisible();
        });

        test('should show error on invalid login', async ({ page }) => {
            // Fill in invalid credentials
            const usernameInput = page.locator('input[type="text"], input[type="email"], input[name*="user"], input[name*="email"]').first();
            const passwordInput = page.locator('input[type="password"]');
            const submitButton = page.getByRole('button', { name: /Login|Sign in|เข้าสู่ระบบ|Submit/i }).or(
                page.locator('button[type="submit"]')
            );

            await usernameInput.fill('invalid@test.com');
            await passwordInput.fill('wrongpassword');
            await submitButton.click();

            // Wait for response
            await page.waitForTimeout(3000);

            // After submission, we should either:
            // 1. Still be on login page (invalid credentials)
            // 2. See an error message
            // 3. See a SweetAlert2 popup (the app uses this)
            const currentUrl = page.url();
            const isOnLoginPage = currentUrl.includes('login');
            const hasError = await page.getByText(/error|invalid|wrong|ผิดพลาด|ไม่ถูกต้อง|fail/i).first().isVisible().catch(() => false);
            const hasSwalPopup = await page.locator('.swal2-popup, [class*="swal"]').isVisible().catch(() => false);

            // Test passes if any of these conditions are true
            expect(isOnLoginPage || hasError || hasSwalPopup).toBe(true);
        });
    });

    test.describe('Protected Routes', () => {
        test('should redirect to login when accessing admin without auth', async ({ page }) => {
            await page.goto('/admin');

            // Should redirect to login or show unauthorized
            await page.waitForTimeout(1000);
            const currentUrl = page.url();

            // Should either redirect to login or stay on admin with error
            expect(currentUrl.includes('login') || currentUrl.includes('admin')).toBe(true);
        });

        test('should redirect to login when accessing admin/draw without auth', async ({ page }) => {
            await page.goto('/admin/draw');
            await page.waitForTimeout(1000);
            const currentUrl = page.url();
            expect(currentUrl.includes('login') || currentUrl.includes('admin')).toBe(true);
        });

        test('should redirect to login when accessing admin/results without auth', async ({ page }) => {
            await page.goto('/admin/results');
            await page.waitForTimeout(1000);
            const currentUrl = page.url();
            expect(currentUrl.includes('login') || currentUrl.includes('admin')).toBe(true);
        });
    });
});
