import { test } from '@playwright/test';
import { HomePage } from '../../page-objects/HomePage';

test('Open Wikipedia and has title', async ({ page }) => {
  const homepage = new HomePage(page);
  await homepage.goto();
});
