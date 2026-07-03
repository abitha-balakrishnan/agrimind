// Local keyword-based RAG fallback when ChromaDB is unavailable
const CROP_KB = [
    'Crop: Rice. Best grown in clayey, loamy soil holding water. Requires heavy rainfall (above 100cm) and high temperature (above 25°C). Kharif crop.',
    'Crop: Wheat. Requires well-drained fertile loamy and clayey loamy soil. Cool growing season and bright sunshine at ripening. Rabi crop.',
    'Crop: Maize. Requires well-drained fertile soil, ideally old alluvial soil. Temperature 21°C to 27°C. Kharif crop.',
    'Crop: Tomato. A warm-season crop. Sandy loam soil with good drainage is ideal. pH 6.0-7.0. Frost sensitive.',
    'Crop: Cotton. Grows well in drier parts of black cotton soil. Requires high temperature, light rainfall, 210 frost-free days.',
    'Crop: Soybean. Requires warm climate, loamy and well-drained soil. Temperature 20°C to 30°C. Kharif crop in many regions.',
];

const PEST_KB = [
    'Pest/Disease: Leaf Blight. Fungal or bacterial disease causing dark spots or browning on leaves. Treatment: Fungicides containing Copper or Mancozeb.',
    'Pest/Disease: Aphids. Small, sap-sucking insects causing curled/yellowing leaves. Treatment: Neem oil, insecticidal soap.',
    'Pest/Disease: Powdery Mildew. Fungal disease looking like white powder on leaves. Treatment: Sulfur-based fungicides, Potassium bicarbonate.',
    'Pest/Disease: Early Blight. Fungal disease causing concentric dark rings on older leaves. Treatment: Chlorothalonil or Copper fungicides.',
    'Pest/Disease: Whitefly. Tiny white winged insects causing yellowing and transmitting viruses. Treatment: Yellow sticky traps, Neem oil.',
    'Pest/Disease: Rust. Fungal disease causing reddish-brown or orange pustules on leaves. Treatment: Propiconazole or Tebuconazole fungicides.',
];

const scoreDoc = (query, doc) => {
    const terms = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);
    const lower = doc.toLowerCase();
    return terms.reduce((score, term) => score + (lower.includes(term) ? 1 : 0), 0);
};

export const queryFallback = (collection, queryText, nResults = 3) => {
    const kb = collection === 'pest_kb' ? PEST_KB : CROP_KB;
    const ranked = kb
        .map(doc => ({ doc, score: scoreDoc(queryText, doc) }))
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, nResults);

    if (ranked.length === 0) {
        return kb.slice(0, nResults).join('\n');
    }
    return ranked.map(r => r.doc).join('\n');
};
