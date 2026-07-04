import { invokeClaudeVisionJSON } from '../llm/claudeClient.js';
import { queryKnowledge } from '../db/chroma.js';

const SYSTEM_PROMPT = `You are a Plant Pathology & Pest Detection Agent.
You will receive an image. FIRST determine whether the image shows a plant leaf (healthy or diseased).
If the image is NOT a plant leaf (e.g. animal, person, landscape, object, fruit, whole plant without visible leaf detail), set isPlantLeaf to false and do NOT provide a disease diagnosis.

Only when isPlantLeaf is true, analyze visible symptoms to identify pests or diseases.

Return ONLY a strictly valid JSON object matching this schema:
{
  "isPlantLeaf": true or false,
  "rejectionMessage": "string. Required when isPlantLeaf is false — polite message asking user to upload a clear leaf photo.",
  "reasoningScratchpad": "string. Your analysis of what you see in the image.",
  "diagnosis": "string. Empty string if isPlantLeaf is false.",
  "confidence": "number 0-100. 0 if isPlantLeaf is false.",
  "treatmentSpecs": {
    "chemical": ["string"],
    "organic": ["string"],
    "preventative": ["string"]
  }
}`;

export const pestAgent = async (base64Image, mimetype, contextData) => {
    const context = await queryKnowledge('pest_kb', contextData.crop || 'general plant pests', 3);

    const userPrompt = `Crop context: ${contextData.crop || 'Unknown crop'}
Knowledge base context: ${context}

Step 1: Is this image a plant leaf suitable for disease diagnosis?
Step 2: If yes, analyze symptoms and provide diagnosis. If no, set isPlantLeaf to false with a helpful rejectionMessage.`;

    const result = await invokeClaudeVisionJSON(
        SYSTEM_PROMPT,
        base64Image,
        mimetype,
        userPrompt
    );

    if (result.isPlantLeaf === false) {
        return {
            isPlantLeaf: false,
            rejectionMessage: result.rejectionMessage ||
                'This does not look like a plant leaf — please upload a clear photo of the affected leaf.',
            diagnosis: null,
            confidence: 0,
            treatmentSpecs: { chemical: [], organic: [], preventative: [] },
        };
    }

    return {
        isPlantLeaf: true,
        reasoningScratchpad: result.reasoningScratchpad,
        diagnosis: result.diagnosis,
        confidence: result.confidence,
        treatmentSpecs: result.treatmentSpecs,
    };
};
