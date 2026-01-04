
import React from 'react';
import { GameStats } from '../types';

interface StatusPanelProps {
  stats: GameStats;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ stats }) => {
  const vocabPercent = (stats.vocabulary / stats.maxVocabulary) * 100;
  const lucidityPercent = (stats.lucidity / stats.maxLucidity) * 100;

  return (
    <div className="fixed top-0 left-0 w-full bg-black/90 backdrop-blur-xl border-b border-white/10 p-6 z-50 flex justify-between items-center px-12 shadow-2xl">
      <div className="flex gap-16">
        <div className="w-56">
          <div className="flex justify-between text-[10px] mb-2 mono tracking-widest">
            <span className="text-red-700">词汇存量 (VOCABULARY)</span>
            <span className="text-gray-400">{stats.vocabulary} / {stats.maxVocabulary}</span>
          </div>
          <div className="w-full h-1.5 bg-gray-950 overflow-hidden rounded-full">
            <div 
              className="h-full bg-red-900 transition-all duration-700 shadow-[0_0_10px_rgba(153,27,27,0.5)]" 
              style={{ width: `${vocabPercent}%` }}
            />
          </div>
          <div className="flex gap-4 mt-2">
            {stats.shield > 0 && (
              <div className="text-[10px] text-blue-500 mono font-bold animate-pulse">
                盾: +{stats.shield}
              </div>
            )}
            {stats.burn > 0 && (
              <div className="text-[10px] text-orange-600 mono font-bold animate-pulse">
                燃: {stats.burn}
              </div>
            )}
          </div>
        </div>
        
        <div className="w-56">
          <div className="flex justify-between text-[10px] mb-2 mono tracking-widest">
            <span className="text-blue-500">清晰度 (LUCIDITY)</span>
            <span className="text-gray-400">{stats.lucidity}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-950 overflow-hidden rounded-full">
            <div 
              className="h-full bg-blue-800 transition-all duration-700 shadow-[0_0_10px_rgba(30,64,175,0.5)]" 
              style={{ width: `${lucidityPercent}%` }}
            />
          </div>
          {stats.lucidity < 80 && (
            <div className="mt-2 text-[10px] text-violet-600 mono font-bold animate-pulse italic">
              混乱生效中...
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-10">
        <div className="text-[10px] mono text-gray-500 uppercase tracking-widest">
          当前区域: <span className="text-white ml-2">{stats.stage}</span>
        </div>
        <div className="text-[10px] mono text-gray-500 uppercase tracking-widest">
          节点清理: <span className="text-white ml-2">{stats.nodesCleared}</span>
        </div>
      </div>
    </div>
  );
};
