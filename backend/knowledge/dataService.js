import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

const SOIL_PROFILES = {
    Loamy: { n: 70, p: 45, k: 40, ph: 6.5, note: 'Balanced loamy soil with good drainage and moderate fertility.' },
    'Black Cotton': { n: 60, p: 35, k: 35, ph: 7.5, note: 'Deep black cotton soil, high water retention, ideal for cotton and sorghum.' },
    'Red/Laterite': { n: 45, p: 30, k: 25, ph: 5.5, note: 'Red/laterite soil, acidic, low organic matter; suits mango, groundnut, millets.' },
    Sandy: { n: 35, p: 25, k: 20, ph: 6.0, note: 'Sandy soil drains fast, low nutrient holding; needs organic matter and frequent irrigation.' },
    Clayey: { n: 55, p: 40, k: 38, ph: 6.8, note: 'Clayey soil holds water well; rice and wheat do well with proper drainage.' },
};

let cropRecords = [];
let fertilizerRecords = [];
let cropSummaries = [];
let loaded = false;

const parseCsv = (content) => {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const row = {};
        headers.forEach((h, i) => { row[h] = values[i]?.trim(); });
        return row;
    });
};

const avg = (nums) => nums.reduce((a, b) => a + b, 0) / nums.length;

export const loadDatasets = () => {
    if (loaded) return;

    const cropPath = path.join(DATA_DIR, 'Crop_recommendation.csv');
    const fertPath = path.join(DATA_DIR, 'fertilizer.csv');

    if (fs.existsSync(cropPath)) {
        cropRecords = parseCsv(fs.readFileSync(cropPath, 'utf-8'));
        const byCrop = {};
        for (const row of cropRecords) {
            const label = row.label?.toLowerCase();
            if (!label) continue;
            if (!byCrop[label]) byCrop[label] = [];
            byCrop[label].push(row);
        }
        cropSummaries = Object.entries(byCrop).map(([name, rows]) => ({
            name,
            avgN: avg(rows.map(r => Number(r.N))),
            avgP: avg(rows.map(r => Number(r.P))),
            avgK: avg(rows.map(r => Number(r.K))),
            avgTemp: avg(rows.map(r => Number(r.temperature))),
            avgHumidity: avg(rows.map(r => Number(r.humidity))),
            avgPh: avg(rows.map(r => Number(r.ph))),
            avgRainfall: avg(rows.map(r => Number(r.rainfall))),
            sampleCount: rows.length,
        }));
    }

    if (fs.existsSync(fertPath)) {
        fertilizerRecords = parseCsv(fs.readFileSync(fertPath, 'utf-8'));
    }

    loaded = true;
};

export const getSoilProfile = (soilType) => SOIL_PROFILES[soilType] || SOIL_PROFILES.Loamy;

export const getCropSummaries = () => {
    loadDatasets();
    return cropSummaries;
};

export const getFertilizerRecords = () => {
    loadDatasets();
    return fertilizerRecords;
};

export const findCropsForQuery = (queryText, n = 5) => {
    loadDatasets();
    const q = queryText.toLowerCase();
    const terms = q.split(/\W+/).filter(t => t.length > 2);

    const scored = cropSummaries.map(c => {
        let score = 0;
        if (q.includes(c.name)) score += 10;
        for (const t of terms) {
            if (c.name.includes(t)) score += 5;
        }
        return { crop: c, score };
    }).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
        return cropSummaries.slice(0, n);
    }
    return scored.slice(0, n).map(s => s.crop);
};

export const findCropsForSoil = (soilType, targetCrop = '', n = 5) => {
    loadDatasets();
    const profile = getSoilProfile(soilType);

    if (targetCrop) {
        const match = cropSummaries.find(c => c.name === targetCrop.toLowerCase() || targetCrop.toLowerCase().includes(c.name));
        if (match) return [match];
    }

    const ranked = cropSummaries.map(c => {
        const nDiff = Math.abs(c.avgN - profile.n);
        const pDiff = Math.abs(c.avgP - profile.p);
        const kDiff = Math.abs(c.avgK - profile.k);
        const phDiff = Math.abs(c.avgPh - profile.ph);
        const score = 100 - (nDiff + pDiff + kDiff + phDiff * 5);
        return { crop: c, score };
    }).sort((a, b) => b.score - a.score);

    return ranked.slice(0, n).map(r => r.crop);
};

export const findFertilizerForCrop = (cropName) => {
    loadDatasets();
    const name = cropName?.toLowerCase() || '';
    const match = fertilizerRecords.find(r => r.Crop?.toLowerCase() === name)
        || fertilizerRecords.find(r => name.includes(r.Crop?.toLowerCase()));
    return match || null;
};

export const formatCropDoc = (crop) =>
    `Crop: ${crop.name}. Avg soil needs — N:${crop.avgN.toFixed(0)}, P:${crop.avgP.toFixed(0)}, K:${crop.avgK.toFixed(0)}. ` +
    `Ideal conditions — Temp:${crop.avgTemp.toFixed(1)}°C, Humidity:${crop.avgHumidity.toFixed(0)}%, pH:${crop.avgPh.toFixed(1)}, Rainfall:${crop.avgRainfall.toFixed(0)}mm. ` +
    `Based on ${crop.sampleCount} dataset records.`;

export const formatFertilizerDoc = (rec) =>
    `Fertilizer for ${rec.Crop}: Recommended NPK ratio N:${rec.N}, P:${rec.P}, K:${rec.K}, pH:${rec.pH}` +
    (rec.soil_moisture ? `, soil moisture ${rec.soil_moisture}%.` : '.');

export const buildCropContext = (farmerQuery, n = 5) => {
    loadDatasets();
    const profile = getSoilProfile(farmerQuery.soilType);
    const crops = findCropsForSoil(farmerQuery.soilType, farmerQuery.crop, n);
    const lines = [
        `Soil profile (${farmerQuery.soilType}): ${profile.note} Typical N:${profile.n}, P:${profile.p}, K:${profile.k}, pH:${profile.ph}.`,
        `Location: ${farmerQuery.location || 'Unknown'}. Land size: ${farmerQuery.landSize || 'Unknown'} acres.`,
    ];
    if (farmerQuery.crop) lines.push(`Target crop: ${farmerQuery.crop}.`);
    lines.push('Matching crops from dataset:');
    crops.forEach(c => lines.push(formatCropDoc(c)));
    return lines.join('\n');
};

export const buildFertilizerContext = (farmerQuery) => {
    loadDatasets();
    const profile = getSoilProfile(farmerQuery.soilType);
    const crop = farmerQuery.crop || '';
    const fertRec = findFertilizerForCrop(crop);
    const lines = [
        `Soil: ${farmerQuery.soilType}. ${profile.note}`,
        `Location: ${farmerQuery.location || 'Unknown'}. Land: ${farmerQuery.landSize || 'Unknown'} acres.`,
    ];
    if (fertRec) {
        lines.push(formatFertilizerDoc(fertRec));
    } else if (crop) {
        lines.push(`No exact fertilizer record for "${crop}" — use soil NPK targets N:${profile.n}, P:${profile.p}, K:${profile.k}.`);
    }
    return lines.join('\n');
};
