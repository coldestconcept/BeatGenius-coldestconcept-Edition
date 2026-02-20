
import React, { useState } from 'react';
import { BeatRecipe, RecipeParameters, SavedRecipe } from '../types';
import { getDetailedParameters } from '../services/geminiService';
import { DrumPatternDisplay } from './DrumPatternDisplay';

interface RecipeCardProps {
  recipe: BeatRecipe;
  isSaved?: boolean;
  onSave?: (recipe: BeatRecipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isSaved, onSave }) => {
  const [params, setParams] = useState<RecipeParameters | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchParams = async () => {
    // 1. Check if we already have it in local state
    if (params) {
      setShowModal(true);
      return;
    }

    // 2. Check if the recipe object itself has pre-fetched parameters (for offline vault use)
    const savedRecipe = recipe as SavedRecipe;
    if (savedRecipe.parameters) {
      setParams(savedRecipe.parameters);
      setShowModal(true);
      return;
    }

    // 3. Otherwise, fetch from the API
    setLoading(true);
    try {
      const data = await getDetailedParameters(recipe);
      setParams(data);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to load parameters", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col overflow-hidden h-full bg-white/20 backdrop-blur-3xl border border-white/40 rounded-[3rem] shadow-2xl hover:scale-[1.01] transition-transform duration-500 relative group">
        {onSave && (
          <button 
            onClick={() => onSave(recipe)}
            className={`absolute top-6 right-6 z-10 p-3 rounded-full backdrop-blur-md transition-all duration-300 ${isSaved ? 'bg-orange-500 text-white shadow-lg' : 'bg-white/40 text-white hover:bg-white/60'}`}
            title={isSaved ? "Saved to Vault" : "Save to Vault"}
          >
            <svg className={`w-5 h-5 ${isSaved ? 'fill-current' : 'fill-none stroke-current'}`} strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
          </button>
        )}

        <div className="bg-orange-400/80 backdrop-blur-md text-white p-8 rounded-t-[3rem]">
          <h2 className="text-2xl font-black tracking-tighter pr-10">{recipe.title}</h2>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-100">{recipe.style}</p>
            {recipe.artistTypes && recipe.artistTypes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] text-white/40">•</span>
                {recipe.artistTypes.map((artist, i) => (
                  <span key={i} className="text-[10px] font-black uppercase tracking-widest text-white italic">
                    {artist}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-8 space-y-8 flex-1">
          <p className="text-sm leading-relaxed italic text-slate-800 font-medium">
            "{recipe.description}"
          </p>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] border-b pb-2 text-slate-800 border-black/5">Architectural Chain</h3>
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="p-4 transition-all bg-white/30 rounded-[1.5rem] border border-white/40">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-orange-400 rounded-full shadow-inner" />
                  <span className="text-sm font-black tracking-tight text-slate-900">{ing.instrument}</span>
                </div>
                <div className="pl-4 border-l-2 border-orange-200 space-y-3">
                  {ing.processing.map((proc, j) => (
                    <div key={j} className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900">
                        {proc.pluginName}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-700">
                        {proc.purpose}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {recipe.drumPatterns && (
            <div className="mt-8">
              <DrumPatternDisplay patterns={recipe.drumPatterns} />
            </div>
          )}
        </div>

        <div className="p-6 mt-auto">
          <button
            onClick={fetchParams}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 font-black py-4 px-6 rounded-full text-[10px] uppercase tracking-[0.2em] transition-all transform active:scale-95 bg-white border border-orange-200 text-slate-900 shadow-xl shadow-orange-900/10 hover:bg-orange-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Decrypting...
              </>
            ) : "Reveal Parameters"}
          </button>
        </div>
      </div>

      {/* Parameter Detail Modal - Refined "Bubble" Style */}
      {showModal && params && (
        <div className="fixed inset-0 z-[250] flex items-start justify-center p-6 sm:p-12 lg:p-20 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-6xl h-full max-h-[82vh] mt-16 sm:mt-24 lg:mt-32 flex flex-col bg-slate-50 rounded-[3.5rem] sm:rounded-[5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border border-white relative">
            
            {/* Sticky Header inside the Bubble */}
            <div className="sticky top-0 z-10 flex justify-between items-center px-10 sm:px-14 py-8 sm:py-10 bg-white/90 backdrop-blur-xl border-b border-slate-200">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-500 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl sm:text-4xl font-black tracking-tighter text-slate-900 leading-tight">
                    {params.recipeTitle}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <p className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.25em] text-orange-600">
                      Master Protocols
                    </p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-4 sm:p-5 rounded-[1.5rem] bg-slate-100 text-slate-900 transition-all hover:bg-red-500 hover:text-white group active:scale-90 shadow-sm"
                aria-label="Close parameters"
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content inside Bubble */}
            <div className="flex-1 overflow-y-auto p-10 sm:p-14 lg:p-16 space-y-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                {params.dives.map((dive, idx) => (
                  <div key={idx} className="group flex flex-col bg-white border border-slate-200 rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:border-orange-300 transition-all duration-500">
                    <div className="px-10 py-7 bg-slate-50 border-b border-slate-100 flex justify-between items-center group-hover:bg-orange-50 transition-colors">
                      <h4 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                        {dive.pluginName}
                      </h4>
                      <div className="text-[11px] font-black bg-slate-200 text-slate-600 px-4 py-1.5 rounded-full uppercase tracking-widest">
                        Rack {idx + 1}
                      </div>
                    </div>
                    
                    <div className="p-10 space-y-8 flex-1">
                      {dive.settings.map((set, sIdx) => (
                        <div key={sIdx} className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8 pb-8 border-b border-slate-50 last:border-0 last:pb-0">
                          <div className="flex flex-col sm:w-1/3">
                            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-1.5">Parameter</span>
                            <span className="text-sm sm:text-base font-bold text-slate-800">{set.parameter}</span>
                          </div>
                          <div className="flex flex-col sm:w-1/4">
                            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-1.5">Value</span>
                            <span className="text-base sm:text-lg font-black text-orange-500">{set.value}</span>
                          </div>
                          <div className="flex flex-col sm:flex-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-1.5">Logic</span>
                            <span className="text-xs sm:text-[14px] font-medium leading-relaxed text-slate-600">{set.explanation}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="px-10 py-7 bg-orange-50 border-t border-orange-100">
                      <div className="flex gap-5">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-orange-200 flex items-center justify-center font-black text-orange-500 text-sm shadow-sm">!</div>
                        <p className="text-[13px] font-bold leading-relaxed text-slate-800 italic">
                          <span className="font-black uppercase tracking-widest text-orange-600 mr-2 not-italic">Pro Tip:</span>
                          {dive.proTip}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mixing Advice Callout */}
              <div className="relative p-12 sm:p-16 lg:p-20 bg-slate-900 rounded-[3.5rem] sm:rounded-[4.5rem] text-white shadow-2xl overflow-hidden group">
                <div className="absolute top-0 right-0 p-16 opacity-10 scale-150 rotate-12 transition-transform group-hover:rotate-0 duration-700">
                  <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                
                <div className="relative z-10 max-w-4xl">
                  <h3 className="text-xs sm:text-sm font-black uppercase mb-8 tracking-[0.5em] text-orange-400 flex items-center gap-4">
                    <span className="w-12 h-[2px] bg-orange-400" />
                    Session Overview
                  </h3>
                  <p className="text-lg sm:text-2xl font-bold leading-relaxed text-slate-100">
                    {params.mixingAdvice}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-10 sm:p-12 bg-white border-t border-slate-200 flex justify-center">
              <button 
                onClick={() => setShowModal(false)}
                className="px-16 py-5 rounded-full bg-slate-900 text-white font-black text-[11px] sm:text-sm uppercase tracking-[0.4em] transition-all hover:bg-orange-500 hover:shadow-2xl hover:shadow-orange-500/30 active:scale-95"
              >
                Close protocols
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
