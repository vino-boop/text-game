
import { GameStats, Enemy, WordCard, ComboEffect } from '../types';

const getConfusionMod = (lucidity: number): number => {
  if (lucidity >= 80) return 0;
  const range = 2 + Math.floor((80 - lucidity) / 6);
  return Math.floor(Math.random() * (range * 2 + 1)) - range;
};

const applyLogic = (
  stats: GameStats, 
  enemy: Enemy, 
  dmg: number = 0, 
  correction: number = 0, 
  source: 'PLAYER' | 'ENEMY' = 'PLAYER'
): { s: GameStats, e: Enemy, finalDmg: number, finalCorr: number } => {
  let s = { ...stats };
  let e = { ...enemy };
  let mod = getConfusionMod(s.lucidity);
  
  if (source === 'ENEMY' && s.tagItems.some(i => i.name === '铁荆棘')) {
    e.hp = Math.max(0, e.hp - 5);
  }

  // 道具联动：回响 (HP < 5% 翻倍)
  let dmgMult = 1;
  if (source === 'PLAYER' && s.tagItems.some(i => i.name === '回响') && s.vocabulary < s.maxVocabulary * 0.05) {
    dmgMult = 2;
  }

  let finalDmg = Math.max(0, (dmg * dmgMult) + mod);
  let finalCorr = Math.max(0, correction + (mod > 0 ? Math.floor(mod/2) : 0));

  if (source === 'PLAYER') {
    e.hp = Math.max(0, e.hp - finalDmg);
    e.correction = Math.min(e.maxCorrection, e.correction + finalCorr);
  } else {
    const shieldAbsorb = Math.min(s.shield, finalDmg);
    s.shield -= shieldAbsorb;
    const remaining = finalDmg - shieldAbsorb;
    s.vocabulary = Math.max(0, s.vocabulary - remaining);
  }

  return { s, e, finalDmg, finalCorr };
};

export const processStartTurnTick = (stats: GameStats, enemy: Enemy): { s: GameStats, e: Enemy, logs: string[] } => {
  let s = { ...stats };
  let e = { ...enemy };
  let logs: string[] = [];
  
  e.turnCount = (e.turnCount || 0) + 1;

  // 被动：虚无之心
  if (s.tagItems.some(i => i.name === '虚无之心') && s.shield === 0) {
    s.shield += 8;
    logs.push("【虚无之心】：在虚无中织就了一层薄弱的护甲。");
  }

  if (e.turnCount === 1 && s.tagItems.some(i => i.name === '生锈锚')) {
    s.shield += 25;
    logs.push("【生锈锚】：首回合稳固。");
  }

  if (s.tagItems.some(i => i.name === '逻辑余烬')) {
    e.burn += 3;
  }

  return { s, e, logs };
};

export const processStatusTick = (stats: GameStats, enemy: Enemy): { s: GameStats, e: Enemy, logs: string[] } => {
  let s = { ...stats };
  let e = { ...enemy };
  let logs: string[] = [];

  // 道具联动：理性 (护盾不自动消失)
  const hasRationality = s.tagItems.some(i => i.name === '理性');
  if (s.shield > 0 && !hasRationality) {
    s.shield = 0;
    logs.push("【护盾消失】：未被定义的防御力已消散。");
  } else if (s.shield > 0 && hasRationality) {
    logs.push("【理性】：护盾逻辑已固化。");
  }

  if (s.burn > 0) {
    const bDmg = Math.floor(s.burn);
    s.vocabulary = Math.max(0, s.vocabulary - bDmg);
    logs.push(`【自燃】：意志损耗 ${bDmg}。`);
    s.burn = Math.floor(s.burn * 0.6);
  }
  
  if (e.burn > 0) {
    const bDmg = Math.floor(e.burn);
    e.hp = Math.max(0, e.hp - bDmg);
    logs.push(`【灼烧】：观测对象损耗 ${bDmg}。`);
    // 道具联动：永恒焚烧事件奖励 slow_burn_decay
    const decayRate = s.tags.includes('slow_burn_decay') ? 0.75 : 0.6;
    e.burn = Math.floor(e.burn * decayRate);
    if (e.burn <= 1) e.burn = 0;
  }

  s.tags = s.tags.filter(t => !['evasive', 'reflect', 'invincible'].includes(t));
  return { s, e, logs };
};

export const COMBOS: Record<string, ComboEffect> = {
  "反安": { 
    phrase: "反安", 
    description: "逆转的平息。修正进度显著回升。", 
    action: (s, e) => { const r = applyLogic(s, e, 0, 18); return { stats: r.s, enemy: r.e, log: "【反安】：修正进度回升。" }; } 
  },
  "固反": { 
    phrase: "固反", 
    description: "凝固的排异。加固现实的同时填补逻辑裂缝。", 
    action: (s, e) => { const r = applyLogic(s, e, 0, 22); return { stats: r.s, enemy: r.e, log: "【固反】：强化修正链条。" }; } 
  },
  "安固": { 
    phrase: "安固", 
    description: "平和的锚点。逻辑趋于稳定。", 
    action: (s, e) => { const r = applyLogic(s, e, 0, 25); return { stats: r.s, enemy: r.e, log: "【安固】：逻辑趋于稳定。" }; } 
  },
  "反击": { 
    phrase: "反击", 
    description: "反射的冲击。本回合反弹攻击。", 
    action: (s, e) => { const r = applyLogic(s, e, 0, 12); r.s.tags.push('reflect'); return { stats: r.s, enemy: r.e, log: "【反击】：以彼之道还施彼身。" }; } 
  },
  "固御": { 
    phrase: "固御", 
    description: "坚定的屏障。产生大量现实护盾。", 
    action: (s, e) => { const r = applyLogic(s, e, 0, 10); r.s.shield += 30; return { stats: r.s, enemy: r.e, log: "【固御】：坚不可摧的定义。" }; } 
  },
  "安守": { 
    phrase: "安守", 
    description: "静谧的防线。回复意志并获得修正。", 
    action: (s, e) => { const r = applyLogic(s, e, 0, 15); r.s.vocabulary = Math.min(r.s.maxVocabulary, r.s.vocabulary + 12); return { stats: r.s, enemy: r.e, log: "【安守】：在静默中修正现实。" }; } 
  },
  // --- 焚 (Incinerate) Related Combos with Burn Effects ---
  "烧焚": { 
    phrase: "烧焚", 
    description: "焦灼的逻辑。造成损耗并大幅引燃。", 
    action: (s, e) => { const r = applyLogic(s, e, 15, 0); return { stats: r.s, enemy: { ...r.e, burn: r.e.burn + 35 }, log: "【烧焚】：认知之火在蔓延。" }; } 
  },
  "焚击": {
    phrase: "焚击",
    description: "热量的干涉。物理冲击夹杂灼烧感。",
    action: (s, e) => { const r = applyLogic(s, e, 20, 0); return { stats: r.s, enemy: { ...r.e, burn: r.e.burn + 15 }, log: "【焚击】：焦黑的痕迹留在了定义上。" }; }
  },
  "焚绝": {
    phrase: "焚绝",
    description: "彻底的燃尽。造成爆发伤害并深度引燃。",
    action: (s, e) => { const r = applyLogic(s, e, 25, 2); return { stats: r.s, enemy: { ...r.e, burn: r.e.burn + 25 }, log: "【焚绝】：燃烧逻辑底色，终结定义。" }; }
  },
  "焚坚": {
    phrase: "焚坚",
    description: "攻守转换的余温。获得护盾并引燃敌人。",
    action: (s, e) => { const r = applyLogic(s, e, 10, 0); r.s.shield += 15; return { stats: r.s, enemy: { ...r.e, burn: r.e.burn + 10 }, log: "【焚坚】：热浪构成的临时屏障。" }; }
  },
  "御焚": {
    phrase: "御焚",
    description: "反震的烈焰。防御成功并溅射火焰。",
    action: (s, e) => { const r = applyLogic(s, e, 5, 0); r.s.shield += 25; return { stats: r.s, enemy: { ...r.e, burn: r.e.burn + 12 }, log: "【御焚】：防御定义的物理溅射引燃。" }; }
  },
  "焚杀": {
    phrase: "焚杀",
    description: "狂乱的定义抹除。牺牲理智造成巨量燃烧。",
    action: (s, e) => { 
        const r = applyLogic(s, e, 40, 0); 
        r.s.lucidity = Math.max(0, r.s.lucidity - 10); 
        return { stats: r.s, enemy: { ...r.e, burn: r.e.burn + 40 }, log: "【焚杀】：狂乱的定义抹除，逻辑在哀嚎中灰飞烟灭。" }; 
    }
  },
  "焚焚焚": {
    phrase: "焚焚焚",
    description: "【认知劫难】。理智暴跌，敌方遭受毁灭性引燃。",
    action: (s, e) => { 
        const r = applyLogic(s, e, 60, 0); 
        r.s.lucidity = Math.max(0, r.s.lucidity - 30); 
        return { stats: r.s, enemy: { ...r.e, burn: r.e.burn + 100 }, log: "【焚焚焚】：失控的认知烈焰，将现实一切定义彻底焚毁。" }; 
    }
  },
  "焚绝杀裂": {
    phrase: "焚绝杀裂",
    description: "牺牲理智，敌方稳定性强制极低并附加剧烈引燃。",
    action: (s, e) => { 
        const r = applyLogic(s, e, 0, 0); 
        r.s.lucidity = Math.floor(r.s.lucidity / 2); 
        return { stats: r.s, enemy: { ...r.e, hp: Math.min(r.e.hp, 5), burn: r.e.burn + 60 }, log: "【焚绝杀裂】：以疯狂为代价，拆解敌方根基并点燃余烬。" }; 
    }
  },
  "击斩焚绝": {
    phrase: "击斩焚绝",
    description: "毁灭性逻辑。造成高额伤害与引燃。",
    action: (s, e) => { 
        const r = applyLogic(s, e, 120, 5); 
        return { stats: r.s, enemy: { ...r.e, burn: r.e.burn + 30 }, log: "【击斩焚绝】：纯粹的毁灭性逻辑，伴随不熄的火。" }; 
    }
  }
};

export const executePlayerAction = (logicSlot: WordCard[], stats: GameStats, enemy: Enemy): { stats: GameStats, enemy: Enemy, logs: string[], comboInfo?: any, chainKey?: string } => {
  const chain = logicSlot.map(c => c.text).join('');
  let s = { ...stats };
  let e = { ...enemy };
  let logs: string[] = [];
  let comboInfo = undefined;
  let chainKey = undefined;

  const hasItem = (name: string) => s.tagItems.some(i => i.name === name);
  let attackMod = hasItem('死者牙齿') ? 1.4 : 1.2;
  let shieldMod = (hasItem('脂烛') && s.lucidity > 50) ? 1.5 : 1;
  
  // 道具：祭坛碎片 (加固反馈)
  const shieldBonus = hasItem('祭坛碎片') ? 3 : 0;

  if (COMBOS[chain]) {
    const res = COMBOS[chain].action(s, e);
    s = res.stats;
    e = res.enemy;
    logs.push(res.log);
    comboInfo = { phrase: COMBOS[chain].phrase, description: COMBOS[chain].description };
    chainKey = chain;
  } else {
    logicSlot.forEach(w => {
      if (w.category === 'attack') {
        const res = applyLogic(s, e, Math.floor(w.power * attackMod), 1);
        s = res.s; e = res.e;
        logs.push(`执行 [${w.text}]：物理干预。`);
      } else if (w.category === 'defense') {
        if (w.text === '安' || w.text === '息') {
          s.vocabulary = Math.min(s.maxVocabulary, s.vocabulary + Math.floor(w.power * 3));
          logs.push(`执行 [${w.text}]：回复意志。`);
        } else {
          s.shield += Math.floor(w.power * 4 * shieldMod) + shieldBonus;
          logs.push(`执行 [${w.text}]：产生护盾。`);
        }
      }
    });
  }

  return { stats: s, enemy: e, logs, comboInfo, chainKey };
};

export const executeEnemyTurn = (stats: GameStats, enemy: Enemy): { stats: GameStats, enemy: Enemy, logs: string[] } => {
  let s = { ...stats };
  let e = { ...enemy };
  let logs: string[] = [];
  const intent = e.intent!;

  if (e.tags?.includes('stunned')) {
    logs.push(`【剥夺】：${e.name} 无法行动。`);
    return { stats: s, enemy: e, logs };
  }

  if (s.tags.includes('invincible')) {
    logs.push("【无敌】：定义的绝对性屏蔽了威胁。");
  } else {
    let val = intent.value;
    if (intent.type === 'ATTACK') {
      if (s.tags.includes('reflect')) {
        e.hp = Math.max(0, e.hp - val);
        logs.push(`【反弹】：攻击者自伤。`);
      } else {
        const res = applyLogic(s, e, val, 0, 'ENEMY');
        s = res.s; e = res.e;
        logs.push(`${e.name} 冲击了你的意志。`);
      }
    } else if (intent.type === 'DEFEND') {
      e.hp = Math.min(e.maxHp, e.hp + val);
      logs.push(`${e.name} 巩固定义。`);
    } else if (intent.type === 'DISTORT') {
      if (e.isBoss) {
        s.lucidity = Math.max(0, s.lucidity - val);
        logs.push(`认知污染！清晰度下降 ${val}%`);
      } else {
        const res = applyLogic(s, e, val, 0, 'ENEMY');
        s = res.s; e = res.e;
        logs.push(`${e.name} 的认知干扰未能刺穿理智，转而损耗意志。`);
      }
    } else if (intent.type === 'HEAL') {
      e.hp = Math.min(e.maxHp, e.hp + val);
      logs.push(`${e.name} 在修复自身定义。`);
    }
  }

  return { stats: s, enemy: e, logs };
};
