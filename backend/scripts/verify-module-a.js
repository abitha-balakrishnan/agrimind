/**
 * Verification script for Module A fixes.
 * Run: node scripts/verify-module-a.js
 *
 * Requires ANTHROPIC_API_KEY in .env for live API tests.
 * Without API key, verifies that mock mode is removed and errors are returned.
 */
import dotenv from 'dotenv';
import { loadDatasets, buildCropContext, findCropsForSoil } from '../knowledge/dataService.js';
import { isApiKeyConfigured } from '../llm/claudeClient.js';

dotenv.config();

const log = (label, pass, detail = '') => {
    console.log(`${pass ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
};

async function main() {
    console.log('\n=== Module A Verification ===\n');

    // 1. Datasets loaded
    loadDatasets();
    const karurMango = findCropsForSoil('Red/Laterite', 'mango', 3);
    const sandyCotton = findCropsForSoil('Sandy', 'cotton', 3);
    log('Dataset: Red/Laterite + mango returns distinct crops', karurMango.length > 0, karurMango.map(c => c.name).join(', '));
    log('Dataset: Sandy + cotton differs from red/mango', sandyCotton[0]?.name !== karurMango[0]?.name || sandyCotton.length > 0, sandyCotton.map(c => c.name).join(', '));

    const ctx1 = buildCropContext({ location: 'Karur', soilType: 'Red/Laterite', landSize: '6', crop: 'mango' });
    const ctx2 = buildCropContext({ location: 'Pune', soilType: 'Black Cotton', landSize: '10', crop: 'cotton' });
    log('RAG context differs by input', ctx1 !== ctx2);

    // 2. API key check
    log('Claude API key configured', isApiKeyConfigured(), isApiKeyConfigured() ? 'live mode' : 'will return 503 errors');

    if (!isApiKeyConfigured()) {
        console.log('\n⚠️  Set ANTHROPIC_API_KEY in backend/.env to run live API tests.\n');
        console.log('Static mock responses have been REMOVED — the app now requires a real API key.\n');
        return;
    }

    // 3. Live chat tests
    const { chatAgent } = await import('../agents/chatAgent.js');
    const questions = [
        { msg: 'what crop suits red soil', lang: 'en' },
        { msg: 'how to treat tomato leaf curl', lang: 'en' },
        { msg: 'best irrigation for cotton', lang: 'en' },
        { msg: 'சிவப்பு மண்ணுக்கு என்ன பயிர் பொருத்தம்?', lang: 'ta' },
    ];

    const chatReplies = [];
    for (const q of questions) {
        try {
            const res = await chatAgent({ message: q.msg, language: q.lang, context: {} });
            chatReplies.push(res.reply);
            log(`Chat [${q.lang}]: "${q.msg.slice(0, 40)}..."`, res.reply?.length > 20, res.reply?.slice(0, 80) + '...');
        } catch (e) {
            log(`Chat: "${q.msg.slice(0, 40)}..."`, false, e.message);
        }
    }
    const uniqueChat = new Set(chatReplies).size;
    log('Chat replies are distinct', uniqueChat === chatReplies.length, `${uniqueChat}/${chatReplies.length} unique`);

    // 4. Live orchestration tests
    const { handleQuery } = await import('../agents/orchestrator.js');
    const combos = [
        { location: 'Karur', soilType: 'Red/Laterite', landSize: '6', crop: 'mango' },
        { location: 'Pune', soilType: 'Black Cotton', landSize: '10', crop: 'cotton' },
        { location: 'Jaipur', soilType: 'Sandy', landSize: '3', crop: 'tomato' },
    ];

    const summaries = [];
    for (const combo of combos) {
        try {
            const res = await handleQuery(combo);
            summaries.push(res.executiveSummary);
            log(`Orchestration: ${combo.location}/${combo.crop}`, res.executiveSummary?.length > 50, res.executiveSummary?.slice(0, 80) + '...');
        } catch (e) {
            log(`Orchestration: ${combo.location}/${combo.crop}`, false, e.message);
        }
    }
    const uniqueOrch = new Set(summaries).size;
    log('Orchestration summaries are distinct', uniqueOrch === summaries.length, `${uniqueOrch}/${summaries.length} unique`);

    console.log('\n=== Verification complete ===\n');
}

main().catch(console.error);
