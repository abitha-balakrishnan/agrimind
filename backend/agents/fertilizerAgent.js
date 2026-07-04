import { invokeClaudeJSON } from '../llm/claudeClient.js';
import { queryKnowledge } from '../db/chroma.js';

const SYSTEM_PROMPT = `You are a Fertilizer Recommendation Agent.
Given a crop, soil type, land size, and growth stage, suggest fertilizer types and quantities.
Use the Reference Knowledge (RAG Data) to ground your recommendations in real NPK data.
Tailor every recommendation to the specific crop and soil type provided — do NOT give generic advice.

Return ONLY a strictly valid JSON object matching this schema:
{
  "reasoningScratchpad": "string. Explain why these fertilizers suit THIS crop and THIS soil.",
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
    const context = await queryKnowledge('fertilizer_kb', JSON.stringify(farmerQuery), 3);

    const userPrompt = `Farmer Data: ${JSON.stringify(farmerQuery)}
    Reference Knowledge (RAG Data):
    ${context}

    Provide a fertilizer plan tailored to this specific crop, soil type, and land size.`;

    const result = await invokeClaudeJSON(SYSTEM_PROMPT, userPrompt);
    return result;
};
