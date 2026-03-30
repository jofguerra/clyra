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
    reviewEveryMonths: 12,
  },
};

// ── Lookup helpers ────────────────────────────────────────────────────────────

/**
 * Finds knowledge for a biomarker by name (case-insensitive, fuzzy match).
 */
export function getBiomarkerKnowledge(name: string): BiomarkerKnowledge | null {
  const lower = name.toLowerCase().trim();
  if (K[lower]) return K[lower];
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
