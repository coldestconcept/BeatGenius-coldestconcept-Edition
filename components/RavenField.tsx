
import React from 'react';

const RavenIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 80" className={className} fill="currentColor">
    {/* Wraith-inspired Jagged Raven Silhouette */}
    <path d="M50 35 C40 25 15 20 5 45 C10 40 15 45 10 55 C18 50 25 55 20 65 C35 55 45 60 48 75 C50 65 55 60 75 65 C70 55 80 50 90 55 C85 45 90 40 95 45 C85 20 60 25 50 35 Z" />
    <path d="M48 35 Q50 28 52 35 L50 45 Z" />
    <path d="M45 40 L55 40 L50 50 Z" opacity="0.5" />
  </svg>
);

const FeatherIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 100" className={className} fill="#ef4444">
    {/* Silhouette based on the provided red feather image */}
    <path d="M20 95 C18 80 15 70 10 50 C5 30 15 10 20 5 C25 10 35 30 30 50 C25 70 22 80 20 95 Z" />
    <path d="M20 95 L20 15" stroke="#7f1d1d" strokeWidth="0.5" />
    <path d="M20 40 L10 35 M20 50 L12 48 M20 60 L14 62" stroke="#7f1d1d" strokeWidth="0.3" opacity="0.6" />
  </svg>
);

export const AvianField: React.FC = () => {
  const ravens = [
    { top: '8%', left: '5%', size: 85, delay: '0s', duration: '18s' },
    { top: '15%', left: '82%', size: 65, delay: '3s', duration: '22s' },
    { top: '42%', left: '10%', size: 110, delay: '1s', duration: '25s' },
    { top: '68%', left: '88%', size: 55, delay: '5s', duration: '20s' },
    { top: '85%', left: '18%', size: 75, delay: '2s', duration: '28s' },
    { top: '22%', left: '38%', size: 60, delay: '7s', duration: '24s' },
    { top: '58%', left: '62%', size: 95, delay: '0.5s', duration: '26s' },
  ];

  const feathers = [
    { left: '15%', delay: '0s', duration: '12s', size: 30 },
    { left: '25%', delay: '4s', duration: '15s', size: 25 },
    { left: '45%', delay: '2s', duration: '18s', size: 35 },
    { left: '65%', delay: '7s', duration: '14s', size: 20 },
    { left: '85%', delay: '1s', duration: '16s', size: 32 },
    { left: '5%', delay: '9s', duration: '20s', size: 28 },
    { left: '55%', delay: '3s', duration: '13s', size: 24 },
    { left: '75%', delay: '6s', duration: '17s', size: 38 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <style>
        {`
          @keyframes wraithGlide {
            0% { transform: translate(0, 0) rotate(-3deg) scaleX(1); }
            50% { transform: translate(40px, -40px) rotate(3deg) scaleX(1.05); }
            100% { transform: translate(0, 0) rotate(-3deg) scaleX(1); }
          }
          @keyframes featherFall {
            0% { transform: translateY(-10vh) translateX(0) rotate(0deg); opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { transform: translateY(110vh) translateX(50px) rotate(360deg); opacity: 0; }
          }
          .raven-wraith {
            animation: wraithGlide linear infinite alternate;
            filter: drop-shadow(0 10px 15px rgba(0,0,0,0.5));
          }
          .feather-float {
            animation: featherFall linear infinite;
          }
        `}
      </style>

      {/* Ravens */}
      {ravens.map((r, i) => (
        <div
          key={`raven-${i}`}
          className="absolute raven-wraith text-black"
          style={{
            top: r.top,
            left: r.left,
            width: `${r.size}px`,
            animationDelay: r.delay,
            animationDuration: r.duration
          }}
        >
          <RavenIcon />
        </div>
      ))}

      {/* Feathers */}
      {feathers.map((f, i) => (
        <div
          key={`feather-${i}`}
          className="absolute feather-float"
          style={{
            left: f.left,
            width: `${f.size}px`,
            animationDelay: f.delay,
            animationDuration: f.duration
          }}
        >
          <FeatherIcon />
        </div>
      ))}
    </div>
  );
};
