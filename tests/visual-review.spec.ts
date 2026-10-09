import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const example = {
  hasCompletedOnboarding: true, userName: 'Visual Test', language: 'en',
  sessions: [{ id: 'visual-exam', label: 'Visual test exam', date: '2026-01-01T12:00:00Z', healthScore: 90,
    biomarkers: [{ name: 'Glucosa', value: '95', unit: 'mg/dL', status: 'normal', referenceRange: '70 - 100' }],
  }],
};

for (const width of [320, 1280]) {
  test(`core screens fit a ${width}px viewport and resize without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const history = { ...example, biomarkers: example.sessions[0].biomarkers, healthScore: 90,
      sessions: [...example.sessions, { ...example.sessions[0], id: 'earlier', date: '2025-12-01T12:00:00Z', healthScore: 80 }],
    };
    await page.addInitScript(seed => localStorage.setItem('clyra-storage', JSON.stringify({ version: 0, state: seed })), history);
    for (const route of ['/', '/upload', '/manual-entry', '/activity', '/progress', '/settings', '/subscription']) {
      await page.goto(route);
      await expect(page.locator('body')).not.toBeEmpty();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (route === '/progress') {
        await expect(page.getByText('Score History', { exact: true })).toBeVisible();
        const overflow = await page.locator('svg').evaluateAll(elements => elements.filter(element => {
          const rect = element.getBoundingClientRect();
          const parent = element.parentElement!.getBoundingClientRect();
          return rect.width > 100 && (rect.left < parent.left - 1 || rect.right > parent.right + 1);
        }).length);
        expect(overflow).toBe(0);
      }
    }
    await page.goto('/manual-entry');
    const input = page.getByLabel('Biomarker', { exact: true });
    await expect(input).toBeVisible();
    expect((await input.boundingBox())!.width).toBeLessThanOrEqual(520);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(async () => (await input.boundingBox())!.width).toBeLessThanOrEqual(390);
  });
}

test('web animation renders using a local WASM asset without CDN requests', async ({ page }) => {
  const remoteRequests: string[] = [];
  page.on('request', request => {
    if (/cdn\.jsdelivr|unpkg\.com/.test(request.url())) remoteRequests.push(request.url());
  });
  await page.addInitScript(() => localStorage.setItem('clyra-storage', JSON.stringify({ version: 0, state: { hasCompletedOnboarding: true } })));
  const wasm = page.waitForResponse(response => response.url().endsWith('/dotlottie-player.wasm'));
  await page.goto('/activity');
  expect((await wasm).status()).toBe(200);
  await expect.poll(() => page.locator('canvas').first().evaluate((canvas: HTMLCanvasElement) => {
    const context = canvas.getContext('2d');
    if (!context) return false;
    return context.getImageData(0, 0, canvas.width, canvas.height).data.some((value, i) => i % 4 === 3 && value > 0);
  }), { timeout: 15_000 }).toBe(true);
  expect(remoteRequests).toEqual([]);
});

test('settings downloads real data and confirms destructive actions', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(seed => localStorage.setItem('clyra-storage', JSON.stringify({ version: 0, state: seed })), example);
  await page.goto('/settings');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('clyra-results.json');
  const json = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(json.sessions[0].id).toBe('visual-exam');
  expect(json.profile.userName).toBe('Visual Test');
  await expect(page.getByRole('switch').first()).toBeDisabled();
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('clyra-storage')!).state.sessions.length)).toBe(1);
  // Reset should remove only Clyra's data, not unrelated origin storage.
  await page.evaluate(() => localStorage.setItem('unrelated-app-data', 'keep'));
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  expect(await page.evaluate(() => localStorage.getItem('unrelated-app-data'))).toBe('keep');
});

test('subscription preview cannot simulate a successful purchase', async ({ page }) => {
  await page.goto('/subscription');
  await expect(page.getByRole('button', { name: 'Purchases coming soon', exact: true })).toBeDisabled();
  await expect(page.getByText('Plan preview only. Purchases and free trials are not available yet; no payment will be taken.')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('clyra-storage') || '{}').state?.isPro ?? false)).toBe(false);
});
