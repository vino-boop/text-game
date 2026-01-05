
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GameStats, Region, WordCard, Enemy, Identity, MapNode, GameEvent, ComboEffect, EnemyIntent, IntentType, TagItem } from './types';
import { IDENTITIES, ALL_WORDS, CHINESE_NUMBERS } from './constants';
import { EVENT_POOL } from './data/events';
import { FIXED_ENEMIES, BOSSES } from './data/enemies';
import { ALL_ITEMS } from './data/items';
import { executePlayerAction, executeEnemyTurn, processStatusTick, processStartTurnTick, COMBOS } from './utils/combatCore';
import { StatusPanel } from './components/StatusPanel';
import { Dictionary } from './components/Dictionary';
import { ComboOverlay } from './components/ComboOverlay';
import { createMap, generateEnemyIntent } from './utils/gameHelpers';

const MAX_WORDS = 6;
const DELAY = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    accumulatedDanger: 0,
    tags: [],
    hasRevival: false,
    currentPos: { x: 3, y: 3 }
  });

  const [map, setMap] = useState<MapNode[]>([]);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [logicSlot, setLogicSlot] = useState<WordCard[]>([]);
  const [rewardChoices, setRewardChoices] = useState<WordCard[] | null>(null);
  const [tagRewardChoices, setTagRewardChoices] = useState<TagItem[] | null>(null);
  const [shopInventory, setShopInventory] = useState<WordCard[]>([]);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [discardMode, setDiscardMode] = useState<'DISCARD' | 'FUSE'>('DISCARD');
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [activeCombo, setActiveCombo] = useState<any>(null);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vfx, setVfx] = useState<'shake' | 'flash-red' | 'flash-blue' | 'flash-orange' | null>(null);

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatLog]);

  const triggerVfx = (type: 'shake' | 'flash-red' | 'flash-blue' | 'flash-orange') => {
    setVfx(type);
    setTimeout(() => setVfx(null), 500);
  };

  const startCombat = useCallback((isBoss: boolean = false) => {
    let enemy: Enemy;
    if (isBoss) {
      enemy = JSON.parse(JSON.stringify(BOSSES[stats.stage]));
      enemy.isBoss = true;
    } else {
      const pool = FIXED_ENEMIES[stats.stage];
      enemy = JSON.parse(JSON.stringify(pool[Math.floor(Math.random() * pool.length)]));
      enemy.hp += stats.nodesCleared * 2;
      enemy.maxHp += stats.nodesCleared * 2;
      enemy.attack += Math.floor(stats.nodesCleared / 5);
      enemy.isBoss = false;
    }
    enemy.turnCount = 0;
    enemy.tags = enemy.tags || [];
    enemy.intent = generateEnemyIntent(enemy);
    
    let s = { ...stats };
    const hasItem = (n: string) => s.tagItems.some(i => i.name === n);
    
    // 道具联动：刻刀 (逻辑剥夺)
    const chiselTag = s.tags.find(t => t.startsWith('chisel_charge_'));
    if (chiselTag) {
      const charges = parseInt(chiselTag.split('_')[2]);
      if (charges > 0) {
        enemy.tags.push('stunned');
        enemy.intent = { type: 'UNKNOWN', value: 0, description: "【逻辑剥夺】行动停止" };
        const newCharges = charges - 1;
        if (newCharges === 0) {
          s.tags = s.tags.filter(t => t !== chiselTag);
          s.tagItems = s.tagItems.filter(i => i.name !== '刻刀');
        } else {
          s.tags = s.tags.map(t => t === chiselTag ? `chisel_charge_${newCharges}` : t);
          s.tagItems = s.tagItems.map(i => i.name === '刻刀' ? { ...i, description: `被动：刻扣现实。下 ${newCharges} 次博弈的首个回合，观测者将被剥夺行动能力。` } : i);
        }
      }
    }

    if (hasItem('旧绷带')) s.vocabulary = Math.min(s.maxVocabulary, s.vocabulary + 15);
    if (hasItem('无名木炭')) enemy.burn += 15;

    setCurrentEnemy(enemy);
    setStats(s);
    setCombatLog([`博弈开始。观测对象：${enemy.name}`]);
    setGameState(GameState.COMBAT);
  }, [stats.stage, stats.nodesCleared, stats.tagItems, stats.tags]);

  const handleLogicAction = async () => {
    if (!currentEnemy || !currentEnemy.intent || isProcessing) return;
    setIsProcessing(true);

    const chain = logicSlot.map(c => c.text).join('');
    let s = { ...stats };
    let e = { ...currentEnemy };
    
    if (COMBOS[chain]) {
      const combo = COMBOS[chain];
      setActiveCombo({ phrase: combo.phrase, description: combo.description });
      await DELAY(1200);
      const res = combo.action(s, e);
      s = res.stats; e = res.enemy;
      setCombatLog(prev => [...prev, res.log]);
      triggerVfx('shake');
      setStats(s); setCurrentEnemy(e);
      await DELAY(600);
    } else {
      for (const word of logicSlot) {
        const playerResult = executePlayerAction([word], s, e);
        s = playerResult.stats; e = playerResult.enemy;
        setCombatLog(prev => [...prev, ...playerResult.logs]);
        setStats(s); setCurrentEnemy(e);
        await DELAY(400);
      }
    }
    setLogicSlot([]);

    if (e.hp <= 0 || e.correction >= e.maxCorrection) {
      setCombatLog(prev => [...prev, `【博弈结束】：观测对象已彻底离线。`]);
      setRewardChoices([...ALL_WORDS].sort(() => Math.random() - 0.5).slice(0, 3));
      setIsProcessing(false);
      return;
    }

    await DELAY(600);
    const enemyResult = executeEnemyTurn(s, e);
    s = enemyResult.stats; e = enemyResult.enemy;
    setCombatLog(prev => [...prev, ...enemyResult.logs]);
    setStats(s); setCurrentEnemy(e);
    await DELAY(600);

    const tickResult = processStatusTick(s, e);
    s = tickResult.s; e = tickResult.e;
    if (tickResult.logs.length > 0) {
      setCombatLog(prev => [...prev, ...tickResult.logs]);
      setStats(s); setCurrentEnemy(e);
      await DELAY(400);
    }

    if (s.vocabulary <= 0) {
      const rationalEmber = s.tagItems.find(i => i.id === 'itm_rational_ember');
      if (s.tagItems.some(i => i.name === '红缎')) {
        s.vocabulary = Math.floor(s.maxVocabulary * 0.5); 
        s.lucidity = 1;
        setCombatLog(prev => [...prev, "【红缎】：因果被强行缝补。"]);
        setStats(s);
      } else if (rationalEmber) {
         s.vocabulary = 1;
         s.tagItems = s.tagItems.filter(i => i.id !== 'itm_rational_ember');
         s.tags.push('rational_ember_active_2'); // 2 turn survival
         setCombatLog(prev => [...prev, "【理性余烬】：强行以1点意志延续。"]);
         setStats(s);
      } else if (s.tags.some(t => t.startsWith('rational_ember_active_'))) {
         const t = s.tags.find(t => t.startsWith('rational_ember_active_'))!;
         const count = parseInt(t.split('_')[3]);
         if (count > 0) {
            s.vocabulary = 1;
            s.tags = s.tags.map(tag => tag === t ? `rational_ember_active_${count - 1}` : tag);
            setCombatLog(prev => [...prev, "【理性余烬】：意志正在蒸发..."]);
            setStats(s);
         } else {
            setGameState(GameState.GAMEOVER); setIsProcessing(false); return;
         }
      } else { 
        setGameState(GameState.GAMEOVER); setIsProcessing(false); return; 
      }
    }

    const startResult = processStartTurnTick(s, e);
    s = startResult.s; e = startResult.e;
    if (startResult.logs.length > 0) {
      setCombatLog(prev => [...prev, ...startResult.logs]);
      setStats(s); setCurrentEnemy(e);
      await DELAY(400);
    }
    
    if (e.tags.includes('stunned')) {
      e.tags = e.tags.filter(t => t !== 'stunned');
    }

    e.intent = generateEnemyIntent(e);
    setCurrentEnemy(e);
    setIsProcessing(false);
  };

  const selectIdentity = (id: Identity) => {
    setStats({
      ...stats,
      vocabulary: id.initialVocabulary,
      maxVocabulary: id.initialVocabulary,
      lucidity: id.initialLucidity,
      maxLucidity: id.initialLucidity,
      inventory: id.startingWords.map(w => ({...w, id: `start_${Math.random()}`})),
      currentPos: { x: 3, y: 3 }
    });
    setMap(createMap({ x: 3, y: 3 }));
    setGameState(GameState.MAP);
  };

  const handleNodeClick = (node: MapNode) => {
    if (node.isRevealed) return;
    const dist = Math.abs(node.x - stats.currentPos.x) + Math.abs(node.y - stats.currentPos.y);
    if (dist > 1) return;
    setMap(prev => prev.map(n => n.id === node.id ? { ...n, isRevealed: true } : n));
    
    let s = { ...stats, nodesCleared: stats.nodesCleared + 1, accumulatedDanger: stats.accumulatedDanger + node.neighborMines, currentPos: { x: node.x, y: node.y } };
    const keyMod = s.tagItems.some(i => i.name === '生锈钥匙') ? 1 : 2;
    s.lucidity = Math.max(0, s.lucidity - keyMod);

    if (s.nodesCleared === 15) s.stage = Region.LOGIC;
    if (s.nodesCleared === 30) s.stage = Region.TRUTH;
    setStats(s);

    if (s.accumulatedDanger > 30) {
      setStats(prev => ({ ...prev, accumulatedDanger: 0 }));
      startCombat(true);
      return;
    }

    if (node.type === 'MINE') startCombat();
    else if (node.content === 'SHOP') {
      setShopInventory([...ALL_WORDS].sort(() => Math.random() - 0.5).slice(0, 4).map(w => ({...w, id: `s_${Math.random()}`, cost: 15 + Math.floor(Math.random()*15)})));
      setGameState(GameState.SHOP);
    }
    else if (node.content === 'REST') setGameState(GameState.REST);
    else if (node.content === 'TREASURE') {
      setTagRewardChoices([...ALL_ITEMS].sort(() => Math.random() - 0.5).slice(0, 3));
      setGameState(GameState.TREASURE);
    }
    else if (node.content === 'EVENT') {
      const eligibleEvents = Object.values(EVENT_POOL).filter(e => {
        if (!e.requirements) return true;
        return e.requirements.some(req => s.inventory.some(inv => inv.text === req));
      });
      const selectedEvent = eligibleEvents.length > 0 
        ? eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)] 
        : EVENT_POOL["ink_gift"];
      
      setCurrentEvent(selectedEvent);
      setGameState(GameState.EVENT);
    }
    else setGameState(GameState.MAP);
  };

  const handleEventOption = (option: any) => {
    const result = option.action(stats);
    setStats(result.stats);
    setCombatLog([result.log]);
    if (result.nextState) setGameState(result.nextState);
    else setGameState(GameState.MAP);
  };

  return (
    <div className={`min-h-screen bg-[#020202] pt-28 pb-12 flex flex-col items-center overflow-hidden relative transition-all duration-300 ${vfx === 'shake' ? 'shake-anim' : ''}`}>
      <div className="absolute inset-0 glitch-bg z-[-1]"></div>
      <StatusPanel stats={stats} />
      {activeCombo && <ComboOverlay phrase={activeCombo.phrase} description={activeCombo.description} onComplete={() => setActiveCombo(null)} />}
      {isDictionaryOpen && <Dictionary stats={stats} onClose={() => setIsDictionaryOpen(false)} />}
      
      {rewardChoices && (
        <div className="fixed inset-0 bg-black/99 z-[150] flex flex-col items-center justify-center p-12 backdrop-blur-3xl">
           <h3 className="text-4xl font-bold text-red-900 mb-20 tracking-[0.8em] uppercase">提取定义碎片</h3>
           <div className="flex gap-16">
             {rewardChoices.map((word, i) => (
               <div key={i} onClick={() => { const newInv = [...stats.inventory, {...word, id: `inv_${Math.random()}`}]; setStats(prev => ({...prev, inventory: newInv})); setRewardChoices(null); if (newInv.length > MAX_WORDS) { setIsDictionaryOpen(true); } else setGameState(GameState.MAP); }} className="w-64 h-96 bg-zinc-950 border border-white/5 hover:border-red-800 cursor-pointer p-12 flex flex-col justify-between group shadow-2xl transition-all hover:scale-105">
                 <span className="text-[10px] text-gray-700 mono uppercase tracking-widest">{word.category}</span>
                 <span className="text-7xl font-bold text-gray-400 self-center group-hover:text-red-600 transition-all italic">{word.text}</span>
                 <span className="text-[8px] mono text-red-900 text-center font-bold opacity-0 group-hover:opacity-100 uppercase">选择</span>
               </div>
             ))}
           </div>
        </div>
      )}

      {gameState === GameState.MENU && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-[200]">
          <h1 className="text-9xl font-bold text-red-950 mb-4 italic tracking-tighter">褪色的余晖</h1>
          <button onClick={() => setGameState(GameState.IDENTITY_SELECTION)} className="px-24 py-5 border-2 border-red-950/40 hover:bg-red-950/20 text-red-800 transition-all uppercase tracking-[1em] mono text-sm shadow-2xl">初始化基调</button>
        </div>
      )}

      {gameState === GameState.IDENTITY_SELECTION && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-[200] p-8">
          <h2 className="text-4xl font-bold text-red-900 mb-20 tracking-[0.5em] uppercase border-b border-red-950/40 pb-6">选择认知身份</h2>
          <div className="flex gap-12 max-w-4xl w-full">
            {IDENTITIES.map(id => (
              <div key={id.id} onClick={() => selectIdentity(id)} className="flex-1 bg-zinc-950/40 border border-white/5 p-12 rounded-xl hover:border-red-900 transition-all cursor-pointer group shadow-2xl backdrop-blur-md">
                <h3 className="text-3xl font-bold text-gray-400 mb-8 group-hover:text-red-700 group-hover:italic transition-all">{id.name}</h3>
                <p className="text-gray-500 text-sm italic leading-relaxed mb-12">{id.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {gameState === GameState.EVENT && currentEvent && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/95 z-[180] p-12 backdrop-blur-3xl animate-fade-in">
           <div className="max-w-3xl w-full bg-zinc-950 border border-white/10 p-12 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,1)] relative overflow-hidden">
             <h3 className="text-4xl font-bold text-red-900 mb-10 tracking-[0.5em] uppercase italic border-b border-white/5 pb-6">{currentEvent.title}</h3>
             <p className="text-xl text-gray-400 mb-12 italic leading-relaxed">{currentEvent.description}</p>
             <div className="flex flex-col gap-5">
               {currentEvent.options.map((opt, i) => {
                 const isEligible = !opt.requiredWord || stats.inventory.some(w => w.text === opt.requiredWord);
                 return (
                   <button key={i} disabled={!isEligible} onClick={() => handleEventOption(opt)} className={`group w-full py-6 px-10 border transition-all rounded-xl relative overflow-hidden ${isEligible ? 'bg-black/40 border-white/5 hover:border-red-900/50 hover:bg-red-950/10' : 'bg-black/20 border-white/5 opacity-20 grayscale cursor-not-allowed'}`}>
                     <span className="text-lg text-gray-300 group-hover:text-red-500 font-bold transition-all uppercase tracking-widest">{opt.label}</span>
                   </button>
                 );
               })}
             </div>
           </div>
        </div>
      )}

      {gameState === GameState.COMBAT && currentEnemy && (
        <div className="max-w-[1500px] w-full px-8 grid grid-cols-12 gap-8 h-[calc(100vh-200px)] animate-fade-in relative z-20">
          <div className="col-span-3 flex flex-col bg-zinc-950/40 border-r border-white/5 p-4 rounded-l-3xl shadow-2xl overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3">
              {combatLog.map((log, i) => (
                <div key={i} className={`text-[11px] border-l-2 pl-4 py-3 ${i === combatLog.length - 1 ? 'text-red-500 border-red-600 bg-red-950/10 font-bold' : 'text-gray-600 border-gray-800 opacity-60 italic'}`}>{log}</div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
          <div className="col-span-6 flex flex-col items-center justify-center relative px-10">
            <div className="w-full max-w-2xl bg-zinc-950/60 border border-white/5 p-12 rounded-3xl shadow-2xl flex flex-col items-center">
              <h3 className="text-5xl font-bold text-gray-100 italic mb-10">【 {currentEnemy.name} 】</h3>
              <div className="px-10 py-5 bg-black/60 border-2 border-red-900/40 rounded-2xl mb-8 flex flex-col items-center">
                <span className="text-xl text-red-500 font-bold">{currentEnemy.intent?.description}</span>
              </div>
              <div className="w-full space-y-4">
                <div className="h-2 bg-zinc-900 w-full rounded-full overflow-hidden"><div className="h-full bg-red-600 transition-all duration-700" style={{ width: `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%` }} /></div>
                <div className="h-2 bg-zinc-900 w-full rounded-full overflow-hidden"><div className="h-full bg-blue-600 transition-all duration-700" style={{ width: `${currentEnemy.correction}%` }} /></div>
              </div>
              <div className="mt-8 w-full">
                <div className="flex gap-4 min-h-[160px] border-2 border-dashed border-white/5 w-full items-center justify-center p-6 bg-black/40 rounded-2xl mb-8">
                  {logicSlot.map((card, i) => (
                    <div key={i} onClick={() => !isProcessing && setLogicSlot(prev => prev.filter((_, idx) => idx !== i))} className="w-24 h-36 bg-red-950/10 border-2 border-red-900/30 text-red-600 flex items-center justify-center shadow-lg transition-all group active:scale-95">
                      <span className="text-5xl font-bold italic">{card.text}</span>
                    </div>
                  ))}
                </div>
                <button disabled={logicSlot.length < 1 || isProcessing} onClick={handleLogicAction} className="w-full py-6 bg-white hover:bg-red-800 hover:text-white text-black font-bold uppercase disabled:opacity-5 text-sm transition-all border border-white/20 tracking-[1.5em] shadow-2xl">执行定义</button>
              </div>
            </div>
          </div>
          <div className="col-span-3 flex flex-col gap-6">
            <div className="bg-zinc-950/60 border border-white/5 p-6 rounded-3xl h-[60%] flex flex-col">
              <h4 className="text-[10px] text-gray-500 uppercase mb-6 text-center mono font-bold">定义存档</h4>
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                {stats.inventory.map((card) => {
                  const isSelected = logicSlot.some(c => c.id === card.id);
                  return (
                    <div key={card.id} onClick={() => { if (!isProcessing) { if (isSelected) setLogicSlot(prev => prev.filter(c => c.id !== card.id)); else if (logicSlot.length < 4) setLogicSlot(prev => [...prev, card]); } }}
                      className={`w-full p-4 border flex items-center justify-between cursor-pointer transition-all rounded-xl ${isSelected ? 'bg-red-950/60 border-white text-white' : 'bg-black/40 border-white/5 text-gray-500'}`}
                    >
                      <span className="text-3xl font-bold italic">{card.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-zinc-950/20 border border-white/5 p-6 rounded-3xl h-[40%] flex flex-col">
              <h4 className="text-[10px] text-gray-500 uppercase mb-4 text-center mono font-bold">认知的具象</h4>
              <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1">
                {stats.tagItems.map((item, i) => (
                  <div key={i} className={`p-3 bg-black/40 border border-white/5 rounded-xl ${item.rarity === 'DIVINE' ? 'border-yellow-900/40 bg-yellow-950/5' : ''}`}>
                    <span className={`text-xs font-bold block ${item.rarity === 'DIVINE' ? 'text-yellow-700' : 'text-red-800'}`}>{item.name}</span>
                    <p className="text-[9px] text-gray-600 leading-tight">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {gameState === GameState.MAP && (
        <div className="grid grid-cols-7 gap-4 bg-zinc-950/30 p-10 border border-white/5 rounded-2xl shadow-2xl relative mt-20">
          {map.map((node) => {
            const dist = Math.abs(node.x - stats.currentPos.x) + Math.abs(node.y - stats.currentPos.y);
            const isSelectable = !node.isRevealed && dist === 1;
            const isCurrent = node.x === stats.currentPos.x && node.y === stats.currentPos.y;
            let icon = '·';
            let iconColor = 'text-gray-700';
            if (node.isRevealed) {
               if (node.type === 'MINE') { icon = '危'; iconColor = 'text-red-600'; }
               else if (node.content === 'SHOP') { icon = '市'; iconColor = 'text-blue-500'; }
               else if (node.content === 'REST') { icon = '火'; iconColor = 'text-orange-500'; }
               else if (node.content === 'TREASURE') { icon = '金'; iconColor = 'text-yellow-500'; }
               else if (node.content === 'EVENT') { icon = '？'; iconColor = 'text-indigo-400'; }
               else { icon = CHINESE_NUMBERS[node.neighborMines]; iconColor = 'text-gray-400'; }
            }
            return (
              <div key={node.id} onClick={() => handleNodeClick(node)} className={`w-16 h-16 flex items-center justify-center transition-all border rounded-sm relative ${node.isRevealed ? 'bg-black/80 border-white/10' : (isSelectable ? 'bg-zinc-900 border-red-900/40 cursor-pointer' : 'bg-zinc-950/40 border-white/5 opacity-30')}`}>
                {isCurrent && <div className="absolute inset-0 border-2 border-red-600/60 animate-ping" />}
                <span className={`mono text-lg font-bold ${iconColor}`}>{icon}</span>
              </div>
            );
          })}
        </div>
      )}

      {gameState === GameState.GAMEOVER && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-[200]">
          <h2 className="text-9xl font-bold text-red-950 mb-8 italic">现实崩毁</h2>
          <button onClick={() => window.location.reload()} className="px-20 py-5 border-2 border-red-950 text-red-950 hover:bg-red-950 hover:text-white transition-all uppercase font-bold text-xs">重新初始化</button>
        </div>
      )}

      <button onClick={() => setIsDictionaryOpen(true)} className="fixed bottom-10 right-10 w-16 h-16 bg-red-950/20 border-2 border-red-900/40 rounded-full flex items-center justify-center text-red-700 hover:bg-red-900 hover:text-white z-[60] shadow-2xl">
        <span className="text-[10px] mono font-bold">词典</span>
      </button>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(153, 27, 27, 0.3); }
        .shake-anim { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-4px, 0, 0); } 40%, 60% { transform: translate3d(4px, 0, 0); } }
      `}</style>
    </div>
  );
};

export default App;
