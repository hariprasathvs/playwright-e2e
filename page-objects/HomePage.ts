import { expect, type Locator, type Page} from '@playwright/test';
export class HomePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;

    }

    async goto() {
        await this.page.goto('/');
        await this.page.waitForLoadState("domcontentloaded");
        // Expect a title "to contain" a substring.
        await expect(this.page).toHaveTitle(/Wikipedia/);
    }
}