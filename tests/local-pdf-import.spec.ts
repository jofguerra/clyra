import { test, expect, type Page } from '@playwright/test';
import { syntheticPdf } from './pdf-fixture';
test.use({ timezoneId:'America/Panama' });
async function openImport(page:Page, seed:object = {}) {
  await page.addInitScript(state => { if (!localStorage.getItem('clyra-storage')) localStorage.setItem('clyra-storage',JSON.stringify({version:0,state:{hasCompletedOnboarding:true,language:'en',...state}})); },seed);
  await page.goto('/import-pdf');
}
async function upload(page:Page, buffer:Buffer, name='synthetic-raly.pdf') {
  const chosen=page.waitForEvent('filechooser');
  await page.getByRole('button',{name:'Select PDF',exact:true}).click();
  await (await chosen).setFiles({name,mimeType:'application/pdf',buffer});
}
async function stored(page:Page) { return page.evaluate(()=>JSON.parse(localStorage.getItem('clyra-storage')!).state); }
test('local PDF extraction requires review, saves edited values/date, preserves newer current results and survives reload',async({page})=>{
  const requests:string[]=[], errors:string[]=[];
  page.on('request',r=>{ if (/supabase|openai|unpkg|jsdelivr|laboratorioraly/.test(r.url())) requests.push(r.url()); });
  page.on('pageerror',e=>errors.push(e.message));
  const recent={name:'PSA Total',value:'6.00',unit:'ng/mL',referenceRange:'0-4',status:'high'};
  await page.setViewportSize({ width:390,height:844 });
  await openImport(page,{biomarkers:[recent],sessions:[{id:'newer',label:'Newer exam',date:'2026-10-01T12:00:00Z',biomarkers:[recent],healthScore:100}],xp:0});
  await upload(page,syntheticPdf([['PSA Total','2.50','0.0-4.00','ng/mL'],['Glucosa','105.2','70-100','mg/dL']]));
  await expect(page.getByText('2 results to review',{exact:true})).toBeVisible();
  await page.screenshot({ path:'/tmp/clyra-pdf-review-390.png',fullPage:true });
  await page.setViewportSize({ width:320,height:800 });
  await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({ path:'/tmp/clyra-pdf-review-320.png',fullPage:true });
  await page.setViewportSize({ width:390,height:844 });
  await expect(page.getByLabel('value 1',{exact:true})).toHaveValue('2.50');
  await expect(page.getByLabel('unit 1',{exact:true})).toHaveValue('ng/mL');
  await expect(page.getByLabel('referenceRange 1',{exact:true})).toHaveValue('0.0-4.00');
  await expect(page.getByLabel('Exam date',{exact:true})).toHaveValue('2026-09-18');
  await expect(page.getByRole('button',{name:'Save reviewed exam',exact:true})).toBeDisabled();
  expect((await stored(page)).sessions).toHaveLength(1);
  await page.getByLabel('value 2',{exact:true}).fill('97.20');
  await page.getByRole('button',{name:'Normal',exact:true}).nth(1).click();
  await page.getByLabel('Exam date',{exact:true}).fill('2026-09-17');
  await page.getByRole('switch',{name:'Confirm review',exact:true}).check();
  await page.getByRole('button',{name:'Save reviewed exam',exact:true}).click();
  await expect.poll(async()=> (await stored(page)).sessions.length).toBe(2);
  const state=await stored(page), imported=state.sessions[1];
  expect(state.sessions[0].id).toBe('newer'); expect(imported.date.slice(0,10)).toBe('2026-09-17');
  expect(imported.biomarkers[1]).toMatchObject({name:'Glucosa',value:'97.20',status:'normal'});
  expect(imported.fileHash).toMatch(/^[a-f0-9]{64}$/);
  expect(state.biomarkers.find((b:{name:string})=>b.name==='PSA Total').value).toBe('6.00');
  expect(state.xp).toBe(100); // additional exam award, no historical improvement award
  await page.goto('/'); await expect(page.getByText('Tests',{exact:true})).toBeVisible(); expect((await stored(page)).sessions).toEqual(state.sessions);
  expect(requests).toEqual([]); expect(errors).toEqual([]);
});
test('comparison values remain exact strings and require status; invalid dates fail before saving',async({page})=>{
  await openImport(page);
  await upload(page,syntheticPdf([['PCR','< 0.5','< 5','mg/L'],['Indice','1.20','','']]));
  await expect(page.getByLabel('value 1',{exact:true})).toHaveValue('< 0.5');
  await expect(page.getByLabel('unit 2',{exact:true})).toHaveValue('');
  await page.getByRole('switch',{name:'Confirm review',exact:true}).check();
  await page.getByRole('button',{name:'Save reviewed exam',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('a status for every result');
  await page.getByRole('button',{name:'Normal',exact:true}).first().click();
  await page.getByRole('button',{name:'Normal',exact:true}).nth(1).click();
  await page.getByLabel('Exam date',{exact:true}).fill('2026-02-30');
  await page.getByRole('switch',{name:'Confirm review',exact:true}).check();
  await page.getByRole('button',{name:'Save reviewed exam',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('date');
  await page.getByLabel('value 1',{exact:true}).fill('<>5');
  await page.getByRole('button',{name:'Normal',exact:true}).first().click();
  await page.getByRole('switch',{name:'Confirm review',exact:true}).check();
  await page.getByRole('button',{name:'Save reviewed exam',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('numeric values');
  await page.getByLabel('value 1',{exact:true}).fill('< 0.5');
  await page.getByRole('button',{name:'Normal',exact:true}).first().click();
  await page.getByLabel('Exam date',{exact:true}).fill('2026-09-18');
  await page.getByRole('switch',{name:'Confirm review',exact:true}).check();
  await page.getByRole('button',{name:'Save reviewed exam',exact:true}).click();
  await expect.poll(async()=> (await stored(page)).sessions?.length).toBe(1);
  expect((await stored(page)).sessions[0].biomarkers[0].value).toBe('< 0.5');
});
for (const [name,buffer,message] of [
  ['invalid',Buffer.from('not a PDF'),'could not be read as a PDF'],
  ['scanned',syntheticPdf([],{empty:true}),'no readable text'],
  ['unsupported',syntheticPdf([],{table:false}),'supported Raly result table'],
  ['oversized',Buffer.alloc(10*1024*1024+1),'up to 10 MB'],
] as const) test(`${name} PDF fails visibly without saving`,async({page})=>{
  await openImport(page); await upload(page,buffer);
  await expect(page.getByRole('alert')).toContainText(message);
  expect((await stored(page)).sessions ?? []).toHaveLength(0);
  await expect(page.getByRole('button',{name:'Enter results manually',exact:true})).toBeVisible();
});
