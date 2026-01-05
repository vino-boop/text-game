
import React, { useState } from 'react';
import { GameStats, WordCard } from '../types';
import { COMBOS } from '../utils/combatCore';

interface DictionaryProps {
  stats: GameStats;
  onClose: () => void;
}

export const Dictionary: React.FC<DictionaryProps> = ({ stats, onClose }) => {
  const [tab, setTab] = useState<'WORDS' | 'COMBOS' | 'ITEMS'>('WORDS');

  // 获取所有单字的唯一展示列表（按名称去重）
  const uniqueWords = stats.inventory.reduce((acc: WordCard[], curr) => {
    if (!acc.find(w => w.text === curr.text)) acc.push(curr);
    return acc;
  }, []);

  return (
    <div className="fixed inset-0 bg-black/95 z-[110] flex flex-col items-center justify-center p-12 backdrop-blur-2xl">
      <div className="max-w-5xl w-full h-[85vh] bg-zinc-950 border border-red-900/30 rounded-lg flex flex-col overflow-hidden shadow-2xl relative">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none overflow-hidden">
          <div className="text-[300px] font-bold text-red-900 leading-none -translate-x-20 -translate-y-20 italic">DICT</div>
        </div>

        <div className="flex border-b border-red-900/20 bg-black/60 relative z-10">
          <button 
            onClick={() => setTab('WORDS')}
            className={`flex-1 py-5 mono text-xs tracking-[0.4em] transition-all uppercase ${tab === 'WORDS' ? 'bg-red-950/30 text-red-500 border-b-2 border-red-600' : 'text-gray-600 hover:text-gray-300'}`}
          >
            单字碎片 (WORDS)
          </button>
          <button 
            onClick={() => setTab('COMBOS')}
            className={`flex-1 py-5 mono text-xs tracking-[0.4em] transition-all uppercase ${tab === 'COMBOS' ? 'bg-red-950/30 text-red-500 border-b-2 border-red-600' : 'text-gray-600 hover:text-gray-300'}`}
          >
            真理词组 (COMBOS)
          </button>
          <button 
            onClick={() => setTab('ITEMS')}
            className={`flex-1 py-5 mono text-xs tracking-[0.4em] transition-all uppercase ${tab === 'ITEMS' ? 'bg-red-950/30 text-red-500 border-b-2 border-red-600' : 'text-gray-600 hover:text-gray-300'}`}
          >
            认知道具 (ITEMS)
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar relative z-10">
          {tab === 'WORDS' && (
            <div className="grid grid-cols-4 gap-6">
              {uniqueWords.map((word, i) => (
                <div key={i} className="p-8 bg-black/60 border border-white/5 rounded-xl flex flex-col items-center group hover:border-red-900/50 transition-all">
                  <span className="text-6xl font-bold text-gray-300 mb-4 italic group-hover:text-red-700 transition-colors">{word.text}</span>
                  <div className="text-[10px] mono text-gray-700 uppercase mb-2 tracking-widest">{word.category}</div>
                  <p className="text-[10px] text-gray-500 italic text-center leading-relaxed">
                    {word.category === 'attack' ? `物理修正单字。单发修正值 +1，对现实造成微量损耗。` : 
                     word.category === 'defense' ? `防御或回复词缀。产生护盾或补完意志。` : 
                     `策略单字。作为词组的核心，引导因果律发生偏转。`}
                  </p>
                </div>
              ))}
            </div>
          )}

          {tab === 'COMBOS' && (
            <div className="flex flex-col gap-5">
              {stats.discoveredCombos.length === 0 ? (
                <div className="text-center text-gray-700 italic py-20 uppercase mono tracking-widest">尚未记录到任何有效的逻辑链条...</div>
              ) : (
                stats.discoveredCombos.map((phrase, i) => {
                  const combo = COMBOS[phrase];
                  if (!combo) return null;
                  return (
                    <div key={i} className="p-8 bg-black border-l-4 border-red-800 flex justify-between items-center group hover:bg-red-950/10 transition-all">
                      <div>
                        <div className="flex items-center gap-4 mb-1">
                          <span className="text-3xl font-bold text-gray-200 tracking-[0.3em] italic">{combo.phrase}</span>
                          <span className="px-2 py-0.5 bg-red-950/20 border border-red-900/30 text-[8px] mono text-red-600 uppercase">已观测</span>
                        </div>
                        <p className="text-sm text-gray-500 italic leading-relaxed">{combo.description}</p>
                      </div>
                      <div className="text-[10px] mono text-red-900/20 uppercase font-bold text-right">
                        SEQUENCE ID: 0{i + 1}
                        <br/>
                        TRUTH_ERODER_V1
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {tab === 'ITEMS' && (
            <div className="grid grid-cols-2 gap-8">
              {stats.tagItems.length === 0 ? (
                <div className="col-span-2 text-center text-gray-700 italic py-20 uppercase mono tracking-widest">行囊中空无一物...</div>
              ) : (
                stats.tagItems.map((item, i) => (
                  <div key={i} className="p-8 bg-black border border-white/5 rounded-2xl group hover:border-red-900 transition-all">
                    <h4 className="text-2xl font-bold text-red-800 mb-3 italic tracking-tight">{item.name}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed italic mb-6">{item.description}</p>
                    <div className="flex justify-between items-center border-t border-white/5 pt-4">
                      {/* Fix: removed reference to non-existent property isConsumable. All items are now PASSIVE. */}
                      <span className="text-[9px] mono text-gray-700 uppercase">TYPE: PASSIVE</span>
                      <span className="text-[9px] mono text-red-900/40 uppercase">ENTITY_ID: {item.id.split('_')[1]}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button 
          onClick={onClose}
          className="w-full py-8 bg-red-950/10 border-t border-red-900/20 hover:bg-red-900 hover:text-white transition-all text-red-800 mono text-xs tracking-[1em] uppercase font-bold relative z-10"
        >
          合上字典 (CLOSE_ARCHIVE)
        </button>
      </div>
    </div>
  );
};
