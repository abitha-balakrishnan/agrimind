import { invokeClaudeJSON } from '../llm/claudeClient.js';
import { queryKnowledge } from '../db/chroma.js';

const SYSTEM_PROMPT = `You are an expert Agricultural Crop Recommendation Agent.
Your task is to suggest suitable crops based on the farmer's ACTUAL input (location, soil type, land size, target crop) and grounded RAG knowledge.
Every recommendation MUST reflect the specific soil type and location provided — never give generic advice unrelated to the input.

Return ONLY a strictly valid JSON object matching this schema:
{
  "recommendedCrops": [
    {
      "name": "string",
      "reasoning": "string. Explain why this crop suits THIS soil type and location.",
      "estimatedYield": "string. Examples: 'High', 'Moderate'"
    }
  ],
  "generalAdvice": "string"
}`;

export const cropAgent = async (farmerQuery) => {
    const context = await queryKnowledge('crop_kb', JSON.stringify(farmerQuery), 3);

    const userPrompt = `Farmer Data: ${JSON.stringify(farmerQuery)}
    Reference Knowledge (RAG Data):
    ${context}
    
    Provide crop recommendations specifically for location="${farmerQuery.location}", soil="${farmerQuery.soilType}", land=${farmerQuery.landSize} acres${farmerQuery.crop ? `, target crop="${farmerQuery.crop}"` : ''}.`;

    const result = await invokeClaudeJSON(SYSTEM_PROMPT, userPrompt);
    return result;
};
