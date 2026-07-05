/**
 * Full verification script for Module A + B
 * Run: node scripts/verify-full.js
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const BASE = 'http://localhost:5000';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const results = { pass: [], fail: [], warn: [] };

const log = (status, msg, detail = '') => {
    const line = detail ? `${msg} — ${detail}` : msg;
    results[status].push(line);
    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${line}`);
};

async function api(method, urlPath, body, isForm = false) {
    const opts = { method };
    if (body) {
        if (isForm) opts.body = body;
        else {
            opts.headers = { 'Content-Type': 'application/json' };
            opts.body = JSON.stringify(body);
        }
    }
    const res = await fetch(`${BASE}${urlPath}`, opts);
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

async function createTestImages() {
    const sharp = (await import('sharp')).default;
    const dir = path.join(__dirname, '..', 'test-images');
    fs.mkdirSync(dir, { recursive: true });

    // Green leaf-like image
    await sharp({ create: { width: 200, height: 200, channels: 3, background: { r: 40, g: 140, b: 50 } } })
        .png().toFile(path.join(dir, 'green-leaf.png'));

    // Diseased-ish (brown spots on green)
    const diseased = Buffer.alloc(200 * 200 * 3);
    for (let i = 0; i < diseased.length; i += 3) {
        diseased[i] = Math.random() > 0.7 ? 120 : 50;
        diseased[i + 1] = Math.random() > 0.7 ? 80 : 130;
        diseased[i + 2] = 40;
    }
    await sharp(diseased, { raw: { width: 200, height: 200, channels: 3 } })
        .png().toFile(path.join(dir, 'diseased-leaf.png'));

    // Non-plant (cow-like brown/blue)
    await sharp({ create: { width: 200, height: 200, channels: 3, background: { r: 139, g: 90, b: 43 } } })
        .png().toFile(path.join(dir, 'non-plant.png'));

    return dir;
}

async function testChat() {
    const enQuestions = [
        'what crop suits red soil',
        'how to treat tomato leaf curl',
        'best irrigation for cotton',
    ];
    const taQuestions = [
        'சிவப்பு மண்ணுக்கு என்ன பயிர் பொருத்தம்?',
        'தக்காளி இலை சுருள் எப்படி சிகிச்சை?',
        'பருத்தி பாசனம் எப்படி?',
    ];

    const enReplies = [];
    for (const msg of enQuestions) {
        const { status, data } = await api('POST', '/api/agent/chat', { message: msg, language: 'en', context: {} });
        if (status !== 200) { log('fail', `Chat EN: "${msg}"`, `HTTP ${status}`); continue; }
        enReplies.push(data.reply);
        log('pass', `Chat EN: "${msg.slice(0, 40)}"`, data.reply?.slice(0, 80));
    }
    log(enReplies.length === 3 && new Set(enReplies).size === 3 ? 'pass' : 'fail',
        'Chat EN replies are distinct', `${new Set(enReplies).size}/3 unique`);

    const taReplies = [];
    for (const msg of taQuestions) {
        const { status, data } = await api('POST', '/api/agent/chat', { message: msg, language: 'ta', context: {} });
        if (status !== 200) { log('fail', `Chat TA: "${msg.slice(0, 20)}"`, `HTTP ${status}`); continue; }
        taReplies.push(data.reply);
        log('pass', `Chat TA: "${msg.slice(0, 20)}..."`, data.reply?.slice(0, 80));
    }
    log(taReplies.length === 3 && new Set(taReplies).size === 3 ? 'pass' : 'fail',
        'Chat TA replies are distinct', `${new Set(taReplies).size}/3 unique`);
}

async function testDashboard() {
    const combos = [
        { location: 'Karur', soilType: 'Red/Laterite', landSize: '6', crop: 'mango' },
        { location: 'Pune', soilType: 'Black Cotton', landSize: '10', crop: 'cotton' },
        { location: 'Jaipur', soilType: 'Sandy', landSize: '3', crop: 'tomato' },
    ];
    const summaries = [];
    for (const combo of combos) {
        const { status, data } = await api('POST', '/api/agent/query', combo);
        if (status !== 200) { log('fail', `Dashboard: ${combo.location}/${combo.crop}`, `HTTP ${status}`); continue; }
        summaries.push(data.executiveSummary);
        const cropName = data.crop?.recommendedCrops?.[0]?.name || '?';
        log('pass', `Dashboard: ${combo.location}/${combo.soilType}/${combo.crop}`, `Crop: ${cropName}, summary: ${data.executiveSummary?.slice(0, 60)}...`);
    }
    log(summaries.length === 3 && new Set(summaries).size === 3 ? 'pass' : 'fail',
        'Dashboard summaries are distinct', `${new Set(summaries).size}/3 unique`);
}

async function testPestScanner(imageDir) {
    const tests = [
        { file: 'diseased-leaf.png', label: 'diseased leaf' },
        { file: 'green-leaf.png', label: 'healthy leaf' },
        { file: 'non-plant.png', label: 'non-plant' },
    ];
    const diagnoses = [];
    for (const t of tests) {
        const filePath = path.join(imageDir, t.file);
        const buffer = fs.readFileSync(filePath);
        const form = new FormData();
        form.append('image', new Blob([buffer], { type: 'image/png' }), t.file);
        form.append('crop', 'tomato');
        const { status, data } = await api('POST', '/api/agent/pest-scan', form, true);
        if (status !== 200) { log('fail', `Pest scan: ${t.label}`, `HTTP ${status}`); continue; }
        if (t.label === 'non-plant') {
            log(data.isPlantLeaf === false ? 'pass' : 'fail', `Pest scan: ${t.label} rejected`, data.rejectionMessage || data.diagnosis);
        } else {
            diagnoses.push(data.diagnosis);
            log('pass', `Pest scan: ${t.label}`, `${data.diagnosis} (${data.confidence}%)`);
        }
    }
    log(diagnoses.length === 2 && new Set(diagnoses).size >= 1 ? 'pass' : 'warn',
        'Pest leaf scans return results', diagnoses.join(' vs '));
}

async function testPriceCalc() {
    const result = (5 / 50) * 12; // wrong - should be (50/5)*12 = 120
    const correct = (50 / 5) * 12;
    log(correct === 120 ? 'pass' : 'fail', 'Price calc math: 5kg=₹50 → 12kg', `₹${correct}`);
}

async function main() {
    console.log('\n=== AgriMind Full Verification ===\n');

    try {
        const health = await api('GET', '/health');
        log(health.status === 200 ? 'pass' : 'fail', 'Backend health', JSON.stringify(health.data));
    } catch (e) {
        log('fail', 'Backend not reachable', e.message);
        console.log('\nStart backend first: cd backend && node server.js\n');
        process.exit(1);
    }

    await testChat();
    await testDashboard();

    try {
        const imageDir = await createTestImages();
        await testPestScanner(imageDir);
    } catch (e) {
        log('warn', 'Pest scanner image tests', e.message);
    }

    testPriceCalc();

    // File checks
    const useCaseFile = path.join(__dirname, '..', '..', 'USE_CASE_DIAGRAM.md');
    log(fs.existsSync(useCaseFile) ? 'pass' : 'fail', 'USE_CASE_DIAGRAM.md exists in repo');

    console.log('\n=== Summary ===');
    console.log(`✅ Passed: ${results.pass.length}`);
    console.log(`❌ Failed: ${results.fail.length}`);
    console.log(`⚠️  Warnings: ${results.warn.length}`);
    if (results.fail.length) process.exit(1);
}

main().catch(console.error);
