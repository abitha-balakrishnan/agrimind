import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import {
    localRouteJSON,
    localTextReply,
    localVisionJSON,
} from './localFallback.js';

dotenv.config();

const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

export class ApiKeyMissingError extends Error {
    constructor() {
        super('ANTHROPIC_API_KEY is not configured. Set a valid API key in backend/.env to enable AI features.');
        this.name = 'ApiKeyMissingError';
        this.statusCode = 503;
    }
}

const useLocalFallback = () => {
    const key = process.env.ANTHROPIC_API_KEY;
    return !key || key === 'your_anthropic_api_key_here';
};

const getClient = () => {
    if (useLocalFallback()) throw new ApiKeyMissingError();
    return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
};

export const isApiKeyConfigured = () => !useLocalFallback();

export const isLocalFallbackActive = () => useLocalFallback();

const parseJsonResponse = (textOutput) => {
    const jsonMatch = textOutput.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const raw = jsonMatch ? jsonMatch[1] : textOutput;
    return JSON.parse(raw.trim());
};

export const invokeClaudeText = async (systemPrompt, userPrompt, temperature = 0.3) => {
    if (useLocalFallback()) {
        console.warn('[Local LLM] Generating dataset-grounded text response.');
        return localTextReply(systemPrompt, userPrompt);
    }

    const anthropic = getClient();
    try {
        const msg = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 1500,
            temperature,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
        });
        return msg.content[0].text;
    } catch (error) {
        console.error('LLM Text Error:', error.message);
        throw new Error(`Failed to generate response from Claude API: ${error.message}`);
    }
};

export const invokeClaudeJSON = async (systemPrompt, userPrompt, temperature = 0) => {
    if (useLocalFallback()) {
        console.warn('[Local LLM] Generating dataset-grounded JSON response.');
        return localRouteJSON(systemPrompt, userPrompt);
    }

    const anthropic = getClient();
    try {
        const msg = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 2000,
            temperature,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
        });
        return parseJsonResponse(msg.content[0].text);
    } catch (error) {
        console.error('LLM JSON Error:', error.message);
        throw new Error(`Failed to generate JSON from Claude API: ${error.message}`);
    }
};

export const invokeClaudeVisionJSON = async (systemPrompt, base64Image, mediaType, userPrompt, temperature = 0) => {
    if (useLocalFallback()) {
        console.warn('[Local LLM] Analyzing image with color-heuristic + knowledge base.');
        const cropMatch = userPrompt.match(/Crop context:\s*(.+)/);
        return localVisionJSON(base64Image, { crop: cropMatch?.[1]?.split('\n')[0]?.trim() || 'Unknown' });
    }

    const anthropic = getClient();
    try {
        const msg = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 2000,
            temperature,
            system: systemPrompt,
            messages: [{
                role: 'user',
                content: [
                    { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Image } },
                    { type: 'text', text: userPrompt },
                ],
            }],
        });
        return parseJsonResponse(msg.content[0].text);
    } catch (error) {
        console.error('LLM Vision Error:', error.message);
        throw new Error(`Failed to process image with Claude API: ${error.message}`);
    }
};
