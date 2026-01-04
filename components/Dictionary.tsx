

import React, { useState } from 'react';
import { GameStats, ComboEffect, TagItem } from '../types';
// Fix: Corrected import source for COMBOS
import { COMBOS } from '../utils/comboLogic';

interface DictionaryProps {
  stats: GameStats;
  onClose: () => void;
}

export const Dictionary: React.FC<DictionaryProps> = ({ stats, onClose }) => {
  const [tab, setTab] = useState<'TAGS' | 'COMBOS'>('TAGS');

  return (
    <div className="fixed inset-0 bg-black/95 z-[110] flex flex-col items-center justify-center p-12 backdrop-blur-2xl">
      <div className="max-w-4xl w-full h-[80vh] bg-zinc-950 border border-red-900/30 rounded-lg flex flex-col overflow-hidden shadow-2xl">
        <div className="flex border-b border-red-900/20 bg-black/40">
          <button 
            onClick={() => setTab('TAGS')}
            className={`flex-1 py-4 mono text-xs tracking-widest transition-all ${tab === 'TAGS' ? 'bg-red-950/20 text-red-500 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-300'}`}
          >
            已获词条道具 ({stats.tagItems.length})
          </button>
          <button 
            onClick={() => setTab('COMBOS')}
            className={`flex-1 py-4 mono text-xs tracking-widest transition-all ${tab === 'COMBOS' ? 'bg-red-950/20 text-red-500 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-300'}`}
          >
            逻辑词组全书 ({stats.discoveredCombos.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {tab === 'TAGS' ? (
            <div className="grid grid-cols-2 gap-6">
              {stats.tagItems.length === 0 ? (
                <div className="col-span-2 text-center text-gray-700 italic py-20">尚未在废墟中发现真理的实证...</div>
              ) : (
                stats.tagItems.map((item, i) => (
                  <div key={i} className="p-6 bg-black border border-white/5 rounded-md group hover:border-red-900 transition-all">
                    <h4 className="text-xl font-bold text-red-700 mb-2">{item.name}</h4>
                    <p className="text-xs text-gray-500 italic leading-relaxed">{item.description}</p>
                    <div className="mt-4 text-[10px] mono text-gray-700 uppercase">
                      类别: {item.isConsumable ? '一次性消耗' : '常驻被动'}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {stats.discoveredCombos.length === 0 ? (
                <div className="text-center text-gray-700 italic py-20">尚未成功观测到逻辑的链式反应...</div>
              ) : (
                stats.discoveredCombos.map((phrase, i) => {
                  const combo = COMBOS[phrase];
                  if (!combo) return null;
                  return (
                    <div key={i} className="p-6 bg-black border-l-4 border-red-900 flex justify-between items-center group hover:bg-red-950/5 transition-all">
                      <div>
                        <span className="text-2xl font-bold text-gray-200 tracking-widest">{combo.phrase}</span>
                        <p className="text-xs text-gray-500 mt-1 italic">{combo.description}</p>
                      </div>
                      <div className="text-[10px] mono text-red-900/40 uppercase">
                        观测序列: {i + 1}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <button 
          onClick={onClose}
          className="w-full py-6 bg-red-950/10 border-t border-red-900/20 hover:bg-red-950/20 text-red-800 mono text-xs tracking-[0.5em] uppercase font-bold"
        >
          合上字典
        </button>
      </div>
    </div>
  );
};