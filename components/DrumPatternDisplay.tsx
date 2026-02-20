import React, { useState } from 'react';
import { DrumPattern } from '../types';
import { motion } from 'motion/react';

interface DrumPatternDisplayProps {
  patterns: {
    intro: DrumPattern;
    verse: DrumPattern;
    hook: DrumPattern;
    bridge: DrumPattern;
    outro: DrumPattern;
  };
  theme?: 'coldest' | 'chef-mode' | 'hustle-time' | 'crazy-bird';
}

const StepGrid = ({ steps, totalSteps, label, color }: { steps: number[], totalSteps: number, label: string, color: string }) => {
  const safeSteps = steps || [];
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{label}</span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-[2px] w-full">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNum = i + 1;
          const isActive = safeSteps.includes(stepNum);
          const isBeat = stepNum % 4 === 1;
          
          return (
            <div 
              key={i} 
              className={`
                relative h-8 rounded-sm transition-all duration-300 group
                ${isActive ? color : 'bg-black/5 dark:bg-white/5'}
                ${isBeat && !isActive ? 'border-l-2 border-black/10 dark:border-white/10' : ''}
              `}
            >
              {/* Step number tooltip */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity font-mono pointer-events-none">
                {stepNum}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const DrumPatternDisplay: React.FC<DrumPatternDisplayProps> = ({ patterns, theme }) => {
  const [activeSection, setActiveSection] = useState<keyof typeof patterns>('hook');

  if (!patterns) return null;

  const sections: (keyof typeof patterns)[] = ['intro', 'verse', 'hook', 'bridge', 'outro'];
  const currentPattern = patterns[activeSection];

  if (!currentPattern) return (
    <div className="p-4 text-center text-xs opacity-50">
      Drum patterns not available for this recipe.
    </div>
  );

  const activeColor = theme === 'chef-mode' ? 'bg-orange-500' : 
                      theme === 'hustle-time' ? 'bg-yellow-500' : 
                      theme === 'crazy-bird' ? 'bg-red-500' : 'bg-sky-500';
  
  const activeText = theme === 'chef-mode' ? 'text-orange-500' : 
                     theme === 'hustle-time' ? 'text-yellow-500' : 
                     theme === 'crazy-bird' ? 'text-red-500' : 'text-sky-500';

  return (
    <div className="mt-8 p-6 rounded-3xl bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${activeColor} animate-pulse`} />
          <h4 className="text-xs font-black uppercase tracking-widest opacity-70">Drum Guide</h4>
        </div>
        
        <div className="flex flex-wrap justify-center gap-1 bg-black/5 dark:bg-white/5 p-1.5 rounded-xl">
          {sections.map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`
                px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all
                ${activeSection === section 
                  ? 'bg-white text-black shadow-sm scale-105' 
                  : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}
              `}
            >
              {section}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <StepGrid 
          steps={currentPattern.hiHat?.steps} 
          totalSteps={currentPattern.hiHat?.isDoubleTime ? 32 : 16} 
          label={`Hi-Hats ${currentPattern.hiHat?.isDoubleTime ? '(2x Speed)' : ''}`}
          color={activeColor}
        />
        
        <StepGrid 
          steps={currentPattern.snare?.steps} 
          totalSteps={16} 
          label={currentPattern.snare?.isClap ? 'Clap' : 'Snare'}
          color={activeColor}
        />

        <StepGrid 
          steps={currentPattern.kick} 
          totalSteps={16} 
          label="Kick"
          color={activeColor}
        />
      </div>
      
      <div className="mt-8 flex justify-between items-center text-[10px] opacity-40 font-mono border-t border-black/5 dark:border-white/5 pt-4">
        <span>* 1 Bar Loop (16 Steps)</span>
        <span>{currentPattern.hiHat?.isDoubleTime ? '32 Steps (Double Time)' : '16 Steps (Normal)'}</span>
      </div>
    </div>
  );
};
