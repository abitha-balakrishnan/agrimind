import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key', 
});

/**
 * Standard text generation with JSON enforcement
 */
export const invokeClaudeJSON = async (systemPrompt, userPrompt, temperature = 0) => {
    try {
        const msg = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: 2000,
            temperature,
            system: systemPrompt,
            messages: [
                { role: "user", content: userPrompt }
            ]
        });

        const textOutput = msg.content[0].text;
        
        // Naive extraction of JSON block if model wrapped it in ```json
        const jsonMatch = textOutput.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1]);
        }
        
        // If not wrapped, try direct parse
        return JSON.parse(textOutput);
    } catch (error) {
        console.error("LLM Error:", error);
        throw new Error("Failed to generate response from Claude API.");
    }
};

/**
 * Vision generation for Pest Detection
 */
export const invokeClaudeVisionJSON = async (systemPrompt, base64Image, mediaType, userPrompt, temperature = 0) => {
    try {
        const msg = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20240620",
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
        
        const jsonMatch = textOutput.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1]);
        }
        return JSON.parse(textOutput);
    } catch (error) {
        console.error("LLM Vision Error:", error);
        throw new Error("Failed to process image with Claude API.");
    }
};
