import { test, expect } from '@playwright/test';
import { syntheticPdf } from './pdf-fixture';
const seed = { hasCompletedOnboarding:true, language:'es', userName:'Prueba', pendingUnlockedAchievements:[] };
test.beforeEach(async ({ page }) => {
  await page.addInitScript(state => localStorage.setItem('clyra-storage',JSON.stringify({version:0,state})),seed);
});
test('companion follows navigation, responds to a greeting and pauses without covering controls',async ({page}) => {
  await page.setViewportSize({width:320,height:800});
  await page.goto('/upload');
  await expect(page.getByTestId('mascot-companion')).toBeVisible();
  await page.getByRole('button',{name:'Saludar a la mascota'}).click();
  await expect(page.getByTestId('companion-message')).toContainText('¡Aquí contigo!');
  await page.getByRole('button',{name:'Pausar acompañante'}).click();
  await expect(page.getByTestId('companion-message')).toContainText('Modo tranquilo');
  await page.getByRole('button',{name:'Activar acompañante'}).click();
  await page.getByText('Conectar Raly',{exact:true}).click();
  await expect(page.getByLabel('Usuario Raly')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('Raly selection requires profile confirmation and opens the existing PDF review without saving',async ({page})=>{
  let downloads = 0;
  await page.route('http://127.0.0.1:8098/**',async route => {
    const path = new URL(route.request().url()).pathname;
    const headers = {'Access-Control-Allow-Origin':'http://127.0.0.1:8090','Access-Control-Allow-Headers':'Content-Type, X-Clyra-Token, X-Raly-Session','Access-Control-Allow-Methods':'POST,GET,DELETE,OPTIONS'};
    if(route.request().method()==='OPTIONS') return route.fulfill({status:204,headers});
    if(path==='/connect') return route.fulfill({json:{session:'synthetic',studies:[{id:'abcd-1234',label:'HEMOGLOBINA · informe de prueba'}]},headers});
    if(path==='/session') return route.fulfill({json:{ok:true},headers});
    downloads++;
    return route.fulfill({body:syntheticPdf([['Glucosa','95','70 - 100','mg/dL']]),contentType:'application/pdf',headers});
  });
  await page.goto('/raly');
  await page.getByLabel('Clave del conector',{exact:true}).fill('synthetic');
  await page.getByLabel('Usuario Raly',{exact:true}).fill('synthetic-user');
  await page.getByLabel('Contraseña Raly',{exact:true}).fill('synthetic-password');
  await page.getByRole('button',{name:'Conectar y buscar estudios'}).click();
  await expect(page.getByRole('button',{name:'Descargar y revisar'})).toBeDisabled();
  await page.getByRole('switch',{name:'Los estudios corresponden a este perfil'}).click();
  await page.getByRole('button',{name:'Descargar y revisar'}).click();
  await expect(page.getByText('1 resultados para revisar',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Guardar examen revisado'})).toBeDisabled();
  expect(downloads).toBe(1);
  const stored = await page.evaluate(()=>localStorage.getItem('clyra-storage')!);
  expect(stored).not.toContain('synthetic-password'); expect(stored).not.toContain('synthetic-user');
  expect(JSON.parse(stored).state.sessions || []).toHaveLength(0);
  await page.getByRole('button',{name:'Back',exact:true}).click();
  await page.getByRole('button',{name:'Desconectar Raly'}).click();
  await expect(page.getByLabel('Usuario Raly',{exact:true})).toBeVisible();
});

test('reduced motion keeps the companion still while greetings remain usable',async ({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/upload');
  const mascot = page.getByTestId('mascot-companion').getByTestId('mascot-motion');
  await expect(mascot).toBeVisible();
  await page.getByRole('button',{name:'Saludar a la mascota'}).click();
  await expect(page.getByTestId('companion-message')).toContainText('¡Aquí contigo!');
  const before = await mascot.evaluate(el=>getComputedStyle(el).transform);
  await page.waitForTimeout(650);
  expect(await mascot.evaluate(el=>getComputedStyle(el).transform)).toBe(before);
});
