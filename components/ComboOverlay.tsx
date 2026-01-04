
import React, { useEffect, useState } from 'react';

interface ComboOverlayProps {
  phrase: string;
  description: string;
  isNegative?: boolean;
  isCursed?: boolean;
  onComplete: () => void;
}

export const ComboOverlay: React.FC<ComboOverlayProps> = ({ phrase, description, isNegative, isCursed, onComplete }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 500); 
    }, 2200);
    return () => clearTimeout(timer);
  }, [phrase, onComplete]);

  const mainColor = isCursed ? 'text-violet-900' : (isNegative ? 'text-red-600' : 'text-white');
  const glowColor = isCursed ? 'rgba(88,28,135,0.8)' : (isNegative ? 'rgba(255,0,0,0.8)' : 'rgba(255,255,255,0.5)');
  const backdropColor = isCursed ? 'bg-black/80' : (isNegative ? 'bg-red-950/40' : 'bg-white/10');

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center pointer-events-none transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`absolute inset-0 ${backdropColor} backdrop-blur-md animate-pulse`}></div>
      <div className="relative text-center">
        <div className={`text-[12rem] font-bold ${mainColor} tracking-[2rem] drop-shadow-[0_0_45px_${glowColor}] italic glitch-text-fast`}>
          {phrase}
        </div>
        <div className={`mt-4 text-2xl mono ${isCursed ? 'text-violet-400' : (isNegative ? 'text-red-400' : 'text-blue-400')} font-bold tracking-[0.5em] uppercase border-y border-red-900/40 py-4 bg-black/80 px-12`}>
          {isCursed ? '💀 逻辑坍缩 💀' : (isNegative ? '⚠️ 逻辑反噬 ⚠️' : '✧ 逻辑共鸣 ✧')}
          <br/>
          <span className="text-gray-300 text-lg"> {description} </span>
        </div>
      </div>
      <style>{`
        @keyframes glitch-fast {
          0% { transform: translate(0); }
          20% { transform: translate(-8px, 8px); }
          40% { transform: translate(-8px, -8px); }
          60% { transform: translate(8px, 8px); }
          80% { transform: translate(8px, -8px); }
          100% { transform: translate(0); }
        }
        .glitch-text-fast {
          animation: glitch-fast 0.15s infinite;
          text-shadow: 6px 0 #ff0000, -6px 0 #00ffff;
        }
      `}</style>
    </div>
  );
};
