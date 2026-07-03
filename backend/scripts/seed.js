import { ChromaClient } from 'chromadb';
import dotenv from 'dotenv';
dotenv.config();

const parseChromaUri = (uri) => {
    const url = new URL(uri || 'http://localhost:8000');
    return { host: url.hostname, port: url.port ? Number(url.port) : 8000, ssl: url.protocol === 'https:' };
};

const chromaClient = new ChromaClient(parseChromaUri(process.env.CHROMA_URI));

const CROPS = [
    { id: 'crop-1', name: 'Rice', info: 'Best grown in clayey, loamy soil holding water. Requires heavy rainfall (above 100cm) and high temperature (above 25°C). Kharif crop.' },
    { id: 'crop-2', name: 'Wheat', info: 'Requires well-drained fertile loamy and clayey loamy soil. Cool growing season and bright sunshine at ripening. Rabi crop.' },
    { id: 'crop-3', name: 'Maize', info: 'Requires well-drained fertile soil, ideally old alluvial soil. Temperature 21°C to 27°C. Kharif crop.' },
    { id: 'crop-4', name: 'Sugarcane', info: 'Requires hot and humid climate (21°C to 27°C). Rainfall 75cm to 100cm. Can be grown on diverse soils.' },
    { id: 'crop-5', name: 'Cotton', info: 'Grows well in drier parts of black cotton soil. Requires high temperature, light rainfall, 210 frost-free days.' },
    { id: 'crop-6', name: 'Groundnut', info: 'Kharif crop in mostly sandy loams. Needs 20°C to 30°C temperature and 50cm to 75cm rainfall.' },
    { id: 'crop-7', name: 'Tomato', info: 'A warm-season crop. Sandy loam soil with good drainage is ideal. pH 6.0-7.0. Frost sensitive.' },
    { id: 'crop-8', name: 'Potato', info: 'Cool-season crop. Loamy, well-draining soil rich in organic matter. Sandy soils are good. Poor tolerance to waterlogging.' },
    { id: 'crop-9', name: 'Soybean', info: 'Requires warm climate, loamy and well-drained soil. Temperature 20°C to 30°C. Kharif crop in many regions.' },
    { id: 'crop-10', name: 'Mustard', info: 'Cool-season Rabi crop. Loam to heavy clay soils. Needs moderate temperature.' },
    { id: 'crop-11', name: 'Millets (Bajra)', info: 'Grows well on sandy soils and shallow black soil. Dry warm climate.' },
    { id: 'crop-12', name: 'Tea', info: 'Plantation crop. Deep and fertile well-drained soil rich in humus and organic matter. Warm and moist frost-free climate.' },
    { id: 'crop-13', name: 'Coffee', info: 'Requires hot and humid climate, well-draining soil (laterite soils). Grown on hill slopes.' },
    { id: 'crop-14', name: 'Onion', info: 'Cool season for vegetative growth and warm for bulb formation. Mild climate without extremes.' },
    { id: 'crop-15', name: 'Sunflower', info: 'Adaptable to a wide range of soils. High tolerance to drought.' },
];

const PESTS = [
    { id: 'pest-1', name: 'Leaf Blight', info: 'Fungal or bacterial disease causing dark spots or browning on leaves. Treatment: Fungicides containing Copper or Mancozeb. Ensure good air circulation.' },
    { id: 'pest-2', name: 'Aphids', info: 'Small, sap-sucking insects causing curled/yellowing leaves. Treatment: Neem oil, insecticidal soap, or introducing ladybugs.' },
    { id: 'pest-3', name: 'Stem Borer', info: 'Larvae that bore into stems causing "dead heart" or white earheads in crops like rice. Treatment: Chlorantraniliprole, Cartap hydrochloride.' },
    { id: 'pest-4', name: 'Whitefly', info: 'Tiny white winged insects causing yellowing and transmitting viruses. Treatment: Yellow sticky traps, Neem oil, Imidacloprid.' },
    { id: 'pest-5', name: 'Powdery Mildew', info: 'Fungal disease looking like white powder on leaves. Treatment: Sulfur-based fungicides, Potassium bicarbonate.' },
    { id: 'pest-6', name: 'Fall Armyworm', info: 'Devastating caterpillar chewing large holes in leaves (especially maize). Treatment: Spinetoram, Emamectin benzoate.' },
    { id: 'pest-7', name: 'Spider Mites', info: 'Tiny arachnids causing stippling or yellowing on leaves, fine webbing. Treatment: Miticides, forceful water spray, Neem oil.' },
    { id: 'pest-8', name: 'Root Knot Nematodes', info: 'Microscopic worms forming galls on roots, stunting growth. Treatment: Crop rotation with non-hosts, solarization, nematicides.' },
    { id: 'pest-9', name: 'Thrips', info: 'Tiny insects causing silvery stippling on leaves and fruit scarring. Treatment: Spinosad, Neem oil, insecticidal soap.' },
    { id: 'pest-10', name: 'Rust', info: 'Fungal disease causing reddish-brown or orange pustules on leaves. Treatment: Fungicides containing Propiconazole or Tebuconazole.' },
    { id: 'pest-11', name: 'Mealybugs', info: 'White, cottony masses on stems/leaves sucking sap. Treatment: Isopropyl alcohol dab, Horticultural oils, Neem oil.' },
    { id: 'pest-12', name: 'Early Blight', info: 'Fungal disease causing concentric dark rings on older leaves (bullseye pattern). Treatment: Chlorothalonil or Copper fungicides.' },
];

const seedCollection = async (name, items, label) => {
    const collection = await chromaClient.getOrCreateCollection({ name });
    const count = await collection.count();
    if (count > 0) {
        console.log(`${label} collection already has ${count} items. Skipping.`);
        return;
    }

    await collection.add({
        ids: items.map(i => i.id),
        documents: items.map(i => `${label}: ${i.name}. ${i.info}`),
        metadatas: items.map(i => ({ name: i.name, type: label.toLowerCase() })),
    });
    console.log(`Seeded ${items.length} ${label.toLowerCase()} entries.`);
};

const seedDatabase = async () => {
    try {
        console.log('Connecting to ChromaDB at', process.env.CHROMA_URI || 'http://localhost:8000');
        await chromaClient.heartbeat();
        await seedCollection('crop_kb', CROPS, 'Crop');
        await seedCollection('pest_kb', PESTS, 'Pest/Disease');
        console.log('Database seeding complete.');
    } catch (error) {
        console.error('Error seeding database:', error.message);
        process.exit(1);
    }
};

seedDatabase();
