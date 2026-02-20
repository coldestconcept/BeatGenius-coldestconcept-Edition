
import React from 'react';

interface HourglassProps {
  size?: number;
  className?: string;
  theme?: 'coldest' | 'crazy-bird' | 'hustle-time';
}

export const Hourglass: React.FC<HourglassProps> = ({ size = 120, className = "", theme = 'coldest' }) => {
  const accentColor = theme === 'coldest' ? '#0ea5e9' : theme === 'crazy-bird' ? '#ef4444' : '#facc15';
  
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <style>
        {`
          @keyframes hourglassFlip {
            0%, 90% { transform: rotate(0deg); }
            100% { transform: rotate(180deg); }
          }
          @keyframes sandFlow {
            0% { transform: scaleY(0); transform-origin: top; }
            10% { transform: scaleY(1); transform-origin: top; }
            90% { transform: scaleY(1); transform-origin: top; }
            100% { transform: scaleY(1); transform-origin: top; }
          }
          @keyframes topSandDrain {
            0% { transform: scaleY(1); transform-origin: bottom; }
            100% { transform: scaleY(0); transform-origin: bottom; }
          }
          @keyframes bottomSandFill {
            0% { transform: scaleY(0); transform-origin: bottom; }
            100% { transform: scaleY(1); transform-origin: bottom; }
          }
          .hourglass-container {
            animation: hourglassFlip 4s cubic-bezier(0.8, 0, 0.2, 1) infinite;
          }
          .sand-stream {
            animation: sandFlow 4s linear infinite;
          }
          .sand-top {
            animation: topSandDrain 4s linear infinite;
          }
          .sand-bottom {
            animation: bottomSandFill 4s linear infinite;
          }
        `}
      </style>
      <svg 
        width={size} 
        height={size * 1.5} 
        viewBox="0 0 100 150" 
        className="hourglass-container"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Frame */}
        <path d="M10 10 H90 L90 20 L55 75 L90 130 L90 140 H10 L10 130 L45 75 L10 20 Z" stroke="currentColor" strokeWidth="4" />
        <line x1="10" y1="10" x2="90" y2="10" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <line x1="10" y1="140" x2="90" y2="140" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />

        {/* Glass Interior Clipping Paths */}
        <defs>
          <clipPath id="topGlass">
            <path d="M15 20 L50 75 L85 20 Z" />
          </clipPath>
          <clipPath id="bottomGlass">
            <path d="M15 130 L50 75 L85 130 Z" />
          </clipPath>
        </defs>

        {/* Top Sand */}
        <g clipPath="url(#topGlass)">
          <rect x="15" y="20" width="70" height="55" fill={accentColor} className="sand-top" />
        </g>

        {/* Bottom Sand */}
        <g clipPath="url(#bottomGlass)">
          <rect x="15" y="75" width="70" height="55" fill={accentColor} className="sand-bottom" />
        </g>

        {/* Sand Stream */}
        <rect x="49" y="75" width="2" height="55" fill={accentColor} className="sand-stream" />
        
        {/* Shiny highlights */}
        <path d="M25 30 Q30 35 30 40" stroke="white" strokeWidth="1" opacity="0.3" />
        <path d="M75 120 Q70 115 70 110" stroke="white" strokeWidth="1" opacity="0.3" />
      </svg>
    </div>
  );
};
