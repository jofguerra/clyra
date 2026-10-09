// Synthetic reports only. No uploaded patient file is retained in test fixtures.
export function syntheticPdf(rows: string[][], options: { date?: string; table?: boolean; encrypted?: boolean; empty?: boolean } = {}): Buffer {
  const escape = (s:string) => s.replace(/[\\()]/g,'\\$&');
  const line = (text:string,x:number,y:number) => `BT /F1 10 Tf ${x} ${y} Td (${escape(text)}) Tj ET`;
  const operations = options.empty ? [] : [line(`REPORTE: ${options.date ?? '18/09/2026'} 12:30`,60,800)];
  if (!options.empty && options.table !== false) {
    ['Examen','Resultado','Rango Ref.','Unidades'].forEach((s,i)=>operations.push(line(s,[60,283,397,482][i],750)));
    rows.forEach((cells,n)=>cells.forEach((s,i)=>operations.push(line(s,[60,283,397,482][i],730-n*18))));
    operations.push(line('TECNOLOGIA APLICADA:',60,650));
  }
  const content = operations.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Count 1 /Kids [3 0 R] >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];
  let document='%PDF-1.4\n', offsets=[0];
  objects.forEach((obj,i)=>{ offsets.push(Buffer.byteLength(document)); document+=`${i+1} 0 obj\n${obj}\nendobj\n`; });
  const xref=Buffer.byteLength(document);
  document+=`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(n=>n.toString().padStart(10,'0')+' 00000 n ').join('\n')}\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(document);
}
