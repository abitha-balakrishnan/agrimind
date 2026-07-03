import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key', 
});

const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

const isMockMode = () => {
    const key = process.env.ANTHROPIC_API_KEY;
    return !key || key === 'your_anthropic_api_key_here';
};

const parseJsonResponse = (textOutput) => {
    const jsonMatch = textOutput.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) return JSON.parse(jsonMatch[1]);
    return JSON.parse(textOutput);
};

/**
 * Standard text generation with JSON enforcement
 */
export const invokeClaudeJSON = async (systemPrompt, userPrompt, temperature = 0) => {
    if (isMockMode()) {
        console.warn("Mocking Claude because no API Key is provided.");
        if (systemPrompt.includes('Crop Recommendation Agent')) return { recommendedCrops: [{ name: "Wheat", reasoning: "Well suited for loamy soil in the rabi season.", estimatedYield: "High" }], generalAdvice: "Ensure proper drainage before sowing." };
        if (systemPrompt.includes('Weather Advisory Agent')) return { forecastSummary: "Mild showers expected over the next 48 hours.", farmingAdvice: "Delay pesticide spraying until conditions dry.", alerts: ["Light Rain Advisory"] };
        if (systemPrompt.includes('Fertilizer Recommendation Agent')) return { reasoningScratchpad: "", recommendations: [{ fertilizerType: "NPK 19:19:19", quantityPerAcre: "50kg", applicationMethod: "Basal application at sowing" }], organicAlternatives: ["Vermicompost 2 tonnes/acre"] };
        if (systemPrompt.includes('Irrigation Scheduling Agent')) return { schedule: [{ day: "Monday", action: "Water 1.5 inches", reasoning: "Soil moisture low after dry spell" }], waterConservationTip: "Mulch around plants to reduce evaporation." };
        if (systemPrompt.includes('Orchestrator')) return { executiveSummary: "Based on your loamy soil and regional conditions, wheat is a strong choice this season. Apply basal NPK at sowing, delay spraying until after the forecast showers pass, and irrigate early in the week to replenish soil moisture." };
        return {};
    }
    
    try {
        const msg = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 2000,
            temperature,
            system: systemPrompt,
            messages: [
                { role: "user", content: userPrompt }
            ]
        });

        const textOutput = msg.content[0].text;
        return parseJsonResponse(textOutput);
    } catch (error) {
        console.error("LLM Error:", error);
        throw new Error("Failed to generate response from Claude API.");
    }
};

/**
 * Vision generation for Pest Detection
 */
export const invokeClaudeVisionJSON = async (systemPrompt, base64Image, mediaType, userPrompt, temperature = 0) => {
    if (isMockMode()) {
        console.warn("Mocking Claude Vision because no API Key is provided.");
        return {
            reasoningScratchpad: "Visible brown lesions with concentric rings on leaf surface suggest fungal pathology.",
            diagnosis: "Early Blight",
            confidence: 87,
            treatmentSpecs: {
                chemical: ["Chlorothalonil spray every 7-10 days"],
                organic: ["Neem oil spray and remove affected leaves"],
                preventative: ["Crop rotation and improved air circulation"],
            },
        };
    }
    
    try {
        const msg = await anthropic.messages.create({
            model: MODEL,
            max_tokens: 2000,
            temperature,
            system: systemPrompt,
            messages: [
                { 
                    role: "user", 
                    content: [
                        {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: mediaType,
                                data: base64Image
                            }
                        },
                        {
                            type: "text",
                            text: userPrompt
                        }
                    ] 
                }
            ]
        });

        const textOutput = msg.content[0].text;
        return parseJsonResponse(textOutput);
    } catch (error) {
        console.error("LLM Vision Error:", error);
        throw new Error("Failed to process image with Claude API.");
    }
};
