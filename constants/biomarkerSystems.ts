import { Biomarker } from '../services/openai';

export type SystemStatus = 'normal' | 'borderline' | 'attention' | 'none';

interface BilingualText { en: string; es: string; }

export interface BodySystem {
  id: string;
  emoji: string;
  label: string;            // kept for backwards compat (not shown in new BodyMap)
  name: BilingualText;
  shortName: BilingualText; // fits in narrow side column
  biomarkerNames: string[];
  cx: number;
  cy: number;
  requiredTests: { name: BilingualText; description: BilingualText }[];
}

export const BODY_SYSTEMS: BodySystem[] = [
  {
    id: 'cardiovascular',
    emoji: '❤️',
    label: 'CV',
    name: { en: 'Heart Health', es: 'Cardiovascular' },
    shortName: { en: 'Heart', es: 'Corazón' },
    biomarkerNames: [
      'Colesterol Total', 'Colesterol HDL', 'Colesterol LDL', 'Triglicéridos',
      'PCR', 'Proteína C Reactiva', 'Homocisteína',
    ],
    cx: 97, cy: 156,
    requiredTests: [
      {
        name: { en: 'Lipid Panel', es: 'Perfil Lipídico' },
        description: { en: 'Total Cholesterol, HDL, LDL and Triglycerides', es: 'Colesterol Total, HDL, LDL y Triglicéridos' },
      },
      {
        name: { en: 'hs-CRP (High-sensitivity C-Reactive Protein)', es: 'PCR Ultrasensible' },
        description: { en: 'Low-grade vascular inflammation marker', es: 'Inflamación vascular de bajo grado' },
      },
      {
        name: { en: 'Homocysteine', es: 'Homocisteína' },
        description: { en: 'Independent cardiovascular risk factor', es: 'Riesgo cardiovascular independiente' },
      },
    ],
  },
  {
    id: 'hepatico',
    emoji: '🟤',
    label: 'HEP',
    name: { en: 'Liver', es: 'Hígado' },
    shortName: { en: 'Liver', es: 'Hígado' },
    biomarkerNames: [
      'AST', 'ALT', 'GGT', 'Bilirrubina Total', 'Bilirrubina',
      'Albúmina', 'Fosfatasa Alcalina', 'Proteínas Totales',
    ],
    cx: 136, cy: 202,
    requiredTests: [
      {
        name: { en: 'Liver Panel', es: 'Panel Hepático' },
        description: { en: 'AST, ALT, GGT, Total Bilirubin and Albumin', es: 'AST, ALT, GGT, Bilirrubina Total y Albúmina' },
      },
      {
        name: { en: 'Alkaline Phosphatase (ALP)', es: 'Fosfatasa Alcalina' },
        description: { en: 'Bile ducts and bone function', es: 'Función de vías biliares y hueso' },
      },
      {
        name: { en: 'Total Proteins', es: 'Proteínas Totales' },
        description: { en: 'Liver protein synthesis capacity', es: 'Capacidad de síntesis hepática' },
      },
    ],
  },
  {
    id: 'metabolico',
    emoji: '⚡',
    label: 'MET',
    name: { en: 'Metabolic', es: 'Metabólico' },
    shortName: { en: 'Metabolic', es: 'Metabólico' },
    biomarkerNames: [
      'Glucosa', 'Glucosa en Ayunas', 'Hemoglobina A1c', 'HbA1c', 'Insulina', 'Péptido C',
    ],
    cx: 100, cy: 210,
    requiredTests: [
      {
        name: { en: 'Fasting Glucose', es: 'Glucosa en Ayunas' },
        description: { en: 'Blood sugar after 8 hours fasting', es: 'Azúcar en sangre tras 8h de ayuno' },
      },
      {
        name: { en: 'HbA1c (Glycated Hemoglobin)', es: 'HbA1c' },
        description: { en: '3-month average blood sugar level', es: 'Promedio de glucosa de los últimos 3 meses' },
      },
      {
        name: { en: 'Fasting Insulin', es: 'Insulina en Ayunas' },
        description: { en: 'Detects early insulin resistance', es: 'Detecta resistencia a la insulina temprana' },
      },
    ],
  },
  {
    id: 'renal',
    emoji: '🫘',
    label: 'REN',
    name: { en: 'Kidneys', es: 'Riñones' },
    shortName: { en: 'Kidneys', es: 'Riñones' },
    biomarkerNames: [
      'Creatinina', 'Ácido Úrico', 'Urea', 'BUN', 'Nitrógeno Ureico',
      'Microalbúmina', 'Cistatina C', 'TFG', 'Sodio', 'Potasio', 'Cloro',
    ],
    cx: 144, cy: 232,
    requiredTests: [
      {
        name: { en: 'Creatinine & BUN', es: 'Creatinina y BUN' },
        description: { en: 'Kidney filtration function', es: 'Función de filtración renal' },
      },
      {
        name: { en: 'Uric Acid', es: 'Ácido Úrico' },
        description: { en: 'Gout risk and chronic kidney damage', es: 'Riesgo de gota y daño renal crónico' },
      },
      {
        name: { en: 'Electrolytes (Sodium, Potassium, Chloride)', es: 'Electrolitos' },
        description: { en: 'Fluid and mineral balance', es: 'Equilibrio de líquidos y minerales' },
      },
    ],
  },
  {
    id: 'tiroideo',
    emoji: '🦋',
    label: 'TIR',
    name: { en: 'Thyroid', es: 'Tiroides' },
    shortName: { en: 'Thyroid', es: 'Tiroides' },
    biomarkerNames: [
      'TSH', 'T3 Libre', 'T4 Libre', 'T3', 'T4',
      'Anticuerpos TPO', 'Anticuerpos Tiroglobulina',
    ],
    cx: 123, cy: 100,
    requiredTests: [
      {
        name: { en: 'TSH (Thyroid Stimulating Hormone)', es: 'TSH' },
        description: { en: 'First-line thyroid indicator', es: 'Hormona estimulante de tiroides, primer indicador' },
      },
      {
        name: { en: 'Free T3 & Free T4', es: 'T3 y T4 Libres' },
        description: { en: 'Active thyroid hormones in blood', es: 'Hormonas tiroideas activas en sangre' },
      },
      {
        name: { en: 'Anti-TPO Antibodies', es: 'Anticuerpos TPO' },
        description: { en: 'Rules out autoimmune thyroiditis (Hashimoto\'s)', es: 'Descarta tiroiditis autoinmune (Hashimoto)' },
      },
    ],
  },
  {
    id: 'hematologico',
    emoji: '🩸',
    label: 'HEM',
    name: { en: 'Blood & Immune', es: 'Sangre e Inmunidad' },
    shortName: { en: 'Blood', es: 'Sangre' },
    biomarkerNames: [
      'Hemoglobina', 'Hematocrito', 'Leucocitos', 'Glóbulos Blancos', 'Plaquetas',
      'VCM', 'HCM', 'Neutrófilos', 'Linfocitos', 'Monocitos',
      'Eosinófilos', 'Basófilos', 'Eritrocitos', 'Glóbulos Rojos',
    ],
    cx: 62, cy: 172,
    requiredTests: [
      {
        name: { en: 'Complete Blood Count (CBC)', es: 'Hemograma Completo (CBC)' },
        description: { en: 'Red cells, white cells and platelets', es: 'Glóbulos rojos, blancos y plaquetas' },
      },
      {
        name: { en: 'White Blood Cell Differential', es: 'Diferencial de Leucocitos' },
        description: { en: 'Types of immune system cells', es: 'Tipos de células del sistema inmune' },
      },
      {
        name: { en: 'ESR / CRP', es: 'VSG / PCR' },
        description: { en: 'Systemic inflammation markers', es: 'Marcadores de inflamación sistémica' },
      },
    ],
  },
  {
    id: 'vitaminas',
    emoji: '✨',
    label: 'VIT',
    name: { en: 'Vitamins & Minerals', es: 'Vitaminas y Minerales' },
    shortName: { en: 'Vitamins', es: 'Vitaminas' },
    biomarkerNames: [
      'Vitamina D', 'Vitamina B12', 'Vitamina B9', 'Ácido Fólico', 'Folato',
      'Vitamina A', 'Vitamina E',
      'Ferritina', 'Hierro Sérico', 'Hierro', 'Transferrina',
      'Calcio', 'Magnesio', 'Zinc', 'Fósforo',
    ],
    cx: 170, cy: 175,
    requiredTests: [
      {
        name: { en: 'Vitamin D (25-OH)', es: 'Vitamina D (25-OH)' },
        description: { en: 'Deficiency affects bones, immunity and mood', es: 'La deficiencia afecta huesos, inmunidad y ánimo' },
      },
      {
        name: { en: 'Vitamin B12 & Folate', es: 'Vitamina B12 y Folato' },
        description: { en: 'Energy, nervous system and blood cell production', es: 'Energía, sistema nervioso y formación de sangre' },
      },
      {
        name: { en: 'Ferritin & Serum Iron', es: 'Ferritina y Hierro Sérico' },
        description: { en: 'Iron stores and anemia risk', es: 'Reservas de hierro y riesgo de anemia' },
      },
      {
        name: { en: 'Calcium, Magnesium & Zinc', es: 'Calcio, Magnesio y Zinc' },
        description: { en: 'Key minerals for muscle and metabolism', es: 'Minerales clave para músculo y metabolismo' },
      },
    ],
  },
  {
    id: 'hormonal',
    emoji: '💊',
    label: 'HOR',
    name: { en: 'Hormones', es: 'Hormonas' },
    shortName: { en: 'Hormones', es: 'Hormonas' },
    biomarkerNames: [
      'Cortisol', 'DHEA', 'DHEAS', 'Testosterona', 'Estradiol',
      'Progesterona', 'FSH', 'LH', 'Prolactina',
      'IGF-1', 'Hormona de Crecimiento', 'PTH',
    ],
    cx: 86, cy: 213,
    requiredTests: [
      {
        name: { en: 'Morning Cortisol', es: 'Cortisol Matutino' },
        description: { en: 'Chronic stress and adrenal function', es: 'Estrés crónico y función adrenal' },
      },
      {
        name: { en: 'Total & Free Testosterone', es: 'Testosterona Total y Libre' },
        description: { en: 'Energy, muscle mass and libido', es: 'Energía, masa muscular y libido' },
      },
      {
        name: { en: 'FSH, LH & Estradiol', es: 'FSH, LH y Estradiol' },
        description: { en: 'Reproductive axis and hormonal health', es: 'Eje reproductivo y salud hormonal' },
      },
      {
        name: { en: 'DHEA-S', es: 'DHEA-S' },
        description: { en: 'Adrenal aging marker', es: 'Marcador de envejecimiento adrenal' },
      },
    ],
  },
];

function nameMatch(biomarkerName: string, systemNames: string[]): boolean {
  const b = biomarkerName.toLowerCase();
  return systemNames.some(n => {
    const s = n.toLowerCase();
    return b === s || b.includes(s) || s.includes(b);
  });
}

export function getSystemStatus(system: BodySystem, biomarkers: Biomarker[]): SystemStatus {
  const matches = biomarkers.filter(b => nameMatch(b.name, system.biomarkerNames));
  if (matches.length === 0) return 'none';
  if (matches.some(b => b.status === 'high' || b.status === 'low')) return 'attention';
  if (matches.some(b => b.status === 'borderline')) return 'borderline';
  return 'normal';
}

export function getSystemBiomarkers(system: BodySystem, biomarkers: Biomarker[]): Biomarker[] {
  return biomarkers.filter(b => nameMatch(b.name, system.biomarkerNames));
}

export function computeHealthScore(biomarkers: Biomarker[]): number {
  if (biomarkers.length === 0) return 0;
  const scores = biomarkers.map(b => {
    switch (b.status) {
      case 'normal':     return 100;
      case 'borderline': return 65;
      case 'low':
      case 'high':       return 25;
      default:           return 50;
    }
  });
  return Math.round(scores.reduce((a, v) => a + v, 0) / scores.length);
}
