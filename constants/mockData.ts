export const mockBiomarkers = [
    { name: "Vitamina D", value: "42 ng/mL", status: "Optimal", trend: "up", ref: "30-100" },
    { name: "Ferritina", value: "28 ng/mL", status: "Borderline", trend: "up", ref: "30-300" },
    { name: "TSH", value: "2.1 mIU/L", status: "Optimal", trend: "stable", ref: "0.4-4.0" },
    { name: "Colesterol LDL", value: "145 mg/dL", status: "Attention", trend: "down", ref: "<100" },
    { name: "Vitamina B12", value: "520 pg/mL", status: "Optimal", trend: "stable", ref: "200-900" },
    { name: "Hemoglobina", value: "14.2 g/dL", status: "Optimal", trend: "stable", ref: "12-17" },
    { name: "Glucosa en Ayunas", value: "95 mg/dL", status: "Borderline", trend: "up", ref: "70-100" },
    { name: "Proteína C Reactiva", value: "0.8 mg/L", status: "Optimal", trend: "down", ref: "<1.0" },
];

export const mockActionPlan = [
    { label: "Tomar suplemento de Vitamina D (2000 UI)", done: true },
    { label: "Añadir alimentos ricos en hierro al almuerzo", done: true },
    { label: "30 minutos de ejercicio cardiovascular", done: false },
    { label: "Reducir ingesta de alimentos procesados", done: false },
    { label: "Programar panel de lípidos de seguimiento", done: false },
];

export const mockAiResponses = {
    ferritin: "Tu ferritina está en 28 ng/mL, lo cual está por debajo del rango óptimo (50-150). Te sugiero aumentar la ingesta de hierro...",
    ldl: "Tu colesterol LDL es de 145 mg/dL, por encima del rango óptimo que es menor a 100...",
    recovery: "Para optimizar la recuperación, céntrate en estos marcadores: Proteína C Reactiva, Ferritina y Vitamina D...",
    default: "Entiendo. ¿Puedes proporcionarme más detalles sobre tus resultados de laboratorio para poder darte una respuesta más precisa?",
};

export const mockBiomarkerDetails: any = {
    "Vitamina D": {
        value: "42", unit: "ng/mL", status: "Optimal",
        referenceRange: "30-100", optimalRange: "40-60",
        description: "La vitamina D es esencial para la salud de los huesos, la función inmunológica y la regulación del estado de ánimo.",
        insight: "Tus niveles han mejorado significativamente en los últimos 3 meses, subiendo de 28 a 42 ng/mL.",
        actions: ["Continuar tomando 2000 UI de Vitamina D3 al día", "Tomar 15 min de sol por la mañana", "Volver a evaluar en 3 meses"],
        history: [22, 25, 28, 33, 38, 42]
    },
    "Ferritina": {
        value: "28", unit: "ng/mL", status: "Borderline",
        referenceRange: "30-300", optimalRange: "50-150",
        description: "La ferritina refleja las reservas de hierro de tu cuerpo.",
        insight: "Tu ferritina está ligeramente por debajo del rango estándar y muy por debajo del óptimo.",
        actions: ["Comer alimentos ricos en hierro", "Acompañar el hierro con vitamina C", "Evitar el té/café con las comidas", "Considerar un suplemento de bisglicinato de hierro"],
        history: [18, 20, 22, 24, 26, 28]
    }
};
