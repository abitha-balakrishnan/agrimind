import { invokeClaudeVisionJSON } from '../llm/claudeClient.js';
import { getCollection } from '../db/chroma.js';

const SYSTEM_PROMPT = `You are a Plant Pathology & Pest Detection Agent.
You will receive an image of a plant leaf and some context. Analyze the image to identify pests or diseases. Use Chain-of-Thought reasoning internally but output only the final JSON structure requested.

Return ONLY a strictly valid JSON object matching this schema:
{
  "reasoningScratchpad": "string. Your analysis of visual symptoms.",
  "diagnosis": "string",
  "confidence": "number (0-100)",
  "treatmentSpecs": {
    "chemical": ["string"],
    "organic": ["string"],
    "preventative": ["string"]
  }
}`;

export const pestAgent = async (base64Image, mimetype, contextData) => {
    
    // RAG Retrieve for Pest info
    let context = "No specific RAG context found.";
    try {
        const pestCollection = await getCollection('pest_kb');
        const results = await pestCollection.query({
            queryTexts: [contextData.crop || 'general plant pests'],
            nResults: 2
        });
        
        if (results && results.documents[0].length > 0) {
            context = results.documents[0].join('\n');
        }
    } catch (e) {
        console.warn("Chroma query failed in Pest Agent", e);
    }
    
    const userPrompt = `Crop specific knowledge context: ${context}
    Please analyze this image and provide a diagnosis.`;

    const result = await invokeClaudeVisionJSON(
        SYSTEM_PROMPT,
        base64Image,
        mimetype,
        userPrompt
    );
    return result;
};
