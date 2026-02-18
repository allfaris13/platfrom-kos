import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('should navigate to room detail and start booking', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for the splash screen to disappear
    await page.waitForSelector('text=Initializing Platform', { state: 'hidden' });
    
    // Check if we are on the portal
    await expect(page).toHaveTitle(/Kos-kosan/);
    
    // Simulate finding a room card (example based on existing UI)
    const roomCard = page.locator('div:has-text("Kamar")').first();
    await expect(roomCard).toBeVisible();
    
    // Click detail button if exists
    const detailButton = roomCard.locator('button:has-text("Detail")');
    if (await detailButton.isVisible()) {
        await detailButton.click();
        // Verify we see room details
        await expect(page.locator('text=Fasilitas Kamar')).toBeVisible();
    }
  });

  test('login flow', async ({ page }) => {
    await page.goto('/');
    // Depending on auth state, we might see login or dashboard
    // This is a smoke test to ensure no crashes
    await expect(page.locator('body')).toBeVisible();
  });
});
