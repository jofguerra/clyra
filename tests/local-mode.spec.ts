import { localWeekKey } from '../constants/activityDates';
import { expect, test, type Page } from '@playwright/test';

async function state(page: Page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('clyra-storage') || '{}').state);
}

test('onboarding, manual exam, validation and persistence work without a backend', async ({ page }) => {
  const errors: string[] = [];
  const backendRequests: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (/supabase|openai|\/auth\/v1|\/rest\/v1|\/functions\/v1/.test(request.url())) {
      backendRequests.push(request.url());
    }
  });

  await page.goto('/');
  await page.getByText('Skip', { exact: true }).click();
  await page.getByPlaceholder('E.g. Alex').fill('Local Tester');
  await page.getByPlaceholder('E.g. 35').fill('35');
  await page.getByText('Female', { exact: true }).click();
  await page.getByText('Continue', { exact: true }).click();
  await expect(page).toHaveURL(/onboarding\/goals/);
  await page.getByText('I understand', { exact: true }).last().click();
  await page.getByText('Skip for now', { exact: true }).click();
  await expect.poll(async () => (await state(page))?.hasCompletedOnboarding).toBe(true);
  await page.getByText('Tests', { exact: true }).click();
  await page.getByText('Enter results manually', { exact: true }).click();
  await page.getByText('Add marker', { exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('numeric value');
  await page.getByLabel('Biomarker', { exact: true }).fill('Glucosa');
  await page.getByLabel('Value', { exact: true }).fill('95');
  await page.getByLabel('Unit', { exact: true }).fill('mg/dL');
  await page.getByLabel('Reference range (optional)').fill('70 - 100');
  await page.getByRole('radio', { name: 'Normal', exact: true }).click();
  await page.getByText('Add marker', { exact: true }).click();
  await expect(page.getByText('Glucosa: 95 mg/dL · Normal', { exact: true })).toBeVisible();
  await page.getByText('Save exam', { exact: true }).click();
  await expect.poll(async () => (await state(page))?.sessions.length).toBe(1);
  const saved = await state(page);
  expect(saved.sessions[0].biomarkers[0]).toMatchObject({ name: 'Glucosa', value: '95', unit: 'mg/dL', status: 'normal' });
  expect(saved.userName).toBe('Local Tester');
  expect(saved.isGuest).toBe(true);
  expect(saved.lastSyncedAt).toBeNull();

  // Reload through the root to exercise asynchronous hydration before routing.
  await page.goto('/');
  await expect(page.getByText('Tests', { exact: true })).toBeVisible();
  expect((await state(page)).sessions).toEqual(saved.sessions);
  // Persisted achievement celebrations are real overlays; dismiss them before navigating.
  for (let i = 0; i < 10 && (await state(page)).pendingUnlockedAchievements?.length; i++) {
    const remaining = (await state(page)).pendingUnlockedAchievements.length;
    await page.getByRole('dialog').click({ position: { x: 10, y: 10 } });
    await expect.poll(async () => (await state(page)).pendingUnlockedAchievements.length).toBe(remaining - 1);
  }
  await page.getByText('Tests', { exact: true }).click();
  await page.getByText(saved.sessions[0].label, { exact: true }).click();
  await expect(page.locator('body')).toContainText('95');
  await page.goto('/settings');
  await expect(page.getByText('Your data is saved only on this device. Accounts and cloud backup are unavailable.')).toBeVisible();
  await expect(page.getByText('Create Account', { exact: true })).toHaveCount(0);
  await page.goto('/chat');
  await expect(page.getByText('AI chat and photo analysis are unavailable in local mode. Enter results manually or import a Raly text PDF on web.')).toBeVisible();
  await page.goto('/progress');
  await expect(page.getByText('Trends', { exact: true }).last()).toBeVisible();
  await page.goto('/activity');
  await expect(page.getByText('Actions', { exact: true }).last()).toBeVisible();
  expect(backendRequests).toEqual([]);
  expect(errors).toEqual([]);
});

test('a stored exam can be opened directly, edited, and deleted with confirmation', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('clyra-storage', JSON.stringify({ version: 0, state: {
    hasCompletedOnboarding: true,
    sessions: [{ id: 'local-exam', date: '2026-01-01T12:00:00Z', label: 'Local exam', healthScore: 100,
      biomarkers: [{ name: 'Glucosa', value: '95', unit: 'mg/dL', status: 'normal', referenceRange: '70 - 100' }],
    }],
  } })));
  await page.goto('/test/local-exam');
  await expect(page.getByText('95 mg/dL', { exact: true })).toBeVisible();
  await page.getByText('Edit Test', { exact: true }).click();
  await page.getByLabel('Glucosa value', { exact: true }).fill('98');
  await page.getByLabel('Confirm Glucosa', { exact: true }).click();
  await page.getByText('Save Changes', { exact: true }).click();
  await page.reload();
  await expect(page.getByText('98 mg/dL', { exact: true })).toBeVisible();
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByText('Delete Test', { exact: true }).click();
  expect((await state(page)).sessions).toHaveLength(1);
  page.once('dialog', dialog => dialog.accept());
  await page.getByText('Delete Test', { exact: true }).click();
  await expect.poll(async () => (await state(page))?.sessions.length).toBe(0);
  await page.reload();
  expect((await state(page)).biomarkers).toEqual([]);
});

test('persisted cloud identity becomes a local guest without losing stored data', async ({ page }) => {
  await page.addInitScript(week => {
    localStorage.setItem('clyra-storage', JSON.stringify({ version: 0, state: {
      userName: 'Existing Profile', hasCompletedOnboarding: true,
      authUserId: 'previous-cloud-user', isGuest: false, lastSyncedAt: '2025-01-01T00:00:00Z',
      weeklyMissionCount: 2, weeklyMissionWeek: week,
    } }));
  }, localWeekKey());
  await page.goto('/');
  await page.getByText('Settings', { exact: true }).click();
  await expect(page.getByText('Existing Profile', { exact: true })).toBeVisible();
  await expect.poll(async () => (await state(page))?.isGuest).toBe(true);
  const restored = await state(page);
  expect(restored.authUserId).toBeNull();
  expect(restored.lastSyncedAt).toBeNull();
  expect(restored.weeklyMissionCount).toBe(2);
});

test('local auth route offers a working path forward in Spanish', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('clyra-storage', JSON.stringify({
    version: 0, state: { language: 'es' },
  })));
  await page.goto('/onboarding/auth');
  await expect(page.getByText('Modo local', { exact: true })).toBeVisible();
  await expect(page.locator('input')).toHaveCount(0);
  await page.getByText('Continuar localmente', { exact: true }).click();
  await expect(page.getByPlaceholder('Ej. Alex')).toBeVisible();
});
