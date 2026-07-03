import { cropAgent } from './cropAgent.js';
import { weatherAgent } from './weatherAgent.js';
import { fertilizerAgent } from './fertilizerAgent.js';
import { irrigationAgent } from './irrigationAgent.js';
import { invokeClaudeJSON } from '../llm/claudeClient.js';

export const handleQuery = async (farmerQuery) => {
    // We run weather agent first because irrigation agent needs it
    const weatherRes = await weatherAgent(farmerQuery.location || 'Unknown');
    const weatherData = weatherRes.raw || weatherRes;

    // Run parallel agents
    const [cropRes, fertilizerRes, irrigationRes] = await Promise.all([
        cropAgent(farmerQuery),
        fertilizerAgent(farmerQuery),
        irrigationAgent(farmerQuery, weatherData)
    ]);

    // Synthesize final response
    const synthesisPrompt = `You are the AgriMind Orchestrator. Combine the individual agent responses into a single cohesive narrative for the farmer.
    Keep the tone encouraging, professional, and easy to understand.
    Do not mention "agents" or "AI", just present the advice directly.
    Return ONLY a valid JSON object with a single "executiveSummary" string field.`;

    const userPrompt = `
    Input Data: ${JSON.stringify(farmerQuery)}
    Crop Recommendation: ${JSON.stringify(cropRes)}
    Weather Advisory: ${JSON.stringify(weatherRes)}
    Fertilizer Plan: ${JSON.stringify(fertilizerRes)}
    Irrigation Schedule: ${JSON.stringify(irrigationRes)}
    `;

    const synthesis = await invokeClaudeJSON(synthesisPrompt, userPrompt);

    return {
        farmerQuery,
        executiveSummary: synthesis.executiveSummary,
        crop: cropRes,
        weather: weatherRes,
        fertilizer: fertilizerRes,
        irrigation: irrigationRes
    };
};
