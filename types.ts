
export interface VSTPlugin {
  vendor: string;
  name: string;
  type: string;
  version: string;
  lastModified: string;
}

export interface SignalChainStep {
  pluginName: string;
  purpose: string;
}

export interface ParameterSetting {
  parameter: string;
  value: string;
  explanation: string;
}

export interface PluginDeepDive {
  pluginName: string;
  settings: ParameterSetting[];
  proTip: string;
}

export interface RecipeParameters {
  recipeTitle: string;
  dives: PluginDeepDive[];
  mixingAdvice: string;
}

export interface BeatRecipe {
  title: string;
  style: string;
  description: string;
  ingredients: {
    instrument: string;
    processing: SignalChainStep[];
  }[];
  mastering: string[];
}

export interface Folder {
  id: string;
  name: string;
}

export interface SavedRecipe extends BeatRecipe {
  id: string;
  savedAt: string;
  bubbleColor: string;
  folderId?: string;
}

export interface HistoryItem extends BeatRecipe {
  generatedAt: string;
}

export interface User {
  name: string;
  email: string;
  photo: string;
}

export interface RecommendationResponse {
  recipes: BeatRecipe[];
}

export type AppTheme = 'coldest' | 'crazy-bird';

export type KnifeStyle = 'standard' | 'gold' | 'bloody' | 'adamant' | 'mythril' | 'samuels-saber';
