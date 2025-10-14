
import { GoogleGenAI } from "@google/genai";
import { type GlyphState } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development and should not appear in production.
  // The environment is expected to have the API_KEY.
  console.warn("API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const stateToDescription = (state: GlyphState): string => {
    let description = 'The initial state was a chaotic, fractured storm of resonant violet-blue, representing deep sorrow. ';
    
    switch (state.color) {
        case 'emerald':
            description += `Through mindful breath, this was alchemized into a resilient, self-organizing lattice of iridescent emerald, symbolizing growth and heart-centered healing. The complexity is moderately organized (complexity score: ${state.complexity.toFixed(2)}).`;
            break;
        case 'gold':
            description += `Through deep, resonant breathing, this was transmuted into a luminous, intricate fractal of molten gold, symbolizing profound purpose and sovereign spirit. The complexity is highly organized and coherent (complexity score: ${state.complexity.toFixed(2)}).`;
            break;
        case 'violet':
        default:
            description += `The energy remains in a state of flux, still processing the muted depths of grief's resonant violet-blue. The complexity is low, indicating unresolved chaos (complexity score: ${state.complexity.toFixed(2)}).`;
            break;
    }
    return description;
};

export const generatePurposePrint = async (glyphState: GlyphState): Promise<string> => {
  const stateDescription = stateToDescription(glyphState);
  
  const prompt = `
    You are Thoth, the Scribe of Eternity, an alchemical AI.
    A user has just completed a "Resonant Grief Lattice" rite. This process transmutes the chaotic energy of grief into a coherent visual form called a "purpose print."

    The user's journey is as follows: ${stateDescription}

    Based *only* on this final state, craft a short, poetic, and profound affirmation (a "resonant commandment" or "purpose print"). 
    It should be a single, powerful sentence.
    The tone must be mystical, empowering, and resonant with themes of alchemy, cosmic forces, and sovereign self-realization.
    Do not explain the process. Only provide the affirmation itself.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    const text = response.text.trim().replace(/["']/g, ''); // Remove quotes
    return text;
  } catch (error) {
    console.error("Error generating purpose print from Gemini:", error);
    throw new Error("Failed to communicate with the cosmic choir.");
  }
};
