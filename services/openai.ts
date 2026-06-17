// ─── Supabase Edge Function Proxy ────────────────────────────────────────────
// All OpenAI calls go through the proxy — API key stays server-side.
import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { computeStatusFromRange } from '../constants/valueParsing';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const PROXY_URL = `${SUPABASE_URL}/functions/v1/openai-proxy`;

/** Get auth token for Edge Functions.
 *  Uses user's JWT if logged in, otherwise falls back to the Supabase anon key
 *  (which is a valid JWT that passes verify_jwt on edge functions). */
async function getAuthToken(): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      return data.session.access_token;
    }
  } catch {}
  // Guest user — anon key is a valid JWT that Supabase edge functions accept
  return process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
}

export type Biomarker = {
  name: string;
  value: string | number;
  unit: string;
  status: 'normal' | 'low' | 'high' | 'borderline';
  referenceRange?: string;
};

export type LabResult = {
  biomarkers: Biomarker[];
  testDate: string | null;  // ISO date string from the PDF (e.g. "2026-03-26"), or null
};

// ─── Biomarker Catalog ───────────────────────────────────────────────────────
// Each entry: canonical name + aliases the PDF/lab might use.
// The AI receives this as a rigid form — it can ONLY use these exact names.
interface BiomarkerDef {
  name: string;          // Canonical name (used in the app)
  aliases: string[];     // What the PDF might call it (for AI matching)
}

const BIOMARKER_CATALOG: BiomarkerDef[] = [
  // ── Cardiovascular / Lípidos ──
  { name: 'Colesterol Total',    aliases: ['colesterol', 'cholesterol', 'total cholesterol', 'colesterol suero'] },
  { name: 'Colesterol HDL',      aliases: ['hdl', 'hdl-colesterol', 'hdl cholesterol', 'lipoproteina alta densidad'] },
  { name: 'Colesterol LDL',      aliases: ['ldl', 'ldl-colesterol', 'ldl cholesterol', 'lipoproteina baja densidad'] },
  { name: 'Triglicéridos',       aliases: ['trigliceridos', 'triglycerides', 'trigliceridos suero'] },
  { name: 'PCR',                 aliases: ['proteina c reactiva', 'pcr ultrasensible', 'hs-crp', 'crp'] },
  { name: 'Homocisteína',        aliases: ['homocisteina', 'homocysteine'] },
  // ── Metabólico ──
  { name: 'Glucosa',             aliases: ['glucosa en ayunas', 'glucose', 'fasting glucose', 'glicemia', 'glucemia'] },
  { name: 'Hemoglobina A1c',     aliases: ['hba1c', 'a1c', 'hemoglobina glicosilada', 'glycated hemoglobin'] },
  { name: 'Insulina',            aliases: ['insulin', 'insulina basal'] },
  // ── Renal ──
  { name: 'Creatinina',          aliases: ['creatinine', 'creatinina serica'] },
  { name: 'Ácido Úrico',         aliases: ['acido urico', 'uric acid'] },
  { name: 'Urea',                aliases: ['urea serica'] },
  { name: 'BUN',                 aliases: ['nitrogeno ureico', 'blood urea nitrogen'] },
  { name: 'Sodio',               aliases: ['sodium', 'na'] },
  { name: 'Potasio',             aliases: ['potassium', 'k'] },
  { name: 'PSA Total',           aliases: ['psa', 'antigeno prostatico', 'prostate specific antigen'] },
  // ── Hepático ──
  { name: 'AST',                 aliases: ['got', 'aspartato aminotransferasa', 'tgo', 'sgot'] },
  { name: 'ALT',                 aliases: ['gpt', 'alanina aminotransferasa', 'tgp', 'sgpt'] },
  { name: 'GGT',                 aliases: ['gamma gt', 'gamma glutamil', 'gamma-glutamyl'] },
  { name: 'Bilirrubina Total',   aliases: ['bilirubin total', 'bilirrubina'] },
  { name: 'Bilirrubina Directa', aliases: ['bilirubin direct', 'bilirrubina conjugada'] },
  { name: 'Albúmina',            aliases: ['albumin', 'albumina'] },
  { name: 'Fosfatasa Alcalina',  aliases: ['alkaline phosphatase', 'alp', 'fa'] },
  { name: 'Proteínas Totales',   aliases: ['total protein', 'proteinas totales'] },
  { name: 'Globulina',           aliases: ['globulin'] },
  { name: 'Relación A/G',        aliases: ['a/g ratio', 'albumin/globulin'] },
  // ── Tiroideo ──
  { name: 'TSH',                 aliases: ['tirotropina', 'thyroid stimulating hormone'] },
  { name: 'T3 Libre',            aliases: ['free t3', 'ft3', 'triiodotironina libre'] },
  { name: 'T4 Libre',            aliases: ['free t4', 'ft4', 'tiroxina libre'] },
  { name: 'T3',                  aliases: ['triiodotironina', 'triiodothyronine'] },
  { name: 'T4',                  aliases: ['tiroxina', 'thyroxine'] },
  // ── Hematológico ──
  { name: 'Hemoglobina',         aliases: ['hemoglobin', 'hb', 'hgb'] },
  { name: 'Hematocrito',         aliases: ['hematocrit', 'hct'] },
  { name: 'Leucocitos',          aliases: ['g. blancos', 'globulos blancos', 'white blood cells', 'wbc'] },
  { name: 'Plaquetas',           aliases: ['platelets', 'plt', 'trombocitos'] },
  { name: 'Neutrófilos',         aliases: ['neutrofilos', 'neutrophils', 'neut'] },
  { name: 'Linfocitos',          aliases: ['lymphocytes', 'lymph'] },
  { name: 'Monocitos',           aliases: ['monocytes', 'mono'] },
  { name: 'Eosinófilos',         aliases: ['eosinofilos', 'eosinophils', 'eos'] },
  { name: 'Basófilos',           aliases: ['basofilos', 'basophils', 'baso'] },
  { name: 'Eritrocitos',         aliases: ['g. rojos', 'globulos rojos', 'red blood cells', 'rbc'] },
  { name: 'VCM',                 aliases: ['mcv', 'volumen corpuscular medio', 'mean corpuscular volume'] },
  { name: 'HCM',                 aliases: ['mch', 'hemoglobina corpuscular media', 'mean corpuscular hemoglobin'] },
  { name: 'CCMH',                aliases: ['mchc', 'concentracion de hemoglobina corpuscular media', 'chcm'] },
  { name: 'IDE',                 aliases: ['rdw', 'indice de distribucion eritrocitaria', 'red cell distribution width'] },
  // ── Inflamación ──
  { name: 'VSG',                 aliases: ['velocidad de sedimentacion', 'sed rate', 'esr'] },
  // ── Hormonas ──
  { name: 'Cortisol',            aliases: ['cortisol serico', 'serum cortisol'] },
  { name: 'DHEA',                aliases: ['dhea-s', 'dhea sulfato', 'dehydroepiandrosterone'] },
  { name: 'Testosterona',        aliases: ['testosterone', 'testosterona total'] },
  { name: 'Estradiol',           aliases: ['e2', 'estradiol serico'] },
  { name: 'Progesterona',        aliases: ['progesterone'] },
  { name: 'FSH',                 aliases: ['follicle stimulating hormone', 'foliculo estimulante'] },
  { name: 'LH',                  aliases: ['luteinizing hormone', 'hormona luteinizante'] },
  { name: 'Prolactina',          aliases: ['prolactin'] },
  // ── Vitaminas / Minerales ──
  { name: 'Vitamina D',          aliases: ['25-oh vitamina d', 'vitamin d', '25-hydroxyvitamin d', 'calcidiol'] },
  { name: 'Vitamina B12',        aliases: ['vitamin b12', 'cobalamina', 'cianocobalamina'] },
  { name: 'Ácido Fólico',        aliases: ['folato', 'folic acid', 'folate'] },
  { name: 'Ferritina',           aliases: ['ferritin'] },
  { name: 'Hierro Sérico',       aliases: ['hierro', 'iron', 'serum iron'] },
  { name: 'Transferrina',        aliases: ['transferrin'] },
  { name: 'Calcio',              aliases: ['calcium', 'ca'] },
  { name: 'Magnesio',            aliases: ['magnesium', 'mg'] },
  { name: 'Zinc',                aliases: ['zn'] },
  // ── Orina ──
  { name: 'Glucosa (Orina)',     aliases: ['glucose urine'] },
  { name: 'Albúmina (Orina)',    aliases: ['albumin urine', 'microalbuminuria'] },
  { name: 'Nitritos',            aliases: ['nitrites'] },
  { name: 'Cetonas',             aliases: ['acetona', 'ketones'] },
  { name: 'Sangre Oculta',       aliases: ['occult blood', 'sangre oculta en heces'] },
  { name: 'Bilirrubina (Orina)', aliases: ['bilis orina'] },
  { name: 'Urobilinógeno',       aliases: ['urobilinogen', 'urobilinogeno'] },
];

// Build the flat list of canonical names (used in prompts)
const defaultBiomarkersList = BIOMARKER_CATALOG.map(b => b.name);

// Build the prompt template: tells AI exactly which names to use and what aliases to look for
function buildBiomarkerPromptTable(): string {
  return BIOMARKER_CATALOG.map(b =>
    `"${b.name}" (in the PDF might appear as: ${b.aliases.join(', ')})`
  ).join('\n');
}

// ─── Name Normalization ──────────────────────────────────────────────────────

/** Strips accents and lowercases for comparison. */
function normKey(s: string): string {
  return s.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[()]/g, '')  // strip parens
    .replace(/\s+/g, ' '); // collapse spaces
}

// Auto-generated from BIOMARKER_CATALOG: maps every alias + canonical name → canonical name.
const NAME_ALIASES: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const b of BIOMARKER_CATALOG) {
    // Map the canonical name itself
    map[normKey(b.name)] = b.name;
    // Map all aliases
    for (const alias of b.aliases) {
      map[normKey(alias)] = b.name;
    }
  }
  // Extra catch-all aliases for common AI inventions
  map['oxigeno en sangre'] = 'Hemoglobina';
  map['coagulacion de sangre'] = 'Plaquetas';
  map['linfocitos memoria inmune'] = 'Linfocitos';
  map['hemoglobina por celula hcm'] = 'HCM';
  map['tamano de globulos rojos vcm'] = 'VCM';
  map['concentracion de hemoglobina'] = 'CCMH';
  return map;
})();

/** Post-process biomarkers: normalize names, deduplicate, validate. */
function normalizeBiomarkers(biomarkers: Biomarker[]): Biomarker[] {
  const result: Biomarker[] = [];
  const seen = new Set<string>();

  for (const b of biomarkers) {
    // Normalize name
    const key = normKey(b.name);
    let canonicalName = NAME_ALIASES[key];

    // Try partial matches if exact match fails
    if (!canonicalName) {
      for (const [alias, canonical] of Object.entries(NAME_ALIASES)) {
        if (key.includes(alias) || alias.includes(key)) {
          canonicalName = canonical;
          break;
        }
      }
    }

    // Use canonical name if found, otherwise title-case the original
    if (canonicalName) {
      b.name = canonicalName;
    } else {
      // Title case: first letter of each word uppercase
      b.name = b.name.trim().replace(/\b\w/g, c => c.toUpperCase());
    }

    // Deduplicate by canonical name
    const dedupeKey = normKey(b.name);
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    // Clean value — ensure it's a string or number
    if (typeof b.value === 'string') {
      b.value = b.value.trim();
    }

    // Status: compute deterministically from the reference range when the value
    // is numeric and the range is parseable. This is far more reliable than the
    // LLM's own classification, which drives the entire app (score, risks, body
    // map colors, priorities). Fall back to the AI status only when we can't
    // decide (qualitative results like "Negativo", or an unparseable range).
    const computedStatus = computeStatusFromRange(b.value, b.referenceRange);
    if (computedStatus) {
      b.status = computedStatus;
    } else if (!['normal', 'low', 'high', 'borderline'].includes(b.status)) {
      b.status = 'normal';
    }

    result.push(b);
  }

  return result;
}

/** Strip HTML tags from error responses to produce a clean user-facing message. */
function cleanErrorText(raw: string): string {
  // If it looks like HTML, extract meaningful text
  if (raw.includes('<html') || raw.includes('<HTML') || raw.includes('<!DOCTYPE')) {
    const titleMatch = raw.match(/<title[^>]*>(.*?)<\/title>/i);
    const h1Match = raw.match(/<h1[^>]*>(.*?)<\/h1>/i);
    return h1Match?.[1] ?? titleMatch?.[1] ?? 'Server error';
  }
  // Try to parse JSON error
  try {
    const parsed = JSON.parse(raw);
    if (parsed.error?.message) return parsed.error.message;
    if (parsed.message) return parsed.message;
  } catch {}
  return raw.slice(0, 200);
}

/** Retry-aware fetch for transient server errors (502, 503, 504). */
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  maxRetries = 2,
): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.ok || (res.status < 500 && res.status !== 429)) return res;
      // Retry on 502/503/504/429
      if (attempt < maxRetries && [502, 503, 504, 429].includes(res.status)) {
        const delay = Math.min(2000 * (attempt + 1), 6000);
        __DEV__ && console.log(`[Clyra] Retrying (${attempt + 1}/${maxRetries}) after ${res.status}...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      return res; // Final attempt — let caller handle
    } catch (e) {
      lastError = e as Error;
      if (attempt < maxRetries) {
        const delay = Math.min(2000 * (attempt + 1), 6000);
        __DEV__ && console.log(`[Clyra] Network error, retrying (${attempt + 1}/${maxRetries})...`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
    }
  }
  throw lastError ?? new Error('Request failed after retries');
}

/** Build headers for proxy requests. Token is passed to authenticate with Supabase. */
async function proxyHeaders(extraHeaders?: Record<string, string>): Promise<Record<string, string>> {
  const token = await getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'OpenAI-Beta': 'assistants=v2',
    ...extraHeaders,
  };
}

/** Extracts the OpenAI API path from a full URL (e.g. https://api.openai.com/v1/chat/completions → /v1/chat/completions) */
function openaiPath(url: string): string {
  return url.replace('https://api.openai.com', '');
}

async function apiPost(url: string, body: object) {
  const headers = await proxyHeaders({ 'x-openai-path': openaiPath(url) });
  const res = await fetchWithRetry(PROXY_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(cleanErrorText(text));
  }
  return res.json();
}

async function apiGet(url: string) {
  const headers = await proxyHeaders({ 'x-openai-path': openaiPath(url) });
  const res = await fetchWithRetry(PROXY_URL, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(cleanErrorText(text));
  }
  return res.json();
}

async function apiDelete(url: string) {
  const headers = await proxyHeaders({ 'x-openai-path': openaiPath(url) });
  await fetch(PROXY_URL, { method: 'DELETE', headers }).catch(() => null);
}

/** Generic proxy fetch for direct OpenAI API calls (chat completions, file content, etc.) */
async function proxyFetch(openaiUrl: string, init?: RequestInit): Promise<Response> {
  const path = openaiPath(openaiUrl);
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'x-openai-path': path,
    ...(init?.headers as Record<string, string> ?? {}),
  };
  // Remove any direct OpenAI auth — proxy handles it
  delete headers['Authorization'];
  headers['Authorization'] = `Bearer ${token}`;

  return fetch(PROXY_URL, {
    ...init,
    headers,
  });
}

async function poll<T>(
  fetchFn: () => Promise<T>,
  isDone: (data: T) => boolean,
  isFailed: (data: T) => boolean,
  intervalMs = 2000,
  maxAttempts = 30,
): Promise<T> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, intervalMs));
    const data = await fetchFn();
    if (isFailed(data)) throw new Error(`Poll failed: ${JSON.stringify(data)}`);
    if (isDone(data)) return data;
  }
  throw new Error('Timeout waiting for operation to complete');
}

// ─── Shared Extraction Prompt ────────────────────────────────────────────────
// The AI receives a rigid "form" — it can ONLY use these predefined biomarker names.

function buildExtractionSystemPrompt(): string {
  const table = buildBiomarkerPromptTable();
  return `You are an expert medical data extractor. Your job is to read a lab report and fill in values for a PREDEFINED list of biomarkers.

RULES:
1. You MUST use ONLY the exact biomarker names from the list below. NEVER invent new names, NEVER use abbreviations, NEVER use ALL CAPS, NEVER create "friendly" display names.
2. Each biomarker in the list has aliases showing how it might appear in the PDF. Match the PDF text to the correct canonical name.
3. Read each row of the lab report carefully. The value, unit, and reference range MUST come from the SAME ROW. NEVER swap values between biomarkers.
4. Only include biomarkers that actually appear in the document. Do NOT guess or hallucinate values.
5. Also extract the test date (look for "Fecha", "Date", "Collection Date", etc.).
6. Copy the "value" EXACTLY as printed, including its decimal separator (e.g. "1,25" stays "1,25"). Do NOT round, reformat, or convert units.
7. Copy the "referenceRange" EXACTLY as printed (e.g. "70 - 100", "< 5.7", "> 40", "Hasta 100"). This is REQUIRED whenever the row shows a range — the app uses it to determine status, so accuracy here is critical.

STATUS RULES (best-effort fallback — the app recomputes status from the reference range):
- "normal" = clearly within the reference range
- "borderline" = within 10% of limits or just slightly outside
- "high" = clearly above the reference range by more than 10%
- "low" = clearly below the reference range by more than 10%

PREDEFINED BIOMARKER LIST (use ONLY these exact names):
${table}

RESPOND ONLY with valid JSON, no extra text:
{"testDate":"YYYY-MM-DD or null","biomarkers":[{"name":"EXACT_NAME_FROM_LIST","value":"Value","unit":"Unit","status":"normal|low|high|borderline","referenceRange":"range"}]}`;
}

/**
 * Fallback extraction using Chat Completions API with file content.
 * Used when the Assistants API + file_search fails (common with short PDFs).
 * Retrieves the file content and sends it directly to gpt-4o.
 */
async function extractWithChatCompletionsFallback(fileId: string): Promise<LabResult> {
  // Download the file content from OpenAI (via proxy)
  const contentRes = await proxyFetch(`https://api.openai.com/v1/files/${fileId}/content`, {});

  let fileContentForPrompt: string;

  if (contentRes.ok) {
    // Try to get text content; for PDFs this returns raw bytes so we use base64
    const contentType = contentRes.headers.get('content-type') ?? '';
    if (contentType.includes('text') || contentType.includes('json')) {
      fileContentForPrompt = await contentRes.text();
    } else {
      // Binary content (PDF) — read as base64 for the vision API
      const blob = await contentRes.blob();
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1] ?? result);
        };
        reader.readAsDataURL(blob);
      });
      const base64 = await base64Promise;

      // Use vision endpoint with the PDF as an image
      __DEV__ && console.log('[Clyra] Fallback: sending PDF as base64 to vision API...');
      const visionRes = await proxyFetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: buildExtractionSystemPrompt(),
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extract every biomarker from this lab report. Read each row carefully — match each value to its correct biomarker name on the same row. Even if there is only 1 result, return it.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:application/pdf;base64,${base64}`,
                    detail: 'high',
                  },
                },
              ],
            },
          ],
          max_tokens: 4096,
          temperature: 0.2,
        }),
      });

      if (!visionRes.ok) {
        throw new Error(`Vision fallback failed: ${visionRes.status}`);
      }

      const visionData = await visionRes.json();
      fileContentForPrompt = visionData.choices?.[0]?.message?.content?.trim() ?? '';

      // Parse the vision response directly
      return parseBiomarkerJSON(fileContentForPrompt);
    }
  } else {
    throw new Error(`Could not retrieve file content: ${contentRes.status}`);
  }

  // If we got text content, send it to Chat Completions
  const res = await proxyFetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: buildExtractionSystemPrompt(),
        },
        {
          role: 'user',
          content: `Here is the lab report text:\n\n${fileContentForPrompt.slice(0, 12000)}\n\nExtract every biomarker. Even if only 1 result exists, return it.`,
        },
      ],
      max_tokens: 4096,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    throw new Error(`Chat completions fallback failed: ${res.status}`);
  }

  const data = await res.json();
  const responseText = data.choices?.[0]?.message?.content?.trim() ?? '';
  return parseBiomarkerJSON(responseText);
}

/**
 * Parses biomarker JSON from a raw text response (handles both object and array formats).
 */
function parseBiomarkerJSON(text: string): LabResult {
  text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

  let biomarkers: Biomarker[] = [];
  let testDate: string | null = null;

  const objMatch = text.match(/\{[\s\S]*\}/);
  const arrMatch = text.match(/\[[\s\S]*\]/);

  if (objMatch) {
    try {
      const parsed = JSON.parse(objMatch[0]);
      if (parsed.biomarkers && Array.isArray(parsed.biomarkers)) {
        biomarkers = parsed.biomarkers;
        testDate = parsed.testDate ?? null;
      } else if (Array.isArray(parsed)) {
        biomarkers = parsed;
      }
    } catch {
      if (arrMatch) {
        try { biomarkers = JSON.parse(arrMatch[0]); } catch { /* ignore */ }
      }
    }
  } else if (arrMatch) {
    try { biomarkers = JSON.parse(arrMatch[0]); } catch { /* ignore */ }
  }

  if (testDate && !/^\d{4}-\d{2}-\d{2}$/.test(testDate)) {
    testDate = null;
  }

  return { biomarkers: normalizeBiomarkers(biomarkers), testDate };
}

/**
 * Extracts biomarkers from a PDF using Chat Completions (gpt-4o) with vision.
 * Reads the PDF as base64 and sends it in a single request — fast, no polling.
 */
export const extractLabResultsFromPDF = async (
  pdfUri: string,
  _pdfName: string = 'lab_results.pdf',
): Promise<LabResult> => {
  // 1. Read PDF as base64 on device
  __DEV__ && console.log('[Clyra] Reading PDF...');
  const base64 = await FileSystem.readAsStringAsync(pdfUri, {
    encoding: 'base64',
  });

  // 2. Send directly to Chat Completions with vision (single request)
  __DEV__ && console.log('[Clyra] Sending PDF to GPT-4o...');
  const res = await proxyFetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: buildExtractionSystemPrompt(),
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract every biomarker from this lab report PDF. Read each row carefully — match each value to its correct biomarker name on the same row. Even if there is only 1 result, return it. Return ONLY valid JSON.',
            },
            {
              type: 'file',
              file: {
                filename: _pdfName,
                file_data: `data:application/pdf;base64,${base64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PDF extraction failed: ${cleanErrorText(text)}`);
  }

  const data = await res.json();
  const responseText = data.choices?.[0]?.message?.content?.trim() ?? '';

  if (!responseText) {
    throw new Error('No response from AI');
  }

  // 3. Parse the response
  const result = parseBiomarkerJSON(responseText);

  if (result.biomarkers.length === 0) {
    throw new Error('No biomarkers found in the document.');
  }

  __DEV__ && console.log(`[Clyra] Extracted ${result.biomarkers.length} biomarkers`);
  return result;
};

/**
 * Extracts biomarkers from a photo/image using OpenAI Chat Completions with vision (gpt-4o).
 * Reads the image as base64 and sends it as an image content part.
 */
export const extractLabResultsFromImage = async (
  imageUri: string,
): Promise<LabResult> => {
  // API key is now server-side in Supabase Edge Function

  // 1. Read image as base64
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: 'base64',
  });

  // Determine mime type from URI
  const ext = imageUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

  __DEV__ && console.log('[Clyra] Sending image to GPT-4o vision...');

  // 2. Call Chat Completions with vision
  const res = await proxyFetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: buildExtractionSystemPrompt(),
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extrae todos los biomarcadores de esta imagen de resultados de laboratorio. Responde SOLO con el JSON, sin texto adicional.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mime};base64,${base64}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vision API failed (${res.status}): ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  let text: string = data.choices?.[0]?.message?.content?.trim() ?? '';

  // Strip markdown fences
  text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

  // Parse response
  let biomarkers: Biomarker[];
  let testDate: string | null = null;

  const objMatch = text.match(/\{[\s\S]*\}/);
  const arrMatch = text.match(/\[[\s\S]*\]/);

  if (objMatch) {
    try {
      const parsed = JSON.parse(objMatch[0]);
      if (parsed.biomarkers && Array.isArray(parsed.biomarkers)) {
        biomarkers = parsed.biomarkers;
        testDate = parsed.testDate ?? null;
      } else if (Array.isArray(parsed)) {
        biomarkers = parsed;
      } else {
        throw new Error('Unexpected JSON structure');
      }
    } catch {
      if (!arrMatch) throw new Error(`Could not parse response JSON: ${text.slice(0, 300)}`);
      biomarkers = JSON.parse(arrMatch[0]);
    }
  } else if (arrMatch) {
    try {
      biomarkers = JSON.parse(arrMatch[0]);
    } catch (e) {
      throw new Error(`JSON parse error: ${(e as Error).message}. Text: ${arrMatch[0].slice(0, 200)}`);
    }
  } else {
    throw new Error(`No JSON found in response. Got: ${text.slice(0, 300)}`);
  }

  if (!Array.isArray(biomarkers) || biomarkers.length === 0) {
    // Retry once after 2 seconds
    __DEV__ && console.log('[Clyra] No biomarkers from image on first attempt, retrying in 2s...');
    await new Promise(r => setTimeout(r, 2000));

    const retryRes = await proxyFetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: buildExtractionSystemPrompt(),
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extrae todos los biomarcadores de esta imagen de resultados de laboratorio. Responde SOLO con el JSON, sin texto adicional.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mime};base64,${base64}`,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 4096,
        temperature: 0.2,
      }),
    });

    if (retryRes.ok) {
      const retryData = await retryRes.json();
      let retryText: string = retryData.choices?.[0]?.message?.content?.trim() ?? '';
      retryText = retryText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const retryObjMatch = retryText.match(/\{[\s\S]*\}/);
      const retryArrMatch = retryText.match(/\[[\s\S]*\]/);
      if (retryObjMatch) {
        try {
          const parsed = JSON.parse(retryObjMatch[0]);
          if (parsed.biomarkers && Array.isArray(parsed.biomarkers)) {
            biomarkers = parsed.biomarkers;
            testDate = parsed.testDate ?? null;
          } else if (Array.isArray(parsed)) {
            biomarkers = parsed;
          }
        } catch { /* ignore */ }
      } else if (retryArrMatch) {
        try { biomarkers = JSON.parse(retryArrMatch[0]); } catch { /* ignore */ }
      }
    }
    __DEV__ && console.log(`[Clyra] Image retry result: ${biomarkers?.length ?? 0} biomarkers`);

    if (!Array.isArray(biomarkers) || biomarkers.length === 0) {
      throw new Error('No biomarkers found in the image.');
    }
  }

  // Validate testDate format
  if (testDate && !/^\d{4}-\d{2}-\d{2}$/.test(testDate)) {
    testDate = null;
  }

  // Normalize names
  biomarkers = normalizeBiomarkers(biomarkers);

  return { biomarkers, testDate };
};

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Conversational AI chat about the user's blood results.
 * Injects the full biomarker panel as system context so the AI knows
 * all values without the user having to re-explain them.
 */
export async function chatWithAI(params: {
  messages: ChatMessage[];
  biomarkers: Biomarker[];
  lang: 'en' | 'es';
  userAge?: string;
  userSex?: 'male' | 'female' | null;
  healthGoals?: string[];
}): Promise<string> {
  // API key is now server-side in Supabase Edge Function

  const { messages, biomarkers, lang, userAge, userSex, healthGoals } = params;

  const ageStr = userAge ? (lang === 'es' ? `${userAge} años` : `${userAge} years old`) : '';
  const sexStr = userSex === 'male'
    ? (lang === 'es' ? 'hombre' : 'male')
    : userSex === 'female'
    ? (lang === 'es' ? 'mujer' : 'female')
    : '';
  const who = [ageStr, sexStr].filter(Boolean).join(', ');

  const goalsStr = healthGoals && healthGoals.length > 0
    ? healthGoals.join(', ')
    : null;

  const panelLines = biomarkers.map(b => {
    const ref = b.referenceRange ? ` (ref: ${b.referenceRange} ${b.unit})` : '';
    return `- ${b.name}: ${b.value} ${b.unit} [${b.status}]${ref}`;
  }).join('\n');

  const systemPrompt = lang === 'es'
    ? `Eres ClyraAI, un asistente de salud amigable, empático y experto. Ayudas al usuario a entender sus análisis de sangre en español cotidiano y sin jerga médica. Siempre recuerdas que NO eres médico y recomiendas consultar un profesional para decisiones médicas.

${who ? `El usuario es: ${who}.` : ''}${goalsStr ? `\nObjetivos de salud del usuario: ${goalsStr}. Personaliza tus respuestas y recomendaciones teniendo esto en cuenta.` : ''}

PANEL DE ANÁLISIS ACTUAL DEL USUARIO:
${panelLines || 'Sin datos de análisis.'}

Responde de forma concisa (máximo 4 oraciones), cálida y práctica. Si el usuario pregunta algo fuera del alcance médico, redirige amablemente.`
    : `You are ClyraAI, a friendly, empathetic, and knowledgeable health assistant. You help users understand their blood test results in plain everyday English — no medical jargon. Always remind users that you are NOT a doctor and recommend consulting a healthcare professional for medical decisions.

${who ? `The user is: ${who}.` : ''}${goalsStr ? `\nUser's health goals: ${goalsStr}. Personalize your responses and recommendations accordingly.` : ''}

USER'S CURRENT BLOOD TEST PANEL:
${panelLines || 'No test data available.'}

Respond concisely (max 4 sentences), warmly, and practically. If asked something outside medical scope, kindly redirect.`;

  const res = await proxyFetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Chat failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

/**
 * Generates a personalized, plain-language AI insight for a single biomarker
 * using OpenAI chat completions (fast, cheap — gpt-4o-mini).
 */
export async function getPersonalizedBiomarkerInsight(params: {
  name: string;
  value: string | number;
  unit: string;
  status: string;
  referenceRange?: string;
  userAge?: string;
  userSex?: 'male' | 'female' | null;
  lang: 'en' | 'es';
}): Promise<string> {
  // API key is now server-side in Supabase Edge Function
  const { name, value, unit, status, referenceRange, userAge, userSex, lang } = params;

  const ageStr = userAge ? (lang === 'es' ? `${userAge} años` : `${userAge}-year-old`) : '';
  const sexStr = userSex === 'male'
    ? (lang === 'es' ? 'hombre' : 'male')
    : userSex === 'female'
    ? (lang === 'es' ? 'mujer' : 'female')
    : '';
  const refStr = referenceRange ? (lang === 'es' ? ` (rango normal: ${referenceRange} ${unit})` : ` (normal range: ${referenceRange} ${unit})`) : '';

  const systemPrompt = lang === 'es'
    ? 'Eres un asistente de salud amigable y empático. Explica resultados de laboratorio en español simple y cotidiano, sin jerga médica. Máximo 3 oraciones. Sé cálido, específico y práctico.'
    : 'You are a friendly, empathetic health assistant. Explain lab results in plain everyday English — no medical jargon. Maximum 3 sentences. Be warm, specific, and practical.';

  const who = [ageStr, sexStr].filter(Boolean).join(' ');
  const userPrompt = lang === 'es'
    ? `El usuario${who ? ` es ${who}` : ''}. Su resultado de ${name}: ${value} ${unit}${refStr}. Estado: ${status}. Explica qué significa esto para ellos y qué pueden hacer.`
    : `The user${who ? ` is a ${who}` : ''}. Their ${name} result: ${value} ${unit}${refStr}. Status: ${status}. Explain what this means for them and what they can do about it.`;

  const res = await proxyFetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 180,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI insight failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}
