import { test, expect } from '@playwright/test';
import { parseRalyPages, suggestLocalStatus, isValidLabDate, isSupportedLocalValue, type PdfTextPage } from '../services/localLabParser';
function table(rows: string[][], report = 'REPORTE: 18/09/2026 12:30'): PdfTextPage {
  return [[report], ['Exámen','Resultado','Rango Ref.','Unidades'], ...rows, ['TECNOLOGIA APLICADA:']]
    .flatMap((cells,i) => cells.map((text,j) => ({ text, x:[60,283,397,482][j], y:800-i*16 })));
}
test('Raly column layout retains exact text, unit, range and report date', () => {
  const result = parseRalyPages([table([['PSA Total','2.50','0.0-4.00','ng/mL'],['Glucosa','105,2','70-100','mg/dL'],['TSH','0.20','0.4-4.0','mUI/L']])]);
  expect(result.testDate).toBe('2026-09-18');
  expect(result.dateSource).toBe('report');
  expect(result.biomarkers).toEqual([
    { name:'PSA Total', value:'2.50', referenceRange:'0.0-4.00', unit:'ng/mL', status:'normal' },
    { name:'Glucosa', value:'105,2', referenceRange:'70-100', unit:'mg/dL', status:'high' },
    { name:'TSH', value:'0.20', referenceRange:'0.4-4.0', unit:'mUI/L', status:'low' },
  ]);
});
test('comparison values, unitless rows and ambiguous numbers require review without invented data', () => {
  const draft = parseRalyPages([table([['PCR','< 0.5','< 5','mg/L'],['Índice','1.250','0.5-2.0',''],['Hormona','2,50','H: 1-3 M: 4-5','ng/mL']])]);
  expect(draft.biomarkers.map(b => [b.value,b.unit,b.status])).toEqual([['< 0.5','mg/L',null],['1.250','',null],['2,50','ng/mL',null]]);
  expect(suggestLocalStatus('5','< 5')).toBe('high');
  expect(suggestLocalStatus('5','≤ 5')).toBe('normal');
  expect(suggestLocalStatus('5','> 5')).toBe('low');
  expect(suggestLocalStatus('5','≥ 5')).toBe('normal');
});
test('unsupported and empty tables fail honestly; qualitative and duplicate rows are reported', () => {
  expect(() => parseRalyPages([[{ text:'Glucosa 95 70-100', x:20,y:100 }]])).toThrow('unsupported');
  expect(() => parseRalyPages([table([['Resultado','Negativo','','']])])).toThrow('no-results');
  const draft = parseRalyPages([table([['Glucosa','95','70-100','mg/dL'],['Glucosa','96','70-100','mg/dL'],['Cualitativo','Negativo','','']])]);
  expect(draft.biomarkers).toHaveLength(1);
  expect(draft.skippedRows).toBe(2);
  expect(draft.warnings).toContain('duplicate');
});
test('date is never guessed from personal header dates or invalid/ambiguous dates', () => {
  expect(parseRalyPages([table([['PSA Total','2','0-4','ng/mL']], 'NACIMIENTO: 01/01/1980')]).testDate).toBe('');
  const draft = parseRalyPages([table([['PSA Total','2','0-4','ng/mL']]),table([['Glucosa','90','70-100','mg/dL']], 'REPORTE: 19/09/2026')]);
  expect(draft.testDate).toBe(''); expect(draft.warnings).toContain('ambiguous-date');
  expect(isValidLabDate('2026-02-30')).toBe(false); expect(isValidLabDate('2024-02-29')).toBe(true);
});
test('positions rather than text order determine cells across multiple pages', () => {
  const page = table([['PSA Total','2.00','0-4','ng/mL']]).reverse();
  expect(parseRalyPages([page, table([['Glucosa','90','70-100','mg/dL']])]).biomarkers).toHaveLength(2);
});

test('review numeric syntax rejects malformed strings without changing comparators or locale decimals', () => {
  for (const value of ['1..2','12 34','<>5','NaN','Infinity','-','1,234.56','1e6']) expect(isSupportedLocalValue(value)).toBe(false);
  for (const value of ['< 0.5','<= 0,50','≥ 10','+2.50','-0,5','1.250']) expect(isSupportedLocalValue(value)).toBe(true);
});
