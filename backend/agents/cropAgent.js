import { invokeClaudeJSON } from '../llm/claudeClient.js';
import { getCollection } from '../db/chroma.js';

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
    // 1. RAG Retrieve
    let context = "No specific RAG context found.";
    try {
        const cropCollection = await getCollection('crop_kb');
        const results = await cropCollection.query({
            queryTexts: [JSON.stringify(farmerQuery)],
            nResults: 3
        });
        
        if (results && results.documents[0].length > 0) {
            context = results.documents[0].join('\n');
        }
    } catch (e) {
        console.warn("Chroma query failed in Crop Agent", e);
    }

    const userPrompt = `Farmer Data: ${JSON.stringify(farmerQuery)}
    Reference Knowledge (RAG Data):
    ${context}
    
    Please provide the crop recommendation based on the Farmer Data and Reference Knowledge.`;

    const result = await invokeClaudeJSON(SYSTEM_PROMPT, userPrompt);
    return result;
};
