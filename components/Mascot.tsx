
import React from 'react';
import { KnifeStyle } from '../types';

export type GrillStyle = 'iced-out' | 'aquaberry-diamond' | 'gold' | 'opal';

interface MascotProps {
  className?: string;
  size?: number;
  glowColor?: string;
  grillStyle?: GrillStyle;
  knifeStyle?: KnifeStyle;
}

export const Mascot: React.FC<MascotProps> = ({ 
  className = "", 
  size = 48, 
  glowColor = "#3b82f6",
  grillStyle = 'iced-out',
  knifeStyle = 'standard'
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 1000 1000" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className}`}
      style={{ filter: `drop-shadow(0 0 ${size * 0.15}px ${glowColor}66)` }}
    >
      <style>
        {`
          @keyframes sparkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          .sparkle-dot {
            animation: sparkle 2s infinite ease-in-out;
          }
          @keyframes glint {
            0% { transform: translateX(-100%) rotate(45deg); }
            20% { transform: translateX(200%) rotate(45deg); }
            100% { transform: translateX(200%) rotate(45deg); }
          }
          .blade-glint {
            animation: glint 4s infinite ease-in-out;
          }
          @keyframes drip {
            0% { transform: translateY(0); opacity: 0.8; }
            70% { transform: translateY(20px); opacity: 1; }
            100% { transform: translateY(40px); opacity: 0; }
          }
          .blood-drip {
            animation: drip 3s infinite ease-in;
          }
          @keyframes flicker {
            0% { opacity: 0.95; filter: blur(2px) brightness(1); }
            20% { opacity: 1; filter: blur(3px) brightness(1.2); }
            40% { opacity: 0.9; filter: blur(2px) brightness(0.9); }
            60% { opacity: 1; filter: blur(4px) brightness(1.3); }
            80% { opacity: 0.85; filter: blur(2px) brightness(1.1); }
            100% { opacity: 0.95; filter: blur(2px) brightness(1); }
          }
          .saber-blade {
            animation: flicker 0.15s infinite;
          }
        `}
      </style>
      <defs>
        {/* Diamond Faceting Gradient */}
        <linearGradient id="diamondFacet" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#d1d5db" />
          <stop offset="60%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#9ca3af" />
        </linearGradient>

        {/* Aquaberry Diamond Gradient */}
        <linearGradient id="aquaberryDiamond" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ccfbf1" />
          <stop offset="20%" stopColor="#5eead4" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="80%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>

        {/* Gold Grill Gradient */}
        <linearGradient id="goldGrill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="20%" stopColor="#eab308" />
          <stop offset="50%" stopColor="#fef9c3" />
          <stop offset="80%" stopColor="#a16207" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>

        {/* Opal Grill Gradient (Multicolor/Iridescent) */}
        <linearGradient id="opalGrill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="20%" stopColor="#e0f2fe" />
          <stop offset="35%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#f9a8d4" />
          <stop offset="65%" stopColor="#6ee7b7" />
          <stop offset="80%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>

        {/* Blade Standard Gradient */}
        <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e5e7eb" />
          <stop offset="45%" stopColor="#9ca3af" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#4b5563" />
        </linearGradient>

        {/* Blade Gold Gradient */}
        <linearGradient id="bladeGold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="45%" stopColor="#eab308" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="55%" stopColor="#a16207" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>

        {/* Blade Adamant Gradient (Aquaberry Refresh) */}
        <linearGradient id="bladeAdamant" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ccfbf1" />
          <stop offset="45%" stopColor="#2dd4bf" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#042f2e" />
        </linearGradient>

        {/* Blade Mythril Gradient (Blue) */}
        <linearGradient id="bladeMythril" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="45%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#60a5fa" />
          <stop offset="55%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        {/* Blood Gradient */}
        <radialGradient id="bloodGrad">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="70%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>

        {/* Saber Purple Core Gradient */}
        <linearGradient id="saberPurpleCore" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="50%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e9d5ff" />
        </linearGradient>

        {/* Skin Gradient */}
        <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>

        {/* Silk Du-rag Gradient */}
        <linearGradient id="silkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#444" />
          <stop offset="30%" stopColor="#111" />
          <stop offset="70%" stopColor="#222" />
          <stop offset="100%" stopColor="#555" />
        </linearGradient>

        <clipPath id="bladeClip">
          <path d="M0 0 L280 15 Q320 25 280 40 L0 55 Z" />
        </clipPath>
      </defs>

      {/* 1. LAYER: MAIN HEAD BASE & BORDERS (Bottom-most) */}
      <circle cx="500" cy="580" r="360" fill="black" />
      <circle cx="500" cy="580" r="335" fill="#1e50ff" />
      <circle cx="500" cy="580" r="350" stroke="black" strokeWidth="20" fill="none" />

      {/* 2. LAYER: FACE FEATURES (Eyes, Mouth, Grills) */}
      <g>
        {/* Eyes - Vertical Ovals */}
        <g>
          <ellipse cx="385" cy="580" rx="45" ry="75" fill="black" stroke="#000" strokeWidth="15" />
          <ellipse cx="395" cy="545" rx="8" ry="12" fill="white" />
          
          <ellipse cx="615" cy="580" rx="45" ry="75" fill="black" stroke="#000" strokeWidth="15" />
          <ellipse cx="625" cy="545" rx="8" ry="12" fill="white" />
        </g>

        {/* Cheek Highlight */}
        <g opacity="0.3">
          <circle cx="760" cy="560" r="10" fill="white" />
          <circle cx="785" cy="585" r="14" fill="white" />
          <circle cx="765" cy="610" r="10" fill="white" />
        </g>

        {/* Grills */}
        <g transform="translate(305, 710)">
          <g>
            {[10, 75, 140, 205, 270, 335].map((x, i) => {
              const tilt = (i - 2.5) * 4;
              const yOff = Math.abs(i - 2.5) * 5;
              
              let fill = "url(#diamondFacet)";
              let strokeColor = "#333";
              let showFacets = true;
              let showGoldDetail = false;

              if (grillStyle === 'aquaberry-diamond') {
                fill = "url(#aquaberryDiamond)";
                strokeColor = "#0f766e";
                showFacets = true;
              } else if (grillStyle === 'gold') {
                fill = "url(#goldGrill)";
                strokeColor = "#854d0e";
                showFacets = false;
                showGoldDetail = true;
              } else if (grillStyle === 'opal') {
                fill = "url(#opalGrill)";
                strokeColor = "#ccc";
                showFacets = true;
              }

              return (
                <g key={i} transform={`translate(${x}, ${15 + yOff}) rotate(${tilt})`}>
                  <rect 
                    width="50" 
                    height="60" 
                    rx="4" 
                    fill={fill} 
                    stroke={strokeColor} 
                    strokeWidth="2" 
                  />
                  
                  {showFacets && (
                    <>
                      <path d="M0 0 L50 60 M50 0 L0 60" stroke="white" strokeWidth="1" opacity="0.3" />
                      <path d="M25 0 L25 60 M0 30 L50 30" stroke="white" strokeWidth="1" opacity="0.2" />
                      <circle cx="10" cy="10" r="2" fill="white" className="sparkle-dot" style={{ animationDelay: `${i * 0.3}s` }} />
                      <circle cx="40" cy="50" r="1.5" fill="white" className="sparkle-dot" style={{ animationDelay: `${i * 0.5}s` }} />
                    </>
                  )}

                  {showGoldDetail && (
                    <path d="M5 10 L45 10 M5 30 L45 30" stroke="#854d0e" strokeWidth="1" opacity="0.4" />
                  )}

                  <rect x="5" y="5" width="40" height="15" fill="white" opacity={grillStyle === 'gold' ? 0.2 : 0.4} rx="2" />
                </g>
              );
            })}
          </g>
        </g>
      </g>

      {/* ARMED ASSEMBLY (Knives or Saber) */}
      {knifeStyle !== 'samuels-saber' ? (
        <g transform="translate(80, 820) rotate(-45)">
          {/* Knife Handle */}
          <rect x="-100" y="-20" width="140" height="40" rx="6" fill="#111" stroke="black" strokeWidth="3" />
          
          {/* Hand / Fist gripping the handle */}
          <g transform="translate(-80, 0)">
              {/* Thumb */}
              <ellipse cx="20" cy="-15" rx="25" ry="15" fill="#1e50ff" stroke="black" strokeWidth="2" transform="rotate(-15)" />
              {/* Fingers wrapping handle */}
              {[0, 25, 50, 75].map((xOffset) => (
                  <rect key={xOffset} x={xOffset} y="-25" width="22" height="50" rx="10" fill="url(#skinGrad)" stroke="black" strokeWidth="2" />
              ))}
          </g>

          {/* Guard */}
          <rect x="35" y="-35" width="15" height="70" rx="4" fill="#222" stroke="black" strokeWidth="2" />

          {/* Blade - Positioned to the side of the head */}
          <g transform="translate(50, -28)">
              {/* Blade Fill Selection */}
              {(() => {
                let bladeFill = "url(#bladeGrad)";
                if (knifeStyle === 'gold') bladeFill = "url(#bladeGold)";
                if (knifeStyle === 'adamant') bladeFill = "url(#bladeAdamant)";
                if (knifeStyle === 'mythril') bladeFill = "url(#bladeMythril)";
                
                return <path d="M0 0 L280 15 Q320 25 280 40 L0 55 Z" fill={bladeFill} stroke="#111" strokeWidth="3" />;
              })()}

              {/* Blood Overlay for 'bloody' style */}
              {knifeStyle === 'bloody' && (
                <g>
                  <path d="M120 18 Q160 25 140 38 L80 30 Z" fill="url(#bloodGrad)" opacity="0.8" />
                  <path d="M220 24 Q260 28 240 36 L180 32 Z" fill="url(#bloodGrad)" opacity="0.9" />
                  <circle cx="150" cy="40" r="5" fill="#991b1b" className="blood-drip" style={{ animationDelay: '0s' }} />
                  <circle cx="210" cy="35" r="3.5" fill="#7f1d1d" className="blood-drip" style={{ animationDelay: '1.5s' }} />
                  <path d="M50 15 L280 28" stroke="#ef4444" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
                </g>
              )}

              {/* Blood groove */}
              <path d="M20 22 L240 28" stroke="#000" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
              {/* Edge highlight */}
              <path d="M10 50 L270 38" stroke="white" strokeWidth="1" opacity="0.5" />
              {/* Glint effect */}
              <g clipPath="url(#bladeClip)">
                  <rect x="-100" y="-50" width="40" height="200" fill="white" opacity="0.4" className="blade-glint" />
              </g>
          </g>
        </g>
      ) : (
        /* SAMUEL'S SABER - Refined Firm Grip */
        <g transform="translate(130, 780)">
          {/* 1. BACKGROUND FINGERS (Wrapped behind the hilt) */}
          <g>
            {[ -45, -15 ].map((yOffset) => (
                <rect key={yOffset} x="-35" y={yOffset} width="70" height="25" rx="12" fill="url(#skinGrad)" stroke="black" strokeWidth="3" />
            ))}
          </g>

          {/* 2. LIGHTSABER HILT (Mace Windu Gold/Silver/Black) */}
          <g transform="translate(0, 0)">
            {/* Main Tube */}
            <rect x="-20" y="-120" width="40" height="180" rx="6" fill="#666" stroke="black" strokeWidth="3" />
            {/* Grip bands */}
            {[ -100, -80, -60, -40, -20, 0, 20, 40 ].map(y => (
              <rect key={y} x="-20" y={y} width="40" height="8" fill="black" />
            ))}
            {/* Gold Accents */}
            <rect x="-18" y="-115" width="4" height="170" fill="#eab308" opacity="0.6" />
            <rect x="14" y="-115" width="4" height="170" fill="#eab308" opacity="0.6" />
            {/* Emitter */}
            <rect x="-25" y="-140" width="50" height="30" rx="4" fill="#333" stroke="black" strokeWidth="3" />
          </g>

          {/* 3. FOREGROUND FINGERS (Wrapped on top of hilt) */}
          <g>
            {/* Thumb wrapping over the front tightly */}
            <ellipse cx="25" cy="-20" rx="28" ry="18" fill="#1e50ff" stroke="black" strokeWidth="3" transform="rotate(25)" />
            {/* Lower fingers */}
            {[ 15, 45 ].map((yOffset) => (
                <rect key={yOffset} x="-35" y={yOffset} width="70" height="25" rx="12" fill="url(#skinGrad)" stroke="black" strokeWidth="3" />
            ))}
          </g>

          {/* 4. VERTICAL PURPLE BLADE (Pointing straight up) */}
          <g transform="translate(0, -140)">
            {/* Outer Glow */}
            <rect 
              x="-25" 
              y="-600" 
              width="50" 
              height="600" 
              rx="25" 
              fill="#a855f7" 
              opacity="0.6" 
              className="saber-blade" 
              style={{ filter: 'blur(20px)' }}
            />
            {/* Inner Glow */}
            <rect 
              x="-18" 
              y="-590" 
              width="36" 
              height="590" 
              rx="18" 
              fill="#c084fc" 
              opacity="0.8" 
              className="saber-blade" 
              style={{ filter: 'blur(8px)' }}
            />
            {/* White Core */}
            <rect 
              x="-10" 
              y="-580" 
              width="20" 
              height="580" 
              rx="10" 
              fill="url(#saberPurpleCore)" 
              className="saber-blade" 
            />
          </g>
        </g>
      )}

      {/* 3. LAYER: DU-RAG (Top-most) */}
      <g>
        {/* Main Cap Part */}
        <path 
          d="M150 460 C140 190 400 60 500 60 C600 60 860 190 850 460 L150 460 Z" 
          fill="black" 
        />
        <path 
          d="M170 450 C165 220 410 100 500 100 C590 100 835 220 830 450 Z" 
          fill="url(#silkGrad)" 
        />

        {/* Center Seam */}
        <path 
          d="M500 100 Q520 270 500 450" 
          stroke="black" 
          strokeWidth="12" 
          strokeLinecap="round" 
          opacity="0.8" 
          fill="none" 
        />
        <path 
          d="M500 100 Q520 270 500 450" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          opacity="0.2" 
          fill="none" 
        />

        {/* Front Band/Wrap */}
        <path 
          d="M155 400 Q500 360 845 400 L845 460 Q500 420 155 460 Z" 
          fill="black" 
        />
        <path 
          d="M170 415 Q500 380 830 415 L830 445 Q500 410 170 445 Z" 
          fill="#333" 
        />

        {/* Du-rag Ties */}
        <path 
          d="M840 420 Q950 490 900 690 L850 660 Q880 520 800 420 Z" 
          fill="black" 
        />
        <path 
          d="M825 420 Q930 480 885 670 L845 645 Q865 510 790 420 Z" 
          fill="url(#silkGrad)" 
        />

        {/* Highlight Shimmers */}
        <path d="M300 190 Q400 140 450 160" stroke="white" strokeWidth="4" opacity="0.1" fill="none" />
        <path d="M600 190 Q700 240 750 290" stroke="white" strokeWidth="6" opacity="0.1" fill="none" />
      </g>
    </svg>
  );
};
