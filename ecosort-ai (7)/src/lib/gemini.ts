export type WasteCategory =
  | 'Plastic'
  | 'Paper'
  | 'Glass'
  | 'Metal'
  | 'Organic'
  | 'Cardboard'
  | 'E-Waste'
  | 'Trash';

export interface WasteItem {
  item: string;
  category: WasteCategory;
  confidence: number;
  recyclable: boolean;
  decomposition_time: string;
  disposal_tips: string;
  eco_alternative: string;
  bbox?: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
  timestamp?: number;
  id?: string;
  image?: string; // Base64 image string
}

import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;
let currentApiKey: string | null = null;

export function setCustomApiKey(key: string) {
  if (!key) return;
  currentApiKey = key;
  ai = new GoogleGenAI({ apiKey: key });
}

export function getCustomApiKey() {
  return currentApiKey;
}

function getAI() {
  if (!ai) {
    const apiKey = currentApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API Key is missing. Please set GEMINI_API_KEY in your environment variables or settings.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function validateApiKey(key: string): Promise<boolean> {
  try {
    const tempAI = new GoogleGenAI({ apiKey: key });
    await tempAI.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: { parts: [{ text: "ping" }] }
    });
    return true;
  } catch (error) {
    console.error("API Key validation failed:", error);
    return false;
  }
}

const schema = {
  type: Type.OBJECT,
  properties: {
    item: { type: Type.STRING },
    category: { type: Type.STRING, enum: ['Plastic', 'Paper', 'Glass', 'Metal', 'Organic', 'Cardboard', 'E-Waste', 'Trash'] },
    confidence: { type: Type.NUMBER },
    recyclable: { type: Type.BOOLEAN },
    decomposition_time: { type: Type.STRING },
    disposal_tips: { type: Type.STRING },
    eco_alternative: { type: Type.STRING },
    bbox: {
      type: Type.ARRAY,
      items: { type: Type.NUMBER },
      description: "Bounding box coordinates [ymin, xmin, ymax, xmax] normalized to 0-1 range. If multiple items, pick the most prominent one."
    }
  },
  required: ['item', 'category', 'confidence', 'recyclable', 'decomposition_time', 'disposal_tips']
};

export async function analyzeImage(base64Image: string): Promise<WasteItem> {
  try {
    const genAI = getAI();
    
    // Remove data URL prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: "Analyze this image and identify the primary waste item. Focus on waste segregation. Return the bounding box of the item if possible." }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as WasteItem;
  } catch (error: any) {
    if (isRateLimitError(error)) {
      console.warn("Quota exceeded for analyzeImage. Returning mock data.");
      return {
        item: "Plastic Bottle (Demo)",
        category: "Plastic",
        confidence: 0.95,
        recyclable: true,
        decomposition_time: "450 years",
        disposal_tips: "Empty liquid, crush to save space, and place in plastics recycling bin. Keep cap on if possible.",
        eco_alternative: "Use a reusable stainless steel water bottle.",
        bbox: [0.25, 0.25, 0.75, 0.75]
      };
    }
    console.error("Error analyzing image:", error);
    throw new Error(error.message || "Failed to analyze image. Please try again.");
  }
}

export async function chatWithGemini(message: string, history: { role: 'user' | 'model', parts: [{ text: string }] }[] = []) {
  try {
    const genAI = getAI();
    const chat = genAI.chats.create({
      model: 'gemini-3.1-pro-preview',
      history: history,
      config: {
        systemInstruction: "You are EcoBot, a helpful and knowledgeable recycling assistant. Your goal is to help users sort waste, understand recycling symbols, and live a more sustainable lifestyle. Keep answers concise and encouraging.",
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error: any) {
    if (isRateLimitError(error)) {
      console.warn("Quota exceeded for chatWithGemini. Returning mock response.");
      return "I'm currently experiencing high traffic (API quota exceeded). However, I can tell you that generally, it's best to clean your recyclables before binning them! (Demo Mode)";
    }
    console.error("Error in chat:", error);
    throw error;
  }
}

export async function generateEcoImage(prompt: string) {
  try {
    const genAI = getAI();
    const response = await genAI.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    // Extract image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error: any) {
    if (isRateLimitError(error)) {
      console.warn("Quota exceeded for generateEcoImage. Returning placeholder.");
      // Return a placeholder image URL (using a reliable placeholder service)
      return "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop"; 
    }
    console.error("Error generating image:", error);
    throw error;
  }
}

export async function getFastEcoTip() {
  try {
    const genAI = getAI();
    const response = await genAI.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: {
        parts: [{ text: "Give me a very short, one-sentence eco-tip or recycling fact. Be interesting." }]
      }
    });
    return response.text;
  } catch (error: any) {
    // Fallback if API fails (including rate limits)
    console.warn("Error getting tip (possibly quota):", error);
    return "Did you know? Recycling one aluminum can saves enough energy to run a TV for three hours.";
  }
}

function isRateLimitError(error: any): boolean {
  if (error.message && error.message.includes("429")) return true;
  if (typeof error.message === 'string' && error.message.startsWith('{')) {
    try {
      const errorObj = JSON.parse(error.message);
      return errorObj.error && errorObj.error.code === 429;
    } catch (e) {
      return false;
    }
  }
  return false;
}
