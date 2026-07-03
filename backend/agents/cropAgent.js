import { invokeClaudeJSON } from '../llm/claudeClient.js';
import { queryKnowledge } from '../db/chroma.js';

const SYSTEM_PROMPT = `You are an expert Agricultural Crop Recommendation Agent.
Your task is to suggest suitable crops based on user input (soil type, season, region, land size, water availability) and grounded RAG knowledge.

Return ONLY a strictly valid JSON object matching this schema:
{
  "recommendedCrops": [
    {
      "name": "string",
      "reasoning": "string. Explain why this crop is suitable.",
      "estimatedYield": "string. Examples: 'High', 'Moderate'"
    }
  ],
  "generalAdvice": "string"
}

Example output:
{
  "recommendedCrops": [
    {
      "name": "Wheat",
      "reasoning": "Well suited for loamy soil and cool rabi season.",
      "estimatedYield": "High"
    }
  ],
  "generalAdvice": "Ensure proper drainage."
}`;

export const cropAgent = async (farmerQuery) => {
    const context = await queryKnowledge('crop_kb', JSON.stringify(farmerQuery), 3);

    const userPrompt = `Farmer Data: ${JSON.stringify(farmerQuery)}
    Reference Knowledge (RAG Data):
    ${context}
    
    Please provide the crop recommendation based on the Farmer Data and Reference Knowledge.`;

    const result = await invokeClaudeJSON(SYSTEM_PROMPT, userPrompt);
    return result;
};
