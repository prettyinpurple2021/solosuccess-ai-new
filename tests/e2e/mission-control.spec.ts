import { test, expect } from '@playwright/test';

test.describe('Mission Control E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to mission control page
    await page.goto('http://localhost:3000/dashboard/mission-control');
  });

  test('should display mission control interface', async ({ page }) => {
    // Check if mission control page loads
    const heading = page.getByRole('heading', { name: /mission control/i });
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test('should show objective input field', async ({ page }) => {
    // Look for objective input
    const objectiveInput = page.getByPlaceholder(/objective|goal|what would you like/i);
    if (await objectiveInput.isVisible()) {
      await expect(objectiveInput).toBeVisible();
      await expect(objectiveInput).toBeEditable();
    }
  });

  test('should allow creating a new session', async ({ page }) => {
    // Find and fill objective input
    const objectiveInput = page.getByPlaceholder(/objective|goal|what would you like/i);
    const submitButton = page.getByRole('button', { name: /start|create|launch/i });
    
    if (await objectiveInput.isVisible() && await submitButton.isVisible()) {
      await objectiveInput.fill('Create a marketing strategy for my SaaS product');
      await submitButton.click();
      
      // Check for loading state or success message
      const loadingIndicator = page.getByText(/processing|analyzing|working/i);
      await expect(loadingIndicator).toBeVisible({ timeout: 5000 });
    }
  });
});
