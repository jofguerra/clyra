import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Biomarker } from './openai';
import { BODY_SYSTEMS, getSystemBiomarkers } from '../constants/biomarkerSystems';
import { getBiomarkerKnowledge } from '../constants/biomarkerKnowledge';

export interface HealthReportParams {
  userName: string;
  age: string;
  sex: 'male' | 'female' | null;
  language: 'en' | 'es';
  healthScore: number;
  biomarkers: Biomarker[];
  reportDate?: string; // ISO string; defaults to now
}

function statusColor(status: string): string {
  if (status === 'normal') return '#16a34a';
  if (status === 'borderline') return '#f59e0b';
  return '#ef4444';
}

function statusLabel(status: string, lang: 'en' | 'es'): string {
  const labels: Record<string, Record<string, string>> = {
    normal: { en: 'Normal', es: 'Normal' },
    borderline: { en: 'Borderline', es: 'Límite' },
    high: { en: 'High', es: 'Alto' },
    low: { en: 'Low', es: 'Bajo' },
  };
  return labels[status]?.[lang] ?? status;
}

function scoreRingColor(score: number): string {
  if (score >= 65) return '#16a34a';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function generateHealthReportHTML(params: HealthReportParams): string {
  const {
    userName, age, sex, language: lang, healthScore, biomarkers,
    reportDate,
  } = params;

  const date = reportDate ? new Date(reportDate) : new Date();
  const formattedDate = date.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const sexLabel = sex === 'male'
    ? (lang === 'es' ? 'Hombre' : 'Male')
    : sex === 'female'
    ? (lang === 'es' ? 'Mujer' : 'Female')
    : (lang === 'es' ? 'No especificado' : 'Not specified');

  // Critical / attention markers
  const criticalMarkers = biomarkers.filter(b => b.status === 'high' || b.status === 'low');
  const borderlineMarkers = biomarkers.filter(b => b.status === 'borderline');

  // Group biomarkers by body system
  const systemsWithData = BODY_SYSTEMS
    .map(sys => ({
      system: sys,
      markers: getSystemBiomarkers(sys, biomarkers),
    }))
    .filter(s => s.markers.length > 0);

  // Uncategorized markers
  const categorizedNames = new Set(
    systemsWithData.flatMap(s => s.markers.map(m => m.name))
  );
  const uncategorized = biomarkers.filter(b => !categorizedNames.has(b.name));

  // Build marker rows HTML
  function markerRowsHTML(markers: Biomarker[]): string {
    return markers.map(b => {
      const color = statusColor(b.status);
      const knowledge = getBiomarkerKnowledge(b.name);
      const displayName = knowledge?.simpleName?.[lang] ?? b.name;
      const optRange = knowledge?.optimalRange;
      let optRangeStr = '';
      if (optRange) {
        const range = (sex === 'male' && optRange.male)
          ? optRange.male
          : (sex === 'female' && optRange.female)
          ? optRange.female
          : optRange.general;
        if (range) {
          optRangeStr = `${range.min} - ${range.max} ${b.unit}`;
        }
      }
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">
            <strong>${escapeHtml(displayName)}</strong>
            ${displayName !== b.name ? `<br><span style="font-size:10px;color:#999;">${escapeHtml(b.name)}</span>` : ''}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;font-weight:600;">
            ${escapeHtml(String(b.value))} ${escapeHtml(b.unit)}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">
            <span style="display:inline-block;padding:3px 10px;border-radius:12px;background:${color}15;color:${color};font-weight:700;font-size:11px;">
              ${statusLabel(b.status, lang)}
            </span>
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#666;">
            ${b.referenceRange ? escapeHtml(b.referenceRange) : '—'}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:12px;color:#666;">
            ${optRangeStr ? escapeHtml(optRangeStr) : '—'}
          </td>
        </tr>`;
    }).join('');
  }

  const tableHeader = `
    <tr style="background:#f8f9fa;">
      <th style="padding:10px 12px;text-align:left;font-size:12px;color:#555;border-bottom:2px solid #e0e0e0;">
        ${lang === 'es' ? 'Biomarcador' : 'Biomarker'}
      </th>
      <th style="padding:10px 12px;text-align:center;font-size:12px;color:#555;border-bottom:2px solid #e0e0e0;">
        ${lang === 'es' ? 'Valor' : 'Value'}
      </th>
      <th style="padding:10px 12px;text-align:center;font-size:12px;color:#555;border-bottom:2px solid #e0e0e0;">
        ${lang === 'es' ? 'Estado' : 'Status'}
      </th>
      <th style="padding:10px 12px;text-align:center;font-size:12px;color:#555;border-bottom:2px solid #e0e0e0;">
        ${lang === 'es' ? 'Rango Ref.' : 'Ref. Range'}
      </th>
      <th style="padding:10px 12px;text-align:center;font-size:12px;color:#555;border-bottom:2px solid #e0e0e0;">
        ${lang === 'es' ? 'Rango Óptimo' : 'Optimal Range'}
      </th>
    </tr>`;

  // Critical section HTML
  let criticalSectionHTML = '';
  if (criticalMarkers.length > 0 || borderlineMarkers.length > 0) {
    const title = lang === 'es' ? 'Marcadores que Requieren Atención' : 'Markers Requiring Attention';
    const critItems = criticalMarkers.map(b => {
      const knowledge = getBiomarkerKnowledge(b.name);
      const displayName = knowledge?.simpleName?.[lang] ?? b.name;
      return `<li style="margin-bottom:6px;">
        <span style="color:${statusColor(b.status)};font-weight:700;">${escapeHtml(displayName)}</span>:
        ${escapeHtml(String(b.value))} ${escapeHtml(b.unit)}
        <span style="color:${statusColor(b.status)};">(${statusLabel(b.status, lang)})</span>
      </li>`;
    });
    const borderItems = borderlineMarkers.map(b => {
      const knowledge = getBiomarkerKnowledge(b.name);
      const displayName = knowledge?.simpleName?.[lang] ?? b.name;
      return `<li style="margin-bottom:6px;">
        <span style="color:${statusColor(b.status)};font-weight:700;">${escapeHtml(displayName)}</span>:
        ${escapeHtml(String(b.value))} ${escapeHtml(b.unit)}
        <span style="color:${statusColor(b.status)};">(${statusLabel(b.status, lang)})</span>
      </li>`;
    });

    criticalSectionHTML = `
      <div style="margin:24px 0;padding:16px 20px;background:#fff5f5;border:1px solid #fecaca;border-radius:12px;">
        <h3 style="margin:0 0 12px;font-size:16px;color:#dc2626;">${title}</h3>
        ${critItems.length > 0 ? `
          <p style="margin:0 0 6px;font-weight:700;color:#dc2626;font-size:13px;">
            ${lang === 'es' ? 'Fuera de rango:' : 'Out of range:'}
          </p>
          <ul style="margin:0 0 12px;padding-left:20px;font-size:13px;line-height:1.6;">${critItems.join('')}</ul>
        ` : ''}
        ${borderItems.length > 0 ? `
          <p style="margin:0 0 6px;font-weight:700;color:#f59e0b;font-size:13px;">
            ${lang === 'es' ? 'En zona límite:' : 'Borderline:'}
          </p>
          <ul style="margin:0;padding-left:20px;font-size:13px;line-height:1.6;">${borderItems.join('')}</ul>
        ` : ''}
      </div>`;
  }

  // Systems tables
  const systemsHTML = systemsWithData.map(({ system, markers }) => `
    <div style="margin-top:24px;">
      <h3 style="margin:0 0 8px;font-size:16px;color:#1e293b;">
        ${system.emoji} ${escapeHtml(system.name[lang])}
      </h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        ${tableHeader}
        ${markerRowsHTML(markers)}
      </table>
    </div>
  `).join('');

  const uncategorizedHTML = uncategorized.length > 0 ? `
    <div style="margin-top:24px;">
      <h3 style="margin:0 0 8px;font-size:16px;color:#1e293b;">
        ${lang === 'es' ? 'Otros Marcadores' : 'Other Markers'}
      </h3>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        ${tableHeader}
        ${markerRowsHTML(uncategorized)}
      </table>
    </div>
  ` : '';

  const scoreColor = scoreRingColor(healthScore);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 0;
      background: #fff;
      line-height: 1.5;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div style="max-width:800px;margin:0 auto;padding:32px 24px;">

    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #6366f1;padding-bottom:16px;margin-bottom:24px;">
      <div>
        <h1 style="margin:0;font-size:24px;color:#6366f1;font-weight:800;">Clyra Health Report</h1>
        <p style="margin:4px 0 0;font-size:13px;color:#94a3b8;">
          ${lang === 'es' ? 'Informe de Salud' : 'Health Report'}
        </p>
      </div>
      <div style="text-align:right;font-size:12px;color:#64748b;">
        <div>${formattedDate}</div>
      </div>
    </div>

    <!-- Patient Info -->
    <div style="display:flex;gap:24px;margin-bottom:24px;">
      <div style="flex:1;background:#f8fafc;border-radius:12px;padding:16px;">
        <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:700;">
          ${lang === 'es' ? 'Paciente' : 'Patient'}
        </p>
        <p style="margin:0;font-size:16px;font-weight:700;">${escapeHtml(userName || (lang === 'es' ? 'No especificado' : 'Not specified'))}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#64748b;">
          ${age ? `${escapeHtml(age)} ${lang === 'es' ? 'años' : 'years old'}` : ''}${age && sex ? ' | ' : ''}${sex ? sexLabel : ''}
        </p>
      </div>
      <div style="background:${scoreColor}10;border:2px solid ${scoreColor};border-radius:12px;padding:16px;text-align:center;min-width:140px;">
        <p style="margin:0 0 2px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:700;">
          ${lang === 'es' ? 'Puntaje de Salud' : 'Health Score'}
        </p>
        <p style="margin:0;font-size:36px;font-weight:900;color:${scoreColor};">${healthScore}</p>
        <p style="margin:0;font-size:11px;color:${scoreColor};font-weight:600;">/100</p>
      </div>
    </div>

    <!-- Summary -->
    <div style="display:flex;gap:12px;margin-bottom:8px;">
      <div style="flex:1;background:#f0fdf4;border-radius:10px;padding:12px;text-align:center;">
        <div style="font-size:20px;font-weight:800;color:#16a34a;">${biomarkers.filter(b => b.status === 'normal').length}</div>
        <div style="font-size:11px;color:#16a34a;font-weight:600;">${lang === 'es' ? 'Normal' : 'Normal'}</div>
      </div>
      <div style="flex:1;background:#fffbeb;border-radius:10px;padding:12px;text-align:center;">
        <div style="font-size:20px;font-weight:800;color:#f59e0b;">${borderlineMarkers.length}</div>
        <div style="font-size:11px;color:#f59e0b;font-weight:600;">${lang === 'es' ? 'Límite' : 'Borderline'}</div>
      </div>
      <div style="flex:1;background:#fef2f2;border-radius:10px;padding:12px;text-align:center;">
        <div style="font-size:20px;font-weight:800;color:#ef4444;">${criticalMarkers.length}</div>
        <div style="font-size:11px;color:#ef4444;font-weight:600;">${lang === 'es' ? 'Fuera de rango' : 'Out of range'}</div>
      </div>
    </div>

    <!-- Critical / Attention Section -->
    ${criticalSectionHTML}

    <!-- Biomarkers by System -->
    <h2 style="margin:32px 0 0;font-size:20px;color:#1e293b;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">
      ${lang === 'es' ? 'Resultados por Sistema' : 'Results by Body System'}
    </h2>
    ${systemsHTML}
    ${uncategorizedHTML}

    <!-- Footer Disclaimer -->
    <div style="margin-top:40px;padding:16px 20px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
      <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;line-height:1.6;">
        ${lang === 'es'
          ? 'Este informe fue generado por Clyra con fines informativos. Por favor consulte a su profesional de salud para decisiones m\u00e9dicas.'
          : 'This report was generated by Clyra for informational purposes. Please consult your healthcare provider for medical decisions.'}
      </p>
    </div>

  </div>
</body>
</html>`;
}

export async function shareHealthReport(params: HealthReportParams): Promise<void> {
  const html = generateHealthReportHTML(params);

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: params.language === 'es' ? 'Compartir Informe de Salud' : 'Share Health Report',
    UTI: 'com.adobe.pdf',
  });
}
