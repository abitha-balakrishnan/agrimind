import { invokeClaudeJSON } from '../llm/claudeClient.js';

const SYSTEM_PROMPT = `You are an Irrigation Scheduling Agent for farmers.
Generate a week-by-week watering schedule based on the specific crop type, soil type, and weather forecast provided.
Tailor every recommendation to the actual crop and soil — do NOT give generic schedules.

Return ONLY a strictly valid JSON object matching this schema:
{
  "schedule": [
    {
      "day": "string (e.g., 'Monday')",
      "action": "string (e.g., 'Water 2 inches', 'No watering needed')",
      "reasoning": "string explaining why, referencing the crop and soil"
    }
  ],
  "waterConservationTip": "string"
}`;

export const irrigationAgent = async (farmerQuery, weatherData) => {
    const userPrompt = `Crop: ${farmerQuery.crop || 'Unknown'}
    Soil Type: ${farmerQuery.soilType || 'Unknown'}
    Weather Forecast: ${JSON.stringify(weatherData)}
    
    Provide the irrigation schedule for the upcoming week.`;

    const result = await invokeClaudeJSON(SYSTEM_PROMPT, userPrompt);
    return result;
};
