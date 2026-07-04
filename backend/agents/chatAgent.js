import { cropAgent } from './cropAgent.js';
import { weatherAgent } from './weatherAgent.js';
import { fertilizerAgent } from './fertilizerAgent.js';
import { irrigationAgent } from './irrigationAgent.js';
import { invokeClaudeJSON, invokeClaudeText } from '../llm/claudeClient.js';

const LANGUAGE_PROMPTS = {
    en: 'Respond ONLY in English. Use simple, farmer-friendly language.',
    ta: 'Respond ONLY in Tamil (தமிழ்). Use simple, farmer-friendly language.',
    hi: 'Respond ONLY in Hindi (हिंदी). Use simple, farmer-friendly language.',
};

const ROUTING_PROMPT = `You are AgriMind Chat Router. Classify the farmer's question and extract relevant parameters from their message and any existing context.
Return ONLY a valid JSON object:
{
  "intent": "fertilizer" | "crop" | "weather" | "irrigation" | "pest" | "general" | "greeting",
  "extractedContext": {
    "location": "string or empty",
    "soilType": "string or empty",
    "landSize": "string or empty",
    "crop": "string or empty",
    "growthStage": "string or empty"
  },
  "needsMoreInfo": false,
  "missingFields": []
}
Set needsMoreInfo true only when the question clearly requires location/soil/crop details that are missing.`;

export const chatAgent = async ({ message, language = 'en', context = {} }) => {
    const langInstruction = LANGUAGE_PROMPTS[language] || LANGUAGE_PROMPTS.en;

    const routing = await invokeClaudeJSON(
        ROUTING_PROMPT,
        `Farmer message: ${message}\nExisting context: ${JSON.stringify(context)}`
    );

    const mergedContext = {
        location: routing.extractedContext?.location || context.location || '',
        soilType: routing.extractedContext?.soilType || context.soilType || 'Loamy',
        landSize: routing.extractedContext?.landSize || context.landSize || '',
        crop: routing.extractedContext?.crop || context.crop || '',
        growthStage: routing.extractedContext?.growthStage || context.growthStage || '',
    };

    if (routing.intent === 'greeting') {
        const reply = await invokeClaudeText(
            `You are AgriMind, a helpful farm advisor chatbot. ${langInstruction} Greet the farmer warmly and briefly explain you can help with crops, fertilizer, weather, irrigation, and pest advice.`,
            message
        );
        return { reply, agentsUsed: [] };
    }

    if (routing.intent === 'pest') {
        const reply = await invokeClaudeText(
            `You are AgriMind. ${langInstruction} Tell the farmer to use the Pest & Disease Scanner on the dashboard — upload a leaf photo for AI pathology analysis.`,
            message
        );
        return { reply, agentsUsed: [] };
    }

    if (routing.needsMoreInfo && routing.missingFields?.length) {
        const reply = await invokeClaudeText(
            `You are AgriMind, a helpful farm advisor chatbot. ${langInstruction} Ask the farmer for the missing information in a friendly, concise way.`,
            `The farmer asked: ${message}\nMissing fields: ${routing.missingFields.join(', ')}`
        );
        return { reply, agentsUsed: [], needsMoreInfo: true };
    }

    let agentData = {};
    const agentsUsed = [];

    switch (routing.intent) {
        case 'fertilizer':
            agentData = await fertilizerAgent(mergedContext);
            agentsUsed.push('fertilizer');
            break;
        case 'crop':
            agentData = await cropAgent(mergedContext);
            agentsUsed.push('crop');
            break;
        case 'weather':
            agentData = await weatherAgent(mergedContext.location || 'India');
            agentsUsed.push('weather');
            break;
        case 'irrigation': {
            const weatherRes = await weatherAgent(mergedContext.location || 'India');
            agentData = await irrigationAgent(mergedContext, weatherRes.raw || weatherRes);
            agentsUsed.push('weather', 'irrigation');
            break;
        }
        default: {
            const [cropRes, fertilizerRes] = await Promise.all([
                cropAgent(mergedContext),
                fertilizerAgent(mergedContext),
            ]);
            agentData = { crop: cropRes, fertilizer: fertilizerRes };
            agentsUsed.push('crop', 'fertilizer');
        }
    }

    const reply = await invokeClaudeText(
        `You are AgriMind, a helpful farm advisor chatbot. ${langInstruction}
Present advice directly based on the agent data below. Do not mention AI, agents, or JSON. Be concise but practical.`,
        `Farmer question: ${message}\nAgent data: ${JSON.stringify(agentData)}\nFarm context: ${JSON.stringify(mergedContext)}`
    );

    return { reply, agentsUsed, agentData };
};
