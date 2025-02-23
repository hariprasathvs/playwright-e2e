import { test } from '../Fixtures';

test('Run Accessibilty test for Wikipedia HomePage', async ({ page, checkAccessibility}) => {
    await page.goto('/');
    await checkAccessibility (page, ['wcag21aa', 'ACT']);
});