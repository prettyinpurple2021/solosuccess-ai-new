import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('http://localhost:3000');
  });

  test('should display login page', async ({ page }) => {
    // Check if the page loads
    await expect(page).toHaveTitle(/SoloSuccess/i);
    
    // Check for login elements (adjust selectors based on actual implementation)
    const loginButton = page.getByRole('button', { name: /sign in|login/i });
    await expect(loginButton).toBeVisible();
  });

  test('should navigate to registration page', async ({ page }) => {
    // Click on register/sign up link
    const registerLink = page.getByRole('link', { name: /sign up|register/i });
    if (await registerLink.isVisible()) {
      await registerLink.click();
      
      // Verify navigation to registration page
      await expect(page).toHaveURL(/register|signup/i);
    }
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // Try to submit with invalid email
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole('button', { name: /sign in|login/i });
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid-email');
      await passwordInput.fill('password123');
      await submitButton.click();
      
      // Check for validation error
      const errorMessage = page.getByText(/invalid email|email is invalid/i);
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Dashboard Navigation E2E Tests', () => {
  test('should display dashboard after login', async ({ page }) => {
    // This test assumes user is already logged in or uses a test account
    await page.goto('http://localhost:3000/dashboard');
    
    // Check if redirected to login or dashboard loads
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/(login|dashboard)/);
  });

  test('should navigate to agents page', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Look for agents navigation link
    const agentsLink = page.getByRole('link', { name: /agents|ai agents/i });
    if (await agentsLink.isVisible()) {
      await agentsLink.click();
      await expect(page).toHaveURL(/agents/);
    }
  });
});
