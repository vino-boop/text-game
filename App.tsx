
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, GameStats, Region, WordCard, Enemy, Identity, MapNode, GameEvent, ComboEffect, EnemyIntent, IntentType, TagItem } from './types';
import { IDENTITIES, ALL_WORDS, CHINESE_NUMBERS, EVENT_POOL, TAG_ITEMS } from './constants';
import { executePlayerAction, executeEnemyTurn, processStatusTick } from './utils/combatCore';
import { StatusPanel } from './components/StatusPanel';
import { GlitchText } from './components/GlitchText';
import { Dictionary } from './components/Dictionary';
import { ComboOverlay } from './components/ComboOverlay';
import { generateEnemyDescription } from './geminiService';
import { createMap, generateEnemyIntent } from './utils/gameHelpers';

const MAX_WORDS = 8;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [stats, setStats] = useState<GameStats>({
    vocabulary: 120,
    maxVocabulary: 120,
    lucidity: 100,
    maxLucidity: 100,
    shield: 0,
    burn: 0,
    day: 1,
    inventory: [],
    tagItems: [],
    discoveredCombos: [],
    stage: Region.SENSES,
    nodesCleared: 0,
    tags: [],
    currentPos: { x: 3, y: 3 }
  });

  const [map, setMap] = useState<MapNode[]>([]);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [logicSlot, setLogicSlot] = useState<WordCard[]>([]);
  const [rewardChoices, setRewardChoices] = useState<WordCard[] | null>(null);
  const [shopInventory, setShopInventory] = useState<WordCard[]>([]);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [activeCombo, setActiveCombo] = useState<any>(null);

  const initMap = useCallback((pos: { x: number, y: number }) => {
    const newMap = createMap(pos);
    setMap(newMap);
  }, []);

  const selectIdentity = (id: Identity) => {
    const initialPos = { x: 3, y: 3 };
    setStats({
      ...stats,
      vocabulary: id.initialVocabulary,
      maxVocabulary: id.initialVocabulary,
      lucidity: id.initialLucidity,
      maxLucidity: id.initialLucidity,
      inventory: [...id.startingWords],
      shield: 0,
      burn: 0,
      nodesCleared: 0,
      tags: [],
      currentPos: initialPos
    });
    initMap(initialPos);
    setGameState(GameState.MAP);
  };

  const useTagItem = (item: TagItem) => {
    const res = item.effect(stats, currentEnemy);
    let newTagItems = stats.tagItems;
    if (item.isConsumable) {
      newTagItems = stats.tagItems.filter(t => t.id !== item.id);
    }
    setStats({ ...res.stats, tagItems: newTagItems });
    if (res.enemy) setCurrentEnemy(res.enemy);
    if (res.log) setCombatLog(prev => [...prev, res.log]);
  };

  /**
   * 核心战斗博弈循环
   */
  const handleLogicAction = () => {
    if (!currentEnemy || !currentEnemy.intent) return;
    
    // 1. 玩家逻辑执行
    const playerResult = executePlayerAction(logicSlot, stats, currentEnemy);
    let s = playerResult.stats;
    let e = playerResult.enemy;
    let logs = [...playerResult.logs];
    if (playerResult.comboInfo) setActiveCombo(playerResult.comboInfo);

    // 2. 敌方反击 (若判定未结束)
    if (e.hp > 0 && e.correction < e.maxCorrection) {
      const enemyResult = executeEnemyTurn(s, e);
      s = enemyResult.stats;
      e = enemyResult.enemy;
      logs = [...logs, ...enemyResult.logs];
    }

    // 3. 状态结算 (焚烧等)
    const tickResult = processStatusTick(s, e);
    s = tickResult.s;
    e = tickResult.e;
    logs = [...logs, ...tickResult.logs];

    // 胜负判定：HP归零 或 修正满额
    if (e.hp <= 0 || e.correction >= e.maxCorrection) {
      const reason = e.hp <= 0 ? "维度坍塌" : "逻辑修正";
      logs.push(`【博弈结束】：${e.name} 已通过 [${reason}] 彻底离线。`);
      setStats(s);
      setRewardChoices([...ALL_WORDS].sort(() => Math.random() - 0.5).slice(0, 3));
      return;
    }

    // 玩家死亡判定
    if (s.vocabulary <= 0) {
      if (s.hasRevival) {
        s.vocabulary = s.maxVocabulary; s.hasRevival = false; 
        logs.push("【死而复生】：在彻底崩溃的一瞬，你找回了自我的最初定义。");
      } else { setGameState(GameState.GAMEOVER); return; }
    }

    // 更新敌方意图
    e.intent = generateEnemyIntent(e);
    setStats(s);
    setCurrentEnemy(e);
    setCombatLog(prev => [...prev, ...logs]);
    setLogicSlot([]);
  };

  const startCombat = useCallback(async (isBoss: boolean = false) => {
    const enemyData = await generateEnemyDescription(stats.stage);
    const enemy: Enemy = {
      name: isBoss ? `【真理终结者】${enemyData.name}` : enemyData.name,
      description: enemyData.description,
      hp: isBoss ? 600 : 40 + stats.nodesCleared * 5,
      maxHp: isBoss ? 600 : 40 + stats.nodesCleared * 5,
      correction: 0,
      maxCorrection: 100,
      attack: isBoss ? 35 : 10 + Math.floor(stats.nodesCleared / 3),
      logicDistortion: isBoss ? 20 : 5 + Math.floor(stats.nodesCleared / 6),
      burn: 0,
      tags: []
    };
    enemy.intent = generateEnemyIntent(enemy);
    setCurrentEnemy(enemy);
    setCombatLog([`博弈开始。观测对象：${enemy.name}`]);
    setGameState(GameState.COMBAT);
  }, [stats.stage, stats.nodesCleared]);

  const handleNodeClick = async (node: MapNode) => {
    if (node.isRevealed) return;
    const dist = Math.abs(node.x - stats.currentPos.x) + Math.abs(node.y - stats.currentPos.y);
    if (dist > 1) return;
    setMap(prev => prev.map(n => n.id === node.id ? { ...n, isRevealed: true } : n));
    const s = { ...stats, nodesCleared: stats.nodesCleared + 1, currentPos: { x: node.x, y: node.y } };
    setStats(s);
    if (s.nodesCleared >= 40) startCombat(true);
    else if (node.type === 'MINE') startCombat();
    else if (node.content === 'SHOP') {
      setShopInventory([...ALL_WORDS].sort(() => Math.random() - 0.5).slice(0, 4).map(w => ({...w, id: `s_${Math.random()}`, cost: 15 + Math.floor(Math.random()*15)})));
      setGameState(GameState.SHOP);
    } else if (node.content === 'REST') setGameState(GameState.REST);
    else if (node.content === 'EVENT') setGameState(GameState.EVENT);
    else setGameState(GameState.MAP);
  };

  const buyItem = (item: WordCard) => {
    if (stats.vocabulary >= (item.cost || 0)) {
      setStats(prev => ({...prev, vocabulary: prev.vocabulary - (item.cost || 0), inventory: [...prev.inventory, {...item, id: `inv_${Math.random()}`}]}));
      setGameState(GameState.MAP); if (stats.inventory.length >= MAX_WORDS) setIsDiscarding(true);
    }
  };

  const addRewardWord = (word: WordCard) => {
    const newInv = [...stats.inventory, {...word, id: `inv_${Math.random()}`}];
    setStats(prev => ({...prev, inventory: newInv}));
    setRewardChoices(null); if (newInv.length > MAX_WORDS) setIsDiscarding(true); else setGameState(GameState.MAP);
  };

  const discardWord = (index: number) => {
    setStats(prev => ({...prev, inventory: prev.inventory.filter((_, i) => i !== index)}));
    setIsDiscarding(false); setGameState(GameState.MAP);
  };

  if (gameState === GameState.MENU) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black relative">
        <div className="scanline"></div>
        <div className="absolute inset-0 glitch-bg"></div>
        <h1 className="text-9xl font-bold text-red-950 mb-4 italic drop-shadow-[0_0_30px_rgba(153,27,27,0.4)] tracking-tighter">褪色的余晖</h1>
        <p className="text-gray-700 mb-20 mono text-xs tracking-[1em] uppercase opacity-60">Truth Eroder / Final Definition</p>
        <button onClick={() => setGameState(GameState.IDENTITY_SELECTION)} className="px-24 py-5 border-2 border-red-950/40 hover:bg-red-950/20 text-red-800 transition-all uppercase tracking-[1em] mono text-sm shadow-[0_0_50px_rgba(0,0,0,1)] hover:shadow-[0_0_30px_rgba(153,27,27,0.2)]">初始化基调</button>
      </div>
    );
  }

  if (gameState === GameState.IDENTITY_SELECTION) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"><div className="scanline"></div></div>
        <h2 className="text-4xl font-bold text-red-900 mb-20 tracking-[0.5em] uppercase border-b border-red-950/40 pb-6">选择认知身份</h2>
        <div className="flex gap-12 max-w-4xl w-full">
          {IDENTITIES.map(id => (
            <div key={id.id} onClick={() => selectIdentity(id)} className="flex-1 bg-zinc-950/40 border border-white/5 p-12 rounded-xl hover:border-red-900 transition-all cursor-pointer group shadow-2xl backdrop-blur-md">
              <h3 className="text-3xl font-bold text-gray-400 mb-8 group-hover:text-red-700 group-hover:italic transition-all">{id.name}</h3>
              <p className="text-gray-500 text-sm italic leading-relaxed opacity-80 mb-12">{id.description}</p>
              <div className="flex gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                 {id.startingWords.map(w => <span key={w.id} className="px-3 py-1 bg-red-950/20 border border-red-900/40 text-[10px] mono text-red-600 font-bold">{w.text}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] pt-28 pb-12 flex flex-col items-center overflow-hidden relative">
      <div className="absolute inset-0 glitch-bg"></div>
      <StatusPanel stats={stats} />
      {activeCombo && (
        <ComboOverlay phrase={activeCombo.phrase} description={activeCombo.description} isNegative={activeCombo.isNegative} isCursed={activeCombo.isCursed} onComplete={() => setActiveCombo(null)} />
      )}
      <button onClick={() => setIsDictionaryOpen(true)} className="fixed bottom-10 right-10 w-16 h-16 bg-red-950/20 border-2 border-red-900/40 rounded-full flex flex-col items-center justify-center text-red-700 hover:bg-red-900 hover:text-white transition-all z-40 shadow-2xl group">
        <span className="text-[10px] mono font-bold">词典</span>
        <span className="text-[6px] mono opacity-40">DICT</span>
      </button>

      {isDictionaryOpen && <Dictionary stats={stats} onClose={() => setIsDictionaryOpen(false)} />}
      
      {isDiscarding && (
        <div className="fixed inset-0 bg-black/98 z-[100] flex flex-col items-center justify-center p-12 backdrop-blur-3xl">
           <h3 className="text-3xl font-bold text-red-900 mb-4 tracking-[0.5em] uppercase">逻辑超载 ({MAX_WORDS}/{MAX_WORDS})</h3>
           <div className="flex flex-wrap gap-8 justify-center">
             {stats.inventory.map((word, i) => (
               <div key={i} onClick={() => discardWord(i)} className="w-36 h-52 bg-zinc-950/50 border border-white/5 hover:border-red-800 cursor-pointer p-6 flex flex-col justify-between group transition-all hover:scale-105">
                 <span className="text-[8px] mono text-gray-700 uppercase tracking-widest">{word.category}</span>
                 <span className="text-5xl font-bold text-gray-300 self-center group-hover:text-red-600">{word.text}</span>
                 <span className="text-[8px] mono text-red-900 text-center font-bold opacity-0 group-hover:opacity-100 uppercase">丢弃</span>
               </div>
             ))}
           </div>
        </div>
      )}

      {gameState === GameState.MAP && (
        <div className="grid grid-cols-7 gap-4 bg-zinc-950/30 p-10 border border-white/5 rounded-2xl shadow-2xl relative">
          {map.map((node) => {
            const dist = Math.abs(node.x - stats.currentPos.x) + Math.abs(node.y - stats.currentPos.y);
            const isSelectable = !node.isRevealed && dist === 1;
            const isCurrent = node.x === stats.currentPos.x && node.y === stats.currentPos.y;
            return (
              <div key={node.id} onClick={() => handleNodeClick(node)}
                className={`w-16 h-16 flex items-center justify-center cursor-pointer transition-all border rounded-sm relative
                  ${node.isRevealed ? (node.type === 'MINE' ? 'bg-red-950/40 border-red-700 text-red-500' : 'bg-black border-white/10 text-gray-500') : (isSelectable ? 'bg-zinc-900 border-red-900/40 hover:bg-red-950/20' : 'bg-zinc-950/10 border-white/5 opacity-40')}
                `}
              >
                {isCurrent && <div className="absolute inset-0 border-2 border-red-600/60 animate-ping" />}
                {node.isRevealed ? (node.type === 'MINE' ? '危' : CHINESE_NUMBERS[node.neighborMines]) : <div className="w-1 h-1 rounded-full bg-white/10" />}
              </div>
            );
          })}
        </div>
      )}

      {gameState === GameState.COMBAT && currentEnemy && (
        <div className="max-w-[1400px] w-full px-12 grid grid-cols-12 gap-12 h-[calc(100vh-250px)]">
          {rewardChoices && (
            <div className="absolute inset-0 bg-black/99 z-[60] flex flex-col items-center justify-center p-12 backdrop-blur-3xl">
               <h3 className="text-4xl font-bold text-red-900 mb-20 tracking-[0.8em]">提取定义碎片</h3>
               <div className="flex gap-16">
                 {rewardChoices.map((word, i) => (
                   <div key={i} onClick={() => addRewardWord(word)} className="w-64 h-96 bg-zinc-950 border border-white/5 hover:border-red-800 cursor-pointer p-12 flex flex-col justify-between group shadow-2xl transition-all">
                     <span className="text-[10px] text-gray-700 mono uppercase">{word.category}</span>
                     <span className="text-7xl font-bold text-gray-400 self-center group-hover:scale-125 transition-all">{word.text}</span>
                   </div>
                 ))}
               </div>
            </div>
          )}
          
          <div className="col-span-3 flex flex-col gap-6">
            <div className="bg-zinc-950/40 border border-red-950/30 p-10 rounded-2xl shadow-2xl backdrop-blur-sm">
              <h3 className="text-3xl font-bold text-gray-200 mb-4 italic tracking-tight">【{currentEnemy.name}】</h3>
              
              {/* HP Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-[10px] mono mb-1">
                   <span className="text-red-700">稳定性 (HP)</span>
                   <span className="text-gray-500">{currentEnemy.hp} / {currentEnemy.maxHp}</span>
                </div>
                <div className="h-1.5 bg-zinc-900 w-full rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-red-900 transition-all duration-1000 shadow-[0_0_10px_rgba(255,0,0,0.4)]" style={{ width: `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%` }} />
                </div>
              </div>

              {/* Correction Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-[10px] mono mb-1">
                   <span className="text-blue-500">逻辑修正 (CORR)</span>
                   <span className="text-gray-500">{currentEnemy.correction}%</span>
                </div>
                <div className="h-1.5 bg-zinc-900 w-full rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-blue-700 transition-all duration-1000 shadow-[0_0_10px_rgba(30,64,175,0.4)]" style={{ width: `${currentEnemy.correction}%` }} />
                </div>
              </div>

              <div className="mb-4 p-3 bg-red-950/10 border border-red-900/30 rounded-lg">
                <p className="text-[10px] text-red-600 font-bold uppercase mono mb-1">意图: {currentEnemy.intent?.description}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {currentEnemy.burn > 0 && <span className="text-[8px] px-2 py-0.5 bg-orange-950 text-orange-500 border border-orange-900/50 rounded mono">焚烧: {currentEnemy.burn}</span>}
              </div>
            </div>
            
            <div className="bg-zinc-950/20 border border-white/5 p-6 rounded-2xl overflow-y-auto custom-scrollbar flex-1 shadow-inner relative">
              {combatLog.slice().reverse().map((log, i) => <div key={i} className={`text-[10px] border-l-2 pl-4 py-2 mb-3 ${i === 0 ? 'text-red-600 border-red-800 font-bold' : 'text-gray-700 opacity-30 italic'}`}>{log}</div>)}
            </div>
          </div>
          
          <div className="col-span-6 flex flex-col gap-8">
            <div className="flex-1 bg-zinc-950/40 border border-white/10 p-10 rounded-3xl flex flex-col justify-between shadow-2xl backdrop-blur-md">
              <div className="flex gap-4 min-h-[200px] border-2 border-dashed border-white/10 w-full items-center justify-center p-8 bg-black/40 rounded-2xl">
                {logicSlot.map((card, i) => (
                  <div key={i} onClick={() => setLogicSlot(prev => prev.filter((_, idx) => idx !== i))} className="w-28 h-40 bg-red-950/5 border-2 border-red-900/30 text-red-600 cursor-pointer flex items-center justify-center shadow-2xl hover:scale-110 transition-all">
                    <span className="text-5xl font-bold italic">{card.text}</span>
                  </div>
                ))}
                {logicSlot.length === 0 && <span className="text-zinc-800 text-xs italic opacity-20 uppercase tracking-[0.5em]">构建逻辑序列 (2-4 字组)</span>}
              </div>
              <div className="flex justify-center mt-8">
                <button disabled={logicSlot.length < 1} onClick={handleLogicAction} className="px-40 py-5 bg-white hover:bg-red-800 hover:text-white text-black font-bold uppercase disabled:opacity-5 text-xs transition-all border border-white/20">确定定义 (DEFINE)</button>
              </div>
            </div>
            <div className="h-60 bg-zinc-950/30 border border-white/5 p-6 overflow-x-auto rounded-2xl shadow-inner backdrop-blur-sm">
              <div className="flex gap-4 h-full items-center px-4">
                {stats.inventory.map((card) => {
                  const isSelected = logicSlot.some(c => c.id === card.id);
                  return (
                    <div key={card.id} onClick={() => { if (isSelected) setLogicSlot(prev => prev.filter(c => c.id !== card.id)); else if (logicSlot.length < 4) setLogicSlot(prev => [...prev, card]); }}
                      className={`flex-shrink-0 w-28 h-44 border-2 p-5 flex flex-col justify-between cursor-pointer transition-all rounded-xl ${isSelected ? 'bg-red-950/40 border-white text-white -translate-y-8 shadow-2xl scale-110' : 'bg-zinc-950/20 border-white/5 text-gray-600 hover:border-white/20 hover:-translate-y-2'}`}
                    >
                      <span className="text-[8px] mono uppercase opacity-30">{card.category}</span>
                      <span className="text-4xl font-bold self-center italic">{card.text}</span>
                      <span className="text-[8px] mono text-right opacity-30">P:{card.power}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="col-span-3">
             <div className="bg-zinc-950/40 border border-white/5 p-8 rounded-2xl h-full shadow-2xl flex flex-col backdrop-blur-md">
                <h4 className="text-[10px] text-gray-700 uppercase mb-8 border-b border-white/5 pb-4 text-center mono tracking-[0.6em]">认知实体道具</h4>
                <div className="flex flex-col gap-5 overflow-y-auto custom-scrollbar flex-1">
                  {stats.tagItems.map((item, i) => (
                    <div key={i} onClick={() => item.isConsumable && useTagItem(item)} className={`p-5 bg-black/40 border border-white/5 rounded-xl transition-all ${item.isConsumable ? 'hover:border-red-900 cursor-pointer shadow-xl' : 'opacity-40 cursor-default'}`}>
                      <span className="text-sm font-bold text-red-800 tracking-tight italic block mb-1">{item.name}</span>
                      <p className="text-[9px] text-gray-500 italic leading-snug">{item.description}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {gameState === GameState.GAMEOVER && (
        <div className="h-full flex flex-col items-center justify-center text-center z-[200]">
          <h2 className="text-9xl font-bold text-red-950 mb-8 italic animate-glitch tracking-tighter shadow-red-900">现实崩毁</h2>
          <button onClick={() => window.location.reload()} className="px-20 py-5 border-2 border-red-950 text-red-950 hover:bg-red-950 hover:text-white transition-all uppercase font-bold text-xs tracking-[1em] mono">重新初始化</button>
        </div>
      )}
    </div>
  );
};

export default App;
