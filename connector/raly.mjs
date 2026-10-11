import { chromium } from '@playwright/test';
import { randomUUID } from 'node:crypto';
const ORIGIN = 'https://laboratorioraly.com';
const LIST = `${ORIGIN}/labeemapp/pacientesresultados?fnt=resultados`;
export function reportUrl(value) {
  const url = new URL(value, LIST);
  if (url.origin !== ORIGIN || url.pathname !== '/labeemapp/pacientesresultados' || url.searchParams.get('fnt') !== 'resultadopdf' || url.username || url.password) throw new Error('invalid-report');
  return url.href;
}
export async function createRalyAdapter() {
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined, headless:true });
  const context = await browser.newContext({ acceptDownloads:false });
  // No third-party scripts, telemetry, or redirects to another host.
  await context.route('**/*', route => new URL(route.request().url()).origin === ORIGIN ? route.continue() : route.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const reports = new Map();
  let closed = false;
  return {
    async connect(username, password) {
      await page.goto(`${ORIGIN}/labeemapp/pacientesresultados`, { waitUntil:'domcontentloaded' });
      const form = page.locator('form').filter({ has: page.locator('input[name="clave"]') });
      const action = await form.getAttribute('action');
      if (new URL(action, page.url()).href !== `${ORIGIN}/labeemapp/hacerloginpac`) throw new Error('portal-changed');
      await form.locator('input[name="nombre"]').fill(username);
      await form.locator('input[name="clave"]').fill(password);
      await Promise.all([page.waitForNavigation({ waitUntil:'domcontentloaded' }), form.locator('button[type="submit"], input[type="submit"]').first().click()]);
      if (await page.locator('input[name="clave"]').count()) throw new Error('login-failed');
      return this.list();
    },
    async list() {
      await page.goto(LIST, { waitUntil:'domcontentloaded' });
      if (await page.locator('input[name="clave"]').count()) throw new Error('session-expired');
      // Fail closed if the expected authenticated portal is not present.
      if (!await page.getByText('Salir', { exact:true }).count()) throw new Error('portal-changed');
      const entries = await page.locator('a[href*="fnt=resultadopdf"]').evaluateAll(links => links.map(a => ({ href:a.getAttribute('href'), label:a.closest('tr')?.innerText || a.textContent || 'PDF' })));
      reports.clear();
      return entries.map(entry => {
        const url = reportUrl(entry.href);
        const id = randomUUID();
        reports.set(id, url);
        return { id, label:entry.label.replace(/\s+/g,' ').trim().slice(0,400) };
      });
    },
    async download(id) {
      const url = reports.get(id);
      if (!url) throw new Error('unknown-study');
      // Do not follow redirects with signed download URLs.
      const response = await context.request.get(reportUrl(url), { maxRedirects:0, timeout:20000 });
      try {
        if (response.status() !== 200 || !response.headers()['content-type']?.includes('application/pdf')) throw new Error('session-expired');
        if (Number(response.headers()['content-length']) > 10 * 1024 * 1024) throw new Error('pdf-too-large');
        const bytes = await response.body();
        if (bytes.length > 10 * 1024 * 1024) throw new Error('pdf-too-large');
        if (!bytes.subarray(0,1024).includes(Buffer.from('%PDF-'))) throw new Error('invalid-pdf');
        return bytes;
      } finally { await response.dispose(); }
    },
    async close() { if (!closed) { closed = true; reports.clear(); await browser.close(); } },
  };
}
