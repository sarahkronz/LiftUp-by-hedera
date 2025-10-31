import { GoogleGenAI, Type } from "@google/genai";
import { Project } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        suggestedTitle: {
            type: Type.STRING,
            description: 'A more compelling and clear title for the project. Should be concise and impactful.',
        },
        suggestedDescription: {
            type: Type.STRING,
            description: 'An improved, more engaging project description that highlights key benefits for investors and creates a strong call to action.',
        },
    },
    required: ['suggestedTitle', 'suggestedDescription'],
};

class AIService {
    async getProjectSuggestions(title: string, description: string): Promise<{ suggestedTitle: string; suggestedDescription: string; }> {
        const prompt = `
            You are an expert copywriter and marketing strategist specializing in crowdfunding campaigns.
            Your task is to take a draft project title and description and make them more compelling, clear, and engaging for potential investors.
            Keep the core idea of the project intact, but enhance the language to inspire confidence and excitement.

            Current Title: "${title}"
            Current Description: "${description}"

            Please provide an improved title and description in the specified JSON format.
        `;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: responseSchema,
                    temperature: 0.7,
                },
            });

            const jsonText = response.text.trim();
            // Basic validation to ensure it's a parseable object.
            if (jsonText.startsWith('{') && jsonText.endsWith('}')) {
                 return JSON.parse(jsonText);
            } else {
                throw new Error("Received a non-JSON response from the AI.");
            }
        } catch (error) {
            console.error("Error fetching AI suggestions:", error);
            throw new Error("Failed to get suggestions from AI. Please try again.");
        }
    }
}

export const aiService = new AIService();