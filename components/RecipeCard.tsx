
import React, { useState } from 'react';
import { BeatRecipe, RecipeParameters } from '../types';
import { getDetailedParameters } from '../services/geminiService';

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
    if (params) {
      setShowModal(true);
      return;
    }
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
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-orange-100">{recipe.style}</p>
        </div>
        
        <div className="p-8 space-y-8 flex-1">
          <p className="text-sm leading-relaxed italic text-[#4a5f5a] font-medium">
            "{recipe.description}"
          </p>

          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] border-b pb-2 text-[#4a5f5a] border-black/5">Architectural Chain</h3>
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="p-4 transition-all bg-white/30 rounded-[1.5rem] border border-white/40">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-orange-400 rounded-full shadow-inner" />
                  <span className="text-sm font-black tracking-tight text-[#2c3e3a]">{ing.instrument}</span>
                </div>
                <div className="pl-4 border-l-2 border-orange-200 space-y-3">
                  {ing.processing.map((proc, j) => (
                    <div key={j} className="flex flex-col">
                      <span className="text-xs font-bold text-[#2c3e3a]">
                        {proc.pluginName}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 text-[#4a5f5a]">
                        {proc.purpose}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 mt-auto">
          <button
            onClick={fetchParams}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 font-black py-4 px-6 rounded-full text-[10px] uppercase tracking-[0.2em] transition-all transform active:scale-95 bg-white border border-orange-200 text-[#2c3e3a] shadow-xl shadow-orange-900/10 hover:bg-orange-50"
          >
            {loading ? "Decrypting..." : "Reveal Parameters"}
          </button>
        </div>
      </div>

      {/* Parameter Detail Modal */}
      {showModal && params && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-5xl max-h-[85vh] overflow-y-auto transition-all bg-[#f0f4f3]/90 backdrop-blur-3xl border-white rounded-[4rem] p-10 shadow-2xl">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-4xl font-black tracking-tighter text-[#2c3e3a]">
                  {params.recipeTitle}
                </h2>
                <p className="text-[11px] font-black uppercase tracking-[0.4em] mt-2 text-orange-500">
                  Granular Parameter Manual
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="transition-all hover:scale-110 text-[#2c3e3a]">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {params.dives.map((dive, idx) => (
                <div key={idx} className="p-6 transition-all bg-white/60 border border-white rounded-[2.5rem] shadow-sm">
                  <h4 className="text-xl font-black mb-6 pb-4 border-b tracking-tight text-[#2c3e3a] border-black/5">
                    {dive.pluginName}
                  </h4>
                  <div className="space-y-6 mb-8">
                    {dive.settings.map((set, sIdx) => (
                      <div key={sIdx} className="grid grid-cols-1 gap-1">
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#4a5f5a]">{set.parameter}</div>
                        <div className="flex items-baseline gap-4">
                          <div className="text-base font-black text-orange-600">{set.value}</div>
                          <div className="text-[11px] font-medium leading-tight text-[#4a5f5a]/80">{set.explanation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto p-4 rounded-[1.5rem] text-xs font-medium leading-relaxed bg-orange-50 text-[#2c3e3a] border border-orange-100">
                    <span className="font-black uppercase tracking-widest mr-2 opacity-50">Pro Tip:</span>
                    {dive.proTip}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 p-8 transition-all bg-white/40 border border-white rounded-[3rem]">
              <h3 className="text-sm font-black uppercase mb-4 tracking-[0.3em] text-orange-500">Final Engineering Briefing</h3>
              <p className="text-sm leading-relaxed text-[#2c3e3a] font-medium">
                {params.mixingAdvice}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
