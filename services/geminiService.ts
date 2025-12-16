import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TEXT_MODEL = 'gemini-2.5-flash';
const IMAGE_MODEL = 'gemini-2.5-flash-image';

export const enhanceUserPrompt = async (originalPrompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `You are an expert AI prompt engineer. Your task is to refine the user's idea into a professional image generation prompt while strictly adhering to their original intent.
      
      Guidelines:
      1. UNDERSTAND THE CORE IDEA: accurate subject, action, and setting from the original prompt are mandatory. Do not remove or alter key elements.
      2. ENHANCE QUALITY: Add specific details about lighting (e.g., volumetric, cinematic), composition (e.g., wide angle, rule of thirds), art style (e.g., photorealistic, 3D render, oil painting), and texture/detail (e.g., 8k, highly detailed).
      3. CLARITY: Ensure the prompt is structured clearly for an image generation model.
      
      ONLY return the enhanced prompt text, nothing else.
      
      Original Prompt: "${originalPrompt}"`,
    });
    return response.text?.trim() || originalPrompt;
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    return originalPrompt; // Fallback to original
  }
};

export const generateExplanation = async (original: string, enhanced: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: `Compare these two image prompts and explain briefly (in 2-3 sentences) why the enhanced version is likely to produce a better, more professional image while preserving the user's original idea.
      
      Original: "${original}"
      Enhanced: "${enhanced}"`,
    });
    return response.text?.trim() || "Enhanced prompts usually include more specific details about lighting and style.";
  } catch (error) {
    console.error("Error generating explanation:", error);
    return "Optimization details unavailable.";
  }
};

export const generateImageFromPrompt = async (
  prompt: string, 
  aspectRatio: AspectRatio = '1:1',
  referenceImageBase64?: string
): Promise<string | null> => {
  try {
    const parts: any[] = [];
    
    // Add reference image if provided (Multimodal prompt)
    if (referenceImageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/png', // Assuming PNG for simplicity, usually safe for standard base64 inputs
          data: referenceImageBase64
        }
      });
    }

    // Add text prompt
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: parts
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio
        }
      }
    });

    // Extract image from response parts
    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
