
import React from 'react';
import { SavedRecipe, UIPreset } from '../types';

interface RecipeViewerModalProps {
  recipe: SavedRecipe;
  presets?: UIPreset[];
  onClose: () => void;
  onLinkPreset?: (presetId: string) => void;
}

const getContrastColor = (hexcolor: string) => {
  if (!hexcolor || hexcolor.length < 7) return 'white';
  const r = parseInt(hexcolor.substring(1, 3), 16);
  const g = parseInt(hexcolor.substring(3, 5), 16);
  const b = parseInt(hexcolor.substring(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
};

export const RecipeViewerModal: React.FC<RecipeViewerModalProps> = ({ recipe, presets = [], onClose, onLinkPreset }) => {
  const params = recipe.parameters;
  const linkedPreset = presets.find(p => p.id === recipe.linkedPresetId);

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center p-4 sm:p-12 lg:p-20 bg-black/60 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="w-full max-w-6xl my-auto flex flex-col bg-slate-50 rounded-[3rem] sm:rounded-[5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden border border-white/50 relative">
        
        {/* Header Section */}
        <div className="sticky top-0 z-10 flex justify-between items-center px-8 sm:px-16 py-6 sm:py-10 bg-white/95 backdrop-blur-2xl border-b border-slate-200">
          <div className="flex items-center gap-4 sm:gap-6">
            <div 
              className="w-12 h-12 sm:w-20 sm:h-20 rounded-[1.2rem] sm:rounded-[2.5rem] flex items-center justify-center shadow-lg border-2 border-white/40"
              style={{ backgroundColor: recipe.bubbleColor }}
            >
              <span className="text-lg sm:text-3xl font-black text-white drop-shadow-sm">
                {recipe.title.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-xl sm:text-4xl font-black tracking-tighter text-slate-900 leading-tight">
                {recipe.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                <p className="text-[8px] sm:text-[12px] font-black uppercase tracking-[0.3em] text-orange-600">
                  {recipe.style} • Vault Record
                </p>
                {recipe.artistTypes && recipe.artistTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] text-slate-300">•</span>
                    {recipe.artistTypes.map((artist, i) => (
                      <span key={i} className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-slate-500 italic">
                        {artist}
                      </span>
                    ))}
                  </div>
                )}
                {linkedPreset && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[7px] font-black uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: linkedPreset.bubbleColor }} />
                    Tied to: {linkedPreset.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 sm:p-5 rounded-[1rem] sm:rounded-[1.5rem] bg-slate-100 text-slate-900 transition-all hover:bg-red-500 hover:text-white active:scale-90 shadow-sm"
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 sm:p-16 lg:p-20 space-y-12 sm:space-y-16">
          
          {/* Preset Linking Section */}
          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 sm:p-12 shadow-sm">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Visual Tie-In</h3>
                  <p className="text-sm font-bold text-slate-700">Link this recipe to one of your Studio Personas.</p>
                </div>
                <div className="flex items-center gap-4">
                  {linkedPreset && (
                    <div className="w-10 h-10 rounded-full border-4 border-white shadow-lg" style={{ background: linkedPreset.bubbleColor }} />
                  )}
                  <select 
                    value={recipe.linkedPresetId || ''} 
                    onChange={(e) => onLinkPreset?.(e.target.value)}
                    className="bg-slate-100 border-none rounded-2xl px-6 py-3 font-black text-[10px] uppercase tracking-widest outline-none focus:ring-4 focus:ring-orange-500/20 transition-all cursor-pointer"
                  >
                    <option value="">No UI Preset Linked</option>
                    {presets.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
             </div>
          </section>

          {/* Summary Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4">Architect's Brief</h3>
                <p className="text-base sm:text-lg font-bold italic text-slate-700 leading-relaxed border-l-4 border-orange-500 pl-6 py-2">
                  "{recipe.description}"
                </p>
              </div>
              
              <div>
                <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4">Mastering Path</h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.mastering.map((m, i) => (
                    <span key={i} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-300">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">Signal Flow Matrix</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {recipe.ingredients.map((ing, i) => (
                  <div key={i} className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                      <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{ing.instrument}</span>
                    </div>
                    <div className="space-y-3 pl-6 border-l-2 border-slate-100">
                      {ing.processing.map((proc, j) => (
                        <div key={j} className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">{proc.pluginName}</span>
                          <span className="text-[8px] uppercase font-black tracking-widest text-slate-500">{proc.purpose}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Parameters Section */}
          {params ? (
            <section className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center gap-6">
                <h3 className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900">Deep Protocol Decryption</h3>
                <div className="h-[2px] flex-1 bg-slate-200" />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                {params.dives.map((dive, idx) => (
                  <div key={idx} className="flex flex-col bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500">
                    <div className="px-8 sm:px-10 py-6 sm:py-7 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                      <h4 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 uppercase">
                        {dive.pluginName}
                      </h4>
                      <span className="text-[9px] font-black bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase tracking-widest">
                        Module {idx + 1}
                      </span>
                    </div>
                    
                    <div className="p-8 sm:p-10 space-y-8 flex-1">
                      {dive.settings.map((set, sIdx) => (
                        <div key={sIdx} className="flex flex-col sm:flex-row gap-3 sm:gap-8 pb-8 border-b border-slate-50 last:border-0 last:pb-0">
                          <div className="sm:w-1/3">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-1">Param</span>
                            <span className="text-xs sm:text-sm font-bold text-slate-800">{set.parameter}</span>
                          </div>
                          <div className="sm:w-1/4">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-1">Value</span>
                            <span className="text-base sm:text-lg font-black text-orange-500">{set.value}</span>
                          </div>
                          <div className="flex-1">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block mb-1">Reasoning</span>
                            <p className="text-[11px] sm:text-xs font-medium leading-relaxed text-slate-600">{set.explanation}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="px-8 sm:px-10 py-6 sm:py-7 bg-orange-50/50 border-t border-orange-100">
                      <p className="text-[11px] sm:text-[13px] font-bold leading-relaxed text-slate-800 italic">
                        <span className="font-black uppercase tracking-widest text-orange-600 mr-2 not-italic">Pro Tip:</span>
                        {dive.proTip}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mixing Advice */}
              <div className="p-10 sm:p-16 bg-slate-900 rounded-[3rem] sm:rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-16 opacity-10 scale-150 rotate-12 transition-transform group-hover:rotate-0 duration-700">
                  <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                <h3 className="text-[10px] font-black uppercase mb-8 tracking-[0.5em] text-orange-400 flex items-center gap-4">
                  <span className="w-8 sm:w-12 h-[2px] bg-orange-400" />
                  Engineering Verdict
                </h3>
                <p className="text-lg sm:text-2xl font-bold leading-relaxed max-w-4xl relative z-10">
                  {params.mixingAdvice}
                </p>
              </div>
            </section>
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="text-6xl animate-pulse">📡</div>
              <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Awaiting Parameter Sync...</h3>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 sm:p-10 bg-white border-t border-slate-200 flex justify-center">
          <button 
            onClick={onClose}
            className="px-12 sm:px-16 py-4 sm:py-5 rounded-full bg-slate-900 text-white font-black text-[10px] sm:text-sm uppercase tracking-[0.4em] transition-all hover:bg-orange-500 hover:shadow-2xl active:scale-95 shadow-lg"
          >
            Close vault record
          </button>
        </div>
      </div>
    </div>
  );
};
