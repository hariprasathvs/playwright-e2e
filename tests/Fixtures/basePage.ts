import { test as base } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import lighthouse from "lighthouse";
import fs from "fs";
import { chromium } from "playwright";
import net from "net";
import { extractLightHouseMetrics } from "../../utils/lighthouseMetrics";

export const test = base.extend<{
    accessibilityBuilder: AxeBuilder;
    checkAccessibility: (page:any, tags?: string[]) => Promise<void>;
    runLighthouseAudit: (url: string) => Promise<any>;
}> ({
    accessibilityBuilder: async ({ page }, use) =>{
        const accessibilityBuilder = new AxeBuilder({ page });
        await use(accessibilityBuilder);
    },
    checkAccessibility: async ({page, accessibilityBuilder}, use, testInfo) => {
        const checkAccessibility = async (page:any, tags?: string[]) => {
            const builder = tags ? accessibilityBuilder.withTags(tags) : accessibilityBuilder;
            const accessibilityScanResults = await builder.analyze();

            const violations = accessibilityScanResults.violations;

            await testInfo.attach("accessibility-scan-results", {
                body: JSON.stringify(violations, null, 2),
                contentType: "application/json",
            });

            const seriousOrCritialViolations = violations.filter(
                (v) => v.impact === 'critical' || v.impact === 'serious'
            );
            expect(seriousOrCritialViolations).toBe(0);
        };
        await use(checkAccessibility);
    },
    runLighthouseAudit: async ({}, use, testInfo) => {
        async function findFreePort() {
            return new Promise ((resolve, reject) => {
                const server = net.createServer();
                server.listen(0, () => {
                    const port = server.address().port;
                    server.close(()=> resolve(port));
                });
                server.on('error', reject);
            });
        }
        const port = await findFreePort();
        const runLighthouseAudit = async (path: string) => {
            const baseUrl = 'https://www.wikipedia.org'
            const url = `${baseUrl}${path}`;
            const browser = await chromium.launch({
                headless: true,
                args: [`--remote-debugging-port=${port}`],
            });

            console.log(`Playwright Chromium started with remote debugging for ${url}`);

            try {
                const results: any = await lighthouse( url, {
                    port: port,
                    output: 'json',
                    onlyCategories: ['performance'],
                });

                const { audits } = results.lhr;
                const metrics = extractLightHouseMetrics(audits);

                console.log(`Extracted Lighthouse Metrics for ${url}:`, metrics);

                const filenameBase = url.replace(/[^a-zA-Z0-9]/g, '-');
                const reportPath = `${filenameBase}-report.json`;
                const metricsPath = `${filenameBase}-metrics.json`;

                await Promise.all([ //Use Promise.all for concurrent file writing    
                fs.promises.writeFile(reportPath, JSON.stringify(results.lhr, null, 2)),
                fs.promises.writeFile(metricsPath, JSON.stringify(metrics, null, 2)),
            ]);
            await testInfo.attach(`lighthouse-report-${filenameBase}`, {
                path: reportPath,
                contentType: "application/json",
            });
            await testInfo.attach(`lighthouse-metrics-${filenameBase}`, {
                path: metricsPath,
                contentType: "application/json",
            });

            console.log(`Lighthouse audit completed for ${url}. Report saved as ${reportPath}`);
            console.log(`Metrics extracted for ${url}. Saved as ${metricsPath}`);

            return metrics;
            } catch (error) {
                console.error(`Error running Lighthouse audit for ${url}:`, error);
                throw error;
            } finally {
                await browser.close();
                console.log(`Playwright browser closed for ${url}`);
            }
        };
        await use(runLighthouseAudit);
    },
});

export const expect = base.expect;