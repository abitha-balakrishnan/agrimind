import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();

const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

export class ApiKeyMissingError extends Error {
    constructor() {
        super('ANTHROPIC_API_KEY is not configured. Set a valid API key in backend/.env to enable AI features.');
        this.name = 'ApiKeyMissingError';
        this.statusCode = 503;
    }
}

const getClient = () => {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key || key === 'your_anthropic_api_key_here') {
        throw new ApiKeyMissingError();
    }
    return new Anthropic({ apiKey: key });
};

export const isApiKeyConfigured = () => {
    const key = process.env.ANTHROPIC_API_KEY;
    return Boolean(key && key !== 'your_anthropic_api_key_here');
};

const parseJsonResponse = (textOutput) => {
    const jsonMatch = textOutput.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const raw = jsonMatch ? jsonMatch[1] : textOutput;
    return JSON.parse(raw.trim());
};

/**
 * Plain text generation (for chatbot responses)
 */
export const invokeClaudeText = async (systemPrompt, userPrompt, temperature = 0.3) => {
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

/**
 * Standard text generation with JSON enforcement
 */
export const invokeClaudeJSON = async (systemPrompt, userPrompt, temperature = 0) => {
    const anthropic = getClient();
    try {
        const msg = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 2000,
            temperature,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
        });

        const textOutput = msg.content[0].text;
        return parseJsonResponse(textOutput);
    } catch (error) {
        console.error('LLM JSON Error:', error.message);
        throw new Error(`Failed to generate JSON from Claude API: ${error.message}`);
    }
};

/**
 * Vision generation for Pest Detection
 */
export const invokeClaudeVisionJSON = async (systemPrompt, base64Image, mediaType, userPrompt, temperature = 0) => {
    const anthropic = getClient();
    try {
        const msg = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 2000,
            temperature,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: mediaType,
                                data: base64Image,
                            },
                        },
                        {
                            type: 'text',
                            text: userPrompt,
                        },
                    ],
                },
            ],
        });

        const textOutput = msg.content[0].text;
        return parseJsonResponse(textOutput);
    } catch (error) {
        console.error('LLM Vision Error:', error.message);
        throw new Error(`Failed to process image with Claude API: ${error.message}`);
    }
};
