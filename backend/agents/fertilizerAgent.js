import { invokeClaudeJSON } from '../llm/claudeClient.js';

const SYSTEM_PROMPT = `You are a Fertilizer Recommendation Agent.
Given a crop, soil nutrient levels (if provided), and growth stage, suggest fertilizer types and quantities. Use Chain-of-Thought reasoning internally but output only the final JSON structure requested.

Return ONLY a strictly valid JSON object matching this schema:
{
  "reasoningScratchpad": "string. Your internal reasoning process.",
  "recommendations": [
    {
      "fertilizerType": "string (e.g. Urea, NPK 19:19:19, Organic Compost)",
      "quantityPerAcre": "string",
      "applicationMethod": "string"
    }
  ],
  "organicAlternatives": ["string"]
}`;

export const fertilizerAgent = async (farmerQuery) => {
    const userPrompt = `Crop: ${farmerQuery.crop || 'Unknown'}
    Soil Type: ${farmerQuery.soilType || 'Unknown'}
    Growth Stage: ${farmerQuery.growthStage || 'Pre-sowing'}
    Land Size: ${farmerQuery.landSize || 'Unknown'}
    
    Provide the fertilizer plan.`;

    const result = await invokeClaudeJSON(SYSTEM_PROMPT, userPrompt);
    return result;
};
