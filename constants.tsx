
import { WordCard, Identity, GameStats, GameEvent, GameState, ComboEffect, Enemy, TagItem } from './types';

export const INITIAL_VOCABULARY = 120;
export const INITIAL_LUCIDITY = 100;

export const TAG_ITEMS: Record<string, TagItem> = {
  "乡愁": {
    id: "tag_nostalgia",
    name: "乡愁",
    description: "消耗品。在战斗中使用：直接终结本场逻辑博弈并逃离。",
    isConsumable: true,
    effect: (s, e) => ({ stats: s, enemy: e ? { ...e, hp: 0 } : null, log: "【乡愁】：泛黄的记忆重构了眼前的空间，威胁消失了。" })
  },
  "墨染": {
    id: "tag_inked",
    name: "墨染",
    description: "被动。每当你打出包含[杀]或[绝]的组合，额外造成12点伤害。",
    isConsumable: false,
    effect: (s, e) => ({ stats: s, enemy: e, log: "" })
  },
  "修正流体": {
    id: "tag_corr_fluid",
    name: "修正流体",
    description: "消耗品。立即为当前敌人增加20点逻辑修正。",
    isConsumable: true,
    effect: (s, e) => ({ stats: s, enemy: e ? { ...e, correction: Math.min(e.maxCorrection, e.correction + 20) } : null, log: "【修正流体】：逻辑被强行填补了。" })
  }
};

const rawWords: { t: string, c: 'attack' | 'defense' | 'strategy' | 'forbidden', p: number }[] = [
  // Attack (7)
  { t: '击', c: 'attack', p: 3 }, 
  { t: '斩', c: 'attack', p: 4 }, 
  { t: '裂', c: 'attack', p: 2 }, 
  { t: '焚', c: 'attack', p: 5 }, 
  { t: '烧', c: 'attack', p: 4 }, // 新增字
  { t: '杀', c: 'attack', p: 4 }, 
  { t: '绝', c: 'attack', p: 0 }, 

  // Defense (7)
  { t: '坚', c: 'defense', p: 3 },
  { t: '固', c: 'defense', p: 2 },
  { t: '守', c: 'defense', p: 4 },
  { t: '封', c: 'defense', p: 5 },
  { t: '御', c: 'defense', p: 5 },
  { t: '安', c: 'defense', p: 2 },
  { t: '息', c: 'defense', p: 3 },

  // Strategy (6)
  { t: '无', c: 'strategy', p: 0 }, 
  { t: '空', c: 'strategy', p: 0 }, 
  { t: '幻', c: 'strategy', p: 0 }, 
  { t: '影', c: 'strategy', p: 0 }, 
  { t: '移', c: 'strategy', p: 0 }, 
  { t: '反', c: 'strategy', p: 0 }
];

export const ALL_WORDS: WordCard[] = rawWords.map((w, i) => ({
  id: `w_${i}`,
  text: w.t,
  category: w.c,
  power: w.p
}));

export const IDENTITIES: Identity[] = [
  {
    id: 'id_scribe',
    name: '失语书记员',
    description: '最后的现实记录者。他的使命是在世界彻底失真前，找回“定义”的基石。',
    startingWords: [
      { id: 'start_1', text: '坚', category: 'defense', power: 3 },
      { id: 'start_2', text: '斩', category: 'attack', power: 4 },
      { id: 'start_3', text: '烧', category: 'attack', power: 4 }
    ],
    initialLucidity: 100,
    initialVocabulary: 120
  }
];

export const EVENT_POOL: Record<string, GameEvent> = {
  "墨染的馈赠": {
    id: "e_ink_gift",
    title: "【墨染的馈赠】",
    description: "墨水池中漂浮着几枚沉重的单字，它们似乎在渴求血液。",
    options: [
      { label: "献祭意志 (损耗20意志, 获[绝])", action: (s) => ({ stats: { ...s, vocabulary: s.vocabulary - 20, inventory: [...s.inventory, ALL_WORDS.find(w => w.text === '绝')!] }, log: "你感到笔尖变得冰冷。获得单字 [绝]。" }) },
      { label: "献祭理智 (损耗15理智, 获[杀])", action: (s) => ({ stats: { ...s, lucidity: s.lucidity - 15, inventory: [...s.inventory, ALL_WORDS.find(w => w.text === '杀')!] }, log: "疯狂中产生了一丝真实。获得单字 [杀]。" }) },
      { label: "拒绝引诱", action: (s) => ({ stats: s, log: "你退出了墨水池的范围。" }) }
    ]
  }
};

export const DISTORTION_CHARS = ['$', '&', '#', '*', '@', '!', '?', 'ø', '†', '‡', '死', '空', '嘘'];
export const CHINESE_NUMBERS = ['零', '一', '二', '三', '四', '五', '六', '七', '八'];
