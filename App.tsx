
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { VSTPlugin, BeatRecipe, AppTheme, User, SavedRecipe, HistoryItem, Folder, KnifeStyle } from './types';
import { getBeatRecommendations } from './services/geminiService';
import { PluginCard } from './components/PluginCard';
import { RecipeCard } from './components/RecipeCard';
import { Mascot, GrillStyle } from './components/Mascot';
import { AvianField } from './components/RavenField';
import { DAWGuide } from './components/DAWGuide';
import { Vault } from './components/Vault';

// Moved outside to prevent remounting flashes
interface LogoProps {
  size?: number;
  grillStyle: GrillStyle;
  knifeStyle: KnifeStyle;
  theme: AppTheme;
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({ size = 48, grillStyle, knifeStyle, theme, onClick }) => (
  <div 
    className="group relative flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer" 
    onClick={onClick}
  >
    <Mascot 
      size={size} 
      grillStyle={grillStyle} 
      knifeStyle={knifeStyle} 
      glowColor={theme === 'crazy-bird' ? '#ef4444' : '#0ea5e9'} 
      className="relative z-10" 
    />
  </div>
);

const App: React.FC = () => {
  const [csvInput, setCsvInput] = useState<string>('');
  const [plugins, setPlugins] = useState<VSTPlugin[]>([]);
  const [recipes, setRecipes] = useState<BeatRecipe[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [grillStyle, setGrillStyle] = useState<GrillStyle>('iced-out');
  const [knifeStyle, setKnifeStyle] = useState<KnifeStyle>('standard');
  const [theme, setTheme] = useState<AppTheme>('coldest');
  const [showShareHub, setShowShareHub] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth & Onboarding UI
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [tempUsername, setTempUsername] = useState('');
  
  // Persistence States
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bg_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [vault, setVault] = useState<SavedRecipe[]>(() => {
    const saved = localStorage.getItem('bg_vault');
    return saved ? JSON.parse(saved) : [];
  });

  const [folders, setFolders] = useState<Folder[]>(() => {
    const saved = localStorage.getItem('bg_folders');
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('bg_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Handle URL Blueprint Hydration
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#blueprint=')) {
      try {
        const base64 = hash.split('#blueprint=')[1];
        const json = atob(base64);
        const data = JSON.parse(json);
        if (data.plugins) setPlugins(data.plugins);
        if (data.recipes) setRecipes(data.recipes);
        // Clean URL after import
        window.history.replaceState(null, '', window.location.pathname);
      } catch (e) {
        console.error("Failed to hydrate from blueprint", e);
      }
    }
  }, []);

  // Effect for syncing local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('bg_user', JSON.stringify(user));
      localStorage.setItem('bg_vault', JSON.stringify(vault));
      localStorage.setItem('bg_folders', JSON.stringify(folders));
      localStorage.setItem('bg_history', JSON.stringify(history));
    }
  }, [user, vault, folders, history]);

  const handleSignUpClick = () => {
    if (user) return;
    setShowSignUpModal(true);
  };

  const handleSignIn = () => {
    if (!tempUsername.trim()) return;
    const newUser = {
      name: tempUsername.trim(),
      email: `${tempUsername.toLowerCase()}@coldestconcept.com`,
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${tempUsername}`
    };
    setUser(newUser);
    setShowSignUpModal(false);
    setShowOnboardingModal(true);
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('bg_user');
  };

  const saveToVault = (recipe: BeatRecipe) => {
    if (!user) {
      alert("Please Sign Up first to save your favorites!");
      return;
    }
    if (vault.some(r => r.title === recipe.title)) return;
    
    const newSaved: SavedRecipe = {
      ...recipe,
      id: Math.random().toString(36).substr(2, 9),
      savedAt: new Date().toISOString(),
      bubbleColor: '#0ea5e9'
    };
    setVault([...vault, newSaved]);
  };

  const removeFromVault = (id: string) => {
    setVault(vault.filter(r => r.id !== id));
  };

  const updateVaultColor = (id: string, color: string) => {
    setVault(vault.map(r => r.id === id ? { ...r, bubbleColor: color } : r));
  };

  const updateVaultFolder = (id: string, folderId: string) => {
    setVault(vault.map(r => r.id === id ? { ...r, folderId: folderId || undefined } : r));
  };

  const addFolder = (name: string) => {
    const newFolder: Folder = { id: Math.random().toString(36).substr(2, 9), name };
    setFolders([...folders, newFolder]);
  };

  const removeFolder = (id: string) => {
    setFolders(folders.filter(f => f.id !== id));
    setVault(vault.map(r => r.folderId === id ? { ...r, folderId: undefined } : r));
  };

  const parsePlugins = (input: string) => {
    if (!input.trim()) return;
    const lines = input.trim().split('\n');
    const isReaperIni = lines.some(l => l.includes('=') && (l.includes('.dll') || l.includes('.vst3')));
    let parsed: VSTPlugin[] = [];

    if (isReaperIni) {
      parsed = lines.map(line => {
        if (!line.includes('=')) return null;
        const [filename, rest] = line.split('=');
        if (!rest) return null;
        const parts = rest.split(',');
        const displayName = parts[2] || filename;
        const vendorMatch = displayName.match(/\(([^)]+)\)/);
        const vendor = vendorMatch ? vendorMatch[1] : 'Unknown';
        const name = displayName.split('(')[0].trim();
        return {
          vendor,
          name,
          type: filename.toLowerCase().includes('vst3') ? 'VST3' : 'VST2',
          version: 'N/A',
          lastModified: 'Found in INI',
        };
      }).filter((p): p is VSTPlugin => p !== null && p.name !== '');
    } else {
      const startIndex = lines[0] && lines[0].toLowerCase().includes('vendor') ? 1 : 0;
      parsed = lines.slice(startIndex).map(line => {
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const rawName = parts[1]?.replace(/"/g, '').trim() || 'Unknown';
        const rawVendor = parts[0]?.replace(/"/g, '').trim() || 'Unknown';
        return {
          vendor: rawVendor,
          name: rawName,
          type: parts[2]?.replace(/"/g, '').trim() || 'Unknown',
          version: parts[3]?.replace(/"/g, '').trim() || 'Unknown',
          lastModified: parts[4]?.replace(/"/g, '').trim() || 'Unknown',
        };
      }).filter(p => p.name !== 'Unknown');
    }

    if (parsed.length === 0) {
      setError("I couldn't find any plugins. Make sure you copied the list or uploaded the right file!");
      return;
    }
    setPlugins(parsed);
    setError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvInput(content);
        parsePlugins(content);
      }
    };
    reader.onerror = () => {
      setError("Failed to read the file. Please try again.");
    };
    reader.readAsText(file);
    // Reset the input so the same file can be uploaded again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (plugins.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getBeatRecommendations(plugins);
      setRecipes(response.recipes);
      
      if (user) {
        const newHistory: HistoryItem[] = response.recipes.map(r => ({
          ...r,
          generatedAt: new Date().toISOString()
        }));
        setHistory(prev => [...newHistory, ...prev].slice(0, 50));
      }
    } catch (err) {
      setError("Couldn't think of any beats right now. Try again in a second!");
    } finally {
      setLoading(false);
    }
  };

  const generateShareLink = () => {
    const data = { plugins, recipes };
    const base64 = btoa(JSON.stringify(data));
    const url = `${window.location.origin}${window.location.pathname}#blueprint=${base64}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportOfflineApp = () => {
    const data = {
      plugins,
      recipes,
      theme,
      exportedAt: new Date().toLocaleString(),
    };

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My BeatGenius Studio Station</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        body { 
          background: ${theme === 'coldest' ? '#f0f9ff' : '#050505'}; 
          color: ${theme === 'coldest' ? '#0c4a6e' : '#ffffff'}; 
          font-family: 'Inter', sans-serif; 
          margin: 0;
          padding: 0;
        }
        .box { background: rgba(255, 255, 255, ${theme === 'coldest' ? '0.6' : '0.05'}); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 2rem; }
    </style>
</head>
<body class="p-6 md:p-12">
    <div class="max-w-6xl mx-auto space-y-12">
        <div class="bg-orange-500 text-white p-8 md:p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div class="relative z-10">
              <h1 class="text-4xl md:text-6xl font-black tracking-tighter mb-4 uppercase">My Private Studio App</h1>
              <p class="text-lg font-bold opacity-90 mb-8">This file is yours to keep. It works without internet!</p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-black/20 p-6 rounded-3xl">
                  <h3 class="text-xs font-black uppercase tracking-widest mb-2">Step 1: Save This File</h3>
                  <p class="text-[13px] opacity-80 leading-relaxed">Keep this file on your PC. You can rename it to 'My Studio'!</p>
                </div>
                <div class="bg-black/20 p-6 rounded-3xl">
                  <h3 class="text-xs font-black uppercase tracking-widest mb-2">Step 2: No Internet Needed</h3>
                  <p class="text-[13px] opacity-80 leading-relaxed">Open this anytime to see your recipes even if the wifi is out.</p>
                </div>
                <div class="bg-black/20 p-6 rounded-3xl">
                  <h3 class="text-xs font-black uppercase tracking-widest mb-2">Step 3: Keep Favorites</h3>
                  <p class="text-[13px] opacity-80 leading-relaxed">Your PC remembers 'Saved' beats every time you open this file.</p>
                </div>
              </div>
            </div>
            <div class="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-[100px]"></div>
        </div>
        <section class="space-y-8">
            <h2 class="text-3xl font-black uppercase tracking-tighter">Your Beat Recipes</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                ${recipes.map(r => `
                    <div class="box p-8 border border-white/10">
                        <div class="flex justify-between items-start mb-6">
                            <div>
                                <h3 class="text-2xl font-black">${r.title}</h3>
                                <p class="text-[10px] font-black uppercase text-orange-500 tracking-widest mt-1">${r.style}</p>
                            </div>
                        </div>
                        <p class="text-sm italic mb-8 opacity-70 leading-relaxed">"${r.description}"</p>
                        <div class="space-y-4">
                            ${r.ingredients.map(ing => `
                                <div class="p-5 rounded-2xl ${theme === 'coldest' ? 'bg-white/40' : 'bg-black/40'} border border-white/5">
                                    <p class="text-[10px] font-black uppercase opacity-40 mb-3 tracking-widest">${ing.instrument}</p>
                                    <ul class="text-xs space-y-3">
                                        ${ing.processing.map(p => `
                                          <li class="flex flex-col">
                                            <span class="font-black text-sm">${p.pluginName}</span>
                                            <span class="text-[10px] uppercase opacity-60 font-bold">${p.purpose}</span>
                                          </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
        <section class="opacity-50">
            <h2 class="text-xs font-black uppercase tracking-[0.5em] mb-8 text-center">Your Gear Rack (${plugins.length} Plugins)</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                ${plugins.map(p => `
                    <div class="p-3 text-[10px] box ${theme === 'coldest' ? 'bg-white/40' : 'bg-black/60'} border-white/5">
                        <p class="opacity-40 font-black uppercase truncate mb-0.5">${p.vendor}</p>
                        <p class="font-black truncate">${p.name}</p>
                    </div>
                `).join('')}
            </div>
        </section>
        <footer class="pt-20 pb-10 text-center opacity-20">
            <p class="text-[9px] font-black uppercase tracking-[1em]">OFFLINE STATION V1.0 / BEATGENIUS</p>
        </footer>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `My_Studio_App.html`;
    link.click();
    URL.revokeObjectURL(url);
    setShowShareHub(false);
  };

  const filteredPlugins = useMemo(() => {
    return plugins.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [plugins, searchTerm]);

  const cycleGrill = () => {
    if (grillStyle === 'iced-out') setGrillStyle('aquaberry-diamond');
    else if (grillStyle === 'aquaberry-diamond') setGrillStyle('gold');
    else if (grillStyle === 'gold') setGrillStyle('opal');
    else setGrillStyle('iced-out');
  };

  const cycleKnife = () => {
    const styles: KnifeStyle[] = ['standard', 'gold', 'bloody', 'adamant', 'mythril', 'samuels-saber'];
    const nextIndex = (styles.indexOf(knifeStyle) + 1) % styles.length;
    setKnifeStyle(styles[nextIndex]);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'coldest' ? 'crazy-bird' : 'coldest');
  };

  const grillLabel = grillStyle === 'iced-out' ? 'Iced Out' : grillStyle === 'aquaberry-diamond' ? 'Aquaberry' : grillStyle === 'gold' ? 'Gold' : 'Opal';
  const knifeLabel = { standard: 'Standard', gold: 'Gold', bloody: 'Bloody', adamant: 'Adamant', mythril: 'Mythril', 'samuels-saber': "Samuel L's Saber" }[knifeStyle];

  const themeClasses = theme === 'coldest' 
    ? "from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc] text-[#0c4a6e]"
    : "from-[#7f1d1d] via-[#450a0a] to-[#111827] text-red-50";

  // Slightly larger Action Button class to improve readability as requested
  const actionBtnClasses = `text-[10px] px-3.5 py-1 rounded-full font-black uppercase border transition-all truncate max-w-[140px]`;

  return (
    <div className={`min-h-screen transition-all duration-700 flex flex-col bg-gradient-to-br ${themeClasses} font-sans selection:bg-sky-200`}>
      {theme === 'crazy-bird' && <AvianField />}
      {showGuide && <DAWGuide theme={theme} onClose={() => setShowGuide(false)} />}
      {user && showVault && (
        <Vault 
          theme={theme} 
          recipes={vault} 
          folders={folders}
          onClose={() => setShowVault(false)} 
          onRemove={removeFromVault} 
          onUpdateColor={updateVaultColor}
          onUpdateFolder={updateVaultFolder}
          onAddFolder={addFolder}
          onRemoveFolder={removeFolder}
          onOpen={(r) => {}}
        />
      )}

      {showSignUpModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
          <div className={`w-full max-w-md p-10 rounded-[3rem] border shadow-2xl ${theme === 'coldest' ? 'bg-white' : 'bg-[#111] text-white border-red-900/40'}`}>
             <div className="text-center mb-8">
                <Logo size={80} grillStyle={grillStyle} knifeStyle={knifeStyle} theme={theme} onClick={cycleGrill} />
                <h2 className="text-3xl font-black tracking-tighter mt-4">Join the Club</h2>
                <p className="text-xs opacity-50 uppercase tracking-[0.2em] mt-1">Make a profile to save beats</p>
             </div>
             <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block">Choose a name</label>
                  <input 
                    type="text" 
                    value={tempUsername} 
                    onChange={(e) => setTempUsername(e.target.value)}
                    className="w-full bg-black/5 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 outline-none transition-all"
                    placeholder="Producer name..."
                  />
                </div>
                <button 
                  onClick={handleSignIn}
                  className="w-full bg-orange-500 text-white font-black py-4 rounded-full shadow-lg shadow-orange-900/20 active:scale-95 transition-all uppercase text-xs tracking-widest"
                >
                  Join Now
                </button>
                <button 
                  onClick={() => setShowSignUpModal(false)}
                  className="w-full text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                >
                  Go Back
                </button>
             </div>
          </div>
        </div>
      )}

      {showOnboardingModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-12 duration-500">
          <div className="w-full max-w-2xl p-12 rounded-[4rem] bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-2xl relative">
             <h2 className="text-4xl font-black tracking-tighter mb-4">You're in, {user?.name}!</h2>
             <div className="space-y-6 mb-10">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-black">1</div>
                  <p className="text-sm font-medium leading-relaxed">Save your favorite beats to your <strong className="font-black underline">Studio Vault</strong>. Your computer will remember them for next time.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-black">2</div>
                  <p className="text-sm font-medium leading-relaxed">Everything you generate is automatically saved in your <strong className="font-black underline">History Log</strong>.</p>
                </div>
             </div>
             <button 
               onClick={() => setShowOnboardingModal(false)}
               className="w-full bg-white text-orange-600 font-black py-5 rounded-full shadow-2xl active:scale-95 transition-all uppercase text-xs tracking-[0.3em]"
             >
               Start Making Beats
             </button>
          </div>
        </div>
      )}
      
      <div className={`h-8 flex items-center justify-between px-3 text-[11px] font-bold select-none backdrop-blur-md border-b transition-all duration-500 z-[70] ${theme === 'coldest' ? 'bg-white/30 text-[#0c4a6e] border-white/20' : 'bg-black/40 text-red-100 border-red-900/30'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full shadow-inner ${theme === 'coldest' ? 'bg-sky-400' : 'bg-red-600'}`} />
          <span className="tracking-wide uppercase">BeatGenius ColdestConcept Edition</span>
        </div>
        
        <div className="flex items-center gap-4">
          {!user ? (
            <button 
              onClick={handleSignUpClick} 
              className="hover:opacity-70 transition-all uppercase tracking-[0.2em] text-[9px] flex items-center gap-2 bg-orange-500 text-white px-4 py-1 rounded-full shadow-lg"
            >
              Sign Up
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <img src={user.photo} alt={user.name} className="w-4 h-4 rounded-full border border-white/40" />
                <span className="opacity-70 truncate max-w-[120px]">{user.name}</span>
              </div>
              <button 
                onClick={handleSignOut} 
                className="hover:text-red-500 transition-colors uppercase tracking-widest text-[9px] bg-white/10 px-3 py-1 rounded-full"
              >
                Log Out
              </button>
            </div>
          )}
          <div className="h-4 w-[1px] bg-white/20 mx-1" />
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-400/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-gray-400/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          </div>
        </div>
      </div>

      <div className={`py-2 text-center transition-all duration-500 border-b backdrop-blur-md relative z-[60] ${theme === 'coldest' ? 'bg-white/40 border-white/20' : 'bg-black/60 border-red-900/30'}`}>
        <a href="https://www.youtube.com/channel/UC8gMzSxHRWzMzfIjdcqKvQw" target="_blank" rel="noopener noreferrer" className={`text-[9px] font-black uppercase tracking-[0.4em] hover:opacity-70 transition-opacity flex items-center justify-center gap-2 ${theme === 'coldest' ? 'text-sky-700' : 'text-red-500'}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          Best Beats In Universe
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        </a>
      </div>

      <header className={`sticky top-0 z-50 px-6 py-4 border-b transition-all duration-500 backdrop-blur-xl shadow-lg ${theme === 'coldest' ? 'bg-white/20 border-white/30' : 'bg-black/30 border-red-900/40'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size={42} grillStyle={grillStyle} knifeStyle={knifeStyle} theme={theme} onClick={cycleGrill} />
            <div className="flex flex-col">
              <h1 className={`text-xl font-black tracking-tighter leading-none ${theme === 'coldest' ? 'text-[#0c4a6e]' : 'text-white'}`}>BeatGenius</h1>
              <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${theme === 'coldest' ? 'text-sky-600' : 'text-red-500'}`}>
                <a href="https://www.youtube.com/@coldestconcept" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">ColdestConcept</a>
              </span>
            </div>
            
            <div className={`h-8 w-[1px] hidden sm:block ${theme === 'coldest' ? 'bg-sky-900/10' : 'bg-white/10'}`} />
            
            <div className="hidden sm:flex gap-2">
              <button onClick={cycleGrill} className={`${actionBtnClasses} ${theme === 'coldest' ? 'bg-white/40 border-white/60 text-[#0c4a6e] hover:bg-sky-100' : 'bg-red-950/40 border-red-800/60 text-red-100 hover:bg-red-900/60'}`}>Grill: {grillLabel}</button>
              <button onClick={cycleKnife} className={`${actionBtnClasses} !max-w-none !truncate-none ${theme === 'coldest' ? 'bg-white/40 border-white/60 text-[#0c4a6e] hover:bg-sky-100' : 'bg-red-950/40 border-red-800/60 text-red-100 hover:bg-red-900/60'}`}>Knife: {knifeLabel}</button>
              <button onClick={toggleTheme} className={`${actionBtnClasses} ${theme === 'coldest' ? 'bg-white/40 border-white/60 text-[#0c4a6e] hover:bg-red-100' : 'bg-red-600 border-red-500 text-white hover:bg-red-500'}`}>Theme: {theme === 'coldest' ? 'Coldest' : 'Crazy Bird'}</button>
              <button onClick={() => setShowShareHub(!showShareHub)} className={`${actionBtnClasses} flex items-center gap-1 ${theme === 'coldest' ? 'bg-orange-500 border-orange-600 text-white' : 'bg-black border-red-900/50 text-red-500'}`}>Share & Store</button>
              {user && (
                <button onClick={() => setShowVault(true)} className={`${actionBtnClasses} relative ${theme === 'coldest' ? 'bg-sky-500 border-sky-600 text-white' : 'bg-red-900 border-red-700 text-white'}`}>
                  Saved Beats
                  {vault.length > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white text-orange-500 rounded-full flex items-center justify-center text-[6px] font-black shadow-sm">{vault.length}</span>}
                </button>
              )}
            </div>
          </div>
          
          <nav className="hidden md:flex gap-6 lg:gap-8">
            <button onClick={() => setShowGuide(true)} className={`text-xs font-bold uppercase tracking-[0.2em] transition-all border-b-2 border-transparent pb-1 ${theme === 'coldest' ? 'text-[#0369a1] hover:text-[#0c4a6e] hover:border-sky-500' : 'text-red-200/60 hover:text-white hover:border-red-600'}`}>Guide</button>
            <a href="#inventory" className={`text-xs font-bold uppercase tracking-[0.2em] transition-all border-b-2 border-transparent pb-1 ${theme === 'coldest' ? 'text-[#0369a1] hover:text-[#0c4a6e] hover:border-sky-500' : 'text-red-200/60 hover:text-white hover:border-red-600'}`}>My Plugins</a>
          </nav>
        </div>
      </header>

      {/* SHARE HUB MODAL */}
      {showShareHub && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md">
          <div className={`w-full max-w-xl transition-all transform backdrop-blur-2xl p-10 rounded-[4rem] shadow-2xl border ${theme === 'coldest' ? 'bg-white/95 border-white' : 'bg-black/95 border-orange-900/30'}`}>
            <div className="text-center">
              <div className="flex justify-center mb-8"><Logo size={100} grillStyle={grillStyle} knifeStyle={knifeStyle} theme={theme} onClick={cycleGrill} /></div>
              <h2 className={`text-4xl font-black mb-4 tracking-tighter ${theme === 'coldest' ? 'text-[#0c4a6e]' : 'text-white'}`}>Studio Share</h2>
              <p className={`text-sm mb-10 leading-relaxed max-w-sm mx-auto ${theme === 'coldest' ? 'text-[#0c4a6e]/70' : 'text-red-200/60'}`}>
                Send your list to a friend, or download a private app to use offline on your PC.
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="group relative">
                  <button 
                    onClick={generateShareLink} 
                    className={`w-full text-sm font-black py-5 rounded-[2rem] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${theme === 'coldest' ? 'bg-sky-500 text-white' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    {copiedLink ? "Link Copied!" : "Send Studio Link"}
                  </button>
                  <p className="mt-2 text-[10px] uppercase font-bold tracking-widest opacity-40">Share your gear with anyone!</p>
                </div>

                <div className="py-2 flex items-center gap-4">
                  <div className="flex-1 h-[1px] bg-black/10" />
                  <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">or</span>
                  <div className="flex-1 h-[1px] bg-black/10" />
                </div>

                <div className="group relative">
                  <button 
                    onClick={handleExportOfflineApp} 
                    className={`w-full text-sm font-black py-5 rounded-[2rem] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${theme === 'coldest' ? 'bg-white border-sky-200 border-2 text-sky-600' : 'bg-black border-orange-900 border-2 text-orange-500 hover:bg-orange-900/20'}`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download Offline App
                  </button>
                  <p className="mt-2 text-[10px] uppercase font-bold tracking-widest opacity-40">Save a file to your PC for offline studio use.</p>
                </div>
              </div>

              <button onClick={() => setShowShareHub(false)} className={`mt-10 w-full text-[11px] font-black uppercase tracking-[0.4em] ${theme === 'coldest' ? 'text-sky-900/40' : 'text-orange-900'}`}>Close</button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 relative z-10">
        {error && <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-2xl text-red-400 text-sm font-bold text-center">{error}</div>}

        {plugins.length === 0 ? (
          <div className="max-w-3xl mx-auto mt-12 animate-in fade-in zoom-in duration-1000">
            <div className={`p-12 transition-all backdrop-blur-2xl border rounded-[4rem] shadow-2xl ${theme === 'coldest' ? 'bg-white/30 border-white/40' : 'bg-black/40 border-red-900/30'}`}>
              <div className="flex items-center gap-12 mb-10">
                <Logo size={240} grillStyle={grillStyle} knifeStyle={knifeStyle} theme={theme} onClick={cycleGrill} />
                <div>
                  <h2 className={`text-5xl font-black tracking-tighter ${theme === 'coldest' ? 'text-[#0c4a6e]' : 'text-white'}`}>Let's go to the top!</h2>
                  <p className={`text-lg font-medium ${theme === 'coldest' ? 'text-[#0c4a6e]/70' : 'text-red-200/60'}`}>Paste your plugin list or upload a file.</p>
                </div>
              </div>
              <div className="relative group">
                <textarea 
                  value={csvInput} 
                  onChange={(e) => setCsvInput(e.target.value)} 
                  className={`w-full h-80 p-8 text-sm font-mono focus:ring-4 transition-all duration-500 outline-none backdrop-blur-md border shadow-inner rounded-[3rem] ${theme === 'coldest' ? 'bg-white/40 border-white text-[#0c4a6e] focus:bg-white/60' : 'bg-black/60 border-red-900/30 text-red-100 focus:bg-black/80'}`} 
                  placeholder="Paste your plugin list or Reaper .ini content here..." 
                />
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".csv,.txt,.ini" 
                  onChange={handleFileUpload} 
                />

                <div className="absolute bottom-8 right-8 flex gap-3 flex-wrap justify-end">
                  <button onClick={() => setShowGuide(true)} className={`font-black py-4 px-8 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 border ${theme === 'coldest' ? 'bg-white border-sky-200 text-sky-500' : 'bg-black border-red-900 text-red-500'}`}>Help</button>
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className={`font-black py-4 px-8 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 ${theme === 'coldest' ? 'bg-white border-sky-200 text-sky-600' : 'bg-transparent border-red-900 text-red-400'}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Upload File
                  </button>
                  <button onClick={() => parsePlugins(csvInput)} className={`font-black py-4 px-12 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 ${theme === 'coldest' ? 'bg-sky-500 text-white' : 'bg-red-600 text-white'}`}>Load Gear</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-20">
            <section className={`flex flex-col md:flex-row gap-10 items-center justify-between p-10 transition-all backdrop-blur-2xl border rounded-[4rem] shadow-xl ${theme === 'coldest' ? 'bg-white/20 border-white/30' : 'bg-black/40 border-red-900/20'}`}>
              <div className="flex items-center gap-6">
                <Logo size={64} grillStyle={grillStyle} knifeStyle={knifeStyle} theme={theme} onClick={cycleGrill} />
                <div>
                  <h2 className={`text-3xl font-black mb-1 tracking-tight ${theme === 'coldest' ? 'text-[#0c4a6e]' : 'text-white'}`}>Studio Info</h2>
                  <p className={`text-sm ${theme === 'coldest' ? 'text-[#0c4a6e]/70' : 'text-red-200/60'}`}>Loaded {plugins.length} plugins from your library.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setPlugins([])} className={`px-8 py-5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${theme === 'coldest' ? 'border-[#0c4a6e] text-[#0c4a6e]' : 'border-red-900 text-red-900'}`}>Reset</button>
                <button onClick={handleGenerate} disabled={loading} className={`flex items-center gap-3 font-black py-5 px-16 rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg ${theme === 'coldest' ? 'bg-sky-500 text-white' : 'bg-red-600 text-white'}`}>{loading ? "Thinking..." : "Get Beat Recipes"}</button>
              </div>
            </section>

            {recipes.length > 0 && (
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                {recipes.map((recipe, idx) => (
                  <RecipeCard 
                    key={idx} 
                    recipe={recipe} 
                    isSaved={user && vault.some(r => r.title === recipe.title)}
                    onSave={user ? saveToVault : undefined}
                  />
                ))}
              </section>
            )}

            <section id="inventory" className="space-y-10 scroll-mt-24">
              <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8 ${theme === 'coldest' ? 'border-sky-900/10' : 'border-red-900/30'}`}>
                <div className="flex flex-col gap-1">
                  <h3 className={`text-3xl font-black tracking-tight ${theme === 'coldest' ? 'text-[#0c4a6e]' : 'text-white'}`}>Gear Rack</h3>
                  {!user && (
                    <div className={`text-[10px] font-black uppercase tracking-widest ${theme === 'coldest' ? 'text-sky-600/60' : 'text-red-500/60'}`}>
                      <button onClick={handleSignUpClick} className="underline hover:opacity-100">Sign Up</button> to enable history & vault
                    </div>
                  )}
                </div>
                <div className="relative">
                  <input type="text" placeholder="Search the rack..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`py-4 px-8 text-sm focus:outline-none transition-all w-96 shadow-sm border rounded-full ${theme === 'coldest' ? 'bg-white/40 border-white text-[#0c4a6e]' : 'bg-black/60 border-red-900/30 text-white placeholder-red-900/50'}`} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {filteredPlugins.map((plugin, idx) => <PluginCard key={idx} plugin={plugin} />)}
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className={`py-16 px-6 text-center transition-all ${theme === 'coldest' ? 'text-[#0c4a6e]/20' : 'text-red-950'}`}>
        <div className="flex flex-col items-center gap-4">
          <Logo size={48} grillStyle={grillStyle} knifeStyle={knifeStyle} theme={theme} onClick={cycleGrill} />
          <p className="text-[10px] font-black uppercase tracking-[0.8em]">BeatGenius / ColdestConcept Edition / 2026</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
