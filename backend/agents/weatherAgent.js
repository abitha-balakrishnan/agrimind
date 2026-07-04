import { invokeClaudeJSON } from '../llm/claudeClient.js';
import axios from 'axios';

const SYSTEM_PROMPT = `You are a Weather Advisory Agent for farmers.
Convert the raw weather forecast data into plain-language, actionable farming advice.

Return ONLY a strictly valid JSON object matching this schema:
{
  "forecastSummary": "string. Plain English summary.",
  "farmingAdvice": "string. Specific action like 'delay sowing', 'good time to fertilize', etc.",
  "alerts": ["string"]
}

Example output:
{
  "forecastSummary": "Heavy rain expected over the next 2 days.",
  "farmingAdvice": "Delay any sowing activities until the rain passes to prevent seed wash-out.",
  "alerts": ["Heavy Rain Warning"]
}`;

export const weatherAgent = async (location) => {
    let rawWeather = {};
    try {
        const apiKey = process.env.WEATHER_API_KEY;
        if (apiKey && apiKey !== 'your_openweathermap_api_key_here') {
            const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`);
            rawWeather = {
                temp: res.data.main.temp,
                weather: res.data.weather[0].description,
                humidity: res.data.main.humidity
            };
        } else {
            // Mock weather for demo if no API key
            rawWeather = {
                temp: 28,
                weather: "scattered showers",
                humidity: 75
            };
        }
    } catch (error) {
        console.warn("Weather API failed, using mock data.", error.message);
        rawWeather = { error: "Could not fetch live weather, assume typical conditions" };
    }

    const userPrompt = `Location: ${location}
    Raw Weather Data: ${JSON.stringify(rawWeather)}
    
    Provide weather advisory tailored to farming activities in ${location}.`;

    const result = await invokeClaudeJSON(SYSTEM_PROMPT, userPrompt);
    // Attach raw info for frontend
    result.raw = rawWeather;
    return result;
};
