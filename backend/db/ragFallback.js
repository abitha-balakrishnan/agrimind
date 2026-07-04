import {
    loadDatasets,
    buildCropContext,
    buildFertilizerContext,
    findCropsForQuery,
    formatCropDoc,
    formatFertilizerDoc,
    findFertilizerForCrop,
} from '../knowledge/dataService.js';

loadDatasets();

const PEST_KB = [
    'Pest/Disease: Leaf Blight. Fungal or bacterial disease causing dark spots or browning on leaves. Treatment: Fungicides containing Copper or Mancozeb.',
    'Pest/Disease: Aphids. Small, sap-sucking insects causing curled/yellowing leaves. Treatment: Neem oil, insecticidal soap.',
    'Pest/Disease: Powdery Mildew. Fungal disease looking like white powder on leaves. Treatment: Sulfur-based fungicides, Potassium bicarbonate.',
    'Pest/Disease: Early Blight. Fungal disease causing concentric dark rings on older leaves. Treatment: Chlorothalonil or Copper fungicides.',
    'Pest/Disease: Whitefly. Tiny white winged insects causing yellowing and transmitting viruses. Treatment: Yellow sticky traps, Neem oil.',
    'Pest/Disease: Rust. Fungal disease causing reddish-brown or orange pustules on leaves. Treatment: Propiconazole or Tebuconazole fungicides.',
    'Pest/Disease: Tomato Leaf Curl. Virus spread by whiteflies causing upward curling of tomato leaves. Treatment: Control whiteflies with neem spray; remove infected plants.',
    'Pest/Disease: Bacterial Leaf Spot. Water-soaked lesions on leaves turning brown. Treatment: Copper-based bactericides.',
];

const scoreDoc = (query, doc) => {
    const terms = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
    const lower = doc.toLowerCase();
    return terms.reduce((score, term) => score + (lower.includes(term) ? 1 : 0), 0);
};

export const queryFallback = (collection, queryText, nResults = 3) => {
    if (collection === 'pest_kb') {
        const ranked = PEST_KB
            .map(doc => ({ doc, score: scoreDoc(queryText, doc) }))
            .filter(r => r.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, nResults);
        if (ranked.length === 0) return PEST_KB.slice(0, nResults).join('\n');
        return ranked.map(r => r.doc).join('\n');
    }

    if (collection === 'fertilizer_kb') {
        const ctx = buildFertilizerContext(typeof queryText === 'string' && queryText.startsWith('{')
            ? JSON.parse(queryText)
            : { crop: queryText, soilType: 'Loamy' });
        const fert = findFertilizerForCrop(queryText);
        const docs = fert ? [formatFertilizerDoc(fert), ctx] : [ctx];
        return docs.join('\n');
    }

    // crop_kb — use dataset
    try {
        const parsed = queryText.startsWith('{') ? JSON.parse(queryText) : null;
        if (parsed?.soilType) {
            return buildCropContext(parsed, nResults);
        }
    } catch { /* use keyword search */ }

    const crops = findCropsForQuery(queryText, nResults);
    if (crops.length === 0) {
        return findCropsForQuery('rice wheat tomato', nResults).map(formatCropDoc).join('\n');
    }
    return crops.map(formatCropDoc).join('\n');
};
