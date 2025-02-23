import { expect, test } from '@playwright/test';
import { HomePage } from '../../page-objects/HomePage';

test('Verify Wikipedia homepage for visual regression', async ({ page }) => {
  const homepage = new HomePage(page);
  await homepage.goto();
  await expect(page).toHaveScreenshot("HomePage.png", {fullPage: true, maxDiffPixels: 100});
});
