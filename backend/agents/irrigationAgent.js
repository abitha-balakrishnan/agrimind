import { invokeClaudeJSON } from '../llm/claudeClient.js';

const SYSTEM_PROMPT = `You are an Irrigation Scheduling Agent for farmers.
Generate a week-by-week watering schedule based on crop type, soil, and weather forecast.

Return ONLY a strictly valid JSON object matching this schema:
{
  "schedule": [
    {
      "day": "string (e.g., 'Monday')",
      "action": "string (e.g., 'Water 2 inches', 'No watering needed')",
      "reasoning": "string"
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
