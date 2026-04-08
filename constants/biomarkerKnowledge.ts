// Plain-language, bilingual knowledge base for common biomarkers.
// Used in detail screen, insights summary, and AI prompts.

export type BioLang = 'en' | 'es';

interface BilingualText {
  en: string;
  es: string;
}

export interface BiomarkerKnowledge {
  simpleName: BilingualText;
  emoji: string;
  whatItMeasures: BilingualText;
  messages: {
    normal: BilingualText;
    borderline: BilingualText;
    high: BilingualText;
    low: BilingualText;
  };
  whyItMatters: BilingualText;
  foodsToEat?: BilingualText;    // plain text: "spinach, lentils, salmon"
  foodsToAvoid?: BilingualText;  // plain text: "soda, white bread, fried food"
  optimalRange?: {
    male?: { min: number; max: number };
    female?: { min: number; max: number };
    general?: { min: number; max: number };
  };
  sampleType: 'blood' | 'urine' | 'stool' | 'saliva';
  reviewEveryMonths: number;
}

const K: Record<string, BiomarkerKnowledge> = {

  // ── Blood Sugar / Glucose ──────────────────────────────────────────────────
  'glucosa': {
    simpleName: { en: 'Blood Sugar', es: 'Azúcar en sangre' },
    emoji: '🍬',
    whatItMeasures: {
      en: 'How much sugar is in your blood after fasting (8+ hours)',
      es: 'Nivel de azúcar en sangre en ayunas (mínimo 8h)',
    },
    messages: {
      normal: {
        en: 'Your blood sugar is in a healthy range 🎉 Your body is handling sugar well.',
        es: 'Tu azúcar está bien controlada. Tu cuerpo procesa la glucosa eficientemente.',
      },
      borderline: {
        en: 'Your blood sugar is slightly elevated. Try cutting back on sodas, white bread, and sweets.',
        es: 'Tu azúcar está ligeramente alta. Reducir harinas refinadas y azúcar puede ayudar.',
      },
      high: {
        en: 'Your blood sugar is too high. This could be a sign of prediabetes — talk to your doctor soon.',
        es: 'Tu azúcar está elevada. Puede indicar prediabetes o diabetes. Consulta a tu médico.',
      },
      low: {
        en: 'Your blood sugar is a bit low. This can cause dizziness or fatigue. Mention it to your doctor.',
        es: 'Tu azúcar está baja. Puede causar mareos o fatiga. Consulta con tu médico.',
      },
    },
    whyItMatters: {
      en: 'Blood sugar levels tell us how well your body processes carbohydrates. Consistently high levels raise your risk for diabetes, heart disease, and kidney damage.',
      es: 'La glucosa en ayunas mide cómo tu cuerpo regula el azúcar. Niveles constantemente elevados aumentan el riesgo de diabetes tipo 2, daño renal y cardiovascular.',
    },
    foodsToEat: {
      en: 'leafy greens, whole grains, legumes, nuts, eggs, lean proteins',
      es: 'verduras de hoja, granos enteros, legumbres, nueces, huevos, proteínas magras',
    },
    foodsToAvoid: {
      en: 'sodas, candy, white bread, pastries, fruit juice, sugary cereals',
      es: 'refrescos, dulces, pan blanco, pasteles, jugo de fruta, cereales azucarados',
    },
    optimalRange: { general: { min: 72, max: 85 } },
    sampleType: 'blood',
    reviewEveryMonths: 6,
  },

  'glucosa en ayunas': {
    simpleName: { en: 'Fasting Blood Sugar', es: 'Azúcar en ayunas' },
    emoji: '🍬',
    whatItMeasures: {
      en: 'Blood sugar level after going 8 hours without eating',
      es: 'Nivel de glucosa en sangre tras 8h sin comer',
    },
    messages: {
      normal: {
        en: 'Your fasting blood sugar is perfect 🎉 Your metabolism is handling glucose well.',
        es: 'Tu azúcar en ayunas es óptima. Tu metabolismo de glucosa funciona bien.',
      },
      borderline: {
        en: 'Your fasting blood sugar is borderline high. Small diet and exercise changes can bring it back to normal.',
        es: 'Tu azúcar en ayunas está en el límite. Considera revisar tu dieta y actividad física.',
      },
      high: {
        en: 'Your fasting blood sugar is high. See your doctor to rule out diabetes — the earlier you catch it, the better.',
        es: 'Tu azúcar en ayunas está elevada. Consulta a tu médico para descartar diabetes.',
      },
      low: {
        en: 'Your fasting blood sugar is low — this can cause dizziness or shakiness. Worth discussing with your doctor.',
        es: 'Tu azúcar en ayunas está baja. Puede indicar hipoglucemia — consulta a tu médico.',
      },
    },
    whyItMatters: {
      en: 'Fasting glucose is the simplest way to spot early metabolic issues. It\'s the first flag for prediabetes.',
      es: 'La glucosa en ayunas es el marcador más básico para detectar alteraciones metabólicas. Es el primer indicador de prediabetes.',
    },
    foodsToEat: {
      en: 'leafy greens, whole grains, legumes, nuts, eggs, lean proteins',
      es: 'verduras de hoja, granos enteros, legumbres, nueces, huevos, proteínas magras',
    },
    foodsToAvoid: {
      en: 'sodas, candy, white bread, pastries, fruit juice, sugary cereals',
      es: 'refrescos, dulces, pan blanco, pasteles, jugo de fruta, cereales azucarados',
    },
    optimalRange: { general: { min: 72, max: 85 } },
    sampleType: 'blood',
    reviewEveryMonths: 6,
  },

  'hemoglobina a1c': {
    simpleName: { en: '3-Month Sugar Average', es: 'Azúcar promedio 3 meses' },
    emoji: '📊',
    whatItMeasures: {
      en: 'Your average blood sugar over the past 3 months — like a long-term report card',
      es: 'Promedio de glucosa en sangre durante los últimos 3 meses',
    },
    messages: {
      normal: {
        en: 'Your 3-month blood sugar average is excellent! Your sugar control is on point.',
        es: 'Tu control de azúcar en los últimos 3 meses es excelente.',
      },
      borderline: {
        en: 'Your average blood sugar is slightly elevated. Small daily habits — less sugar, more walking — can turn this around.',
        es: 'Tu promedio de azúcar está ligeramente elevado. Un pequeño cambio en hábitos puede marcarlo.',
      },
      high: {
        en: 'Your 3-month blood sugar average is high. This is a key marker for diabetes. See your doctor.',
        es: 'Tu promedio de azúcar de los últimos 3 meses está alto. Consulta a tu médico.',
      },
      low: {
        en: 'Your HbA1c is very low — this could mean recurring low blood sugar episodes. Talk to your doctor.',
        es: 'Tu HbA1c es muy baja — podría indicar hipoglucemia recurrente.',
      },
    },
    whyItMatters: {
      en: 'Unlike a single blood sugar reading, HbA1c reflects your sugar control over 3 months. It\'s the gold standard for diagnosing and managing diabetes.',
      es: 'A diferencia de la glucosa en ayunas, la HbA1c refleja el control glucémico a largo plazo. Es el marcador definitivo para diagnosticar y monitorear diabetes.',
    },
    foodsToEat: {
      en: 'fiber-rich vegetables, legumes, whole grains, berries, cinnamon, vinegar',
      es: 'vegetales ricos en fibra, legumbres, granos enteros, bayas, canela, vinagre',
    },
    foodsToAvoid: {
      en: 'refined carbs, sugary drinks, white rice, candy, processed snacks',
      es: 'carbohidratos refinados, bebidas azucaradas, arroz blanco, dulces, snacks procesados',
    },
    optimalRange: { general: { min: 4.0, max: 5.3 } },
    sampleType: 'blood',
    reviewEveryMonths: 3,
  },

  'hba1c': {
    simpleName: { en: '3-Month Sugar Average', es: 'Azúcar promedio 3 meses' },
    emoji: '📊',
    whatItMeasures: {
      en: 'Your average blood sugar over the past 3 months',
      es: 'Promedio de glucosa en sangre durante los últimos 3 meses',
    },
    messages: {
      normal: {
        en: 'Your 3-month blood sugar average is excellent! Your sugar control is on point.',
        es: 'Tu control de azúcar en los últimos 3 meses es excelente.',
      },
      borderline: {
        en: 'Your average blood sugar is slightly elevated. Small daily changes can make a big difference.',
        es: 'Tu promedio de azúcar está ligeramente elevado. Vale la pena ajustar hábitos.',
      },
      high: {
        en: 'Your 3-month blood sugar average is high. This is a key marker for diabetes. See your doctor.',
        es: 'Tu promedio de azúcar de los últimos 3 meses está alto. Consulta a tu médico.',
      },
      low: {
        en: 'Your HbA1c is very low — could indicate recurring low blood sugar. Talk to your doctor.',
        es: 'Tu HbA1c es muy baja — podría indicar hipoglucemia recurrente.',
      },
    },
    whyItMatters: {
      en: 'HbA1c reflects your blood sugar control over 3 months — it\'s the definitive marker for diagnosing diabetes.',
      es: 'La HbA1c refleja el control glucémico a largo plazo y es el marcador definitivo para diagnosticar diabetes.',
    },
    foodsToEat: {
      en: 'fiber-rich vegetables, legumes, whole grains, berries, cinnamon',
      es: 'vegetales ricos en fibra, legumbres, granos enteros, bayas, canela',
    },
    foodsToAvoid: {
      en: 'refined carbs, sugary drinks, white rice, candy',
      es: 'carbohidratos refinados, bebidas azucaradas, arroz blanco, dulces',
    },
    optimalRange: { general: { min: 4.0, max: 5.3 } },
    sampleType: 'blood',
    reviewEveryMonths: 3,
  },

  // ── Cholesterol / Cardiovascular ───────────────────────────────────────────
  'colesterol total': {
    simpleName: { en: 'Total Cholesterol', es: 'Colesterol total' },
    emoji: '❤️',
    whatItMeasures: {
      en: 'The total amount of all types of cholesterol in your blood',
      es: 'Suma de todos los tipos de colesterol en sangre',
    },
    messages: {
      normal: {
        en: 'Your total cholesterol looks good 👍 Your heart is happy!',
        es: 'Tu colesterol total está en buen rango. Tu corazón lo agradece.',
      },
      borderline: {
        en: 'Your cholesterol is a bit elevated. Try eating more vegetables and less fried food.',
        es: 'Tu colesterol total está algo elevado. Revisar dieta y ejercicio puede ayudar.',
      },
      high: {
        en: 'Your cholesterol is high — this raises your risk for heart problems over time. See your doctor.',
        es: 'Tu colesterol total está alto. Aumenta el riesgo cardiovascular. Consulta a tu médico.',
      },
      low: {
        en: 'Your cholesterol is very low. This is rarely an issue, but worth mentioning to your doctor.',
        es: 'Tu colesterol total está muy bajo. En casos extremos puede ser un indicador de problemas.',
      },
    },
    whyItMatters: {
      en: 'Total cholesterol is the sum of good (HDL) and bad (LDL) cholesterol plus others. What matters most is the balance, not just the total number.',
      es: 'El colesterol total es la suma del bueno (HDL), el malo (LDL) y otros. Lo importante es la proporción, no sólo el total.',
    },
    foodsToEat: {
      en: 'oats, avocado, olive oil, salmon, walnuts, beans, fruits',
      es: 'avena, aguacate, aceite de oliva, salmón, nueces, frijoles, frutas',
    },
    foodsToAvoid: {
      en: 'fried food, red meat, full-fat dairy, processed foods, trans fats',
      es: 'frituras, carnes rojas, lácteos enteros, alimentos procesados, grasas trans',
    },
    optimalRange: { general: { min: 150, max: 200 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'colesterol ldl': {
    simpleName: { en: '"Bad" Cholesterol', es: 'Colesterol "malo"' },
    emoji: '⚠️',
    whatItMeasures: {
      en: 'Low-density lipoprotein — the cholesterol that can build up in your arteries',
      es: 'Colesterol de baja densidad — el que se acumula en las arterias',
    },
    messages: {
      normal: {
        en: 'Great news — your "bad" cholesterol is low. Your arteries are staying clean 🧼',
        es: 'Tu colesterol LDL es óptimo. El riesgo de obstrucción arterial es bajo.',
      },
      borderline: {
        en: 'Your "bad" cholesterol is creeping up. Try eating less red meat and more fiber-rich foods.',
        es: 'Tu LDL está en el límite. Reducir grasas saturadas y aumentar fibra puede bajarlo.',
      },
      high: {
        en: 'Your "bad" cholesterol is high — over time this can clog your arteries. Your doctor should know.',
        es: 'Tu LDL está elevado. Con el tiempo puede obstruir las arterias. Consulta a tu médico.',
      },
      low: {
        en: 'Your "bad" cholesterol is very low — that\'s actually great for your heart health!',
        es: 'Tu LDL es muy bajo — generalmente es positivo, pero en extremos puede ser una señal.',
      },
    },
    whyItMatters: {
      en: 'LDL cholesterol transports fat into your arteries where it can build up and cause blockages. It\'s the main modifiable risk factor for heart attacks and strokes.',
      es: 'El LDL transporta colesterol hacia las arterias donde puede acumularse y formar placas. Es el principal factor de riesgo cardiovascular modificable.',
    },
    foodsToEat: {
      en: 'oats, beans, lentils, avocado, olive oil, almonds, salmon, dark chocolate',
      es: 'avena, frijoles, lentejas, aguacate, aceite de oliva, almendras, salmón, chocolate negro',
    },
    foodsToAvoid: {
      en: 'red meat, butter, cheese, fried food, full-fat dairy, processed meats, coconut oil',
      es: 'carnes rojas, mantequilla, queso, frituras, lácteos enteros, embutidos, aceite de coco',
    },
    optimalRange: { general: { min: 0, max: 100 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'colesterol hdl': {
    simpleName: { en: '"Good" Cholesterol', es: 'Colesterol "bueno"' },
    emoji: '💪',
    whatItMeasures: {
      en: 'High-density lipoprotein — the cholesterol that cleans your arteries',
      es: 'Colesterol de alta densidad — el que limpia las arterias',
    },
    messages: {
      normal: {
        en: 'Your "good" cholesterol is healthy 💪 It\'s actively helping clean your arteries.',
        es: 'Tu HDL es bueno. Está ayudando a limpiar el exceso de colesterol de tus arterias.',
      },
      borderline: {
        en: 'Your "good" cholesterol could be higher. Regular aerobic exercise is the best way to raise it.',
        es: 'Tu HDL podría ser más alto. El ejercicio aeróbico es la forma más efectiva de subirlo.',
      },
      high: {
        en: 'Your "good" cholesterol is excellent! High HDL is one of the best signs for heart health 🎉',
        es: 'Tu HDL es excelente. Niveles altos de HDL son protectores del corazón.',
      },
      low: {
        en: 'Your "good" cholesterol is low — this increases heart risk. Try more exercise and less trans fats.',
        es: 'Tu HDL está bajo. Esto aumenta el riesgo cardiovascular. Considera más ejercicio y menos grasas trans.',
      },
    },
    whyItMatters: {
      en: 'HDL acts like a cleanup crew — it picks up excess cholesterol from your arteries and carries it to your liver to be removed. More HDL = more protection for your heart.',
      es: 'El HDL recoge el colesterol de las arterias y lo lleva al hígado para eliminarlo. Más HDL = más protección cardiovascular.',
    },
    foodsToEat: {
      en: 'olive oil, avocado, fatty fish, nuts, seeds, whole grains, berries',
      es: 'aceite de oliva, aguacate, pescado graso, nueces, semillas, granos enteros, bayas',
    },
    foodsToAvoid: {
      en: 'trans fats, fried food, processed snacks, refined carbs, smoking (stop!)',
      es: 'grasas trans, frituras, snacks procesados, carbohidratos refinados',
    },
    optimalRange: {
      male: { min: 50, max: 90 },
      female: { min: 60, max: 90 },
    },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'triglicéridos': {
    simpleName: { en: 'Blood Fats', es: 'Grasas en sangre' },
    emoji: '🫀',
    whatItMeasures: {
      en: 'The level of fats circulating in your blood',
      es: 'Nivel de grasas circulando en la sangre',
    },
    messages: {
      normal: {
        en: 'Your blood fat levels are healthy ✅ Your metabolism is working well.',
        es: 'Tus triglicéridos están bien. Tu metabolismo lipídico funciona correctamente.',
      },
      borderline: {
        en: 'Your blood fats are a bit high. Cut back on sugar, alcohol, and refined carbs to help.',
        es: 'Tus triglicéridos están algo altos. Reducir azúcar, alcohol y carbohidratos refinados ayuda.',
      },
      high: {
        en: 'Your blood fats are elevated — this raises your risk for heart disease and can inflame your pancreas.',
        es: 'Tus triglicéridos están elevados. Aumentan el riesgo cardiovascular y de pancreatitis.',
      },
      low: {
        en: 'Your blood fats are very low — that\'s typically a great sign!',
        es: 'Tus triglicéridos son muy bajos — generalmente es una buena señal.',
      },
    },
    whyItMatters: {
      en: 'High triglycerides are usually tied to a diet high in sugar, alcohol, or too little activity. They\'re an independent risk factor for heart disease — separate from cholesterol.',
      es: 'Los triglicéridos altos suelen relacionarse con dieta rica en azúcares, alcohol o sedentarismo. Son un factor de riesgo cardiovascular independiente.',
    },
    foodsToEat: {
      en: 'fatty fish, leafy greens, whole grains, berries, olive oil, nuts',
      es: 'pescado graso, verduras de hoja, granos enteros, bayas, aceite de oliva, nueces',
    },
    foodsToAvoid: {
      en: 'alcohol, sodas, sugar, white bread, refined carbs, fruit juice, candy',
      es: 'alcohol, refrescos, azúcar, pan blanco, carbohidratos refinados, jugo de fruta, dulces',
    },
    optimalRange: { general: { min: 0, max: 100 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  // ── Kidney Function ────────────────────────────────────────────────────────
  'creatinina': {
    simpleName: { en: 'Kidney Filter Test', es: 'Función renal' },
    emoji: '🫘',
    whatItMeasures: {
      en: 'A waste product your kidneys remove from your blood — tells us how well they\'re filtering',
      es: 'Subproducto muscular que los riñones filtran de la sangre',
    },
    messages: {
      normal: {
        en: 'Your kidneys are filtering great 🫘 Keep up the hydration!',
        es: 'Tus riñones filtran correctamente la creatinina. Función renal normal.',
      },
      borderline: {
        en: 'Your kidney filter marker is slightly off. Stay well-hydrated and mention it to your doctor.',
        es: 'Tu creatinina está algo elevada. Puede indicar sobrecarga renal o deshidratación.',
      },
      high: {
        en: 'Your kidneys may not be filtering as efficiently as they should. See your doctor to check this out.',
        es: 'Tu creatinina está alta. Puede indicar que los riñones no están filtrando bien. Consulta a tu médico.',
      },
      low: {
        en: 'Your creatinine is low — often related to lower muscle mass. Usually not a concern.',
        es: 'Tu creatinina es baja — puede relacionarse con masa muscular reducida.',
      },
    },
    whyItMatters: {
      en: 'Creatinine is the most-used marker to evaluate kidney function. Healthy kidneys efficiently filter it from your bloodstream. Elevated levels can be an early warning sign.',
      es: 'La creatinina es el marcador más usado para evaluar la función renal. Los riñones sanos la filtran eficientemente del torrente sanguíneo.',
    },
    foodsToEat: {
      en: 'water (drink plenty!), fresh fruits, vegetables, whole grains',
      es: 'agua (¡toma mucha!), frutas frescas, verduras, granos enteros',
    },
    foodsToAvoid: {
      en: 'excess protein, processed meats, salt, NSAIDs (pain meds)',
      es: 'exceso de proteína, carnes procesadas, sal, antiinflamatorios en exceso',
    },
    optimalRange: {
      male: { min: 0.7, max: 1.2 },
      female: { min: 0.6, max: 1.0 },
    },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'ácido úrico': {
    simpleName: { en: 'Uric Acid (Gout Risk)', es: 'Ácido úrico' },
    emoji: '🦴',
    whatItMeasures: {
      en: 'A waste product from protein breakdown that your kidneys need to remove',
      es: 'Producto de degradación de proteínas que los riñones eliminan',
    },
    messages: {
      normal: {
        en: 'Your uric acid is in a healthy range. Low risk of gout or kidney stones.',
        es: 'Tu ácido úrico está bien. Riesgo de gota y cálculos renales es bajo.',
      },
      borderline: {
        en: 'Your uric acid is creeping up. Drinking more water and cutting back on red meat can help.',
        es: 'Tu ácido úrico está algo alto. Hidratarte bien y reducir carnes rojas puede ayudar.',
      },
      high: {
        en: 'Your uric acid is elevated — this can cause painful gout attacks and kidney stones over time.',
        es: 'Tu ácido úrico está elevado. Puede causar gota y dañar los riñones con el tiempo.',
      },
      low: {
        en: 'Your uric acid is very low — generally not a concern.',
        es: 'Tu ácido úrico es bajo — generalmente no es preocupante.',
      },
    },
    whyItMatters: {
      en: 'High uric acid can crystallize in your joints causing gout (very painful!) or form kidney stones. It\'s often linked to a diet high in red meat and alcohol.',
      es: 'El ácido úrico elevado puede cristalizarse en las articulaciones causando gota o en los riñones formando cálculos. Se relaciona con dieta alta en purinas.',
    },
    foodsToEat: {
      en: 'water, cherries, low-fat dairy, coffee, vitamin C-rich foods',
      es: 'agua, cerezas, lácteos bajos en grasa, café, alimentos ricos en vitamina C',
    },
    foodsToAvoid: {
      en: 'red meat, organ meat, shellfish, alcohol (especially beer), fructose drinks',
      es: 'carnes rojas, vísceras, mariscos, alcohol (especialmente cerveza), bebidas con fructosa',
    },
    optimalRange: {
      male: { min: 3.5, max: 6.0 },
      female: { min: 2.5, max: 5.5 },
    },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  // ── Thyroid ────────────────────────────────────────────────────────────────
  'tsh': {
    simpleName: { en: 'Thyroid Control Hormone', es: 'Control tiroideo' },
    emoji: '🦋',
    whatItMeasures: {
      en: 'The hormone that tells your thyroid how hard to work',
      es: 'Hormona que controla cuánto trabaja la tiroides',
    },
    messages: {
      normal: {
        en: 'Your thyroid is working at a healthy pace ⚡ Energy and metabolism are on track.',
        es: 'Tu tiroides está funcionando a un ritmo normal. Energía y metabolismo regulados.',
      },
      borderline: {
        en: 'Your thyroid levels are slightly off. Worth checking T3 and T4 for a more complete picture.',
        es: 'Tu TSH está en el límite. Vale la pena monitorear con T3 y T4 para más detalle.',
      },
      high: {
        en: 'Your TSH is high — this may mean your thyroid is underactive (hypothyroidism). You may feel tired or cold. See your doctor.',
        es: 'Tu TSH alta puede indicar hipotiroidismo — tiroides trabajando poco. Consulta a tu médico.',
      },
      low: {
        en: 'Your TSH is low — this may mean your thyroid is overactive (hyperthyroidism). You may feel anxious or have a fast heart rate. See your doctor.',
        es: 'Tu TSH baja puede indicar hipertiroidismo — tiroides sobreactivada. Consulta a tu médico.',
      },
    },
    whyItMatters: {
      en: 'TSH tells your thyroid how much hormone to produce. If it\'s high, your thyroid isn\'t producing enough (hypothyroidism). If it\'s low, it\'s producing too much (hyperthyroidism). Both affect energy, weight, and mood.',
      es: 'La TSH le dice a tu tiroides cuánto trabajar. Si está alta, la tiroides no produce suficiente hormona (hipotiroidismo). Si está baja, produce demasiada (hipertiroidismo).',
    },
    foodsToEat: {
      en: 'iodine-rich foods (seafood, eggs), selenium foods (Brazil nuts, fish), zinc (pumpkin seeds)',
      es: 'alimentos ricos en yodo (mariscos, huevos), selenio (nueces de Brasil, pescado), zinc (semillas de calabaza)',
    },
    foodsToAvoid: {
      en: 'raw cruciferous vegetables in excess (for hypothyroid), soy in excess',
      es: 'exceso de vegetales crucíferos crudos (en hipotiroidismo), exceso de soya',
    },
    optimalRange: { general: { min: 1.0, max: 2.5 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  // ── Blood / Hematology ─────────────────────────────────────────────────────
  'hemoglobina': {
    simpleName: { en: 'Oxygen Carrier', es: 'Oxígeno en sangre' },
    emoji: '🔴',
    whatItMeasures: {
      en: 'The protein in red blood cells that carries oxygen throughout your body',
      es: 'Proteína en glóbulos rojos que transporta oxígeno por el cuerpo',
    },
    messages: {
      normal: {
        en: 'Your hemoglobin is healthy 🔴 Your cells are getting all the oxygen they need.',
        es: 'Tu hemoglobina es normal. Tus células reciben bien el oxígeno.',
      },
      borderline: {
        en: 'Your hemoglobin is a bit low — early signs of anemia. Try adding more iron-rich foods to your diet.',
        es: 'Tu hemoglobina está en el límite. Puede indicar inicio de anemia.',
      },
      high: {
        en: 'Your hemoglobin is elevated — this can be from dehydration or another condition. Check with your doctor.',
        es: 'Tu hemoglobina está alta — puede indicar deshidratación o policitemia.',
      },
      low: {
        en: 'Your hemoglobin is low — this means anemia. You may feel tired, short of breath, or dizzy. See your doctor.',
        es: 'Tu hemoglobina está baja. Puede causar fatiga, mareos y falta de aliento — anemia.',
      },
    },
    whyItMatters: {
      en: 'Hemoglobin is the "delivery truck" that brings oxygen to every cell in your body. Low levels cause anemia — leaving you feeling exhausted and out of breath.',
      es: 'La hemoglobina es la "camioneta" que lleva oxígeno a todos tus tejidos. Niveles bajos causan anemia y reducen tu energía y capacidad física.',
    },
    foodsToEat: {
      en: 'red meat, spinach, lentils, tofu, beans, fortified cereals, pumpkin seeds (with vitamin C)',
      es: 'carne roja, espinaca, lentejas, tofu, frijoles, cereales fortificados, semillas de calabaza (con vitamina C)',
    },
    foodsToAvoid: {
      en: 'excess coffee and tea with meals (blocks iron absorption), calcium-rich foods at same time as iron',
      es: 'exceso de café y té con las comidas (bloquea la absorción de hierro)',
    },
    optimalRange: {
      male: { min: 14.0, max: 16.0 },
      female: { min: 12.0, max: 14.0 },
    },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'leucocitos': {
    simpleName: { en: 'Immune Defenders', es: 'Defensas inmunes' },
    emoji: '🛡️',
    whatItMeasures: {
      en: 'White blood cells — the soldiers of your immune system',
      es: 'Glóbulos blancos que protegen el cuerpo de infecciones',
    },
    messages: {
      normal: {
        en: 'Your immune defenses are strong and balanced 🛡️ Your body is ready to fight off threats.',
        es: 'Tus defensas están bien. Tu sistema inmune está activo y equilibrado.',
      },
      borderline: {
        en: 'Your white blood cells are slightly off — could be temporary from stress or a mild illness.',
        es: 'Tus leucocitos están algo fuera del rango. Puede ser transitorio por estrés o infección leve.',
      },
      high: {
        en: 'Your white blood cells are elevated — your body may be fighting an infection or inflammation.',
        es: 'Tus leucocitos están altos — puede indicar infección activa, inflamación o estrés.',
      },
      low: {
        en: 'Your white blood cells are low — your immune defenses may be weakened. See your doctor.',
        es: 'Tus leucocitos están bajos — tu sistema inmune puede estar deprimido. Consulta a tu médico.',
      },
    },
    whyItMatters: {
      en: 'White blood cells are your body\'s army against bacteria, viruses, and other threats. Abnormal levels can indicate infection, inflammation, or in rare cases, bone marrow issues.',
      es: 'Los leucocitos son los "soldados" de tu sistema inmune. Niveles anormales pueden indicar infección, inflamación, o en casos extremos, problemas en la médula ósea.',
    },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'glóbulos blancos': {
    simpleName: { en: 'Immune Defenders', es: 'Defensas inmunes' },
    emoji: '🛡️',
    whatItMeasures: {
      en: 'White blood cells that fight infections and protect your immune system',
      es: 'Células del sistema inmune que combaten infecciones',
    },
    messages: {
      normal: {
        en: 'Your immune defenses are well-balanced ✅',
        es: 'Tus defensas están bien equilibradas.',
      },
      borderline: {
        en: 'Your white blood cells are slightly off — could be temporary.',
        es: 'Tus glóbulos blancos están algo alterados. Puede ser temporal.',
      },
      high: {
        en: 'Your white blood cells are high — your body may be fighting an active infection.',
        es: 'Tus glóbulos blancos están altos — posible infección o inflamación activa.',
      },
      low: {
        en: 'Your white blood cells are low. Your immune system may need some support.',
        es: 'Tus glóbulos blancos están bajos. Tu sistema inmune puede necesitar atención.',
      },
    },
    whyItMatters: {
      en: 'White blood cells are your first line of defense against bacteria, viruses, and other pathogens.',
      es: 'Los glóbulos blancos son la primera línea de defensa contra bacterias, virus y otros patógenos.',
    },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'plaquetas': {
    simpleName: { en: 'Blood Clotting Cells', es: 'Coagulación de sangre' },
    emoji: '🩹',
    whatItMeasures: {
      en: 'The tiny cells that help your blood clot when you get a cut',
      es: 'Células que ayudan a coagular la sangre cuando te cortas',
    },
    messages: {
      normal: {
        en: 'Your blood clotting cells are in a healthy range 🩹 Normal bleeding response.',
        es: 'Tu coagulación es normal. Tus plaquetas están en buen número.',
      },
      borderline: {
        en: 'Your platelets are slightly off range — could be normal variation. Monitor this.',
        es: 'Tus plaquetas están algo fuera del rango — puede ser variación normal.',
      },
      high: {
        en: 'Your platelet count is high — this can raise your risk for blood clots. Talk to your doctor.',
        es: 'Tus plaquetas están altas — trombocitosis. Puede aumentar riesgo de coágulos.',
      },
      low: {
        en: 'Your platelet count is low — you may bruise or bleed more easily. See your doctor.',
        es: 'Tus plaquetas están bajas — puede haber riesgo de sangrados. Consulta a tu médico.',
      },
    },
    whyItMatters: {
      en: 'Platelets are essential for blood clotting when you have a wound. Too few = bleeding risk. Too many = clot risk. Both extremes need medical attention.',
      es: 'Las plaquetas son esenciales para que la sangre coagule cuando hay una herida. Muy pocas o muy muchas pueden causar problemas serios.',
    },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  // ── Liver ──────────────────────────────────────────────────────────────────
  'ast': {
    simpleName: { en: 'Liver Enzyme AST', es: 'Enzima hepática AST' },
    emoji: '🟤',
    whatItMeasures: {
      en: 'An enzyme found in your liver, heart, and muscles — rises when there\'s cell damage',
      es: 'Enzima presente en hígado, corazón y músculos',
    },
    messages: {
      normal: {
        en: 'Your AST is normal — no signs of liver or muscle damage 👍',
        es: 'Tu AST es normal — no hay señales de daño hepático o muscular.',
      },
      borderline: {
        en: 'Your AST is slightly elevated — could be from intense exercise or mild inflammation.',
        es: 'Tu AST está algo elevada. Puede ser por ejercicio intenso o inflamación leve.',
      },
      high: {
        en: 'Your AST is high — this can indicate liver, heart, or muscle damage. See your doctor.',
        es: 'Tu AST está alta — puede indicar daño en hígado, corazón o músculos. Consulta a tu médico.',
      },
      low: {
        en: 'Your AST is very low — generally no clinical significance.',
        es: 'Tu AST es muy baja — generalmente sin significado clínico.',
      },
    },
    whyItMatters: {
      en: 'AST is released when cells in your liver, heart, or muscles get damaged. Together with ALT, it\'s a key indicator of liver health.',
      es: 'La AST se libera cuando hay daño celular en hígado, corazón o músculos. Junto con ALT, es clave para evaluar salud hepática.',
    },
    foodsToEat: {
      en: 'coffee, green tea, leafy vegetables, berries, olive oil, turmeric',
      es: 'café, té verde, vegetales de hoja, bayas, aceite de oliva, cúrcuma',
    },
    foodsToAvoid: {
      en: 'alcohol, processed foods, excess sugar, high-fat foods',
      es: 'alcohol, alimentos procesados, exceso de azúcar, alimentos muy grasos',
    },
    optimalRange: { general: { min: 10, max: 26 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'alt': {
    simpleName: { en: 'Liver Health Marker', es: 'Enzima hepática ALT' },
    emoji: '🟤',
    whatItMeasures: {
      en: 'A liver-specific enzyme — the best single marker of liver health',
      es: 'Enzima específica del hígado — el mejor marcador de salud hepática',
    },
    messages: {
      normal: {
        en: 'Your liver health marker is normal ✅ Your liver isn\'t showing any signs of stress.',
        es: 'Tu ALT es normal. Tu hígado no muestra señales de daño.',
      },
      borderline: {
        en: 'Your liver enzyme is slightly elevated — could be from alcohol, medications, or fatty liver. Worth monitoring.',
        es: 'Tu ALT está algo elevada. Puede indicar inflamación hepática leve.',
      },
      high: {
        en: 'Your liver enzyme is high — this suggests your liver is under stress. See your doctor.',
        es: 'Tu ALT está alta. Sugiere daño o inflamación del hígado. Consulta a tu médico.',
      },
      low: {
        en: 'Your liver enzyme is very low — no clinical significance.',
        es: 'Tu ALT es muy baja — sin significado clínico.',
      },
    },
    whyItMatters: {
      en: 'ALT is the most liver-specific enzyme. It rises in hepatitis, fatty liver, or when affected by medications and alcohol. Your best single window into liver health.',
      es: 'La ALT es el marcador más específico del hígado. Suele elevarse en hepatitis, hígado graso, o por medicamentos y alcohol.',
    },
    foodsToEat: {
      en: 'coffee, leafy greens, olive oil, berries, fish, garlic',
      es: 'café, verduras de hoja, aceite de oliva, bayas, pescado, ajo',
    },
    foodsToAvoid: {
      en: 'alcohol, processed foods, fried foods, excess sugar, high-fructose corn syrup',
      es: 'alcohol, alimentos procesados, frituras, exceso de azúcar',
    },
    optimalRange: { general: { min: 10, max: 26 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'ggt': {
    simpleName: { en: 'Liver Stress Marker', es: 'Enzima hepática GGT' },
    emoji: '🍺',
    whatItMeasures: {
      en: 'An enzyme sensitive to alcohol, medications, and liver stress',
      es: 'Enzima sensible a alcohol, medicamentos y daño hepático',
    },
    messages: {
      normal: {
        en: 'Your GGT is normal — no signs of liver or bile duct stress.',
        es: 'Tu GGT es normal. Sin señales de estrés hepático o biliar.',
      },
      borderline: {
        en: 'Your GGT is slightly elevated — often related to alcohol or certain medications.',
        es: 'Tu GGT está algo elevada — puede relacionarse con alcohol o medicamentos.',
      },
      high: {
        en: 'Your GGT is high — this can indicate liver damage, heavy alcohol use, or bile duct problems.',
        es: 'Tu GGT está alta. Puede indicar daño hepático, consumo de alcohol o problemas biliares.',
      },
      low: {
        en: 'Your GGT is very low — no clinical significance.',
        es: 'Tu GGT es muy baja — sin significado clínico.',
      },
    },
    whyItMatters: {
      en: 'GGT is very sensitive to alcohol and certain medications. Together with ALT and AST, it completes the liver panel picture.',
      es: 'La GGT es muy sensible al alcohol y ciertos medicamentos. Junto con ALT y AST, completa el panel hepático.',
    },
    foodsToEat: {
      en: 'coffee (shown to lower GGT), green tea, vegetables, fruits',
      es: 'café (se ha demostrado que reduce la GGT), té verde, verduras, frutas',
    },
    foodsToAvoid: {
      en: 'alcohol (main culprit), fried foods, excess sugar',
      es: 'alcohol (principal culpable), frituras, exceso de azúcar',
    },
    optimalRange: {
      male: { min: 10, max: 30 },
      female: { min: 8, max: 25 },
    },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  // ── Vitamins & Minerals ────────────────────────────────────────────────────
  'vitamina d': {
    simpleName: { en: 'Sunshine Vitamin', es: 'Vitamina del sol' },
    emoji: '☀️',
    whatItMeasures: {
      en: 'Your vitamin D level — mostly produced when your skin gets sunlight',
      es: 'Nivel de vitamina D en sangre — producida con la luz solar',
    },
    messages: {
      normal: {
        en: 'Your vitamin D is in a great range ☀️ Your bones, immune system, and mood are well-supported.',
        es: 'Tu vitamina D está en buen nivel. Huesos, inmunidad y ánimo bien respaldados.',
      },
      borderline: {
        en: 'Your vitamin D is a bit low. Try getting 15-20 minutes of sunlight daily or take a supplement.',
        es: 'Tu vitamina D está algo baja. Considera más sol o suplementación.',
      },
      high: {
        en: 'Your vitamin D is very high — likely from over-supplementing. Consider lowering your dose.',
        es: 'Tu vitamina D está muy alta — posible exceso de suplementación. Ajusta la dosis.',
      },
      low: {
        en: 'Your vitamin D is deficient. This can cause fatigue, bone pain, and a weaker immune system. Consider supplementing.',
        es: 'Tu vitamina D está deficiente. Puede causar fatiga, dolor óseo y debilitar el sistema inmune.',
      },
    },
    whyItMatters: {
      en: 'Vitamin D is crucial for absorbing calcium, keeping bones strong, regulating your immune system, and even your mood. Deficiency is extremely common and often goes undetected.',
      es: 'La vitamina D es crucial para absorber calcio, mantener huesos fuertes, regular el sistema inmune y el estado de ánimo. La deficiencia es muy común y subdiagnosticada.',
    },
    foodsToEat: {
      en: 'salmon, tuna, sardines, egg yolks, fortified milk, mushrooms exposed to sunlight',
      es: 'salmón, atún, sardinas, yemas de huevo, leche fortificada, hongos expuestos al sol',
    },
    foodsToAvoid: {
      en: 'nothing specific — mainly focus on getting more sun and possibly supplementing',
      es: 'nada específico — enfócate en obtener más sol y posiblemente suplementar',
    },
    optimalRange: { general: { min: 40, max: 60 } },
    sampleType: 'blood',
    reviewEveryMonths: 6,
  },

  'vitamina b12': {
    simpleName: { en: 'Vitamin B12 (Energy Vitamin)', es: 'Vitamina B12' },
    emoji: '⚡',
    whatItMeasures: {
      en: 'A vitamin essential for your nerves, energy, and making red blood cells',
      es: 'Vitamina esencial para nervios, energía y formación de sangre',
    },
    messages: {
      normal: {
        en: 'Your B12 levels are healthy ⚡ Your nerves and red blood cells have the fuel they need.',
        es: 'Tu B12 está bien. Tus nervios y glóbulos rojos tienen el combustible que necesitan.',
      },
      borderline: {
        en: 'Your B12 is a bit low. Talk to your doctor about whether you need a supplement — especially if you\'re vegetarian or vegan.',
        es: 'Tu B12 está algo baja. Considera revisarla con tu médico y evaluar suplementación.',
      },
      high: {
        en: 'Your B12 is very high — likely from supplements. This is rarely harmful but worth monitoring.',
        es: 'Tu B12 está muy alta — puede relacionarse con suplementación o, en raros casos, problemas hepáticos.',
      },
      low: {
        en: 'Your B12 is deficient. This can cause fatigue, tingling hands or feet, and memory fog. Get supplementing!',
        es: 'Tu B12 está deficiente. Puede causar fatiga, hormigueo en extremidades y anemia.',
      },
    },
    whyItMatters: {
      en: 'B12 is essential for your nervous system and producing red blood cells. Deficiency is very common in vegetarians, vegans, and older adults who absorb it less efficiently.',
      es: 'La B12 es esencial para el sistema nervioso y para producir glóbulos rojos. La deficiencia es común en veganos, vegetarianos y personas mayores.',
    },
    foodsToEat: {
      en: 'meat, fish, eggs, dairy, nutritional yeast (for vegans), fortified plant milks',
      es: 'carne, pescado, huevos, lácteos, levadura nutricional (para veganos), leches vegetales fortificadas',
    },
    foodsToAvoid: {
      en: 'nothing specific — if deficient, you likely need a supplement (B12 shots or pills)',
      es: 'nada específico — si hay deficiencia, probablemente necesitas un suplemento',
    },
    optimalRange: { general: { min: 500, max: 1000 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'ferritina': {
    simpleName: { en: 'Iron Stores', es: 'Reservas de hierro' },
    emoji: '🔋',
    whatItMeasures: {
      en: 'The protein that stores iron in your body — your iron battery level',
      es: 'Proteína que almacena hierro en el cuerpo',
    },
    messages: {
      normal: {
        en: 'Your iron stores are healthy 🔋 You have enough to produce blood and keep energy up.',
        es: 'Tus reservas de hierro son buenas. Suficiente para producir hemoglobina y mantener energía.',
      },
      borderline: {
        en: 'Your iron stores are getting low. Try eating more iron-rich foods like spinach and red meat.',
        es: 'Tus reservas de hierro están algo bajas. Considera más alimentos ricos en hierro.',
      },
      high: {
        en: 'Your iron stores are elevated — can indicate inflammation or iron overload (hemochromatosis). Check with your doctor.',
        es: 'Tu ferritina está alta — puede indicar inflamación o sobrecarga de hierro (hemocromatosis).',
      },
      low: {
        en: 'Your iron stores are depleted — this can lead to anemia with fatigue, weakness, and brain fog.',
        es: 'Tus reservas de hierro son bajas. Puede causar anemia ferropénica con fatiga y debilidad.',
      },
    },
    whyItMatters: {
      en: 'Ferritin is your body\'s iron reserve. It\'s the most sensitive marker for iron deficiency — your levels can drop here long before you develop full anemia.',
      es: 'La ferritina es la reserva de hierro del cuerpo. Es el marcador más sensible de deficiencia de hierro, mucho antes de que aparezca anemia.',
    },
    foodsToEat: {
      en: 'red meat, liver, spinach, lentils, beans, tofu, fortified cereals (eat with vitamin C!)',
      es: 'carne roja, hígado, espinaca, lentejas, frijoles, tofu, cereales fortificados (¡con vitamina C!)',
    },
    foodsToAvoid: {
      en: 'coffee and tea with meals, calcium supplements at same time as iron, excess fiber',
      es: 'café y té con las comidas, suplementos de calcio al mismo tiempo que hierro',
    },
    optimalRange: {
      male: { min: 50, max: 150 },
      female: { min: 30, max: 100 },
    },
    sampleType: 'blood',
    reviewEveryMonths: 6,
  },

  // ── Inflammation ───────────────────────────────────────────────────────────
  'pcr': {
    simpleName: { en: 'Inflammation Marker', es: 'Inflamación sistémica' },
    emoji: '🔥',
    whatItMeasures: {
      en: 'A protein your liver produces when there\'s inflammation anywhere in your body',
      es: 'Proteína que sube cuando hay inflamación en el cuerpo',
    },
    messages: {
      normal: {
        en: 'No signs of inflammation detected 🌿 Your body is not in alert mode.',
        es: 'No hay señales de inflamación activa. Tu cuerpo no está en modo de alerta.',
      },
      borderline: {
        en: 'Some mild inflammation detected — could be from exercise, stress, or a minor illness.',
        es: 'Hay algo de inflamación. Puede ser temporal por ejercicio, estrés o infección leve.',
      },
      high: {
        en: 'Your inflammation marker is elevated — could be an active infection, injury, or chronic inflammation. See your doctor.',
        es: 'Tu PCR está elevada — indica inflamación activa. Puede ser infección, lesión u otra causa.',
      },
      low: {
        en: 'Inflammation is essentially zero — excellent! Your body is calm and balanced.',
        es: 'Tu PCR es muy baja — excelente señal de que no hay inflamación significativa.',
      },
    },
    whyItMatters: {
      en: 'CRP is a general inflammation marker. Chronically elevated low-grade CRP is linked to higher cardiovascular risk, metabolic disease, and accelerated aging.',
      es: 'La PCR es un marcador de inflamación general. Elevaciones crónicas de bajo grado se asocian con mayor riesgo cardiovascular, metabólico y envejecimiento acelerado.',
    },
    foodsToEat: {
      en: 'fatty fish, berries, leafy greens, olive oil, turmeric, ginger, walnuts',
      es: 'pescado graso, bayas, verduras de hoja, aceite de oliva, cúrcuma, jengibre, nueces',
    },
    foodsToAvoid: {
      en: 'processed foods, sugar, fried food, refined carbs, alcohol, trans fats',
      es: 'alimentos procesados, azúcar, frituras, carbohidratos refinados, alcohol, grasas trans',
    },
    optimalRange: { general: { min: 0, max: 1.0 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'proteína c reactiva': {
    simpleName: { en: 'Inflammation Marker', es: 'Inflamación sistémica' },
    emoji: '🔥',
    whatItMeasures: {
      en: 'A key marker of inflammation in your body',
      es: 'Marcador de inflamación en el cuerpo',
    },
    messages: {
      normal: {
        en: 'No signs of active inflammation ✅ Your immune system is calm.',
        es: 'No hay señales de inflamación activa.',
      },
      borderline: {
        en: 'Mild inflammation detected — could be temporary.',
        es: 'Ligera inflamación detectada. Puede ser temporal.',
      },
      high: {
        en: 'Active inflammation detected. See your doctor to identify the cause.',
        es: 'Inflamación activa detectada. Consulta a tu médico para identificar la causa.',
      },
      low: {
        en: 'No detectable inflammation — excellent sign!',
        es: 'Sin inflamación detectable — excelente.',
      },
    },
    whyItMatters: {
      en: 'CRP signals whether your immune system is in "alert mode." Chronic silent inflammation accelerates aging and damages organs over time.',
      es: 'La PCR indica si el sistema inmune está en modo de alerta. La inflamación crónica silenciosa acelera el envejecimiento y el daño a órganos.',
    },
    foodsToEat: {
      en: 'fatty fish, berries, leafy greens, olive oil, turmeric, ginger',
      es: 'pescado graso, bayas, verduras de hoja, aceite de oliva, cúrcuma, jengibre',
    },
    foodsToAvoid: {
      en: 'processed foods, sugar, fried food, trans fats',
      es: 'alimentos procesados, azúcar, frituras, grasas trans',
    },
    optimalRange: { general: { min: 0, max: 1.0 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  // ── Hormones ───────────────────────────────────────────────────────────────
  'testosterona': {
    simpleName: { en: 'Testosterone', es: 'Hormona masculina' },
    emoji: '💪',
    whatItMeasures: {
      en: 'Your main sex hormone — important for both men and women',
      es: 'Hormona sexual principal en hombres (y relevante en mujeres)',
    },
    messages: {
      normal: {
        en: 'Your testosterone is at a healthy level for your age 💪 Energy and vitality look good.',
        es: 'Tu testosterona está en buen nivel para tu edad.',
      },
      borderline: {
        en: 'Your testosterone is slightly out of range — this can affect your energy, mood, and body composition.',
        es: 'Tu testosterona está algo fuera del rango. Puede afectar energía y composición corporal.',
      },
      high: {
        en: 'Your testosterone is elevated. If you\'re having symptoms (acne, mood changes), see your doctor.',
        es: 'Tu testosterona está alta — consulta a tu médico, especialmente si hay síntomas.',
      },
      low: {
        en: 'Your testosterone is low — this can cause fatigue, low sex drive, mood changes, and muscle loss. Talk to your doctor.',
        es: 'Tu testosterona está baja. Puede causar fatiga, pérdida de músculo, libido baja y cambios de ánimo.',
      },
    },
    whyItMatters: {
      en: 'Testosterone regulates muscle mass, energy levels, sex drive, mood, and bone density. It naturally decreases with age — but too much decline can significantly affect quality of life.',
      es: 'La testosterona regula masa muscular, energía, libido, estado de ánimo y densidad ósea. Disminuye naturalmente con la edad.',
    },
    foodsToEat: {
      en: 'zinc-rich foods (oysters, pumpkin seeds), healthy fats (avocado, olive oil), vitamin D foods',
      es: 'alimentos ricos en zinc (ostras, semillas de calabaza), grasas saludables (aguacate, aceite de oliva)',
    },
    foodsToAvoid: {
      en: 'alcohol, soy in excess, processed foods, trans fats',
      es: 'alcohol, exceso de soya, alimentos procesados, grasas trans',
    },
    optimalRange: {
      male: { min: 500, max: 900 },
      female: { min: 15, max: 70 },
    },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'cortisol': {
    simpleName: { en: 'Stress Hormone', es: 'Hormona del estrés' },
    emoji: '😤',
    whatItMeasures: {
      en: 'The hormone your adrenal glands release when you\'re under stress',
      es: 'Hormona producida en las glándulas suprarrenales en respuesta al estrés',
    },
    messages: {
      normal: {
        en: 'Your cortisol is well-balanced 😌 Your body is managing stress normally.',
        es: 'Tu cortisol es normal. Tu respuesta al estrés está bien calibrada.',
      },
      borderline: {
        en: 'Your cortisol is slightly off — chronic stress or poor sleep could be the cause.',
        es: 'Tu cortisol está algo alterado. El estrés crónico o el sueño insuficiente pueden causarlo.',
      },
      high: {
        en: 'Your cortisol is elevated. Chronic high cortisol wears down your body. Consider stress management techniques.',
        es: 'Tu cortisol está elevado. El estrés crónico puede estar afectando tu salud. Considera técnicas de manejo del estrés.',
      },
      low: {
        en: 'Your cortisol is low — this can indicate adrenal insufficiency. Please see your doctor.',
        es: 'Tu cortisol está bajo — puede indicar insuficiencia adrenal. Consulta a tu médico.',
      },
    },
    whyItMatters: {
      en: 'Cortisol regulates metabolism, inflammation, and your stress response. Chronically high levels damage multiple body systems — your sleep, weight, immunity, and heart all suffer.',
      es: 'El cortisol regula el metabolismo, la inflamación y la respuesta al estrés. Niveles crónicamente altos dañan múltiples sistemas del cuerpo.',
    },
    foodsToEat: {
      en: 'dark chocolate, bananas, pears, fermented foods, green tea, ashwagandha (supplement)',
      es: 'chocolate negro, plátanos, peras, alimentos fermentados, té verde',
    },
    foodsToAvoid: {
      en: 'caffeine in excess, alcohol, sugar, processed foods, skipping meals',
      es: 'exceso de cafeína, alcohol, azúcar, alimentos procesados, saltarse comidas',
    },
    optimalRange: { general: { min: 6, max: 12 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  // ── Prostate ──────────────────────────────────────────────────────────────
  'psa total': {
    simpleName: { en: 'Prostate Marker (PSA)', es: 'Marcador prostático (PSA)' },
    emoji: '🔬',
    whatItMeasures: {
      en: 'Prostate-Specific Antigen — a protein produced by the prostate gland',
      es: 'Antígeno Prostático Específico — proteína producida por la próstata',
    },
    messages: {
      normal: {
        en: 'Your PSA is in a healthy range. No signs of prostate issues.',
        es: 'Tu PSA está en rango normal. Sin señales de problemas prostáticos.',
      },
      borderline: {
        en: 'Your PSA is slightly elevated — could be from an enlarged prostate or inflammation. Worth monitoring.',
        es: 'Tu PSA está algo elevado — puede ser hiperplasia benigna o inflamación. Conviene monitorear.',
      },
      high: {
        en: 'Your PSA is elevated. This needs further evaluation by your doctor to rule out prostate conditions.',
        es: 'Tu PSA está elevado. Requiere evaluación médica para descartar problemas prostáticos.',
      },
      low: {
        en: 'Your PSA is very low — that is generally a good sign for prostate health.',
        es: 'Tu PSA es muy bajo — generalmente es buena señal para la salud prostática.',
      },
    },
    whyItMatters: {
      en: 'PSA is the primary screening marker for prostate health in men. Elevated levels can indicate benign enlargement, infection, or in some cases prostate cancer. Early detection saves lives.',
      es: 'El PSA es el principal marcador de salud prostática. Niveles elevados pueden indicar hiperplasia benigna, infección o en algunos casos cáncer de próstata. La detección temprana salva vidas.',
    },
    foodsToEat: {
      en: 'tomatoes (lycopene), broccoli, green tea, pomegranate, fatty fish, walnuts',
      es: 'tomates (licopeno), brócoli, té verde, granada, pescado graso, nueces',
    },
    foodsToAvoid: {
      en: 'excess red meat, high-fat dairy, processed meats, excess calcium supplements',
      es: 'exceso de carne roja, lácteos altos en grasa, carnes procesadas, exceso de suplementos de calcio',
    },
    optimalRange: { male: { min: 0, max: 2.5 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'psa libre': {
    simpleName: { en: 'Free PSA (Ratio)', es: 'PSA Libre (Proporción)' },
    emoji: '🔬',
    whatItMeasures: {
      en: 'The proportion of unbound PSA — helps distinguish benign vs concerning prostate changes',
      es: 'Proporción de PSA no unido a proteínas — ayuda a diferenciar cambios prostáticos benignos de preocupantes',
    },
    messages: {
      normal: {
        en: 'Your free PSA ratio is reassuring — suggests benign prostate changes if PSA is elevated.',
        es: 'Tu proporción de PSA libre es tranquilizadora — sugiere cambios prostáticos benignos.',
      },
      borderline: {
        en: 'Your free PSA ratio is in an intermediate zone. Follow up with your doctor for further evaluation.',
        es: 'Tu proporción de PSA libre está en zona intermedia. Consulta a tu médico para seguimiento.',
      },
      high: {
        en: 'A high free PSA ratio is usually reassuring — it suggests benign prostate enlargement rather than cancer.',
        es: 'Una proporción alta de PSA libre suele ser tranquilizadora — sugiere agrandamiento benigno.',
      },
      low: {
        en: 'A low free PSA ratio may warrant further investigation. Discuss with your urologist.',
        es: 'Una proporción baja de PSA libre puede requerir más estudios. Consulta a tu urólogo.',
      },
    },
    whyItMatters: {
      en: 'Free PSA helps refine risk when total PSA is borderline (4-10). A higher ratio suggests benign enlargement; a lower ratio may suggest further testing is needed.',
      es: 'El PSA libre ayuda a refinar el riesgo cuando el PSA total está en zona gris (4-10). Una proporción más alta sugiere agrandamiento benigno.',
    },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  // ── Electrolytes & Minerals ───────────────────────────────────────────────
  'calcio': {
    simpleName: { en: 'Calcium', es: 'Calcio' },
    emoji: '🦴',
    whatItMeasures: {
      en: 'The level of calcium in your blood — essential for bones, muscles, and nerves',
      es: 'Nivel de calcio en sangre — esencial para huesos, músculos y nervios',
    },
    messages: {
      normal: {
        en: 'Your calcium is in a healthy range. Bones, muscles, and nerves are well-supplied.',
        es: 'Tu calcio está en buen rango. Huesos, músculos y nervios bien abastecidos.',
      },
      borderline: {
        en: 'Your calcium is slightly off range. Check vitamin D levels and parathyroid function.',
        es: 'Tu calcio está algo fuera del rango. Revisa vitamina D y función paratiroidea.',
      },
      high: {
        en: 'Your calcium is elevated (hypercalcemia). This can affect your heart and kidneys. See your doctor.',
        es: 'Tu calcio está elevado (hipercalcemia). Puede afectar corazón y riñones. Consulta a tu médico.',
      },
      low: {
        en: 'Your calcium is low (hypocalcemia). This can cause muscle cramps and tingling. See your doctor.',
        es: 'Tu calcio está bajo (hipocalcemia). Puede causar calambres y hormigueo. Consulta a tu médico.',
      },
    },
    whyItMatters: {
      en: 'Calcium is critical for bone strength, muscle contraction, nerve signaling, and heart rhythm. Both high and low levels can have serious consequences.',
      es: 'El calcio es esencial para huesos fuertes, contracción muscular, señalización nerviosa y ritmo cardíaco. Tanto niveles altos como bajos pueden tener consecuencias serias.',
    },
    foodsToEat: {
      en: 'dairy, sardines, broccoli, kale, fortified plant milks, almonds, tofu',
      es: 'lácteos, sardinas, brócoli, kale, leches vegetales fortificadas, almendras, tofu',
    },
    foodsToAvoid: {
      en: 'excess salt, excess caffeine, excess soda (phosphoric acid leaches calcium)',
      es: 'exceso de sal, exceso de cafeína, exceso de refrescos (el ácido fosfórico elimina calcio)',
    },
    optimalRange: { general: { min: 8.5, max: 10.2 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'magnesio': {
    simpleName: { en: 'Magnesium', es: 'Magnesio' },
    emoji: '✨',
    whatItMeasures: {
      en: 'Blood magnesium level — involved in 300+ enzyme reactions in your body',
      es: 'Nivel de magnesio en sangre — participa en más de 300 reacciones enzimáticas',
    },
    messages: {
      normal: {
        en: 'Your magnesium is in a healthy range. Muscles, nerves, and energy production are well-supported.',
        es: 'Tu magnesio está en buen rango. Músculos, nervios y producción de energía bien respaldados.',
      },
      borderline: {
        en: 'Your magnesium is slightly low. Try adding more nuts, seeds, and leafy greens to your diet.',
        es: 'Tu magnesio está algo bajo. Agrega más nueces, semillas y verduras de hoja a tu dieta.',
      },
      high: {
        en: 'Your magnesium is elevated — usually from supplements or kidney issues. Check with your doctor.',
        es: 'Tu magnesio está elevado — usualmente por suplementos o problemas renales. Consulta a tu médico.',
      },
      low: {
        en: 'Your magnesium is low. This can cause muscle cramps, fatigue, and irregular heartbeat.',
        es: 'Tu magnesio está bajo. Puede causar calambres, fatiga y arritmias. Considera suplementar.',
      },
    },
    whyItMatters: {
      en: 'Magnesium is needed for muscle and nerve function, blood sugar control, and bone health. Deficiency is very common and linked to insomnia, anxiety, and muscle cramps.',
      es: 'El magnesio es necesario para función muscular, nerviosa, control de azúcar y salud ósea. La deficiencia es muy común y se asocia con insomnio, ansiedad y calambres.',
    },
    foodsToEat: {
      en: 'dark chocolate, avocado, nuts, seeds, spinach, bananas, whole grains',
      es: 'chocolate negro, aguacate, nueces, semillas, espinaca, plátanos, granos enteros',
    },
    foodsToAvoid: {
      en: 'excess alcohol, excess caffeine, processed foods (deplete magnesium)',
      es: 'exceso de alcohol, exceso de cafeína, alimentos procesados (agotan magnesio)',
    },
    optimalRange: { general: { min: 1.8, max: 2.4 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'fósforo': {
    simpleName: { en: 'Phosphorus', es: 'Fósforo' },
    emoji: '🦴',
    whatItMeasures: {
      en: 'Blood phosphorus level — works with calcium for bone and energy metabolism',
      es: 'Nivel de fósforo en sangre — trabaja con el calcio para huesos y metabolismo energético',
    },
    messages: {
      normal: {
        en: 'Your phosphorus is in a healthy range. Bone and energy metabolism are on track.',
        es: 'Tu fósforo está en buen rango. Metabolismo óseo y energético en buen estado.',
      },
      borderline: {
        en: 'Your phosphorus is slightly off. Worth checking kidney function and calcium levels.',
        es: 'Tu fósforo está algo fuera del rango. Conviene revisar función renal y calcio.',
      },
      high: {
        en: 'Your phosphorus is elevated — can be related to kidney issues or excess intake. See your doctor.',
        es: 'Tu fósforo está elevado — puede relacionarse con problemas renales. Consulta a tu médico.',
      },
      low: {
        en: 'Your phosphorus is low. This can affect bones and energy levels. Talk to your doctor.',
        es: 'Tu fósforo está bajo. Puede afectar huesos y energía. Consulta a tu médico.',
      },
    },
    whyItMatters: {
      en: 'Phosphorus works alongside calcium to build strong bones and teeth. It also plays a key role in how your body stores and uses energy (ATP).',
      es: 'El fósforo trabaja junto al calcio para construir huesos y dientes fuertes. También es clave en cómo el cuerpo almacena y usa energía (ATP).',
    },
    foodsToEat: {
      en: 'dairy, meat, fish, eggs, nuts, beans, whole grains',
      es: 'lácteos, carne, pescado, huevos, nueces, frijoles, granos enteros',
    },
    foodsToAvoid: {
      en: 'excess phosphorus additives in processed foods and sodas',
      es: 'exceso de aditivos de fósforo en alimentos procesados y refrescos',
    },
    optimalRange: { general: { min: 2.5, max: 4.5 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'potasio': {
    simpleName: { en: 'Potassium', es: 'Potasio' },
    emoji: '🍌',
    whatItMeasures: {
      en: 'Blood potassium level — essential for heart rhythm, muscles, and nerve signals',
      es: 'Nivel de potasio en sangre — esencial para ritmo cardíaco, músculos y nervios',
    },
    messages: {
      normal: {
        en: 'Your potassium is in a healthy range. Heart, muscles, and nerves are well-balanced.',
        es: 'Tu potasio está en buen rango. Corazón, músculos y nervios bien equilibrados.',
      },
      borderline: {
        en: 'Your potassium is slightly off. This can affect heart rhythm — worth monitoring.',
        es: 'Tu potasio está algo fuera del rango. Puede afectar el ritmo cardíaco — conviene monitorear.',
      },
      high: {
        en: 'Your potassium is elevated (hyperkalemia). This can cause dangerous heart rhythm changes. See your doctor.',
        es: 'Tu potasio está elevado (hiperkalemia). Puede causar arritmias peligrosas. Consulta a tu médico.',
      },
      low: {
        en: 'Your potassium is low (hypokalemia). This can cause weakness, cramps, and heart issues.',
        es: 'Tu potasio está bajo (hipokalemia). Puede causar debilidad, calambres y problemas cardíacos.',
      },
    },
    whyItMatters: {
      en: 'Potassium is critical for normal heart rhythm and muscle contraction. Both high and low levels can be dangerous and need medical attention.',
      es: 'El potasio es crítico para el ritmo cardíaco normal y la contracción muscular. Tanto niveles altos como bajos pueden ser peligrosos.',
    },
    foodsToEat: {
      en: 'bananas, potatoes, spinach, avocado, beans, yogurt, salmon',
      es: 'plátanos, papas, espinaca, aguacate, frijoles, yogur, salmón',
    },
    foodsToAvoid: {
      en: 'excess salt substitutes (high in potassium), excess supplementation without medical guidance',
      es: 'exceso de sustitutos de sal (altos en potasio), suplementación sin guía médica',
    },
    optimalRange: { general: { min: 3.5, max: 5.0 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'sodio': {
    simpleName: { en: 'Sodium', es: 'Sodio' },
    emoji: '🧂',
    whatItMeasures: {
      en: 'Blood sodium level — regulates fluid balance, blood pressure, and nerve function',
      es: 'Nivel de sodio en sangre — regula equilibrio de líquidos, presión arterial y función nerviosa',
    },
    messages: {
      normal: {
        en: 'Your sodium is in a healthy range. Fluid balance and blood pressure are well-regulated.',
        es: 'Tu sodio está en buen rango. Equilibrio de líquidos y presión arterial bien regulados.',
      },
      borderline: {
        en: 'Your sodium is slightly off. Stay well-hydrated and monitor your salt intake.',
        es: 'Tu sodio está algo fuera del rango. Mantente bien hidratado y monitorea tu consumo de sal.',
      },
      high: {
        en: 'Your sodium is elevated (hypernatremia). Usually from dehydration. Drink more water and see your doctor.',
        es: 'Tu sodio está elevado (hipernatremia). Usualmente por deshidratación. Toma más agua y consulta a tu médico.',
      },
      low: {
        en: 'Your sodium is low (hyponatremia). This can cause confusion and weakness. See your doctor.',
        es: 'Tu sodio está bajo (hiponatremia). Puede causar confusión y debilidad. Consulta a tu médico.',
      },
    },
    whyItMatters: {
      en: 'Sodium is the main electrolyte controlling fluid balance outside your cells. Abnormal levels affect brain function, blood pressure, and can be life-threatening in extreme cases.',
      es: 'El sodio es el principal electrolito que controla el equilibrio de líquidos fuera de las células. Niveles anormales afectan función cerebral y presión arterial.',
    },
    optimalRange: { general: { min: 136, max: 145 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  // ── Liver (additional) ────────────────────────────────────────────────────
  'albúmina': {
    simpleName: { en: 'Albumin (Liver Protein)', es: 'Albúmina (Proteína hepática)' },
    emoji: '🟤',
    whatItMeasures: {
      en: 'The main protein made by your liver — reflects liver function and nutritional status',
      es: 'Principal proteína producida por el hígado — refleja función hepática y estado nutricional',
    },
    messages: {
      normal: {
        en: 'Your albumin is healthy. Your liver is producing proteins well and your nutrition is good.',
        es: 'Tu albúmina es normal. Tu hígado produce proteínas bien y tu nutrición es buena.',
      },
      borderline: {
        en: 'Your albumin is slightly low. Could reflect mild liver stress or poor nutrition.',
        es: 'Tu albúmina está algo baja. Puede reflejar estrés hepático leve o mala nutrición.',
      },
      high: {
        en: 'Your albumin is elevated — usually from dehydration. Stay well-hydrated.',
        es: 'Tu albúmina está alta — generalmente por deshidratación. Mantente hidratado.',
      },
      low: {
        en: 'Your albumin is low — can indicate liver disease, kidney problems, or malnutrition. See your doctor.',
        es: 'Tu albúmina está baja — puede indicar enfermedad hepática, problemas renales o malnutrición.',
      },
    },
    whyItMatters: {
      en: 'Albumin is the most abundant protein in blood, made by the liver. Low levels indicate the liver is struggling, or your body is losing protein through kidneys or inflammation.',
      es: 'La albúmina es la proteína más abundante en sangre, producida por el hígado. Niveles bajos indican que el hígado está comprometido o que hay pérdida proteica.',
    },
    foodsToEat: {
      en: 'eggs, lean meats, fish, dairy, legumes, tofu',
      es: 'huevos, carnes magras, pescado, lácteos, legumbres, tofu',
    },
    foodsToAvoid: {
      en: 'alcohol, excess processed foods',
      es: 'alcohol, exceso de alimentos procesados',
    },
    optimalRange: { general: { min: 3.5, max: 5.0 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'bilirrubina total': {
    simpleName: { en: 'Total Bilirubin', es: 'Bilirrubina Total' },
    emoji: '🟡',
    whatItMeasures: {
      en: 'A yellow pigment from red blood cell breakdown — processed by the liver',
      es: 'Pigmento amarillo de la degradación de glóbulos rojos — procesado por el hígado',
    },
    messages: {
      normal: {
        en: 'Your bilirubin is normal. Your liver is processing waste products efficiently.',
        es: 'Tu bilirrubina es normal. Tu hígado procesa productos de desecho eficientemente.',
      },
      borderline: {
        en: 'Your bilirubin is slightly elevated. Could be Gilbert syndrome (harmless) or mild liver stress.',
        es: 'Tu bilirrubina está algo elevada. Puede ser síndrome de Gilbert (benigno) o estrés hepático leve.',
      },
      high: {
        en: 'Your bilirubin is high — this can cause jaundice (yellowing). See your doctor to check liver and bile ducts.',
        es: 'Tu bilirrubina está alta — puede causar ictericia. Consulta a tu médico para revisar hígado y vías biliares.',
      },
      low: {
        en: 'Your bilirubin is very low — no clinical concern.',
        es: 'Tu bilirrubina es muy baja — sin significado clínico.',
      },
    },
    whyItMatters: {
      en: 'Bilirubin is a waste product from old red blood cells. Your liver processes it for excretion. Elevated levels can indicate liver disease, bile duct obstruction, or excessive red cell breakdown.',
      es: 'La bilirrubina es un producto de desecho de glóbulos rojos viejos. El hígado la procesa para excretarla. Niveles elevados pueden indicar enfermedad hepática u obstrucción biliar.',
    },
    optimalRange: { general: { min: 0.1, max: 1.0 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'bilirrubina directa': {
    simpleName: { en: 'Direct Bilirubin', es: 'Bilirrubina Directa' },
    emoji: '🟡',
    whatItMeasures: {
      en: 'The portion of bilirubin already processed by the liver — indicates bile duct function',
      es: 'Porción de bilirrubina ya procesada por el hígado — indica función de vías biliares',
    },
    messages: {
      normal: {
        en: 'Your direct bilirubin is normal. Bile ducts and liver processing are working well.',
        es: 'Tu bilirrubina directa es normal. Vías biliares y procesamiento hepático funcionan bien.',
      },
      borderline: {
        en: 'Your direct bilirubin is slightly elevated. Worth checking alongside total bilirubin and liver enzymes.',
        es: 'Tu bilirrubina directa está algo elevada. Conviene revisarla junto con bilirrubina total y enzimas hepáticas.',
      },
      high: {
        en: 'Your direct bilirubin is high — this often points to bile duct obstruction or liver disease. See your doctor.',
        es: 'Tu bilirrubina directa está alta — puede indicar obstrucción biliar o enfermedad hepática. Consulta a tu médico.',
      },
      low: {
        en: 'Your direct bilirubin is very low — no clinical concern.',
        es: 'Tu bilirrubina directa es muy baja — sin significado clínico.',
      },
    },
    whyItMatters: {
      en: 'Direct (conjugated) bilirubin has been processed by the liver. Elevated levels specifically suggest bile duct problems or liver disease affecting bile flow.',
      es: 'La bilirrubina directa (conjugada) ha sido procesada por el hígado. Niveles elevados sugieren problemas en vías biliares o enfermedad hepática.',
    },
    optimalRange: { general: { min: 0, max: 0.3 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  // ── Blood / Hematology (additional) ───────────────────────────────────────
  'eritrocitos': {
    simpleName: { en: 'Red Blood Cells', es: 'Glóbulos Rojos' },
    emoji: '🔴',
    whatItMeasures: {
      en: 'The number of red blood cells carrying oxygen throughout your body',
      es: 'Cantidad de glóbulos rojos que transportan oxígeno por el cuerpo',
    },
    messages: {
      normal: {
        en: 'Your red blood cell count is healthy. Oxygen delivery to your tissues is on track.',
        es: 'Tu conteo de glóbulos rojos es normal. El transporte de oxígeno funciona bien.',
      },
      borderline: {
        en: 'Your red blood cells are slightly off. Check hemoglobin and iron levels for context.',
        es: 'Tus eritrocitos están algo fuera del rango. Revisa hemoglobina y hierro para más contexto.',
      },
      high: {
        en: 'Your red blood cells are elevated (polycythemia). This can thicken your blood. See your doctor.',
        es: 'Tus eritrocitos están elevados (policitemia). Puede espesar la sangre. Consulta a tu médico.',
      },
      low: {
        en: 'Your red blood cells are low — this means anemia. You may feel fatigued and short of breath.',
        es: 'Tus eritrocitos están bajos — indica anemia. Puedes sentir fatiga y falta de aliento.',
      },
    },
    whyItMatters: {
      en: 'Red blood cells carry oxygen from your lungs to every tissue. Too few leads to anemia; too many can increase clot risk.',
      es: 'Los glóbulos rojos llevan oxígeno de los pulmones a todos los tejidos. Muy pocos causan anemia; demasiados aumentan riesgo de coágulos.',
    },
    foodsToEat: {
      en: 'iron-rich foods (red meat, spinach, lentils), vitamin B12, folate',
      es: 'alimentos ricos en hierro (carne roja, espinaca, lentejas), vitamina B12, folato',
    },
    optimalRange: {
      male: { min: 4.5, max: 5.5 },
      female: { min: 4.0, max: 5.0 },
    },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'hematocrito': {
    simpleName: { en: 'Hematocrit', es: 'Hematocrito' },
    emoji: '🩸',
    whatItMeasures: {
      en: 'The percentage of your blood volume that is red blood cells',
      es: 'Porcentaje del volumen sanguíneo ocupado por glóbulos rojos',
    },
    messages: {
      normal: {
        en: 'Your hematocrit is in a healthy range. Blood composition is well-balanced.',
        es: 'Tu hematocrito está en buen rango. La composición de tu sangre está equilibrada.',
      },
      borderline: {
        en: 'Your hematocrit is slightly off. Could be related to hydration or early anemia.',
        es: 'Tu hematocrito está algo fuera del rango. Puede relacionarse con hidratación o anemia leve.',
      },
      high: {
        en: 'Your hematocrit is elevated. This can indicate dehydration or polycythemia. See your doctor.',
        es: 'Tu hematocrito está elevado. Puede indicar deshidratación o policitemia. Consulta a tu médico.',
      },
      low: {
        en: 'Your hematocrit is low — consistent with anemia. Check hemoglobin and iron levels.',
        es: 'Tu hematocrito está bajo — consistente con anemia. Revisa hemoglobina y hierro.',
      },
    },
    whyItMatters: {
      en: 'Hematocrit tells you how much of your blood is red blood cells vs. plasma. Low values indicate anemia; high values can increase clot risk.',
      es: 'El hematocrito indica qué proporción de tu sangre son glóbulos rojos vs plasma. Valores bajos indican anemia; valores altos aumentan riesgo de coágulos.',
    },
    optimalRange: {
      male: { min: 40, max: 50 },
      female: { min: 36, max: 44 },
    },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'vcm': {
    simpleName: { en: 'Red Cell Size (MCV)', es: 'Tamaño de glóbulos rojos (VCM)' },
    emoji: '🔬',
    whatItMeasures: {
      en: 'Mean Corpuscular Volume — the average size of your red blood cells',
      es: 'Volumen Corpuscular Medio — tamaño promedio de tus glóbulos rojos',
    },
    messages: {
      normal: {
        en: 'Your red blood cells are normal size. This is a good sign for nutrient status.',
        es: 'Tus glóbulos rojos tienen tamaño normal. Buena señal de estado nutricional.',
      },
      borderline: {
        en: 'Your red cell size is slightly off. Check B12, folate, and iron levels.',
        es: 'El tamaño de tus glóbulos rojos está algo fuera del rango. Revisa B12, folato y hierro.',
      },
      high: {
        en: 'Your red cells are larger than normal (macrocytic). Often due to B12 or folate deficiency. See your doctor.',
        es: 'Tus glóbulos rojos son más grandes de lo normal (macrocitosis). Frecuente por falta de B12 o folato.',
      },
      low: {
        en: 'Your red cells are smaller than normal (microcytic). Often due to iron deficiency.',
        es: 'Tus glóbulos rojos son más pequeños de lo normal (microcitosis). Frecuente por falta de hierro.',
      },
    },
    whyItMatters: {
      en: 'MCV helps classify the type of anemia. Small cells usually mean iron deficiency. Large cells usually mean B12 or folate deficiency.',
      es: 'El VCM ayuda a clasificar el tipo de anemia. Células pequeñas suelen indicar falta de hierro. Células grandes suelen indicar falta de B12 o folato.',
    },
    optimalRange: { general: { min: 80, max: 96 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'hcm': {
    simpleName: { en: 'Hemoglobin per Cell (MCH)', es: 'Hemoglobina por célula (HCM)' },
    emoji: '🔬',
    whatItMeasures: {
      en: 'Mean Corpuscular Hemoglobin — the average amount of hemoglobin per red blood cell',
      es: 'Hemoglobina Corpuscular Media — cantidad promedio de hemoglobina por glóbulo rojo',
    },
    messages: {
      normal: {
        en: 'Your hemoglobin content per cell is normal. Red cells are well-loaded with oxygen carriers.',
        es: 'Tu HCM es normal. Tus glóbulos rojos tienen buena carga de hemoglobina.',
      },
      borderline: {
        en: 'Your MCH is slightly off. Often parallels MCV changes — check iron and B12.',
        es: 'Tu HCM está algo fuera del rango. Suele acompañar cambios en VCM — revisa hierro y B12.',
      },
      high: {
        en: 'Your MCH is elevated — red cells carry more hemoglobin than usual. Often linked to B12/folate deficiency.',
        es: 'Tu HCM está elevada — puede relacionarse con deficiencia de B12 o folato.',
      },
      low: {
        en: 'Your MCH is low — red cells carry less hemoglobin. Often linked to iron deficiency.',
        es: 'Tu HCM está baja — tus glóbulos rojos llevan menos hemoglobina. Frecuente en deficiencia de hierro.',
      },
    },
    whyItMatters: {
      en: 'MCH indicates how much oxygen each red blood cell can carry. Low MCH together with low MCV strongly suggests iron deficiency.',
      es: 'El HCM indica cuánto oxígeno puede transportar cada glóbulo rojo. HCM bajo junto con VCM bajo sugiere fuertemente deficiencia de hierro.',
    },
    optimalRange: { general: { min: 27, max: 33 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'neutrófilos': {
    simpleName: { en: 'Neutrophils (Infection Fighters)', es: 'Neutrófilos (Combaten infecciones)' },
    emoji: '🛡️',
    whatItMeasures: {
      en: 'The most common type of white blood cell — your first responders against bacterial infections',
      es: 'El tipo más común de glóbulo blanco — los primeros en responder a infecciones bacterianas',
    },
    messages: {
      normal: {
        en: 'Your neutrophils are in a healthy range. Your frontline immune defense is strong.',
        es: 'Tus neutrófilos están en buen rango. Tu defensa inmune de primera línea es fuerte.',
      },
      borderline: {
        en: 'Your neutrophils are slightly off. Could be a response to mild stress or infection.',
        es: 'Tus neutrófilos están algo fuera del rango. Puede ser respuesta a estrés leve o infección.',
      },
      high: {
        en: 'Your neutrophils are elevated — your body is likely fighting a bacterial infection or inflammation.',
        es: 'Tus neutrófilos están altos — tu cuerpo puede estar combatiendo una infección bacteriana o inflamación.',
      },
      low: {
        en: 'Your neutrophils are low (neutropenia). You may be more susceptible to infections. See your doctor.',
        es: 'Tus neutrófilos están bajos (neutropenia). Puedes ser más susceptible a infecciones. Consulta a tu médico.',
      },
    },
    whyItMatters: {
      en: 'Neutrophils are 60-70% of your white blood cells and are the first to arrive at infection sites. Low levels significantly increase infection risk.',
      es: 'Los neutrófilos son el 60-70% de tus glóbulos blancos y son los primeros en llegar a sitios de infección. Niveles bajos aumentan significativamente el riesgo de infecciones.',
    },
    optimalRange: { general: { min: 40, max: 70 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'linfocitos': {
    simpleName: { en: 'Lymphocytes (Immune Memory)', es: 'Linfocitos (Memoria inmune)' },
    emoji: '🛡️',
    whatItMeasures: {
      en: 'White blood cells responsible for immune memory and fighting viral infections',
      es: 'Glóbulos blancos responsables de la memoria inmune y lucha contra virus',
    },
    messages: {
      normal: {
        en: 'Your lymphocytes are in a healthy range. Your adaptive immune system is working well.',
        es: 'Tus linfocitos están en buen rango. Tu sistema inmune adaptativo funciona bien.',
      },
      borderline: {
        en: 'Your lymphocytes are slightly off. Could be a normal response to a recent illness.',
        es: 'Tus linfocitos están algo fuera del rango. Puede ser respuesta normal a una enfermedad reciente.',
      },
      high: {
        en: 'Your lymphocytes are elevated — often seen with viral infections or chronic inflammation.',
        es: 'Tus linfocitos están altos — frecuente en infecciones virales o inflamación crónica.',
      },
      low: {
        en: 'Your lymphocytes are low. This can weaken your immune system. Discuss with your doctor.',
        es: 'Tus linfocitos están bajos. Puede debilitar tu sistema inmune. Consulta a tu médico.',
      },
    },
    whyItMatters: {
      en: 'Lymphocytes include T cells and B cells — the core of your adaptive immune system. They remember past infections and produce antibodies.',
      es: 'Los linfocitos incluyen células T y B — el núcleo de tu sistema inmune adaptativo. Recuerdan infecciones pasadas y producen anticuerpos.',
    },
    optimalRange: { general: { min: 20, max: 40 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'vsg': {
    simpleName: { en: 'Sed Rate (ESR)', es: 'Velocidad de Sedimentación (VSG)' },
    emoji: '🔥',
    whatItMeasures: {
      en: 'How fast red blood cells settle — an indirect measure of inflammation',
      es: 'Velocidad a la que sedimentan los glóbulos rojos — medida indirecta de inflamación',
    },
    messages: {
      normal: {
        en: 'Your ESR is normal. No signs of systemic inflammation.',
        es: 'Tu VSG es normal. Sin señales de inflamación sistémica.',
      },
      borderline: {
        en: 'Your ESR is slightly elevated. Mild inflammation or infection may be present.',
        es: 'Tu VSG está algo elevada. Puede haber inflamación o infección leve.',
      },
      high: {
        en: 'Your ESR is elevated — indicates active inflammation. Your doctor should investigate the cause.',
        es: 'Tu VSG está elevada — indica inflamación activa. Tu médico debe investigar la causa.',
      },
      low: {
        en: 'Your ESR is very low — generally a good sign. No inflammation detected.',
        es: 'Tu VSG es muy baja — generalmente buena señal. Sin inflamación detectable.',
      },
    },
    whyItMatters: {
      en: 'ESR is a non-specific but useful marker of inflammation. Elevated ESR can indicate infections, autoimmune conditions, or even some cancers.',
      es: 'La VSG es un marcador inespecífico pero útil de inflamación. Valores elevados pueden indicar infecciones, enfermedades autoinmunes o incluso algunos cánceres.',
    },
    optimalRange: {
      male: { min: 0, max: 15 },
      female: { min: 0, max: 20 },
    },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  // ── Metabolic (additional) ────────────────────────────────────────────────
  'insulina': {
    simpleName: { en: 'Insulin', es: 'Insulina' },
    emoji: '💉',
    whatItMeasures: {
      en: 'The hormone that moves sugar from your blood into your cells for energy',
      es: 'Hormona que mueve el azúcar de la sangre a las células para producir energía',
    },
    messages: {
      normal: {
        en: 'Your insulin is in a healthy range. Your body is handling blood sugar efficiently.',
        es: 'Tu insulina está en buen rango. Tu cuerpo maneja el azúcar eficientemente.',
      },
      borderline: {
        en: 'Your insulin is slightly elevated — early sign of insulin resistance. Diet and exercise can help.',
        es: 'Tu insulina está algo elevada — señal temprana de resistencia a la insulina. Dieta y ejercicio pueden ayudar.',
      },
      high: {
        en: 'Your insulin is high — this suggests insulin resistance, a precursor to type 2 diabetes. See your doctor.',
        es: 'Tu insulina está alta — sugiere resistencia a la insulina, precursor de diabetes tipo 2. Consulta a tu médico.',
      },
      low: {
        en: 'Your insulin is low — could indicate your pancreas is underproducing. Discuss with your doctor.',
        es: 'Tu insulina está baja — puede indicar que el páncreas no produce suficiente. Consulta a tu médico.',
      },
    },
    whyItMatters: {
      en: 'Fasting insulin is one of the earliest markers of metabolic dysfunction. Elevated insulin can appear years before blood sugar rises, making it a powerful early warning sign.',
      es: 'La insulina en ayunas es uno de los marcadores más tempranos de disfunción metabólica. La insulina puede elevarse años antes de que suba el azúcar.',
    },
    foodsToEat: {
      en: 'leafy greens, whole grains, legumes, nuts, cinnamon, apple cider vinegar',
      es: 'verduras de hoja, granos enteros, legumbres, nueces, canela, vinagre de manzana',
    },
    foodsToAvoid: {
      en: 'sugar, refined carbs, white bread, sodas, fruit juice, processed snacks',
      es: 'azúcar, carbohidratos refinados, pan blanco, refrescos, jugo de fruta, snacks procesados',
    },
    optimalRange: { general: { min: 2, max: 8 } },
    sampleType: 'blood',
    reviewEveryMonths: 6,
  },

  // ── Hormones (additional) ─────────────────────────────────────────────────
  'dhea-s': {
    simpleName: { en: 'DHEA-S (Adrenal Youth)', es: 'DHEA-S (Juventud adrenal)' },
    emoji: '💊',
    whatItMeasures: {
      en: 'A hormone produced by your adrenal glands — a precursor to sex hormones and aging marker',
      es: 'Hormona producida por las glándulas suprarrenales — precursor de hormonas sexuales y marcador de envejecimiento',
    },
    messages: {
      normal: {
        en: 'Your DHEA-S is in a healthy range for your age. Adrenal function looks good.',
        es: 'Tu DHEA-S está en buen rango para tu edad. Función adrenal en buen estado.',
      },
      borderline: {
        en: 'Your DHEA-S is slightly off. This may reflect adrenal stress or age-related decline.',
        es: 'Tu DHEA-S está algo fuera del rango. Puede reflejar estrés adrenal o cambio asociado a la edad.',
      },
      high: {
        en: 'Your DHEA-S is elevated — can be related to PCOS in women or adrenal tumors. See your doctor.',
        es: 'Tu DHEA-S está elevada — puede relacionarse con SOP en mujeres o tumores adrenales. Consulta a tu médico.',
      },
      low: {
        en: 'Your DHEA-S is low. This is common with aging but can also indicate adrenal insufficiency.',
        es: 'Tu DHEA-S está baja. Es común con la edad pero también puede indicar insuficiencia adrenal.',
      },
    },
    whyItMatters: {
      en: 'DHEA-S is the most abundant steroid hormone in your body. It declines naturally with age and is considered a biomarker of biological aging. Low levels are linked to fatigue, depression, and reduced immunity.',
      es: 'La DHEA-S es la hormona esteroidea más abundante del cuerpo. Disminuye con la edad y se considera un biomarcador de envejecimiento biológico.',
    },
    optimalRange: {
      male: { min: 200, max: 500 },
      female: { min: 100, max: 400 },
    },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'estradiol': {
    simpleName: { en: 'Estradiol (Estrogen)', es: 'Estradiol (Estrógeno)' },
    emoji: '🌸',
    whatItMeasures: {
      en: 'The main form of estrogen — key for reproductive health, bones, and mood',
      es: 'La forma principal de estrógeno — clave para salud reproductiva, huesos y ánimo',
    },
    messages: {
      normal: {
        en: 'Your estradiol is in a healthy range. Reproductive and bone health are well-supported.',
        es: 'Tu estradiol está en buen rango. Salud reproductiva y ósea bien respaldadas.',
      },
      borderline: {
        en: 'Your estradiol is slightly off. This can vary with menstrual cycle phase (in women).',
        es: 'Tu estradiol está algo fuera del rango. Puede variar según la fase del ciclo menstrual (en mujeres).',
      },
      high: {
        en: 'Your estradiol is elevated. In men, this can cause breast tissue growth; in women, it may indicate ovarian issues.',
        es: 'Tu estradiol está elevado. En hombres puede causar ginecomastia; en mujeres puede indicar problemas ováricos.',
      },
      low: {
        en: 'Your estradiol is low. This can affect bone density, mood, and reproductive function.',
        es: 'Tu estradiol está bajo. Puede afectar densidad ósea, ánimo y función reproductiva.',
      },
    },
    whyItMatters: {
      en: 'Estradiol is the primary estrogen responsible for reproductive function, bone density, heart health, and brain function. In menopause, declining levels cause many symptoms.',
      es: 'El estradiol es el estrógeno principal responsable de función reproductiva, densidad ósea, salud cardíaca y función cerebral.',
    },
    optimalRange: {
      female: { min: 30, max: 400 },
      male: { min: 10, max: 40 },
    },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'progesterona': {
    simpleName: { en: 'Progesterone', es: 'Progesterona' },
    emoji: '🌙',
    whatItMeasures: {
      en: 'A hormone important for menstrual cycle, pregnancy, and mood regulation',
      es: 'Hormona importante para el ciclo menstrual, embarazo y regulación del ánimo',
    },
    messages: {
      normal: {
        en: 'Your progesterone is in a healthy range. Hormonal balance looks good.',
        es: 'Tu progesterona está en buen rango. Tu equilibrio hormonal se ve bien.',
      },
      borderline: {
        en: 'Your progesterone is slightly off. Varies greatly with menstrual cycle phase.',
        es: 'Tu progesterona está algo fuera del rango. Varía mucho según la fase del ciclo.',
      },
      high: {
        en: 'Your progesterone is elevated — could indicate pregnancy or ovulation (normal) or ovarian cysts.',
        es: 'Tu progesterona está elevada — puede indicar embarazo, ovulación (normal) o quistes ováricos.',
      },
      low: {
        en: 'Your progesterone is low. This can cause irregular periods, mood changes, and difficulty conceiving.',
        es: 'Tu progesterona está baja. Puede causar períodos irregulares, cambios de ánimo y dificultad para concebir.',
      },
    },
    whyItMatters: {
      en: 'Progesterone prepares the uterus for pregnancy and regulates the menstrual cycle. Low levels can cause PMS, irregular periods, and fertility issues.',
      es: 'La progesterona prepara el útero para el embarazo y regula el ciclo menstrual. Niveles bajos pueden causar SPM, períodos irregulares y problemas de fertilidad.',
    },
    optimalRange: {
      female: { min: 5, max: 20 },
    },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  // ── Vitamins (additional) ─────────────────────────────────────────────────
  'ácido fólico': {
    simpleName: { en: 'Folate (Vitamin B9)', es: 'Ácido Fólico (Vitamina B9)' },
    emoji: '🥬',
    whatItMeasures: {
      en: 'Folate (vitamin B9) — essential for DNA synthesis, cell division, and red blood cell formation',
      es: 'Folato (vitamina B9) — esencial para síntesis de ADN, división celular y formación de glóbulos rojos',
    },
    messages: {
      normal: {
        en: 'Your folate is in a healthy range. DNA repair and blood cell production are well-supported.',
        es: 'Tu folato está en buen rango. Reparación de ADN y producción de células sanguíneas bien respaldados.',
      },
      borderline: {
        en: 'Your folate is slightly low. Eat more leafy greens, beans, and fortified foods.',
        es: 'Tu folato está algo bajo. Come más verduras de hoja, legumbres y alimentos fortificados.',
      },
      high: {
        en: 'Your folate is very high — usually from supplements. Rarely harmful but can mask B12 deficiency.',
        es: 'Tu folato está muy alto — usualmente por suplementos. Raramente dañino pero puede enmascarar deficiencia de B12.',
      },
      low: {
        en: 'Your folate is deficient. This can cause a specific type of anemia and, in pregnancy, neural tube defects.',
        es: 'Tu folato está deficiente. Puede causar un tipo específico de anemia y, en embarazo, defectos del tubo neural.',
      },
    },
    whyItMatters: {
      en: 'Folate is vital for producing new cells and DNA repair. Deficiency causes macrocytic anemia (large, immature red blood cells) and is especially dangerous in early pregnancy.',
      es: 'El folato es vital para producir nuevas células y reparar ADN. La deficiencia causa anemia macrocítica y es especialmente peligrosa en el embarazo temprano.',
    },
    foodsToEat: {
      en: 'spinach, kale, broccoli, lentils, beans, avocado, fortified cereals, oranges',
      es: 'espinaca, kale, brócoli, lentejas, frijoles, aguacate, cereales fortificados, naranjas',
    },
    foodsToAvoid: {
      en: 'excess alcohol (depletes folate), overcooked vegetables (destroys folate)',
      es: 'exceso de alcohol (agota el folato), verduras sobrecocidas (destruye el folato)',
    },
    optimalRange: { general: { min: 5, max: 20 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'folato': {
    simpleName: { en: 'Folate (Vitamin B9)', es: 'Folato (Vitamina B9)' },
    emoji: '🥬',
    whatItMeasures: {
      en: 'Folate — a B vitamin essential for DNA repair and healthy red blood cells',
      es: 'Folato — vitamina B esencial para reparación de ADN y glóbulos rojos sanos',
    },
    messages: {
      normal: {
        en: 'Your folate is healthy. Cell division and blood production are well-supported.',
        es: 'Tu folato está bien. División celular y producción de sangre bien respaldados.',
      },
      borderline: {
        en: 'Your folate is slightly low. Add more leafy greens and legumes to your diet.',
        es: 'Tu folato está algo bajo. Agrega más verduras de hoja y legumbres a tu dieta.',
      },
      high: {
        en: 'Your folate is very high — usually from supplements. Monitor B12 to avoid masking deficiency.',
        es: 'Tu folato está muy alto — usualmente por suplementos. Monitorea B12 para evitar enmascarar deficiencia.',
      },
      low: {
        en: 'Your folate is deficient. This can lead to macrocytic anemia and is critical in pregnancy.',
        es: 'Tu folato está deficiente. Puede causar anemia macrocítica y es crítico en el embarazo.',
      },
    },
    whyItMatters: {
      en: 'Folate is needed to create new cells and repair DNA. It works closely with B12 to produce healthy red blood cells.',
      es: 'El folato es necesario para crear nuevas células y reparar ADN. Trabaja junto con la B12 para producir glóbulos rojos sanos.',
    },
    foodsToEat: {
      en: 'spinach, kale, broccoli, lentils, beans, avocado, fortified cereals',
      es: 'espinaca, kale, brócoli, lentejas, frijoles, aguacate, cereales fortificados',
    },
    foodsToAvoid: {
      en: 'excess alcohol, overcooked vegetables',
      es: 'exceso de alcohol, verduras sobrecocidas',
    },
    optimalRange: { general: { min: 5, max: 20 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  // ── Urine Biomarkers ─────────────────────────────────────────────────────────

  'glucosa (orina)': {
    simpleName: { en: 'Urine Sugar', es: 'Azúcar en Orina' },
    emoji: '🍬',
    whatItMeasures: {
      en: 'Whether sugar is spilling into your urine, which normally should not happen',
      es: 'Si hay azúcar en la orina, lo cual normalmente no debería ocurrir',
    },
    messages: {
      normal: {
        en: 'No sugar detected in your urine — that\'s perfectly normal.',
        es: 'No se detectó azúcar en la orina — completamente normal.',
      },
      borderline: {
        en: 'A trace of sugar was found in your urine. Worth monitoring, especially if you have diabetes risk.',
        es: 'Se encontró un rastro de azúcar en la orina. Vale la pena vigilar, sobre todo si tienes riesgo de diabetes.',
      },
      high: {
        en: 'Sugar is present in your urine. This can indicate uncontrolled diabetes or high blood sugar — consult your doctor.',
        es: 'Hay azúcar presente en la orina. Puede indicar diabetes no controlada o hiperglucemia — consulta a tu médico.',
      },
      low: {
        en: 'Negative for glucose in urine — this is normal.',
        es: 'Negativo para glucosa en orina — esto es normal.',
      },
    },
    whyItMatters: {
      en: 'Healthy kidneys reabsorb all glucose. When blood sugar is very high, the kidneys can\'t keep up and glucose spills into the urine — a classic sign of uncontrolled diabetes.',
      es: 'Los riñones sanos reabsorben toda la glucosa. Cuando el azúcar en sangre es muy alta, los riñones no pueden absorber todo y la glucosa aparece en la orina — un signo clásico de diabetes no controlada.',
    },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },

  'albúmina (orina)': {
    simpleName: { en: 'Urine Protein', es: 'Proteína en Orina' },
    emoji: '🫘',
    whatItMeasures: {
      en: 'Whether protein (albumin) is leaking into your urine, indicating possible kidney damage',
      es: 'Si hay proteína (albúmina) en la orina, lo cual puede indicar daño renal',
    },
    messages: {
      normal: {
        en: 'No protein detected in your urine — your kidneys are filtering well.',
        es: 'No se detectó proteína en la orina — tus riñones filtran bien.',
      },
      borderline: {
        en: 'A trace of protein was found in your urine. This can be temporary (exercise, fever) but should be monitored.',
        es: 'Se encontró un rastro de proteína en la orina. Puede ser temporal (ejercicio, fiebre) pero debe vigilarse.',
      },
      high: {
        en: 'Protein is present in your urine. This may indicate kidney damage — consult your doctor.',
        es: 'Hay proteína en la orina. Puede indicar daño renal — consulta a tu médico.',
      },
      low: {
        en: 'Negative for protein in urine — this is normal.',
        es: 'Negativo para proteína en orina — esto es normal.',
      },
    },
    whyItMatters: {
      en: 'Healthy kidneys keep protein in the blood. When albumin leaks into the urine (albuminuria), it can signal early kidney disease, especially in people with diabetes or high blood pressure.',
      es: 'Los riñones sanos mantienen la proteína en la sangre. Cuando la albúmina se filtra a la orina (albuminuria), puede ser una señal temprana de enfermedad renal, especialmente en personas con diabetes o hipertensión.',
    },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },

  'nitratos': {
    simpleName: { en: 'Nitrites', es: 'Nitritos' },
    emoji: '🦠',
    whatItMeasures: {
      en: 'Whether bacteria that cause urinary tract infections are present',
      es: 'Si hay bacterias causantes de infecciones urinarias presentes',
    },
    messages: {
      normal: {
        en: 'No nitrites detected — no signs of a urinary tract infection.',
        es: 'No se detectaron nitritos — sin signos de infección urinaria.',
      },
      borderline: {
        en: 'A weak positive for nitrites — may indicate a mild urinary infection. Consider retesting.',
        es: 'Positivo débil para nitritos — puede indicar infección urinaria leve. Considera repetir la prueba.',
      },
      high: {
        en: 'Nitrites are positive — this strongly suggests a bacterial urinary tract infection. See your doctor.',
        es: 'Nitritos positivos — esto sugiere fuertemente una infección urinaria bacteriana. Consulta a tu médico.',
      },
      low: {
        en: 'Negative for nitrites — this is the normal result.',
        es: 'Negativo para nitritos — este es el resultado normal.',
      },
    },
    whyItMatters: {
      en: 'Certain bacteria convert nitrates (normally present in urine) to nitrites. A positive result is a strong indicator of a bacterial urinary tract infection that may need antibiotics.',
      es: 'Ciertas bacterias convierten los nitratos (normalmente presentes en orina) en nitritos. Un resultado positivo es un indicador fuerte de infección urinaria bacteriana que puede necesitar antibióticos.',
    },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },

  'nitritos': {
    simpleName: { en: 'Nitrites', es: 'Nitritos' },
    emoji: '🦠',
    whatItMeasures: {
      en: 'Whether bacteria that cause urinary tract infections are present',
      es: 'Si hay bacterias causantes de infecciones urinarias presentes',
    },
    messages: {
      normal: {
        en: 'No nitrites detected — no signs of a urinary tract infection.',
        es: 'No se detectaron nitritos — sin signos de infección urinaria.',
      },
      borderline: {
        en: 'A weak positive for nitrites — may indicate a mild urinary infection. Consider retesting.',
        es: 'Positivo débil para nitritos — puede indicar infección urinaria leve. Considera repetir la prueba.',
      },
      high: {
        en: 'Nitrites are positive — this strongly suggests a bacterial urinary tract infection. See your doctor.',
        es: 'Nitritos positivos — esto sugiere fuertemente una infección urinaria bacteriana. Consulta a tu médico.',
      },
      low: {
        en: 'Negative for nitrites — this is the normal result.',
        es: 'Negativo para nitritos — este es el resultado normal.',
      },
    },
    whyItMatters: {
      en: 'Certain bacteria convert nitrates to nitrites. A positive result strongly suggests a bacterial urinary tract infection.',
      es: 'Ciertas bacterias convierten nitratos en nitritos. Un resultado positivo sugiere fuertemente una infección urinaria bacteriana.',
    },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },

  'acetona': {
    simpleName: { en: 'Ketones', es: 'Cetonas' },
    emoji: '⚡',
    whatItMeasures: {
      en: 'Whether your body is burning fat instead of sugar for energy, producing ketones',
      es: 'Si tu cuerpo está quemando grasa en vez de azúcar para obtener energía, produciendo cetonas',
    },
    messages: {
      normal: {
        en: 'No ketones detected — your body is using glucose normally for energy.',
        es: 'No se detectaron cetonas — tu cuerpo usa glucosa normalmente como energía.',
      },
      borderline: {
        en: 'Trace ketones found. This can happen with fasting, keto diets, or mild dehydration.',
        es: 'Se encontraron trazas de cetonas. Puede ocurrir por ayuno, dietas keto o deshidratación leve.',
      },
      high: {
        en: 'Ketones are elevated. In diabetics this can signal diabetic ketoacidosis — seek medical attention if you have diabetes.',
        es: 'Las cetonas están elevadas. En diabéticos puede señalar cetoacidosis diabética — busca atención médica si tienes diabetes.',
      },
      low: {
        en: 'Negative for ketones — this is normal.',
        es: 'Negativo para cetonas — esto es normal.',
      },
    },
    whyItMatters: {
      en: 'When the body can\'t use glucose (fasting, low-carb diet, or uncontrolled diabetes), it burns fat and produces ketones. Small amounts are harmless, but high levels in diabetics can be dangerous (ketoacidosis).',
      es: 'Cuando el cuerpo no puede usar glucosa (ayuno, dieta baja en carbohidratos o diabetes no controlada), quema grasa y produce cetonas. Cantidades pequeñas son inofensivas, pero niveles altos en diabéticos pueden ser peligrosos (cetoacidosis).',
    },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },

  'cetonas': {
    simpleName: { en: 'Ketones', es: 'Cetonas' },
    emoji: '⚡',
    whatItMeasures: {
      en: 'Whether your body is burning fat instead of sugar for energy, producing ketones',
      es: 'Si tu cuerpo está quemando grasa en vez de azúcar para obtener energía, produciendo cetonas',
    },
    messages: {
      normal: {
        en: 'No ketones detected — your body is using glucose normally for energy.',
        es: 'No se detectaron cetonas — tu cuerpo usa glucosa normalmente como energía.',
      },
      borderline: {
        en: 'Trace ketones found. This can happen with fasting, keto diets, or mild dehydration.',
        es: 'Se encontraron trazas de cetonas. Puede ocurrir por ayuno, dietas keto o deshidratación leve.',
      },
      high: {
        en: 'Ketones are elevated. In diabetics this can signal diabetic ketoacidosis — seek medical attention if you have diabetes.',
        es: 'Las cetonas están elevadas. En diabéticos puede señalar cetoacidosis diabética — busca atención médica si tienes diabetes.',
      },
      low: {
        en: 'Negative for ketones — this is normal.',
        es: 'Negativo para cetonas — esto es normal.',
      },
    },
    whyItMatters: {
      en: 'Ketones appear when the body burns fat instead of glucose. High levels in diabetics can indicate ketoacidosis, a medical emergency.',
      es: 'Las cetonas aparecen cuando el cuerpo quema grasa en vez de glucosa. Niveles altos en diabéticos pueden indicar cetoacidosis, una emergencia médica.',
    },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },

  'sangre oculta': {
    simpleName: { en: 'Hidden Blood', es: 'Sangre Oculta' },
    emoji: '🩸',
    whatItMeasures: {
      en: 'Whether there is blood in your urine that is not visible to the naked eye',
      es: 'Si hay sangre en la orina que no es visible a simple vista',
    },
    messages: {
      normal: {
        en: 'No hidden blood detected in your urine — that\'s normal.',
        es: 'No se detectó sangre oculta en la orina — eso es normal.',
      },
      borderline: {
        en: 'A trace of blood was detected. This can happen after vigorous exercise or menstruation. Retest if it persists.',
        es: 'Se detectó un rastro de sangre. Puede ocurrir tras ejercicio intenso o menstruación. Repetir si persiste.',
      },
      high: {
        en: 'Blood is present in your urine. This needs further investigation — consult your doctor.',
        es: 'Hay sangre presente en la orina. Esto necesita mayor investigación — consulta a tu médico.',
      },
      low: {
        en: 'Negative for blood in urine — this is normal.',
        es: 'Negativo para sangre en orina — esto es normal.',
      },
    },
    whyItMatters: {
      en: 'Blood in urine (hematuria) can signal infections, kidney stones, or more serious conditions. Even small amounts warrant medical follow-up if they persist.',
      es: 'Sangre en la orina (hematuria) puede señalar infecciones, cálculos renales o condiciones más serias. Incluso cantidades pequeñas justifican seguimiento médico si persisten.',
    },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },

  'bilis': {
    simpleName: { en: 'Bile', es: 'Bilis' },
    emoji: '🟡',
    whatItMeasures: {
      en: 'Whether bilirubin (a liver byproduct) is present in your urine',
      es: 'Si hay bilirrubina (un subproducto del hígado) presente en la orina',
    },
    messages: {
      normal: {
        en: 'No bilirubin detected in your urine — your liver is processing it normally.',
        es: 'No se detectó bilirrubina en la orina — tu hígado la procesa normalmente.',
      },
      borderline: {
        en: 'A trace of bilirubin in urine. This may indicate mild liver stress — worth monitoring.',
        es: 'Traza de bilirrubina en orina. Puede indicar estrés hepático leve — vale la pena monitorear.',
      },
      high: {
        en: 'Bilirubin is present in your urine. This can indicate liver disease, bile duct obstruction, or hepatitis — see your doctor.',
        es: 'Hay bilirrubina en la orina. Puede indicar enfermedad hepática, obstrucción biliar o hepatitis — consulta a tu médico.',
      },
      low: {
        en: 'Negative for bilirubin in urine — this is normal.',
        es: 'Negativo para bilirrubina en orina — esto es normal.',
      },
    },
    whyItMatters: {
      en: 'Bilirubin normally does not appear in urine. Its presence suggests the liver is struggling to process it, or that bile ducts may be blocked.',
      es: 'La bilirrubina normalmente no aparece en la orina. Su presencia sugiere que el hígado tiene dificultad para procesarla, o que los conductos biliares pueden estar obstruidos.',
    },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },

  'bilirrubina (orina)': {
    simpleName: { en: 'Bile', es: 'Bilis' },
    emoji: '🟡',
    whatItMeasures: {
      en: 'Whether bilirubin (a liver byproduct) is present in your urine',
      es: 'Si hay bilirrubina (un subproducto del hígado) presente en la orina',
    },
    messages: {
      normal: {
        en: 'No bilirubin detected in your urine — your liver is processing it normally.',
        es: 'No se detectó bilirrubina en la orina — tu hígado la procesa normalmente.',
      },
      borderline: {
        en: 'A trace of bilirubin in urine. This may indicate mild liver stress — worth monitoring.',
        es: 'Traza de bilirrubina en orina. Puede indicar estrés hepático leve — vale la pena monitorear.',
      },
      high: {
        en: 'Bilirubin is present in your urine. This can indicate liver disease, bile duct obstruction, or hepatitis — see your doctor.',
        es: 'Hay bilirrubina en la orina. Puede indicar enfermedad hepática, obstrucción biliar o hepatitis — consulta a tu médico.',
      },
      low: {
        en: 'Negative for bilirubin in urine — this is normal.',
        es: 'Negativo para bilirrubina en orina — esto es normal.',
      },
    },
    whyItMatters: {
      en: 'Bilirubin normally does not appear in urine. Its presence suggests the liver is struggling to process it, or that bile ducts may be blocked.',
      es: 'La bilirrubina normalmente no aparece en la orina. Su presencia sugiere que el hígado tiene dificultad para procesarla, o que los conductos biliares pueden estar obstruidos.',
    },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },

  'urobilinógeno': {
    simpleName: { en: 'Urobilinogen', es: 'Urobilinógeno' },
    emoji: '🟠',
    whatItMeasures: {
      en: 'The amount of urobilinogen in your urine, a byproduct of bilirubin breakdown',
      es: 'La cantidad de urobilinógeno en la orina, un subproducto de la descomposición de bilirrubina',
    },
    messages: {
      normal: {
        en: 'Your urobilinogen is in the normal range — your liver and gut are processing bilirubin well.',
        es: 'Tu urobilinógeno está en rango normal — tu hígado e intestino procesan la bilirrubina bien.',
      },
      borderline: {
        en: 'Urobilinogen is slightly elevated. This may indicate mild liver stress or increased red blood cell breakdown.',
        es: 'El urobilinógeno está ligeramente elevado. Puede indicar estrés hepático leve o aumento de destrucción de glóbulos rojos.',
      },
      high: {
        en: 'Urobilinogen is high. This may indicate liver disease, hemolytic anemia, or bile duct issues — consult your doctor.',
        es: 'El urobilinógeno está alto. Puede indicar enfermedad hepática, anemia hemolítica o problemas biliares — consulta a tu médico.',
      },
      low: {
        en: 'Urobilinogen is very low or absent. This may indicate a bile duct obstruction — discuss with your doctor.',
        es: 'El urobilinógeno está muy bajo o ausente. Puede indicar obstrucción biliar — consulta a tu médico.',
      },
    },
    whyItMatters: {
      en: 'Urobilinogen is formed in the gut from bilirubin. Normal levels (0.1-1.0 UE/dL) confirm the liver and bile system are working. High levels may signal liver disease or excess red blood cell destruction.',
      es: 'El urobilinógeno se forma en el intestino a partir de bilirrubina. Niveles normales (0.1-1.0 UE/dL) confirman que el hígado y el sistema biliar funcionan. Niveles altos pueden señalar enfermedad hepática o destrucción excesiva de glóbulos rojos.',
    },
    optimalRange: { general: { min: 0.1, max: 1.0 } },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },

  'glóbulos blancos (orina)': {
    simpleName: { en: 'Immune Defenders', es: 'Glóbulos Blancos' },
    emoji: '🛡️',
    whatItMeasures: {
      en: 'Whether white blood cells are present in your urine, indicating infection or inflammation',
      es: 'Si hay glóbulos blancos en la orina, indicando infección o inflamación',
    },
    messages: {
      normal: {
        en: 'No significant white blood cells in your urine — no signs of infection.',
        es: 'No hay glóbulos blancos significativos en la orina — sin signos de infección.',
      },
      borderline: {
        en: 'A few white blood cells found. This can be normal, but watch for UTI symptoms.',
        es: 'Se encontraron algunos glóbulos blancos. Puede ser normal, pero vigila síntomas de infección urinaria.',
      },
      high: {
        en: 'White blood cells are elevated in your urine. This usually indicates a urinary tract infection or inflammation — see your doctor.',
        es: 'Los glóbulos blancos están elevados en la orina. Esto usualmente indica infección urinaria o inflamación — consulta a tu médico.',
      },
      low: {
        en: 'No white blood cells in urine — this is normal.',
        es: 'Sin glóbulos blancos en orina — esto es normal.',
      },
    },
    whyItMatters: {
      en: 'White blood cells in urine (pyuria) usually mean the immune system is fighting an infection in the urinary tract. Combined with positive nitrites, it strongly suggests a UTI.',
      es: 'Glóbulos blancos en orina (piuria) usualmente significan que el sistema inmune está combatiendo una infección en el tracto urinario. Combinado con nitritos positivos, sugiere fuertemente una infección urinaria.',
    },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },

  'leucocitos (orina)': {
    simpleName: { en: 'Immune Defenders', es: 'Glóbulos Blancos' },
    emoji: '🛡️',
    whatItMeasures: {
      en: 'Whether white blood cells are present in your urine, indicating infection or inflammation',
      es: 'Si hay glóbulos blancos en la orina, indicando infección o inflamación',
    },
    messages: {
      normal: {
        en: 'No significant white blood cells in your urine — no signs of infection.',
        es: 'No hay glóbulos blancos significativos en la orina — sin signos de infección.',
      },
      borderline: {
        en: 'A few white blood cells found. This can be normal, but watch for UTI symptoms.',
        es: 'Se encontraron algunos glóbulos blancos. Puede ser normal, pero vigila síntomas de infección urinaria.',
      },
      high: {
        en: 'White blood cells are elevated in your urine. This usually indicates a urinary tract infection or inflammation — see your doctor.',
        es: 'Los glóbulos blancos están elevados en la orina. Esto usualmente indica infección urinaria o inflamación — consulta a tu médico.',
      },
      low: {
        en: 'No white blood cells in urine — this is normal.',
        es: 'Sin glóbulos blancos en orina — esto es normal.',
      },
    },
    whyItMatters: {
      en: 'White blood cells in urine usually mean the immune system is fighting an infection in the urinary tract.',
      es: 'Glóbulos blancos en orina usualmente significan que el sistema inmune combate una infección en el tracto urinario.',
    },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },

  // ── Hematology (CBC differential) ─────────────────────────────────────────

  'basófilos': {
    simpleName: { en: 'Basophils', es: 'Basófilos' },
    emoji: '🔬',
    whatItMeasures: {
      en: 'A rare type of white blood cell involved in allergic reactions and inflammation',
      es: 'Tipo raro de glóbulo blanco involucrado en reacciones alérgicas e inflamación',
    },
    messages: {
      normal: { en: 'Your basophils are in a healthy range. Allergy and inflammation markers look good.', es: 'Tus basófilos están en rango normal. Marcadores de alergia e inflamación bien.' },
      borderline: { en: 'Your basophils are slightly off. Could reflect a mild allergic response.', es: 'Tus basófilos están algo fuera del rango. Puede reflejar una respuesta alérgica leve.' },
      high: { en: 'Your basophils are elevated — can be related to allergies, inflammation, or rare blood conditions. See your doctor.', es: 'Tus basófilos están altos — puede relacionarse con alergias, inflamación o condiciones raras. Consulta a tu médico.' },
      low: { en: 'Your basophils are low — this is usually not clinically significant.', es: 'Tus basófilos están bajos — generalmente sin significado clínico.' },
    },
    whyItMatters: {
      en: 'Basophils play a role in allergic reactions by releasing histamine. Elevated counts can indicate allergies, chronic inflammation, or rarely, myeloproliferative disorders.',
      es: 'Los basófilos participan en reacciones alérgicas liberando histamina. Valores elevados pueden indicar alergias, inflamación crónica o, raramente, trastornos mieloproliferativos.',
    },
    optimalRange: { general: { min: 0, max: 1 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'eosinófilos': {
    simpleName: { en: 'Eosinophils', es: 'Eosinófilos' },
    emoji: '🔬',
    whatItMeasures: {
      en: 'White blood cells that fight parasites and play a role in allergic reactions',
      es: 'Glóbulos blancos que combaten parásitos y participan en reacciones alérgicas',
    },
    messages: {
      normal: { en: 'Your eosinophils are in a healthy range. No signs of allergies or parasitic infection.', es: 'Tus eosinófilos están en rango normal. Sin signos de alergias o infección parasitaria.' },
      borderline: { en: 'Your eosinophils are slightly elevated. Could be from allergies or mild inflammation.', es: 'Tus eosinófilos están algo elevados. Puede ser por alergias o inflamación leve.' },
      high: { en: 'Your eosinophils are elevated — often seen with allergies, asthma, or parasitic infections. See your doctor.', es: 'Tus eosinófilos están altos — frecuente en alergias, asma o infecciones parasitarias. Consulta a tu médico.' },
      low: { en: 'Your eosinophils are low — usually not a concern on its own.', es: 'Tus eosinófilos están bajos — usualmente no es preocupante por sí solo.' },
    },
    whyItMatters: {
      en: 'Eosinophils help fight parasites and are heavily involved in allergic inflammation. High counts can indicate allergies, asthma, eczema, or parasitic infections.',
      es: 'Los eosinófilos ayudan a combatir parásitos y participan en la inflamación alérgica. Valores altos pueden indicar alergias, asma, eczema o infecciones parasitarias.',
    },
    optimalRange: { general: { min: 1, max: 4 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'monocitos': {
    simpleName: { en: 'Monocytes', es: 'Monocitos' },
    emoji: '🔬',
    whatItMeasures: {
      en: 'Large white blood cells that clean up dead cells and fight chronic infections',
      es: 'Glóbulos blancos grandes que limpian células muertas y combaten infecciones crónicas',
    },
    messages: {
      normal: { en: 'Your monocytes are in a healthy range. Tissue repair and cleanup are on track.', es: 'Tus monocitos están en rango normal. Reparación de tejidos y limpieza celular funcionan bien.' },
      borderline: { en: 'Your monocytes are slightly off. Could reflect a healing process or mild inflammation.', es: 'Tus monocitos están algo fuera del rango. Puede reflejar un proceso de curación o inflamación leve.' },
      high: { en: 'Your monocytes are elevated — often seen during recovery from infections or chronic inflammatory conditions.', es: 'Tus monocitos están altos — frecuente durante recuperación de infecciones o condiciones inflamatorias crónicas.' },
      low: { en: 'Your monocytes are low — this can happen with bone marrow issues. Mention it to your doctor.', es: 'Tus monocitos están bajos — puede ocurrir con problemas de médula ósea. Menciónalo a tu médico.' },
    },
    whyItMatters: {
      en: 'Monocytes are the cleanup crew of the immune system. They eat dead cells, bacteria, and debris. Elevated counts can indicate chronic infections, autoimmune diseases, or recovery from acute illness.',
      es: 'Los monocitos son el equipo de limpieza del sistema inmune. Se comen células muertas, bacterias y desechos. Valores elevados pueden indicar infecciones crónicas o enfermedades autoinmunes.',
    },
    optimalRange: { general: { min: 2, max: 8 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'segmentados': {
    simpleName: { en: 'Segmented Neutrophils', es: 'Segmentados' },
    emoji: '🔬',
    whatItMeasures: {
      en: 'Mature neutrophils — the main soldiers of your immune system against bacteria',
      es: 'Neutrófilos maduros — los principales soldados del sistema inmune contra bacterias',
    },
    messages: {
      normal: { en: 'Your segmented neutrophils are in a healthy range. Immune defense is strong.', es: 'Tus segmentados están en rango normal. Tu defensa inmune es fuerte.' },
      borderline: { en: 'Your segmented neutrophils are slightly off. Could be a temporary response.', es: 'Tus segmentados están algo fuera del rango. Puede ser una respuesta temporal.' },
      high: { en: 'Your segmented neutrophils are elevated — often indicates an active bacterial infection or inflammation.', es: 'Tus segmentados están altos — frecuente en infección bacteriana activa o inflamación.' },
      low: { en: 'Your segmented neutrophils are low. You may be more susceptible to infections. See your doctor.', es: 'Tus segmentados están bajos. Puedes ser más susceptible a infecciones. Consulta a tu médico.' },
    },
    whyItMatters: {
      en: 'Segmented neutrophils are mature immune cells and the most abundant white blood cells. They are the first responders to bacterial infections.',
      es: 'Los segmentados son neutrófilos maduros y los glóbulos blancos más abundantes. Son los primeros en responder a infecciones bacterianas.',
    },
    optimalRange: { general: { min: 40, max: 70 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'bandas': {
    simpleName: { en: 'Band Neutrophils', es: 'Bandas' },
    emoji: '🔬',
    whatItMeasures: {
      en: 'Immature neutrophils — their presence means your body is urgently making more immune cells',
      es: 'Neutrófilos inmaduros — su presencia indica que el cuerpo está produciendo más células inmunes urgentemente',
    },
    messages: {
      normal: { en: 'Your band count is normal. No signs of acute infection.', es: 'Tus bandas están en rango normal. Sin signos de infección aguda.' },
      borderline: { en: 'Slightly elevated bands — your body may be ramping up immune defense.', es: 'Bandas ligeramente elevadas — tu cuerpo puede estar activando defensas.' },
      high: { en: 'Elevated bands (left shift) — this strongly suggests an active acute infection. See your doctor.', es: 'Bandas elevadas (desviación a la izquierda) — sugiere infección aguda activa. Consulta a tu médico.' },
      low: { en: 'Low or absent bands is normal — no clinical concern.', es: 'Bandas bajas o ausentes es normal — sin significado clínico.' },
    },
    whyItMatters: {
      en: 'Band cells are immature neutrophils released early by the bone marrow during acute infection. A high band count ("left shift") is a classic sign of serious bacterial infection.',
      es: 'Las bandas son neutrófilos inmaduros liberados tempranamente por la médula ósea durante infección aguda. Un conteo alto es signo clásico de infección bacteriana seria.',
    },
    optimalRange: { general: { min: 0, max: 5 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'rdw': {
    simpleName: { en: 'Red Cell Variation', es: 'Variación de Glóbulos Rojos' },
    emoji: '📊',
    whatItMeasures: {
      en: 'How much your red blood cells vary in size — helps identify the type of anemia',
      es: 'Cuánto varían en tamaño tus glóbulos rojos — ayuda a identificar el tipo de anemia',
    },
    messages: {
      normal: { en: 'Your red cell size variation is normal. Red blood cells are uniform.', es: 'La variación de tamaño de tus glóbulos rojos es normal. Son uniformes.' },
      borderline: { en: 'Your RDW is slightly elevated. Some size variation in red cells — check iron and B12.', es: 'Tu RDW está algo elevado. Hay algo de variación en tamaño — revisa hierro y B12.' },
      high: { en: 'Your RDW is elevated — mixed-size red cells often indicate iron deficiency or nutritional anemia. See your doctor.', es: 'Tu RDW está elevado — glóbulos rojos de tamaño variable pueden indicar deficiencia de hierro o anemia nutricional.' },
      low: { en: 'Your RDW is low — all red cells are very uniform in size. Usually not a concern.', es: 'Tu RDW está bajo — todos tus glóbulos rojos son muy uniformes. Usualmente no es preocupante.' },
    },
    whyItMatters: {
      en: 'RDW measures size variation among your red blood cells. High RDW combined with other CBC values helps identify the specific type and cause of anemia.',
      es: 'El RDW mide la variación de tamaño entre tus glóbulos rojos. Un RDW alto junto con otros valores del hemograma ayuda a identificar el tipo y causa de anemia.',
    },
    optimalRange: { general: { min: 11.5, max: 14.5 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'chcm': {
    simpleName: { en: 'Hemoglobin Concentration', es: 'Concentración de Hemoglobina' },
    emoji: '📏',
    whatItMeasures: {
      en: 'Mean Corpuscular Hemoglobin Concentration — how concentrated hemoglobin is in your red cells',
      es: 'Concentración de Hemoglobina Corpuscular Media — qué tan concentrada está la hemoglobina en tus glóbulos rojos',
    },
    messages: {
      normal: { en: 'Your MCHC is normal. Hemoglobin is well-distributed in your red cells.', es: 'Tu CHCM es normal. La hemoglobina está bien distribuida en tus glóbulos rojos.' },
      borderline: { en: 'Your MCHC is slightly off. Check alongside MCV and iron levels.', es: 'Tu CHCM está algo fuera del rango. Revísalo junto con VCM y hierro.' },
      high: { en: 'Your MCHC is elevated — can indicate hereditary spherocytosis or dehydration.', es: 'Tu CHCM está elevada — puede indicar esferocitosis hereditaria o deshidratación.' },
      low: { en: 'Your MCHC is low — red cells are paler than normal (hypochromic). Often linked to iron deficiency.', es: 'Tu CHCM está baja — tus glóbulos rojos son más pálidos de lo normal. Frecuente en deficiencia de hierro.' },
    },
    whyItMatters: {
      en: 'MCHC tells you how densely packed hemoglobin is inside red blood cells. Low values (hypochromia) strongly suggest iron deficiency.',
      es: 'La CHCM indica qué tan densamente empaquetada está la hemoglobina dentro de los glóbulos rojos. Valores bajos sugieren fuertemente deficiencia de hierro.',
    },
    optimalRange: { general: { min: 32, max: 36 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  // ── Kidney / Renal (additional) ───────────────────────────────────────────

  'nitrógeno de urea': {
    simpleName: { en: 'Blood Urea Nitrogen', es: 'Nitrógeno de Urea' },
    emoji: '🫘',
    whatItMeasures: {
      en: 'A waste product from protein breakdown that your kidneys filter out',
      es: 'Producto de desecho del metabolismo de proteínas que los riñones filtran',
    },
    messages: {
      normal: { en: 'Your BUN is in a healthy range. Kidneys are filtering protein waste well.', es: 'Tu nitrógeno de urea está en buen rango. Tus riñones filtran bien los desechos proteicos.' },
      borderline: { en: 'Your BUN is slightly elevated. Stay well-hydrated and monitor.', es: 'Tu nitrógeno de urea está algo elevado. Mantente hidratado y monitorea.' },
      high: { en: 'Your BUN is high — can indicate kidney stress, dehydration, or high protein intake. See your doctor.', es: 'Tu nitrógeno de urea está alto — puede indicar estrés renal, deshidratación o alto consumo de proteínas. Consulta a tu médico.' },
      low: { en: 'Your BUN is low — could indicate low protein diet or liver issues. Usually not a concern.', es: 'Tu nitrógeno de urea está bajo — puede indicar dieta baja en proteínas o problemas hepáticos.' },
    },
    whyItMatters: {
      en: 'BUN measures how well your kidneys remove urea (a protein waste product). Together with creatinine, it provides a clear picture of kidney function.',
      es: 'El BUN mide qué tan bien tus riñones eliminan la urea (desecho proteico). Junto con la creatinina, da una imagen clara de la función renal.',
    },
    optimalRange: { general: { min: 7, max: 20 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'urea': {
    simpleName: { en: 'Urea', es: 'Urea' },
    emoji: '🫘',
    whatItMeasures: {
      en: 'A waste product from protein metabolism filtered by your kidneys',
      es: 'Producto de desecho del metabolismo de proteínas filtrado por los riñones',
    },
    messages: {
      normal: { en: 'Your urea is in a healthy range. Kidney filtration is working well.', es: 'Tu urea está en buen rango. La filtración renal funciona bien.' },
      borderline: { en: 'Your urea is slightly elevated. Stay hydrated and monitor kidney function.', es: 'Tu urea está algo elevada. Mantente hidratado y monitorea la función renal.' },
      high: { en: 'Your urea is elevated — can indicate kidney dysfunction or dehydration. See your doctor.', es: 'Tu urea está elevada — puede indicar disfunción renal o deshidratación. Consulta a tu médico.' },
      low: { en: 'Your urea is low — may reflect low protein intake or liver issues.', es: 'Tu urea está baja — puede reflejar bajo consumo de proteínas o problemas hepáticos.' },
    },
    whyItMatters: {
      en: 'Urea is the main waste product from protein breakdown. Your kidneys filter it from the blood. Elevated levels suggest the kidneys may be struggling.',
      es: 'La urea es el principal producto de desecho del metabolismo de proteínas. Los riñones la filtran de la sangre. Valores elevados sugieren que los riñones pueden estar comprometidos.',
    },
    optimalRange: { general: { min: 15, max: 40 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  // ── Liver (additional) ────────────────────────────────────────────────────

  'proteínas totales': {
    simpleName: { en: 'Total Protein', es: 'Proteínas Totales' },
    emoji: '🧬',
    whatItMeasures: {
      en: 'Total protein in your blood — includes albumin and globulins',
      es: 'Proteína total en la sangre — incluye albúmina y globulinas',
    },
    messages: {
      normal: { en: 'Your total protein is in a healthy range. Liver production and nutrition look good.', es: 'Tus proteínas totales están en buen rango. Producción hepática y nutrición bien.' },
      borderline: { en: 'Your total protein is slightly off. Check albumin and globulin individually.', es: 'Tus proteínas totales están algo fuera del rango. Revisa albúmina y globulina por separado.' },
      high: { en: 'Your total protein is elevated — can indicate chronic inflammation, infection, or dehydration.', es: 'Tus proteínas totales están elevadas — puede indicar inflamación crónica, infección o deshidratación.' },
      low: { en: 'Your total protein is low — may indicate liver disease, malnutrition, or kidney protein loss.', es: 'Tus proteínas totales están bajas — puede indicar enfermedad hepática, malnutrición o pérdida renal de proteínas.' },
    },
    whyItMatters: {
      en: 'Total protein reflects your liver\'s ability to produce proteins and your overall nutritional status. Low levels can signal liver disease or malnutrition.',
      es: 'Las proteínas totales reflejan la capacidad del hígado para producir proteínas y tu estado nutricional general. Niveles bajos pueden indicar enfermedad hepática o malnutrición.',
    },
    optimalRange: { general: { min: 6.0, max: 8.3 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'globulina': {
    simpleName: { en: 'Globulin', es: 'Globulina' },
    emoji: '🧬',
    whatItMeasures: {
      en: 'A group of proteins involved in immune function and blood clotting',
      es: 'Grupo de proteínas involucradas en función inmune y coagulación',
    },
    messages: {
      normal: { en: 'Your globulin is in a healthy range. Immune proteins are well-balanced.', es: 'Tu globulina está en buen rango. Las proteínas inmunes están equilibradas.' },
      borderline: { en: 'Your globulin is slightly off. Worth checking in context with other liver markers.', es: 'Tu globulina está algo fuera del rango. Conviene revisarla junto con otros marcadores hepáticos.' },
      high: { en: 'Your globulin is elevated — can indicate chronic infection, inflammation, or liver disease.', es: 'Tu globulina está elevada — puede indicar infección crónica, inflamación o enfermedad hepática.' },
      low: { en: 'Your globulin is low — may indicate immune deficiency or kidney protein loss.', es: 'Tu globulina está baja — puede indicar deficiencia inmune o pérdida renal de proteínas.' },
    },
    whyItMatters: {
      en: 'Globulins include antibodies and clotting proteins. Abnormal levels can indicate immune system problems, chronic infections, or liver disease.',
      es: 'Las globulinas incluyen anticuerpos y proteínas de coagulación. Niveles anormales pueden indicar problemas inmunes, infecciones crónicas o enfermedad hepática.',
    },
    optimalRange: { general: { min: 2.0, max: 3.5 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'relación a/g': {
    simpleName: { en: 'A/G Ratio', es: 'Relación A/G' },
    emoji: '⚖️',
    whatItMeasures: {
      en: 'The ratio of albumin to globulin — reflects liver and immune balance',
      es: 'La proporción entre albúmina y globulina — refleja equilibrio hepático e inmune',
    },
    messages: {
      normal: { en: 'Your A/G ratio is balanced. Liver and immune protein production are in harmony.', es: 'Tu relación A/G está equilibrada. Producción de proteínas hepáticas e inmunes en armonía.' },
      borderline: { en: 'Your A/G ratio is slightly off. Check albumin and globulin individually.', es: 'Tu relación A/G está algo fuera del rango. Revisa albúmina y globulina por separado.' },
      high: { en: 'Your A/G ratio is elevated — usually means low globulins. Check immune function.', es: 'Tu relación A/G está elevada — usualmente indica globulinas bajas. Revisa función inmune.' },
      low: { en: 'Your A/G ratio is low — can indicate chronic inflammation, liver disease, or elevated immune response.', es: 'Tu relación A/G está baja — puede indicar inflamación crónica, enfermedad hepática o respuesta inmune elevada.' },
    },
    whyItMatters: {
      en: 'The A/G ratio helps distinguish between liver problems (low albumin) and immune/inflammatory conditions (high globulin). A low ratio warrants further investigation.',
      es: 'La relación A/G ayuda a distinguir entre problemas hepáticos (albúmina baja) y condiciones inmunes/inflamatorias (globulina alta).',
    },
    optimalRange: { general: { min: 1.1, max: 2.5 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'fosfatasa alcalina': {
    simpleName: { en: 'Alkaline Phosphatase', es: 'Fosfatasa Alcalina' },
    emoji: '🦴',
    whatItMeasures: {
      en: 'An enzyme found in liver, bones, and bile ducts — rises with bone or liver stress',
      es: 'Enzima presente en hígado, huesos y vías biliares — sube con estrés óseo o hepático',
    },
    messages: {
      normal: { en: 'Your ALP is in a healthy range. Liver and bone function look good.', es: 'Tu fosfatasa alcalina está en buen rango. Función hepática y ósea bien.' },
      borderline: { en: 'Your ALP is slightly elevated. Could be normal with bone growth or mild liver stress.', es: 'Tu fosfatasa alcalina está algo elevada. Puede ser normal en crecimiento óseo o estrés hepático leve.' },
      high: { en: 'Your ALP is elevated — can indicate bile duct obstruction, bone disease, or liver issues. See your doctor.', es: 'Tu fosfatasa alcalina está elevada — puede indicar obstrucción biliar, enfermedad ósea o problemas hepáticos. Consulta a tu médico.' },
      low: { en: 'Your ALP is low — rarely clinically significant. Could relate to zinc or magnesium deficiency.', es: 'Tu fosfatasa alcalina está baja — raramente clínicamente significativa. Puede relacionarse con deficiencia de zinc o magnesio.' },
    },
    whyItMatters: {
      en: 'ALP is an enzyme present in liver, bones, and bile ducts. Elevated levels can indicate bile duct blockage, bone disorders (like Paget\'s), or liver disease.',
      es: 'La fosfatasa alcalina es una enzima presente en hígado, huesos y vías biliares. Valores elevados pueden indicar obstrucción biliar, trastornos óseos o enfermedad hepática.',
    },
    optimalRange: { general: { min: 44, max: 147 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  // ── Metabolic (additional) ────────────────────────────────────────────────

  'ldh': {
    simpleName: { en: 'Lactate Dehydrogenase', es: 'Lactato Deshidrogenasa' },
    emoji: '⚡',
    whatItMeasures: {
      en: 'An enzyme released when cells are damaged — found in almost all tissues',
      es: 'Enzima liberada cuando hay daño celular — presente en casi todos los tejidos',
    },
    messages: {
      normal: { en: 'Your LDH is in a healthy range. No signs of tissue damage.', es: 'Tu LDH está en buen rango. Sin signos de daño tisular.' },
      borderline: { en: 'Your LDH is slightly elevated. Could be from exercise or mild tissue stress.', es: 'Tu LDH está algo elevada. Puede ser por ejercicio o estrés tisular leve.' },
      high: { en: 'Your LDH is elevated — indicates cell damage somewhere in the body. See your doctor for further evaluation.', es: 'Tu LDH está elevada — indica daño celular en algún lugar del cuerpo. Consulta a tu médico.' },
      low: { en: 'Your LDH is low — generally not clinically significant.', es: 'Tu LDH está baja — generalmente sin significado clínico.' },
    },
    whyItMatters: {
      en: 'LDH is found in almost every tissue. It rises with cell damage from any cause — heart, liver, muscle, blood, or even exercise. It\'s a general marker, not specific to one organ.',
      es: 'La LDH se encuentra en casi todos los tejidos. Sube con daño celular de cualquier causa — corazón, hígado, músculo, sangre o incluso ejercicio.',
    },
    optimalRange: { general: { min: 120, max: 246 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'cpk': {
    simpleName: { en: 'Muscle Enzyme', es: 'Enzima Muscular' },
    emoji: '💪',
    whatItMeasures: {
      en: 'An enzyme released from damaged muscles, heart, or brain tissue',
      es: 'Enzima liberada por músculos, corazón o tejido cerebral dañados',
    },
    messages: {
      normal: { en: 'Your CPK is in a healthy range. No signs of muscle damage.', es: 'Tu CPK está en buen rango. Sin signos de daño muscular.' },
      borderline: { en: 'Your CPK is slightly elevated. Often from intense exercise — monitor if persistent.', es: 'Tu CPK está algo elevada. Frecuente por ejercicio intenso — monitorea si persiste.' },
      high: { en: 'Your CPK is elevated — can indicate muscle damage, heart injury, or medication side effects (statins). See your doctor.', es: 'Tu CPK está elevada — puede indicar daño muscular, lesión cardíaca o efectos de medicamentos (estatinas). Consulta a tu médico.' },
      low: { en: 'Your CPK is low — generally not a concern.', es: 'Tu CPK está baja — generalmente no es preocupante.' },
    },
    whyItMatters: {
      en: 'CPK (Creatine Phosphokinase) rises when muscle cells are damaged. High levels can indicate rhabdomyolysis, heart attack, or statin-induced muscle damage.',
      es: 'La CPK sube cuando se dañan células musculares. Niveles altos pueden indicar rabdomiólisis, infarto o daño muscular por estatinas.',
    },
    optimalRange: {
      male: { min: 39, max: 308 },
      female: { min: 26, max: 192 },
    },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  // ── Iron metabolism ───────────────────────────────────────────────────────

  'hierro': {
    simpleName: { en: 'Iron', es: 'Hierro' },
    emoji: '🔩',
    whatItMeasures: {
      en: 'The amount of iron circulating in your blood, needed for oxygen transport',
      es: 'Cantidad de hierro circulando en la sangre, necesario para transportar oxígeno',
    },
    messages: {
      normal: { en: 'Your iron is in a healthy range. Oxygen transport and energy production are well-supported.', es: 'Tu hierro está en buen rango. Transporte de oxígeno y producción de energía bien respaldados.' },
      borderline: { en: 'Your iron is slightly off. Check ferritin for a complete picture of iron stores.', es: 'Tu hierro está algo fuera del rango. Revisa ferritina para una imagen completa de reservas de hierro.' },
      high: { en: 'Your iron is elevated — can indicate hemochromatosis or iron overload. See your doctor.', es: 'Tu hierro está elevado — puede indicar hemocromatosis o sobrecarga de hierro. Consulta a tu médico.' },
      low: { en: 'Your iron is low — this can cause fatigue, weakness, and anemia. Consider dietary changes or supplementation.', es: 'Tu hierro está bajo — puede causar fatiga, debilidad y anemia. Considera cambios dietéticos o suplementación.' },
    },
    whyItMatters: {
      en: 'Iron is essential for making hemoglobin, which carries oxygen in your blood. Deficiency is the world\'s most common nutritional disorder.',
      es: 'El hierro es esencial para producir hemoglobina, que transporta oxígeno en la sangre. La deficiencia es el trastorno nutricional más común del mundo.',
    },
    foodsToEat: {
      en: 'red meat, spinach, lentils, beans, fortified cereals, tofu (with vitamin C for better absorption)',
      es: 'carne roja, espinaca, lentejas, frijoles, cereales fortificados, tofu (con vitamina C para mejor absorción)',
    },
    foodsToAvoid: {
      en: 'coffee and tea with meals, excess dairy at same time as iron-rich foods',
      es: 'café y té con las comidas, exceso de lácteos al mismo tiempo que alimentos ricos en hierro',
    },
    optimalRange: {
      male: { min: 65, max: 176 },
      female: { min: 50, max: 170 },
    },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'hierro sérico': {
    simpleName: { en: 'Serum Iron', es: 'Hierro Sérico' },
    emoji: '🔩',
    whatItMeasures: {
      en: 'The amount of iron bound to transferrin in your blood serum',
      es: 'Cantidad de hierro unido a transferrina en el suero sanguíneo',
    },
    messages: {
      normal: { en: 'Your serum iron is in a healthy range.', es: 'Tu hierro sérico está en buen rango.' },
      borderline: { en: 'Your serum iron is slightly off. Check ferritin and transferrin for context.', es: 'Tu hierro sérico está algo fuera del rango. Revisa ferritina y transferrina.' },
      high: { en: 'Your serum iron is elevated — may indicate iron overload. See your doctor.', es: 'Tu hierro sérico está elevado — puede indicar sobrecarga de hierro. Consulta a tu médico.' },
      low: { en: 'Your serum iron is low — a sign of iron deficiency. Check ferritin.', es: 'Tu hierro sérico está bajo — signo de deficiencia de hierro. Revisa ferritina.' },
    },
    whyItMatters: {
      en: 'Serum iron reflects the amount of iron available for immediate use. Together with ferritin and transferrin, it gives a complete picture of your iron status.',
      es: 'El hierro sérico refleja la cantidad de hierro disponible para uso inmediato. Junto con ferritina y transferrina, da una imagen completa del estado de hierro.',
    },
    optimalRange: {
      male: { min: 65, max: 176 },
      female: { min: 50, max: 170 },
    },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'transferrina': {
    simpleName: { en: 'Iron Transport', es: 'Transferrina' },
    emoji: '🚚',
    whatItMeasures: {
      en: 'The protein that carries iron through your bloodstream',
      es: 'Proteína que transporta hierro por el torrente sanguíneo',
    },
    messages: {
      normal: { en: 'Your transferrin is in a healthy range. Iron transport is working well.', es: 'Tu transferrina está en buen rango. El transporte de hierro funciona bien.' },
      borderline: { en: 'Your transferrin is slightly off. Check iron and ferritin for a complete picture.', es: 'Tu transferrina está algo fuera del rango. Revisa hierro y ferritina.' },
      high: { en: 'Your transferrin is elevated — often means your body needs more iron (iron deficiency).', es: 'Tu transferrina está elevada — frecuentemente indica que tu cuerpo necesita más hierro (deficiencia).' },
      low: { en: 'Your transferrin is low — can indicate chronic inflammation, liver disease, or iron overload.', es: 'Tu transferrina está baja — puede indicar inflamación crónica, enfermedad hepática o sobrecarga de hierro.' },
    },
    whyItMatters: {
      en: 'Transferrin is the taxi that moves iron through your blood. High transferrin with low iron = iron deficiency. Low transferrin can indicate chronic disease or liver problems.',
      es: 'La transferrina es el taxi que mueve hierro por la sangre. Transferrina alta con hierro bajo = deficiencia de hierro. Transferrina baja puede indicar enfermedad crónica.',
    },
    optimalRange: { general: { min: 200, max: 360 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  'saturación de transferrina': {
    simpleName: { en: 'Iron Saturation', es: 'Saturación de Transferrina' },
    emoji: '📊',
    whatItMeasures: {
      en: 'The percentage of transferrin that is carrying iron — indicates iron availability',
      es: 'Porcentaje de transferrina que está transportando hierro — indica disponibilidad de hierro',
    },
    messages: {
      normal: { en: 'Your iron saturation is in a healthy range. Iron supply and demand are balanced.', es: 'Tu saturación de transferrina está en buen rango. Oferta y demanda de hierro están equilibradas.' },
      borderline: { en: 'Your iron saturation is slightly off. Monitor alongside ferritin.', es: 'Tu saturación de transferrina está algo fuera del rango. Monitorea junto con ferritina.' },
      high: { en: 'Your iron saturation is elevated — can indicate iron overload (hemochromatosis). See your doctor.', es: 'Tu saturación de transferrina está elevada — puede indicar sobrecarga de hierro (hemocromatosis). Consulta a tu médico.' },
      low: { en: 'Your iron saturation is low — confirms iron deficiency. Consider supplementation.', es: 'Tu saturación de transferrina está baja — confirma deficiencia de hierro. Considera suplementación.' },
    },
    whyItMatters: {
      en: 'Iron saturation tells you what fraction of the iron-carrying protein is actually loaded with iron. Low saturation confirms iron deficiency; high saturation can indicate dangerous iron overload.',
      es: 'La saturación de transferrina indica qué fracción de la proteína transportadora de hierro está cargada con hierro. Baja saturación confirma deficiencia; alta puede indicar sobrecarga peligrosa.',
    },
    optimalRange: { general: { min: 20, max: 50 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  // ── Thyroid (additional) ──────────────────────────────────────────────────

  't3 libre': {
    simpleName: { en: 'Free T3', es: 'T3 Libre' },
    emoji: '🦋',
    whatItMeasures: {
      en: 'The active form of thyroid hormone that directly regulates metabolism',
      es: 'La forma activa de hormona tiroidea que regula directamente el metabolismo',
    },
    messages: {
      normal: { en: 'Your Free T3 is in a healthy range. Thyroid hormone is working well.', es: 'Tu T3 Libre está en buen rango. La hormona tiroidea funciona bien.' },
      borderline: { en: 'Your Free T3 is slightly off. Check TSH and T4 for the full thyroid picture.', es: 'Tu T3 Libre está algo fuera del rango. Revisa TSH y T4 para la imagen completa.' },
      high: { en: 'Your Free T3 is elevated — may indicate hyperthyroidism. You may feel anxious or have a fast heart rate.', es: 'Tu T3 Libre está elevada — puede indicar hipertiroidismo. Puedes sentir ansiedad o taquicardia.' },
      low: { en: 'Your Free T3 is low — may indicate hypothyroidism or conversion problems. See your doctor.', es: 'Tu T3 Libre está baja — puede indicar hipotiroidismo o problemas de conversión. Consulta a tu médico.' },
    },
    whyItMatters: {
      en: 'Free T3 is the most active thyroid hormone. Your body converts T4 into T3. Low T3 even with normal TSH can explain fatigue and weight gain.',
      es: 'La T3 Libre es la hormona tiroidea más activa. El cuerpo convierte T4 en T3. T3 baja incluso con TSH normal puede explicar fatiga y aumento de peso.',
    },
    optimalRange: { general: { min: 2.3, max: 4.2 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  't4 libre': {
    simpleName: { en: 'Free T4', es: 'T4 Libre' },
    emoji: '🦋',
    whatItMeasures: {
      en: 'The main thyroid hormone circulating in your blood, ready to be converted to active T3',
      es: 'La principal hormona tiroidea circulante, lista para convertirse en T3 activa',
    },
    messages: {
      normal: { en: 'Your Free T4 is in a healthy range. Thyroid production is on track.', es: 'Tu T4 Libre está en buen rango. La producción tiroidea está bien.' },
      borderline: { en: 'Your Free T4 is slightly off. Evaluate alongside TSH for a complete picture.', es: 'Tu T4 Libre está algo fuera del rango. Evalúa junto con TSH para una imagen completa.' },
      high: { en: 'Your Free T4 is elevated — suggests hyperthyroidism. See your doctor.', es: 'Tu T4 Libre está elevada — sugiere hipertiroidismo. Consulta a tu médico.' },
      low: { en: 'Your Free T4 is low — suggests hypothyroidism. Your doctor may recommend thyroid medication.', es: 'Tu T4 Libre está baja — sugiere hipotiroidismo. Tu médico puede recomendar medicación tiroidea.' },
    },
    whyItMatters: {
      en: 'Free T4 is the thyroid\'s main output. Together with TSH, it\'s the standard way to diagnose thyroid disorders. Low T4 with high TSH = hypothyroidism. High T4 with low TSH = hyperthyroidism.',
      es: 'La T4 Libre es el principal producto de la tiroides. Junto con TSH, es la forma estándar de diagnosticar trastornos tiroideos.',
    },
    optimalRange: { general: { min: 0.8, max: 1.8 } },
    sampleType: 'blood',
    reviewEveryMonths: 12,
  },

  // ── Urine (physical/microscopic) ──────────────────────────────────────────

  'color (orina)': {
    simpleName: { en: 'Urine Color', es: 'Color de Orina' },
    emoji: '🎨',
    whatItMeasures: {
      en: 'The color of your urine — indicates hydration and potential health issues',
      es: 'El color de la orina — indica hidratación y posibles problemas de salud',
    },
    messages: {
      normal: { en: 'Your urine color is normal (pale to dark yellow). Hydration looks good.', es: 'El color de tu orina es normal (amarillo pálido a oscuro). Hidratación adecuada.' },
      borderline: { en: 'Your urine color is slightly unusual. Monitor hydration and diet.', es: 'El color de tu orina está algo inusual. Vigila tu hidratación y dieta.' },
      high: { en: 'Your urine has an unusual color — dark amber, red, or brown can indicate dehydration, blood, or liver issues.', es: 'Tu orina tiene un color inusual — ámbar oscuro, rojo o marrón puede indicar deshidratación, sangre o problemas hepáticos.' },
      low: { en: 'Very pale or colorless urine usually indicates overhydration — not typically a concern.', es: 'Orina muy pálida o incolora usualmente indica sobrehidratación — no es preocupante.' },
    },
    whyItMatters: {
      en: 'Urine color is a quick indicator of hydration status and can reveal blood, liver byproducts, or medication effects.',
      es: 'El color de la orina es un indicador rápido del estado de hidratación y puede revelar sangre, subproductos hepáticos o efectos de medicamentos.',
    },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },

  'aspecto (orina)': {
    simpleName: { en: 'Urine Appearance', es: 'Aspecto de Orina' },
    emoji: '👁️',
    whatItMeasures: {
      en: 'Whether your urine is clear or cloudy — cloudiness can indicate infection',
      es: 'Si la orina es clara o turbia — la turbidez puede indicar infección',
    },
    messages: {
      normal: { en: 'Your urine is clear — no signs of infection or contamination.', es: 'Tu orina es clara — sin signos de infección o contaminación.' },
      borderline: { en: 'Your urine is slightly cloudy. Could be from mucus, crystals, or mild infection.', es: 'Tu orina está algo turbia. Puede ser por mucosidad, cristales o infección leve.' },
      high: { en: 'Your urine is cloudy — can indicate infection, protein, or white blood cells. See your doctor.', es: 'Tu orina está turbia — puede indicar infección, proteína o glóbulos blancos. Consulta a tu médico.' },
      low: { en: 'Clear urine — this is the normal appearance.', es: 'Orina clara — esta es la apariencia normal.' },
    },
    whyItMatters: {
      en: 'Clear urine is normal. Cloudy urine can indicate bacteria, white blood cells, crystals, or protein — all warranting investigation.',
      es: 'Orina clara es normal. Orina turbia puede indicar bacterias, glóbulos blancos, cristales o proteína — todos ameritan investigación.',
    },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },

  'ph (orina)': {
    simpleName: { en: 'Urine pH', es: 'pH Urinario' },
    emoji: '⚗️',
    whatItMeasures: {
      en: 'How acidic or alkaline your urine is — reflects diet and kidney function',
      es: 'Qué tan ácida o alcalina es la orina — refleja dieta y función renal',
    },
    messages: {
      normal: { en: 'Your urine pH is in a healthy range. Acid-base balance is maintained.', es: 'El pH de tu orina está en rango normal. El equilibrio ácido-base se mantiene.' },
      borderline: { en: 'Your urine pH is slightly off. This often reflects diet more than disease.', es: 'El pH de tu orina está algo fuera del rango. Frecuentemente refleja dieta más que enfermedad.' },
      high: { en: 'Your urine is more alkaline than normal. Can be related to UTIs, diet, or kidney stones (certain types).', es: 'Tu orina es más alcalina de lo normal. Puede relacionarse con infecciones, dieta o cálculos renales.' },
      low: { en: 'Your urine is more acidic than normal. Can be from high-protein diet, dehydration, or metabolic conditions.', es: 'Tu orina es más ácida de lo normal. Puede ser por dieta alta en proteínas, deshidratación o condiciones metabólicas.' },
    },
    whyItMatters: {
      en: 'Urine pH helps assess kidney function and risk of kidney stones. Very acidic urine promotes uric acid stones; very alkaline urine promotes phosphate stones.',
      es: 'El pH urinario ayuda a evaluar función renal y riesgo de cálculos. Orina muy ácida promueve cálculos de ácido úrico; muy alcalina promueve cálculos de fosfato.',
    },
    optimalRange: { general: { min: 5.0, max: 7.0 } },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },

  'densidad (orina)': {
    simpleName: { en: 'Urine Density', es: 'Densidad Urinaria' },
    emoji: '💧',
    whatItMeasures: {
      en: 'How concentrated your urine is — reflects hydration and kidney concentrating ability',
      es: 'Qué tan concentrada está la orina — refleja hidratación y capacidad renal de concentración',
    },
    messages: {
      normal: { en: 'Your urine density is in a healthy range. Hydration and kidney function look good.', es: 'La densidad de tu orina está en rango normal. Hidratación y función renal bien.' },
      borderline: { en: 'Your urine density is slightly off. Make sure you are drinking enough water.', es: 'La densidad de tu orina está algo fuera del rango. Asegúrate de tomar suficiente agua.' },
      high: { en: 'Your urine is very concentrated — likely dehydration. Drink more water.', es: 'Tu orina está muy concentrada — probablemente deshidratación. Toma más agua.' },
      low: { en: 'Your urine is very dilute — could indicate excessive fluid intake or kidney concentrating issues.', es: 'Tu orina está muy diluida — puede indicar exceso de líquidos o problemas de concentración renal.' },
    },
    whyItMatters: {
      en: 'Urine density (specific gravity) measures how well your kidneys concentrate urine. Consistently low density can suggest kidney damage; high density usually means dehydration.',
      es: 'La densidad urinaria mide qué tan bien concentran la orina tus riñones. Densidad persistentemente baja puede sugerir daño renal; alta usualmente indica deshidratación.',
    },
    optimalRange: { general: { min: 1.005, max: 1.030 } },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },

  'células epiteliales': {
    simpleName: { en: 'Epithelial Cells', es: 'Células Epiteliales' },
    emoji: '🔬',
    whatItMeasures: {
      en: 'Cells from the lining of the urinary tract found in your urine sample',
      es: 'Células del revestimiento del tracto urinario encontradas en la muestra de orina',
    },
    messages: {
      normal: { en: 'Few epithelial cells — normal finding. Sample collection was clean.', es: 'Pocas células epiteliales — hallazgo normal. La recolección fue limpia.' },
      borderline: { en: 'Moderate epithelial cells — could mean the sample was slightly contaminated. Consider retesting.', es: 'Células epiteliales moderadas — puede significar contaminación leve de la muestra. Considera repetir.' },
      high: { en: 'Many epithelial cells — the sample may be contaminated. A new sample may be needed.', es: 'Muchas células epiteliales — la muestra puede estar contaminada. Puede necesitarse una nueva muestra.' },
      low: { en: 'Very few epithelial cells — excellent sample quality.', es: 'Muy pocas células epiteliales — excelente calidad de muestra.' },
    },
    whyItMatters: {
      en: 'A few epithelial cells in urine are normal. Many cells suggest the sample may be contaminated from the skin, making other results less reliable.',
      es: 'Pocas células epiteliales en orina son normales. Muchas sugieren contaminación de la piel, haciendo otros resultados menos confiables.',
    },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },

  'cristales': {
    simpleName: { en: 'Crystals', es: 'Cristales' },
    emoji: '💎',
    whatItMeasures: {
      en: 'Mineral crystals in your urine — related to kidney stone risk',
      es: 'Cristales minerales en la orina — relacionados con riesgo de cálculos renales',
    },
    messages: {
      normal: { en: 'No crystals found in your urine — good for kidney stone prevention.', es: 'No se encontraron cristales en la orina — bueno para prevención de cálculos renales.' },
      borderline: { en: 'A few crystals found. Stay well-hydrated to prevent stone formation.', es: 'Se encontraron algunos cristales. Mantente hidratado para prevenir formación de cálculos.' },
      high: { en: 'Crystals are present in your urine. This increases kidney stone risk. Drink more water and see your doctor.', es: 'Hay cristales en la orina. Aumenta el riesgo de cálculos renales. Toma más agua y consulta a tu médico.' },
      low: { en: 'No crystals — this is normal.', es: 'Sin cristales — esto es normal.' },
    },
    whyItMatters: {
      en: 'Urinary crystals form when certain minerals become too concentrated. They are the building blocks of kidney stones. Good hydration is the best prevention.',
      es: 'Los cristales urinarios se forman cuando ciertos minerales se concentran demasiado. Son los bloques de construcción de cálculos renales. La buena hidratación es la mejor prevención.',
    },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },

  'cilindros': {
    simpleName: { en: 'Casts', es: 'Cilindros' },
    emoji: '🔬',
    whatItMeasures: {
      en: 'Tube-shaped protein structures formed in the kidneys — indicate kidney health',
      es: 'Estructuras proteicas tubulares formadas en los riñones — indican salud renal',
    },
    messages: {
      normal: { en: 'No significant casts found — your kidneys are healthy.', es: 'No se encontraron cilindros significativos — tus riñones están sanos.' },
      borderline: { en: 'A few hyaline casts found — can be normal after exercise or dehydration.', es: 'Se encontraron algunos cilindros hialinos — puede ser normal tras ejercicio o deshidratación.' },
      high: { en: 'Casts found in your urine — may indicate kidney inflammation or disease. See your doctor.', es: 'Se encontraron cilindros en la orina — puede indicar inflamación o enfermedad renal. Consulta a tu médico.' },
      low: { en: 'No casts — this is normal.', es: 'Sin cilindros — esto es normal.' },
    },
    whyItMatters: {
      en: 'Casts form in the kidney tubules. Different types indicate different conditions — hyaline casts are often benign, but granular, waxy, or red blood cell casts suggest kidney disease.',
      es: 'Los cilindros se forman en los túbulos renales. Diferentes tipos indican diferentes condiciones — los hialinos suelen ser benignos, pero los granulares o cerosos sugieren enfermedad renal.',
    },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },

  'bacterias': {
    simpleName: { en: 'Bacteria', es: 'Bacterias' },
    emoji: '🦠',
    whatItMeasures: {
      en: 'Whether bacteria are present in your urine, which can indicate infection',
      es: 'Si hay bacterias presentes en la orina, lo cual puede indicar infección',
    },
    messages: {
      normal: { en: 'No bacteria found in your urine — no signs of infection.', es: 'No se encontraron bacterias en la orina — sin signos de infección.' },
      borderline: { en: 'A few bacteria found — could be contamination or early infection. Monitor symptoms.', es: 'Se encontraron pocas bacterias — puede ser contaminación o infección temprana. Vigila síntomas.' },
      high: { en: 'Bacteria are present in your urine — strongly suggests a urinary tract infection. See your doctor.', es: 'Hay bacterias en la orina — sugiere fuertemente una infección urinaria. Consulta a tu médico.' },
      low: { en: 'No bacteria — this is normal.', es: 'Sin bacterias — esto es normal.' },
    },
    whyItMatters: {
      en: 'Bacteria in urine (bacteriuria) usually indicate a urinary tract infection, especially when combined with positive nitrites and white blood cells.',
      es: 'Bacterias en orina (bacteriuria) usualmente indican infección urinaria, especialmente combinadas con nitritos positivos y glóbulos blancos.',
    },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },

  'levaduras': {
    simpleName: { en: 'Yeast', es: 'Levaduras' },
    emoji: '🍄',
    whatItMeasures: {
      en: 'Whether yeast (fungal organisms) are present in your urine',
      es: 'Si hay levaduras (organismos fúngicos) presentes en la orina',
    },
    messages: {
      normal: { en: 'No yeast found in your urine — no signs of fungal infection.', es: 'No se encontraron levaduras en la orina — sin signos de infección fúngica.' },
      borderline: { en: 'A few yeast cells found — could be contamination or early fungal infection.', es: 'Se encontraron pocas levaduras — puede ser contaminación o infección fúngica temprana.' },
      high: { en: 'Yeast is present in your urine — may indicate a fungal urinary infection. See your doctor.', es: 'Hay levaduras en la orina — puede indicar infección urinaria fúngica. Consulta a tu médico.' },
      low: { en: 'No yeast — this is normal.', es: 'Sin levaduras — esto es normal.' },
    },
    whyItMatters: {
      en: 'Yeast in urine can indicate a fungal urinary tract infection, common in people with diabetes, weakened immunity, or on antibiotics.',
      es: 'Las levaduras en orina pueden indicar infección urinaria fúngica, común en personas con diabetes, inmunidad debilitada o en tratamiento con antibióticos.',
    },
    sampleType: 'urine',
    reviewEveryMonths: 12,
  },
};

// ── Alias map for AI-extracted names that may differ from keys ────────────────
// Maps common AI-extracted Spanish names to their knowledge-base key.
const ALIASES: Record<string, string> = {
  'glucosa en orina':        'glucosa (orina)',
  'glucosa orina':           'glucosa (orina)',
  'albúmina en orina':       'albúmina (orina)',
  'albumina en orina':       'albúmina (orina)',
  'albumina (orina)':        'albúmina (orina)',
  'albumina orina':          'albúmina (orina)',
  'proteína en orina':       'albúmina (orina)',
  'nitratos':                'nitratos',
  'nitritos':                'nitritos',
  'nitratos / nitritos':     'nitritos',
  'nitratos/nitritos':       'nitritos',
  'acetona':                 'acetona',
  'cetonas':                 'cetonas',
  'cuerpos cetónicos':       'cetonas',
  'ketones':                 'cetonas',
  'sangre oculta':           'sangre oculta',
  'sangre oculta en orina':  'sangre oculta',
  'hemoglobina (orina)':     'sangre oculta',
  'sangre':                  'sangre oculta',
  'bilis':                   'bilis',
  'bilirrubina (orina)':     'bilirrubina (orina)',
  'bilirrubina en orina':    'bilirrubina (orina)',
  'bilirrubina orina':       'bilirrubina (orina)',
  'urobilinógeno':           'urobilinógeno',
  'urobilinogeno':           'urobilinógeno',
  'glóbulos blancos (orina)':'glóbulos blancos (orina)',
  'globulos blancos (orina)':'glóbulos blancos (orina)',
  'leucocitos (orina)':      'leucocitos (orina)',
  'leucocitos en orina':     'leucocitos (orina)',
  'glóbulos blancos en orina':'glóbulos blancos (orina)',
  // Hematology aliases
  'basofilos':               'basófilos',
  'eosinofilos':             'eosinófilos',
  'glóbulos rojos':          'eritrocitos',
  'globulos rojos':          'eritrocitos',
  'mcv':                     'vcm',
  'mch':                     'hcm',
  'mchc':                    'chcm',
  'ccmh':                    'chcm',
  // Renal aliases
  'bun':                     'nitrógeno de urea',
  'nitrógeno ureico':        'nitrógeno de urea',
  'nitrogeno de urea':       'nitrógeno de urea',
  'nitrogeno ureico':        'nitrógeno de urea',
  'acido urico':             'ácido úrico',
  // Liver aliases
  'proteinas totales':       'proteínas totales',
  'alp':                     'fosfatasa alcalina',
  'relacion a/g':            'relación a/g',
  // Metabolic aliases
  'ck':                      'cpk',
  'creatina quinasa':        'cpk',
  'creatina kinasa':         'cpk',
  'lactato deshidrogenasa':  'ldh',
  'deshidrogenasa láctica':  'ldh',
  // Iron aliases
  'iron':                    'hierro',
  'saturacion de transferrina': 'saturación de transferrina',
  // Thyroid aliases
  'ft3':                     't3 libre',
  'ft4':                     't4 libre',
  // Urine physical aliases
  'color':                   'color (orina)',
  'color orina':             'color (orina)',
  'aspecto':                 'aspecto (orina)',
  'aspecto orina':           'aspecto (orina)',
  'ph':                      'ph (orina)',
  'ph orina':                'ph (orina)',
  'ph urinario':             'ph (orina)',
  'densidad':                'densidad (orina)',
  'densidad orina':          'densidad (orina)',
  'densidad urinaria':       'densidad (orina)',
  'gravedad específica':     'densidad (orina)',
  'celulas epiteliales':     'células epiteliales',
  'células epiteliales planas': 'células epiteliales',
};

// ── Lookup helpers ────────────────────────────────────────────────────────────

/**
 * Finds knowledge for a biomarker by name (case-insensitive, fuzzy match).
 * Checks alias map first, then exact key, then fuzzy substring matching.
 */
export function getBiomarkerKnowledge(name: string): BiomarkerKnowledge | null {
  const lower = name.toLowerCase().trim();

  // 1. Check alias map first (handles urine-specific names)
  if (ALIASES[lower] && K[ALIASES[lower]]) return K[ALIASES[lower]];

  // 2. Direct key match
  if (K[lower]) return K[lower];

  // 3. Fuzzy substring match
  for (const key of Object.keys(K)) {
    if (lower.includes(key) || key.includes(lower)) return K[key];
  }
  return null;
}

/**
 * Returns the plain-language message for a specific status, in the given language.
 */
export function getStatusMessage(
  name: string,
  status: string,
  lang: BioLang = 'en',
): string | null {
  const k = getBiomarkerKnowledge(name);
  if (!k) return null;
  const msgs = k.messages[status as keyof typeof k.messages];
  if (!msgs) return null;
  return msgs[lang];
}

/**
 * Returns how many months since the last test, and whether a retest is due.
 * No language-specific strings — let the caller handle i18n.
 */
export function getRetestStatus(lastTestDate: string, name: string): {
  monthsAgo: number;
  isDue: boolean;
  isOverdue: boolean;
} {
  const k = getBiomarkerKnowledge(name);
  const interval = k?.reviewEveryMonths ?? 12;
  const now = new Date();
  const last = new Date(lastTestDate);
  const diffMs = now.getTime() - last.getTime();
  const monthsAgo = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));

  return {
    monthsAgo,
    isDue: monthsAgo >= interval * 0.8,
    isOverdue: monthsAgo >= interval,
  };
}
