import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show error when Supabase env vars are missing', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toContainText('Missing Supabase configuration');
  });
});

test.describe('Booking Flow', () => {
  test('should load booking page', async ({ page }) => {
    await page.goto('/bookings');
    await expect(page.locator('h1')).toBeVisible();
  });
});