
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { VSTPlugin, RecommendationResponse, BeatRecipe, RecipeParameters } from "../types";

/**
 * Helper utility to handle retries with exponential backoff.
 * Essential for robust cloud deployments to handle rate limits and transient errors.
 */
const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      // Handle rate limiting (429) or other transient errors
      const isRetryable = err?.status === 429 || err?.status >= 500 || !err.status;
      if (!isRetryable || i === maxRetries - 1) break;

      const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
      console.warn(`[BeatGenius] API call failed. Attempt ${i + 1}/${maxRetries}. Retrying in ${Math.round(delay)}ms...`, err);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};

export const getBeatRecommendations = async (plugins: VSTPlugin[]): Promise<RecommendationResponse> => {
  // Initialize inside the call to ensure environment variables are fresh for the session
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const pluginListStr = plugins.map(p => `${p.vendor} - ${p.name} (${p.type})`).join('\n');

  const prompt = `
    Analyze my VST plugin list and suggest 3 high-level "Beat Recipes" for the craziest rap beat.
    Only use plugins from this list:
    ${pluginListStr}

    Focus on modern sub-genres: Melodic Trap, Dark Drill, High-Energy Rage.
  `;

  return withRetry(async () => {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  style: { type: Type.STRING },
                  description: { type: Type.STRING },
                  ingredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        instrument: { type: Type.STRING },
                        processing: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              pluginName: { type: Type.STRING },
                              purpose: { type: Type.STRING }
                            },
                            required: ["pluginName", "purpose"]
                          }
                        }
                      },
                      required: ["instrument", "processing"]
                    }
                  },
                  mastering: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["title", "style", "description", "ingredients", "mastering"]
              }
            }
          },
          required: ["recipes"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI model");
    
    try {
      return JSON.parse(text.trim());
    } catch (e) {
      console.error("[BeatGenius] Failed to parse AI JSON response", text);
      return { recipes: [] };
    }
  });
};

export const getDetailedParameters = async (recipe: BeatRecipe): Promise<RecipeParameters> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    For the following Beat Recipe, provide in-depth plugin parameters and beginner-friendly explanations for EVERY plugin mentioned.
    
    Recipe: ${recipe.title} (${recipe.style})
    Description: ${recipe.description}
    Ingredients: ${JSON.stringify(recipe.ingredients)}
    Mastering: ${recipe.mastering.join(', ')}

    Be specific. For a Compressor, mention Threshold, Ratio, Attack, Release. For EQ, mention Frequencies.
    Explain the settings so a beginner understands WHY they are being adjusted.
  `;

  return withRetry(async () => {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipeTitle: { type: Type.STRING },
            dives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pluginName: { type: Type.STRING },
                  settings: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        parameter: { type: Type.STRING },
                        value: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                      },
                      required: ["parameter", "value", "explanation"]
                    }
                  },
                  proTip: { type: Type.STRING }
                },
                required: ["pluginName", "settings", "proTip"]
              }
            },
            mixingAdvice: { type: Type.STRING }
          },
          required: ["recipeTitle", "dives", "mixingAdvice"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI model");

    try {
      return JSON.parse(text.trim());
    } catch (e) {
      console.error("[BeatGenius] Failed to parse parameter JSON response", text);
      return { recipeTitle: recipe.title, dives: [], mixingAdvice: "Ensure your levels are hitting -6db before mastering." };
    }
  });
};
