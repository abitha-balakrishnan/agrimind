import { ChromaClient } from 'chromadb';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    loadDatasets,
    getCropSummaries,
    getFertilizerRecords,
    formatCropDoc,
    formatFertilizerDoc,
} from '../knowledge/dataService.js';
import { queryFallback } from '../db/ragFallback.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PESTS = [
    { id: 'pest-1', name: 'Leaf Blight', info: 'Fungal or bacterial disease causing dark spots or browning on leaves. Treatment: Fungicides containing Copper or Mancozeb. Ensure good air circulation.' },
    { id: 'pest-2', name: 'Aphids', info: 'Small, sap-sucking insects causing curled/yellowing leaves. Treatment: Neem oil, insecticidal soap, or introducing ladybugs.' },
    { id: 'pest-3', name: 'Stem Borer', info: 'Larvae that bore into stems causing dead heart or white earheads in crops like rice. Treatment: Chlorantraniliprole, Cartap hydrochloride.' },
    { id: 'pest-4', name: 'Whitefly', info: 'Tiny white winged insects causing yellowing and transmitting viruses. Treatment: Yellow sticky traps, Neem oil, Imidacloprid.' },
    { id: 'pest-5', name: 'Powdery Mildew', info: 'Fungal disease looking like white powder on leaves. Treatment: Sulfur-based fungicides, Potassium bicarbonate.' },
    { id: 'pest-6', name: 'Fall Armyworm', info: 'Devastating caterpillar chewing large holes in leaves (especially maize). Treatment: Spinetoram, Emamectin benzoate.' },
    { id: 'pest-7', name: 'Spider Mites', info: 'Tiny arachnids causing stippling or yellowing on leaves, fine webbing. Treatment: Miticides, forceful water spray, Neem oil.' },
    { id: 'pest-8', name: 'Root Knot Nematodes', info: 'Microscopic worms forming galls on roots, stunting growth. Treatment: Crop rotation with non-hosts, solarization, nematicides.' },
    { id: 'pest-9', name: 'Thrips', info: 'Tiny insects causing silvery stippling on leaves and fruit scarring. Treatment: Spinosad, Neem oil, insecticidal soap.' },
    { id: 'pest-10', name: 'Rust', info: 'Fungal disease causing reddish-brown or orange pustules on leaves. Treatment: Propiconazole or Tebuconazole fungicides.' },
    { id: 'pest-11', name: 'Mealybugs', info: 'White, cottony masses on stems/leaves sucking sap. Treatment: Isopropyl alcohol dab, Horticultural oils, Neem oil.' },
    { id: 'pest-12', name: 'Early Blight', info: 'Fungal disease causing concentric dark rings on older leaves (bullseye pattern). Treatment: Chlorothalonil or Copper fungicides.' },
    { id: 'pest-13', name: 'Tomato Leaf Curl', info: 'Virus spread by whiteflies causing upward curling and yellowing of tomato leaves. Treatment: Control whiteflies with yellow traps and neem spray; remove infected plants.' },
    { id: 'pest-14', name: 'Bacterial Leaf Spot', info: 'Water-soaked lesions on leaves turning brown. Treatment: Copper-based bactericides, avoid overhead irrigation.' },
];

const parseChromaUri = (uri) => {
    const url = new URL(uri || 'http://localhost:8000');
    return { host: url.hostname, port: url.port ? Number(url.port) : 8000, ssl: url.protocol === 'https:' };
};

const chromaClient = new ChromaClient(parseChromaUri(process.env.CHROMA_URI));

const seedCollection = async (name, items, label, forceReseed = false) => {
    const collection = await chromaClient.getOrCreateCollection({ name });
    const count = await collection.count();

    if (count > 0 && !forceReseed) {
        console.log(`${label} collection already has ${count} items. Skipping.`);
        return count;
    }

    if (count > 0 && forceReseed) {
        const all = await collection.get();
        if (all.ids?.length) await collection.delete({ ids: all.ids });
    }

    await collection.add({
        ids: items.map(i => i.id),
        documents: items.map(i => i.document),
        metadatas: items.map(i => i.metadata),
    });
    console.log(`Seeded ${items.length} ${label.toLowerCase()} entries.`);
    return items.length;
};

const buildCropItems = () => {
    loadDatasets();
    return getCropSummaries().map((c, i) => ({
        id: `crop-ds-${i}`,
        document: formatCropDoc(c),
        metadata: { name: c.name, type: 'crop', source: 'Crop_recommendation.csv' },
    }));
};

const buildFertilizerItems = () => {
    loadDatasets();
    return getFertilizerRecords().map((r, i) => ({
        id: `fert-${i}`,
        document: formatFertilizerDoc(r),
        metadata: { crop: r.Crop, type: 'fertilizer', source: 'fertilizer.csv' },
    }));
};

const buildPestItems = () =>
    PESTS.map(p => ({
        id: p.id,
        document: `Pest/Disease: ${p.name}. ${p.info}`,
        metadata: { name: p.name, type: 'pest' },
    }));

const seedDatabase = async () => {
    const forceReseed = process.argv.includes('--force');

    try {
        console.log('Connecting to ChromaDB at', process.env.CHROMA_URI || 'http://localhost:8000');
        await chromaClient.heartbeat();

        const cropCsv = path.join(__dirname, '..', 'data', 'Crop_recommendation.csv');
        const fertCsv = path.join(__dirname, '..', 'data', 'fertilizer.csv');
        if (!fs.existsSync(cropCsv)) {
            console.error('Missing Crop_recommendation.csv — run from backend/ after downloading datasets.');
            process.exit(1);
        }
        if (!fs.existsSync(fertCsv)) {
            console.error('Missing fertilizer.csv — run from backend/ after downloading datasets.');
            process.exit(1);
        }

        await seedCollection('crop_kb', buildCropItems(), 'Crop', forceReseed);
        await seedCollection('fertilizer_kb', buildFertilizerItems(), 'Fertilizer', forceReseed);
        await seedCollection('pest_kb', buildPestItems(), 'Pest/Disease', forceReseed);
        console.log('Database seeding complete.');
    } catch (error) {
        console.error('Error seeding database:', error.message);
        process.exit(1);
    }
};

seedDatabase();
