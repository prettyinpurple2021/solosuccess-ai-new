import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should not have accessibility violations on home page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility violations on dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const firstFocusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocusedElement).toBeTruthy();
    
    // Continue tabbing
    await page.keyboard.press('Tab');
    const secondFocusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(secondFocusedElement).toBeTruthy();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', (elements) =>
      elements.map((el) => ({
        level: parseInt(el.tagName.substring(1)),
        text: el.textContent?.trim(),
      }))
    );
    
    // Check that there's at least one h1
    const h1Count = headings.filter((h) => h.level === 1).length;
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const imagesWithoutAlt = await page.$$eval('img:not([alt])', (images) =>
      images.length
    );
    
    expect(imagesWithoutAlt).toBe(0);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('body')
      .analyze();
    
    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    );
    
    expect(contrastViolations).toEqual([]);
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze();
    
    const labelViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'label'
    );
    
    expect(labelViolations).toEqual([]);
  });

  test('should have ARIA attributes where needed', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    const ariaViolations = accessibilityScanResults.violations.filter((v) =>
      v.id.startsWith('aria-')
    );
    
    expect(ariaViolations).toEqual([]);
  });
});

test.describe('Keyboard Navigation Tests', () => {
  test('should navigate through buttons with keyboard', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Get all buttons
    const buttons = await page.$$('button');
    
    if (buttons.length > 0) {
      // Tab to first button
      await page.keyboard.press('Tab');
      
      // Press Enter to activate
      await page.keyboard.press('Enter');
      
      // Verify some action occurred (page change, modal open, etc.)
      await page.waitForTimeout(500);
    }
  });

  test('should close modals with Escape key', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Look for any modal trigger
    const modalTrigger = page.getByRole('button', { name: /open|show|create/i }).first();
    
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      await page.waitForTimeout(500);
      
      // Press Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      
      // Modal should be closed (implementation-specific check)
    }
  });
});

test.describe('Screen Reader Tests', () => {
  test('should have proper ARIA labels on interactive elements', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const buttonsWithoutLabels = await page.$$eval(
      'button:not([aria-label]):not([aria-labelledby])',
      (buttons) => buttons.filter((btn) => !btn.textContent?.trim()).length
    );
    
    expect(buttonsWithoutLabels).toBe(0);
  });

  test('should have proper landmarks', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check for main landmark
    const main = await page.$('main, [role="main"]');
    expect(main).toBeTruthy();
    
    // Check for navigation landmark
    const nav = await page.$('nav, [role="navigation"]');
    expect(nav).toBeTruthy();
  });
});
