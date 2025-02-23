import { test } from '../Fixtures';
test('Run Lighthouse Audit for Wikipedia HomePage', async ({runLighthouseAudit}) => {
    await runLighthouseAudit('/');
});