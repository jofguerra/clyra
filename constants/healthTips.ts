export interface BilingualText {
  en: string;
  es: string;
}

export interface HealthTip {
  id: string;
  title: BilingualText;
  body: BilingualText;
  category: 'nutrition' | 'exercise' | 'sleep' | 'stress' | 'hydration' | 'testing';
}

export const HEALTH_TIPS: HealthTip[] = [
  {
    id: 'tip_01',
    title: { en: 'Hydrate Before Your Draw', es: 'Hidrátate Antes del Análisis' },
    body: {
      en: 'Fasting before your test? Water is fine — and staying hydrated can make your blood draw easier.',
      es: '¿Ayunando antes de tu análisis? El agua está permitida — y mantenerte hidratado facilita la extracción de sangre.',
    },
    category: 'testing',
  },
  {
    id: 'tip_02',
    title: { en: 'Vitamin D Timing', es: 'Cuándo Medir Vitamina D' },
    body: {
      en: 'Vitamin D levels are best tested in late winter — that\'s when most people are at their lowest.',
      es: 'Los niveles de vitamina D se miden mejor a finales del invierno — es cuando la mayoría tiene niveles más bajos.',
    },
    category: 'testing',
  },
  {
    id: 'tip_03',
    title: { en: 'Post-Meal Walks', es: 'Caminar Después de Comer' },
    body: {
      en: 'Walking 30 minutes after meals can significantly improve your glucose response.',
      es: 'Caminar 30 minutos después de las comidas puede mejorar significativamente tu respuesta de glucosa.',
    },
    category: 'exercise',
  },
  {
    id: 'tip_04',
    title: { en: 'Sleep & Inflammation', es: 'Sueño e Inflamación' },
    body: {
      en: 'Poor sleep raises CRP and other inflammatory markers. Aim for 7-9 hours consistently.',
      es: 'Dormir mal eleva la PCR y otros marcadores inflamatorios. Intenta dormir 7-9 horas de forma consistente.',
    },
    category: 'sleep',
  },
  {
    id: 'tip_05',
    title: { en: 'Fiber & Cholesterol', es: 'Fibra y Colesterol' },
    body: {
      en: 'Soluble fiber (oats, beans, apples) can lower LDL cholesterol by 5-10% in just a few weeks.',
      es: 'La fibra soluble (avena, legumbres, manzanas) puede reducir el colesterol LDL un 5-10% en pocas semanas.',
    },
    category: 'nutrition',
  },
  {
    id: 'tip_06',
    title: { en: 'Stress & Cortisol', es: 'Estrés y Cortisol' },
    body: {
      en: 'Chronic stress keeps cortisol elevated, which can affect blood sugar, weight, and immunity.',
      es: 'El estrés crónico mantiene elevado el cortisol, lo que afecta la glucosa, el peso y la inmunidad.',
    },
    category: 'stress',
  },
  {
    id: 'tip_07',
    title: { en: 'Morning Water Habit', es: 'Hábito de Agua al Despertar' },
    body: {
      en: 'Drinking a glass of water first thing in the morning helps kickstart your metabolism and rehydrate after sleep.',
      es: 'Beber un vaso de agua al despertar ayuda a activar tu metabolismo y rehidratarte después de dormir.',
    },
    category: 'hydration',
  },
  {
    id: 'tip_08',
    title: { en: 'Iron Absorption Trick', es: 'Truco para Absorber Hierro' },
    body: {
      en: 'Pair iron-rich foods with vitamin C (citrus, peppers) to boost absorption by up to 6x.',
      es: 'Combina alimentos ricos en hierro con vitamina C (cítricos, pimientos) para multiplicar la absorción hasta 6 veces.',
    },
    category: 'nutrition',
  },
  {
    id: 'tip_09',
    title: { en: 'Exercise & HDL', es: 'Ejercicio y HDL' },
    body: {
      en: 'Regular aerobic exercise is one of the most effective ways to raise your HDL (good) cholesterol.',
      es: 'El ejercicio aeróbico regular es una de las formas más efectivas de subir tu colesterol HDL (bueno).',
    },
    category: 'exercise',
  },
  {
    id: 'tip_10',
    title: { en: 'Consistency Over Perfection', es: 'Consistencia Sobre Perfección' },
    body: {
      en: 'Testing regularly — even every 6 months — matters more than getting every marker perfect at once.',
      es: 'Hacer análisis regularmente — incluso cada 6 meses — importa más que tener cada marcador perfecto de una vez.',
    },
    category: 'testing',
  },
  {
    id: 'tip_11',
    title: { en: 'Omega-3 Benefits', es: 'Beneficios del Omega-3' },
    body: {
      en: 'Omega-3 fatty acids from fish or supplements can lower triglycerides and reduce inflammation.',
      es: 'Los ácidos grasos omega-3 del pescado o suplementos pueden bajar triglicéridos y reducir la inflamación.',
    },
    category: 'nutrition',
  },
  {
    id: 'tip_12',
    title: { en: 'Deep Sleep Matters', es: 'El Sueño Profundo Importa' },
    body: {
      en: 'Deep sleep is when your body repairs tissue and consolidates memory. Cool, dark rooms help you get more of it.',
      es: 'Durante el sueño profundo tu cuerpo repara tejidos y consolida memoria. Un cuarto fresco y oscuro te ayuda.',
    },
    category: 'sleep',
  },
  {
    id: 'tip_13',
    title: { en: 'Strength Training & Glucose', es: 'Fuerza y Glucosa' },
    body: {
      en: 'Resistance training improves insulin sensitivity and helps your muscles absorb glucose more efficiently.',
      es: 'El entrenamiento de fuerza mejora la sensibilidad a la insulina y ayuda a tus músculos a absorber glucosa.',
    },
    category: 'exercise',
  },
  {
    id: 'tip_14',
    title: { en: 'Caffeine & Cortisol', es: 'Cafeína y Cortisol' },
    body: {
      en: 'Avoid coffee before a cortisol test — caffeine can temporarily spike your levels and skew results.',
      es: 'Evita el café antes de un análisis de cortisol — la cafeína puede elevar tus niveles temporalmente.',
    },
    category: 'testing',
  },
  {
    id: 'tip_15',
    title: { en: 'Meditation & Blood Pressure', es: 'Meditación y Presión Arterial' },
    body: {
      en: 'Just 10 minutes of daily meditation has been shown to lower blood pressure and reduce stress hormones.',
      es: 'Solo 10 minutos de meditación diaria pueden bajar la presión arterial y reducir las hormonas del estrés.',
    },
    category: 'stress',
  },
  {
    id: 'tip_16',
    title: { en: 'Dehydration & Kidney Markers', es: 'Deshidratación y Marcadores Renales' },
    body: {
      en: 'Even mild dehydration can temporarily raise creatinine and BUN levels, making kidneys look worse than they are.',
      es: 'Incluso una deshidratación leve puede elevar creatinina y BUN temporalmente, haciendo que tus riñones parezcan peor.',
    },
    category: 'hydration',
  },
  {
    id: 'tip_17',
    title: { en: 'Processed Food & Inflammation', es: 'Alimentos Procesados e Inflamación' },
    body: {
      en: 'Ultra-processed foods can raise inflammatory markers. Focus on whole foods for better blood work results.',
      es: 'Los alimentos ultraprocesados pueden elevar marcadores inflamatorios. Enfócate en alimentos integrales.',
    },
    category: 'nutrition',
  },
  {
    id: 'tip_18',
    title: { en: 'Track Your Trends', es: 'Sigue Tus Tendencias' },
    body: {
      en: 'A single test is a snapshot. Two or more tests over time reveal your true health trajectory.',
      es: 'Un solo análisis es una foto. Dos o más análisis a lo largo del tiempo revelan tu verdadera trayectoria de salud.',
    },
    category: 'testing',
  },
  {
    id: 'tip_19',
    title: { en: 'Breathing Exercises', es: 'Ejercicios de Respiración' },
    body: {
      en: 'Box breathing (4-4-4-4 seconds) activates your parasympathetic system, lowering stress and heart rate.',
      es: 'La respiración cuadrada (4-4-4-4 segundos) activa el sistema parasimpático, bajando estrés y frecuencia cardíaca.',
    },
    category: 'stress',
  },
  {
    id: 'tip_20',
    title: { en: 'Electrolytes & Hydration', es: 'Electrolitos e Hidratación' },
    body: {
      en: 'Water alone isn\'t always enough. Adding a pinch of salt and lemon can improve absorption and electrolyte balance.',
      es: 'El agua sola no siempre es suficiente. Agregar una pizca de sal y limón puede mejorar la absorción y el balance de electrolitos.',
    },
    category: 'hydration',
  },
  {
    id: 'tip_21',
    title: { en: 'Alcohol & Liver Markers', es: 'Alcohol y Marcadores Hepáticos' },
    body: {
      en: 'Even moderate drinking can elevate liver enzymes (ALT, AST, GGT). Consider a break before your next test.',
      es: 'Incluso el consumo moderado de alcohol puede elevar enzimas hepáticas (ALT, AST, GGT). Considera una pausa antes de tu próximo análisis.',
    },
    category: 'nutrition',
  },
  {
    id: 'tip_22',
    title: { en: 'Sunlight & Circadian Rhythm', es: 'Luz Solar y Ritmo Circadiano' },
    body: {
      en: 'Morning sunlight exposure helps regulate your circadian rhythm, improving sleep quality and hormone balance.',
      es: 'La exposición a la luz solar por la mañana ayuda a regular tu ritmo circadiano, mejorando el sueño y el balance hormonal.',
    },
    category: 'sleep',
  },
];

/**
 * Get the tip of the day based on a deterministic day-of-year index.
 */
export function getTipOfTheDay(date: Date = new Date()): HealthTip {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return HEALTH_TIPS[dayOfYear % HEALTH_TIPS.length];
}

/**
 * Get a slice of N tips starting from the tip of the day.
 */
export function getTipsSlice(count: number = 5, date: Date = new Date()): HealthTip[] {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const tips: HealthTip[] = [];
  for (let i = 0; i < count; i++) {
    tips.push(HEALTH_TIPS[(dayOfYear + i) % HEALTH_TIPS.length]);
  }
  return tips;
}
