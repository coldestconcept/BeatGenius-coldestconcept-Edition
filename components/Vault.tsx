
import React, { useState } from 'react';
import { SavedRecipe, AppTheme, Folder } from '../types';

interface VaultProps {
  theme: AppTheme;
  recipes: SavedRecipe[];
  folders: Folder[];
  onRemove: (id: string) => void;
  onUpdateColor: (id: string, color: string) => void;
  onUpdateFolder: (id: string, folderId: string) => void;
  onAddFolder: (name: string) => void;
  onRemoveFolder: (id: string) => void;
  onOpen: (recipe: SavedRecipe) => void;
  onClose: () => void;
}

export const Vault: React.FC<VaultProps> = ({ 
  theme, 
  recipes, 
  folders,
  onRemove, 
  onUpdateColor, 
  onUpdateFolder,
  onAddFolder,
  onRemoveFolder,
  onOpen, 
  onClose 
}) => {
  const [activeFolderId, setActiveFolderId] = useState<string | 'all'>('all');
  const [newFolderName, setNewFolderName] = useState('');

  const containerClasses = theme === 'coldest' 
    ? "bg-white/95 border-white text-[#0c4a6e]" 
    : "bg-[#0a0a0a]/95 border-red-900/50 text-red-50";

  const filteredRecipes = activeFolderId === 'all' 
    ? recipes 
    : recipes.filter(r => r.folderId === activeFolderId);

  const handleAddFolder = () => {
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim());
      setNewFolderName('');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className={`w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col rounded-[4rem] border shadow-2xl relative ${containerClasses}`}>
        <button onClick={onClose} className="absolute top-8 right-8 p-2 rounded-full hover:bg-black/5 transition-all z-20">
           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Folders */}
          <aside className="w-64 border-r border-black/5 p-8 flex flex-col gap-6">
            <header>
              <h2 className="text-2xl font-black tracking-tighter mb-1">Folders</h2>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Organize your gear</p>
            </header>

            <nav className="flex flex-col gap-1 overflow-y-auto flex-1">
              <button 
                onClick={() => setActiveFolderId('all')}
                className={`text-left px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeFolderId === 'all' ? 'bg-orange-500 text-white' : 'hover:bg-black/5'}`}
              >
                All Recipes
              </button>
              {folders.map(folder => (
                <div key={folder.id} className="group flex items-center gap-1">
                  <button 
                    onClick={() => setActiveFolderId(folder.id)}
                    className={`flex-1 text-left px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all truncate ${activeFolderId === folder.id ? 'bg-orange-500 text-white' : 'hover:bg-black/5'}`}
                  >
                    {folder.name}
                  </button>
                  <button 
                    onClick={() => onRemoveFolder(folder.id)}
                    className="opacity-0 group-hover:opacity-40 hover:opacity-100 p-2 text-red-500 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </nav>

            <div className="pt-4 border-t border-black/5">
              <input 
                type="text" 
                placeholder="New Folder..." 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full bg-black/5 rounded-xl px-4 py-2 text-xs font-bold outline-none mb-2"
                onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
              />
              <button 
                onClick={handleAddFolder}
                className="w-full py-2 bg-black/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black/20"
              >
                Create Folder
              </button>
            </div>
          </aside>

          {/* Main Content - Recipes */}
          <main className="flex-1 overflow-y-auto p-12">
            <header className="mb-12">
              <h2 className="text-4xl font-black tracking-tighter mb-2">
                {activeFolderId === 'all' ? 'Studio Vault' : folders.find(f => f.id === activeFolderId)?.name}
              </h2>
              <p className="text-sm font-bold uppercase tracking-[0.3em] opacity-60">Architecture Repository</p>
            </header>

            {filteredRecipes.length === 0 ? (
              <div className="py-20 text-center opacity-40">
                <p className="text-xl font-black italic">Nothing found in this section.</p>
                <p className="text-sm mt-2">Add recipes to your favorites or move them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredRecipes.map((recipe) => (
                  <div 
                    key={recipe.id}
                    className="group relative flex items-center gap-6 p-6 rounded-[2.5rem] bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    <div 
                      onClick={() => onOpen(recipe)}
                      className="w-16 h-16 rounded-full flex-shrink-0 cursor-pointer transition-transform hover:scale-110 shadow-xl border-4 border-white/40 flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: recipe.bubbleColor }}
                    >
                      <span className="text-white text-xl font-black">{recipe.title.charAt(0)}</span>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <h3 onClick={() => onOpen(recipe)} className="text-lg font-black tracking-tight truncate cursor-pointer hover:underline">
                        {recipe.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-[10px] font-black uppercase tracking-widest opacity-60">
                        <span>{recipe.style}</span>
                        <span className="w-1 h-1 rounded-full bg-current" />
                        <select 
                          value={recipe.folderId || ''} 
                          onChange={(e) => onUpdateFolder(recipe.id, e.target.value)}
                          className="bg-transparent font-black uppercase border-none outline-none focus:ring-0 cursor-pointer hover:opacity-100 opacity-60"
                        >
                          <option value="">No Folder</option>
                          {folders.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* RGB Color Picker */}
                      <div className="flex items-center gap-3 mt-3">
                        <label className="text-[9px] font-black uppercase tracking-widest opacity-40">Skin Color:</label>
                        <input 
                          type="color" 
                          value={recipe.bubbleColor} 
                          onChange={(e) => onUpdateColor(recipe.id, e.target.value)}
                          className="w-6 h-6 rounded-full border-none cursor-pointer bg-transparent"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => onRemove(recipe.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 transition-all"
                    >
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
