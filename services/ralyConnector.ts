import type { DocumentPickerAsset } from 'expo-document-picker';
export type RalyStudy = { id: string; label: string };
const BASE = 'http://127.0.0.1:8098';
let pairing = '', session = '';
let studyCache: RalyStudy[] | null = null;
export function currentRalyStudies() { return session ? studyCache : null; }
let pending: DocumentPickerAsset | null = null;
export function pendingRalyPdf() { return pending; }
export function clearRalyPdf() { pending = null; }
async function request(path: string, method: string, body?: object) {
  const response = await fetch(BASE + path, {
    method, headers:{'Content-Type':'application/json','X-Clyra-Token':pairing,'X-Raly-Session':session},
    body: body ? JSON.stringify(body) : undefined, signal:AbortSignal.timeout(60000), credentials:'omit',
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    if (response.status === 401 || response.status === 502) { session = ''; studyCache = null; }
    throw new Error(result.error || 'connection-failed');
  }
  return response;
}
export async function connectRaly(token: string, username: string, password: string): Promise<RalyStudy[]> {
  pairing = token.trim(); session = ''; studyCache = null;
  const response = await request('/connect','POST',{username:username.trim(),password});
  const result = await response.json(); session = result.session; studyCache = result.studies; return result.studies;
}
export async function listRaly(): Promise<RalyStudy[]> { const result = await (await request('/studies','GET')).json(); studyCache = result.studies; return result.studies; }
export async function disconnectRaly() {
  try { if (session) await request('/session','DELETE'); }
  finally { pairing = ''; session = ''; studyCache = null; pending = null; }
}
export async function selectRalyPdf(study: RalyStudy) {
  const response = await request(`/studies/${encodeURIComponent(study.id)}/pdf`,'POST');
  const blob = await response.blob();
  if (blob.size > 10 * 1024 * 1024) throw new Error('pdf-too-large');
  const file = new File([blob], `Raly-${study.id}.pdf`,{type:'application/pdf'});
  pending = {name:file.name,uri:'',size:file.size,mimeType:file.type,lastModified:file.lastModified,file};
}
