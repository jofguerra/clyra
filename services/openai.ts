const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';

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

const defaultBiomarkersList = [
  // Cardiovascular / Lípidos
  "Colesterol Total", "Colesterol HDL", "Colesterol LDL", "Triglicéridos",
  "PCR", "Proteína C Reactiva", "Homocisteína",
  // Metabólico
  "Glucosa", "Glucosa en Ayunas", "Hemoglobina A1c", "HbA1c", "Insulina",
  // Renal
  "Creatinina", "Ácido Úrico", "Urea", "BUN", "Sodio", "Potasio",
  // Hepático
  "AST", "ALT", "GGT", "Bilirrubina Total", "Albúmina", "Fosfatasa Alcalina",
  // Tiroideo
  "TSH", "T3 Libre", "T4 Libre", "T3", "T4",
  // Hematológico
  "Hemoglobina", "Hematocrito", "Leucocitos", "Plaquetas",
  "Neutrófilos", "Linfocitos", "Monocitos", "Eritrocitos", "VCM", "HCM",
  // Hormonas / Endocrino
  "Cortisol", "DHEA", "Testosterona", "Estradiol", "Progesterona",
  "FSH", "LH", "Prolactina",
  // Vitaminas / Minerales
  "Vitamina D", "Vitamina B12", "Ácido Fólico", "Folato",
  "Ferritina", "Hierro Sérico", "Transferrina",
  "Calcio", "Magnesio", "Zinc"
];

const authHeaders = {
  'Authorization': `Bearer ${OPENAI_API_KEY}`,
  'Content-Type': 'application/json',
  'OpenAI-Beta': 'assistants=v2',
};

async function apiPost(url: string, body: object) {
  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${url} → ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function apiGet(url: string) {
  const res = await fetch(url, { headers: authHeaders });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${url} → ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function apiDelete(url: string) {
  await fetch(url, { method: 'DELETE', headers: authHeaders }).catch(() => null);
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

/**
 * Extracts biomarkers from a PDF using OpenAI Assistants API.
 * Uses fetch + FormData for reliable file upload on React Native.
 */
export const extractLabResultsFromPDF = async (
  pdfUri: string,
  pdfName: string = 'lab_results.pdf',
): Promise<LabResult> => {
  if (!OPENAI_API_KEY) {
    throw new Error('Falta la clave de API de OpenAI. Configura EXPO_PUBLIC_OPENAI_API_KEY en .env');
  }

  // 1. Upload PDF via FormData (more reliable than FileSystem.uploadAsync)
  console.log('[VitalIQ] Uploading PDF...');
  const formData = new FormData();
  formData.append('file', { uri: pdfUri, name: pdfName, type: 'application/pdf' } as any);
  formData.append('purpose', 'assistants');

  const uploadRes = await fetch('https://api.openai.com/v1/files', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: formData,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    throw new Error(`Upload failed (${uploadRes.status}): ${text.slice(0, 300)}`);
  }

  const uploadData = await uploadRes.json();
  const file_id: string = uploadData.id;
  if (!file_id) throw new Error('No file_id returned from upload');
  if (uploadData.bytes === 0) throw new Error('El archivo subido está vacío (0 bytes).');

  // 2. Wait for file to be processed
  console.log('[VitalIQ] Waiting for file processing...');
  await poll(
    () => apiGet(`https://api.openai.com/v1/files/${file_id}`),
    (d) => d.status === 'processed',
    (d) => d.status === 'error',
    1500, 20,
  ).catch(() => {
    // Some PDFs skip the processing step — continue anyway
    console.log('[VitalIQ] File status poll timed out, continuing...');
  });

  // 3. Create Vector Store
  console.log('[VitalIQ] Creating vector store...');
  const { id: vector_store_id } = await apiPost('https://api.openai.com/v1/vector_stores', {
    name: 'Lab Results Store',
    file_ids: [file_id],
  });

  // 4. Wait for Vector Store
  await poll(
    () => apiGet(`https://api.openai.com/v1/vector_stores/${vector_store_id}`),
    (d) => d.status === 'completed',
    (d) => d.status === 'failed',
    2000, 20,
  );

  // 5. Create temporary Assistant
  console.log('[VitalIQ] Creating assistant...');
  const { id: assistant_id } = await apiPost('https://api.openai.com/v1/assistants', {
    model: 'gpt-4o',
    name: 'Lab Data Extractor',
    instructions: `You are an expert medical assistant. Extract all biomarkers from the attached lab report (look especially for: ${defaultBiomarkersList.join(', ')}).
Also extract the test/collection date from the document (look for "Fecha", "Date", "Collection Date", "Report Date", etc.).
Compare against standard adult reference ranges if not shown in the document.
Classify as "borderline" if a value is at the edge of the normal range.
RESPOND ONLY with a valid JSON object — no extra text, no markdown, no explanations.
Required format:
{"testDate":"YYYY-MM-DD or null if not found","biomarkers":[{"name":"Name","value":"Value","unit":"Unit","status":"normal|low|high|borderline","referenceRange":"range"}]}`,
    tools: [{ type: 'file_search' }],
    tool_resources: { file_search: { vector_store_ids: [vector_store_id] } },
  });

  // 6. Create Thread + Run
  console.log('[VitalIQ] Creating thread...');
  const { id: thread_id } = await apiPost('https://api.openai.com/v1/threads', {
    messages: [{
      role: 'user',
      content: 'Extrae todos los biomarcadores del documento. Responde SOLO con el array JSON, sin texto adicional.',
    }],
  });

  console.log('[VitalIQ] Starting run...');
  const { id: run_id } = await apiPost(`https://api.openai.com/v1/threads/${thread_id}/runs`, {
    assistant_id,
  });

  // 7. Poll run status
  await poll(
    () => apiGet(`https://api.openai.com/v1/threads/${thread_id}/runs/${run_id}`),
    (d) => d.status === 'completed',
    (d) => ['failed', 'cancelled', 'expired', 'requires_action'].includes(d.status),
    2000, 40,
  );

  // 8. Fetch messages
  console.log('[VitalIQ] Fetching results...');
  const messagesData = await apiGet(`https://api.openai.com/v1/threads/${thread_id}/messages`);
  const finalMessage = messagesData.data?.find((m: any) => m.role === 'assistant');
  if (!finalMessage) throw new Error('No response from assistant');

  const textBlock = finalMessage.content?.find((c: any) => c.type === 'text');
  if (!textBlock) throw new Error('Assistant returned no text content');

  let text: string = textBlock.text.value ?? '';
  // Strip file_search citations like 【4:0†source】
  text = text.replace(/【[^】]*】/g, '');
  // Strip markdown fences
  text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

  // Try to extract the new object format { testDate, biomarkers }
  // Fall back to old array format for compatibility
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
      // Fall through to array match
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
    throw new Error('No biomarkers found in the document.');
  }

  // Validate testDate format (YYYY-MM-DD)
  if (testDate && !/^\d{4}-\d{2}-\d{2}$/.test(testDate)) {
    testDate = null;
  }

  // 9. Cleanup
  console.log('[VitalIQ] Cleaning up...');
  await Promise.all([
    apiDelete(`https://api.openai.com/v1/assistants/${assistant_id}`),
    apiDelete(`https://api.openai.com/v1/vector_stores/${vector_store_id}`),
    apiDelete(`https://api.openai.com/v1/files/${file_id}`),
    apiDelete(`https://api.openai.com/v1/threads/${thread_id}`),
  ]);

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
  if (!OPENAI_API_KEY) throw new Error('Missing OpenAI API key');

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
    ? `Eres VitalIA, un asistente de salud amigable, empático y experto. Ayudas al usuario a entender sus análisis de sangre en español cotidiano y sin jerga médica. Siempre recuerdas que NO eres médico y recomiendas consultar un profesional para decisiones médicas.

${who ? `El usuario es: ${who}.` : ''}${goalsStr ? `\nObjetivos de salud del usuario: ${goalsStr}. Personaliza tus respuestas y recomendaciones teniendo esto en cuenta.` : ''}

PANEL DE ANÁLISIS ACTUAL DEL USUARIO:
${panelLines || 'Sin datos de análisis.'}

Responde de forma concisa (máximo 4 oraciones), cálida y práctica. Si el usuario pregunta algo fuera del alcance médico, redirige amablemente.`
    : `You are VitalIA, a friendly, empathetic, and knowledgeable health assistant. You help users understand their blood test results in plain everyday English — no medical jargon. Always remind users that you are NOT a doctor and recommend consulting a healthcare professional for medical decisions.

${who ? `The user is: ${who}.` : ''}${goalsStr ? `\nUser's health goals: ${goalsStr}. Personalize your responses and recommendations accordingly.` : ''}

USER'S CURRENT BLOOD TEST PANEL:
${panelLines || 'No test data available.'}

Respond concisely (max 4 sentences), warmly, and practically. If asked something outside medical scope, kindly redirect.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
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
  if (!OPENAI_API_KEY) {
    throw new Error('Missing OpenAI API key');
  }

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

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
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
