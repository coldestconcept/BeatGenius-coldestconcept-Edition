
import { GoogleGenAI, Type } from "@google/genai";
import { VSTPlugin, RecommendationResponse, BeatRecipe, RecipeParameters } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBeatRecommendations = async (plugins: VSTPlugin[]): Promise<RecommendationResponse> => {
  const pluginListStr = plugins.map(p => `${p.vendor} - ${p.name} (${p.type})`).join('\n');

  const prompt = `
    Analyze my VST plugin list and suggest 3 high-level "Beat Recipes" for the craziest rap beat.
    Only use plugins from this list:
    ${pluginListStr}

    Focus on modern sub-genres: Melodic Trap, Dark Drill, High-Energy Rage.
  `;

  const response = await ai.models.generateContent({
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

  const jsonStr = response.text?.trim() || '{"recipes": []}';
  return JSON.parse(jsonStr);
};

export const getDetailedParameters = async (recipe: BeatRecipe): Promise<RecipeParameters> => {
  const prompt = `
    For the following Beat Recipe, provide in-depth plugin parameters and beginner-friendly explanations for EVERY plugin mentioned.
    
    Recipe: ${recipe.title} (${recipe.style})
    Description: ${recipe.description}
    Ingredients: ${JSON.stringify(recipe.ingredients)}
    Mastering: ${recipe.mastering.join(', ')}

    Be specific. For a Compressor, mention Threshold, Ratio, Attack, Release. For EQ, mention Frequencies.
    Explain the settings so a beginner understands WHY they are being adjusted.
  `;

  const response = await ai.models.generateContent({
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

  const jsonStr = response.text?.trim() || '{"dives": []}';
  return JSON.parse(jsonStr);
};
