import { exactResultNumber, resultDirection } from '../constants/resultTrends';
import { test, expect } from '@playwright/test';
test.use({ timezoneId: 'America/Panama' });
import { BODY_SYSTEMS, getSystemBiomarkers, getSystemStatus, computeHealthScore, comparableScoreDelta } from '../constants/biomarkerSystems';
import { computeSystemCoverage } from '../constants/healthMetrics';
import { getXPLevel, getScoreLevel } from '../constants/gamification';
import { localDayKey, localWeekKey, nextActiveWeeks } from '../constants/activityDates';
import type { Biomarker } from '../services/openai';
const marker = (name: string, status: Biomarker['status'] = 'normal', unit = 'mg/dL'): Biomarker => ({ name, status, unit, value: '90' });
const system = (id: string) => BODY_SYSTEMS.find(s => s.id === id)!;

test('system matching distinguishes A1c, free hormones, urine and similarly named proteins', () => {
  const rows = [marker('Hemoglobina A1c', 'high'), marker('Glucosa (Orina)', 'low'), marker('Microalbúmina', 'high'), marker('Transferrina', 'normal')];
  expect(getSystemStatus(system('hematologico'), rows)).toBe('none');
  expect(getSystemBiomarkers(system('metabolico'), rows).map(b => b.name)).toEqual(['Hemoglobina A1c']);
  expect(getSystemStatus(system('hepatico'), rows)).toBe('none');
  expect(getSystemBiomarkers(system('renal'), rows)).toHaveLength(2);
  expect(getSystemStatus(system('cardiovascular'), [marker('')])).toBe('none');
  expect(computeSystemCoverage([marker('T3 Libre')], system('tiroideo')).covered).toBe(1);
});
test('coverage counts canonical markers once, not duplicate aliases or repeated rows', () => {
  const cardiovascular = system('cardiovascular');
  const coverage = computeSystemCoverage([marker('PCR'), marker('Proteína C Reactiva'), marker('PCR')], cardiovascular);
  expect(coverage).toEqual({ covered: 1, total: 6, percentage: 17 });
  expect(getSystemStatus(cardiovascular, [marker('LDL', 'high')])).toBe('attention');
  expect(getSystemStatus(system('vitaminas'), [marker('Vitamina D', 'low')])).toBe('low');
});
test('XP levels handle zero, thresholds, maximum and invalid persisted input', () => {
  expect(getXPLevel(0)).toMatchObject({ level: 1, progress: 0, remainingXP: 100 });
  expect(getXPLevel(100)).toMatchObject({ level: 2, currentXP: 0, remainingXP: 150 });
  expect(getXPLevel(540)).toMatchObject({ level: 4, currentXP: 40, remainingXP: 260 });
  expect(getXPLevel(14600)).toMatchObject({ level: 20, progress: 1, isMaxLevel: true, remainingXP: 0 });
  for (const invalid of [-5, NaN, Infinity]) expect(getXPLevel(invalid)).toMatchObject({ totalXP: 0, progress: 0 });
  expect(getScoreLevel(64.8).id).toBe('good_shape');
});
test('score deltas compare the same panel and units only', () => {
  expect(computeHealthScore([marker('A'), marker('B','borderline'), marker('C','high')])).toBe(63);
  expect(comparableScoreDelta([marker('Glucosa')], [marker('PSA Total')])).toBeNull();
  expect(comparableScoreDelta([marker('Glucosa')], [marker('Glucosa','high','mmol/L')])).toBeNull();
  expect(comparableScoreDelta([marker('HbA1c')], [marker('Hemoglobina A1c','high')])).toBe(75);
});
test('local calendar uses Monday weeks and counts weeks rather than daily visits', () => {
  const now = new Date(2026,9,7,20);
  expect(localDayKey(now)).toBe('2026-10-07'); expect(localWeekKey(now)).toBe('2026-10-05');
  expect(nextActiveWeeks('2026-10-06', 3, now)).toBe(3);
  expect(nextActiveWeeks('2026-10-04', 3, now)).toBe(4);
  expect(nextActiveWeeks('2026-09-20', 3, now)).toBe(1);
});

const rows = [marker('Hemoglobina A1c','high'), marker('Vitamina D','low'), marker('PSA Total')];
const seed = { hasCompletedOnboarding: true, language: 'es', userName: 'Prueba', biomarkers: rows, healthScore: 99,
  sessions: [{ id: 'current', label: 'Examen de prueba', date: '2026-10-07T12:00:00Z', healthScore: 99, biomarkers: rows }],
  pendingUnlockedAchievements: [], xp: 540, lastActiveDate: '2026-10-07', activeWeeks: 3,
  weeklyMissionWeek: '2026-10-05', weeklyMissionCount: 1,
};
async function setup(page: import('@playwright/test').Page, extra = {}) {
  await page.clock.install({ time: new Date('2026-10-07T17:00:00Z') });
  await page.addInitScript(s => { if (!localStorage.getItem('clyra-storage')) localStorage.setItem('clyra-storage', JSON.stringify({version: 0, state: s})); }, {...seed,...extra});
}
async function state(page: import('@playwright/test').Page) { return page.evaluate(() => JSON.parse(localStorage.getItem('clyra-storage')!).state); }
for (const width of [320, 1280]) test(`body indicators and XP fit ${width}px with accessible selection and real statuses`, async ({ page }) => {
  await page.setViewportSize({width,height:900}); await setup(page); await page.goto('/');
  await expect(page.getByTestId('body-system-hematologico')).toHaveAccessibleName(/Sin datos/);
  await expect(page.getByTestId('body-system-metabolico')).toHaveAccessibleName(/Alto, 1/);
  await expect(page.getByTestId('body-system-vitaminas')).toHaveAccessibleName(/Bajo, 1/);
  await page.getByTestId('body-system-metabolico').click();
  await expect(page.getByTestId('body-system-metabolico')).toHaveAttribute('aria-pressed','true');
  await expect(page.getByText('Panel de Metabólico', {exact:true})).toBeVisible();
  await expect(page.getByText('Azúcar promedio 3 meses', {exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Ver todos los sistemas'}).click();
  await expect(page.getByTestId('body-system-metabolico')).toHaveAttribute('aria-pressed','false');
  await page.getByTestId('body-dot-renal').click();
  await expect(page.getByTestId('body-system-renal')).toHaveAttribute('aria-pressed','true');
  await page.goto('/activity');
  await expect(page.getByTestId('activity-points')).toContainText('260 XP para el nivel 5');
  const bar = page.getByRole('progressbar',{name:'Avance de nivel'});
  await expect(bar).toHaveAttribute('aria-valuenow','13');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('daily missions award once, persist, and do not change result score or add a week', async ({page}) => {
  await setup(page); await page.goto('/activity');
  const water = page.getByRole('button',{name:/Bebe 2L de agua hoy/});
  await water.click(); await expect(water).toBeDisabled();
  await expect.poll(async () => (await state(page)).xp).toBe(560);
  expect((await state(page)).healthScore).toBe(99); // XP does not rewrite laboratory data
  expect((await state(page)).activeWeeks).toBe(3);
  await page.reload(); await expect(water).toBeDisabled();
  expect((await state(page)).xp).toBe(560);
});
test('maximum level has no zero denominator and old weekly progress resets', async ({page}) => {
  await setup(page,{xp: 16000, weeklyMissionWeek:'2026-09-28', weeklyMissionCount:3, lastActiveDate:'2026-10-04'});
  await page.goto('/activity');
  await expect(page.getByTestId('activity-points')).toContainText('Nivel máximo alcanzado');
  await expect(page.getByRole('progressbar',{name:'Avance de nivel'})).toHaveAttribute('aria-valuenow','100');
  expect((await state(page)).weeklyMissionCount).toBe(0);
  expect((await state(page)).activeWeeks).toBe(4);
});

test('numeric trends exclude bounds and unit changes and interpret direction correctly', () => {
  expect(Number.isNaN(exactResultNumber('< 5'))).toBe(true);
  expect(exactResultNumber('-1,5')).toBe(-1.5);
  const series = (values: string[], statuses: Biomarker['status'][]) => values.map((value,i) => ({...marker('Glucosa',statuses[i]),value}));
  expect(resultDirection(series(['90','110','130'],['normal','high','high']))).toBe('improving_from_high');
  expect(resultDirection(series(['90','60','50'],['normal','low','low']))).toBe('improving_from_low');
  expect(resultDirection(series(['110','100','90'],['high','normal','normal']))).toBe('rising');
  expect(resultDirection(series(['90','< 100','130'],['normal','normal','high']))).toBeNull();
  const mixed = series(['90','110','130'],['normal','high','high']); mixed[1].unit='mmol/L';
  expect(resultDirection(mixed)).toBeNull();
});

test('Panama evening does not reset daily points at UTC midnight', async ({page}) => {
  await setup(page,{completedMissions:['daily_water_2026-10-07']});
  await page.clock.setSystemTime(new Date('2026-10-08T02:00:00Z'));
  await page.goto('/activity');
  await expect(page.getByRole('button',{name:/Bebe 2L de agua hoy/})).toBeDisabled();
  expect((await state(page)).lastActiveDate).toBe('2026-10-07');
});
test('marker detail shows recorded categories and reference without a fabricated numeric position', async ({page}) => {
  await setup(page, { biomarkers: [{ ...marker('Glucosa','low'), value: '< 60', referenceRange: '70 - 100' }], sessions: [] });
  await page.goto('/biomarker/Glucosa');
  await expect(page.getByText('Estado registrado en tu resultado', {exact:true})).toBeVisible();
  await expect(page.getByText('Referencia del laboratorio: 70 - 100', {exact:true})).toBeVisible();
  await expect(page.getByText('< 60', {exact:true}).first()).toBeVisible();
  await expect(page.locator('body')).not.toContainText('NaN');
});
