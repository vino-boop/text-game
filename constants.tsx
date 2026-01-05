
import { WordCard, Identity, TagItem } from './types';

export const INITIAL_VOCABULARY = 120;
export const INITIAL_LUCIDITY = 100;

const rawWords: { t: string, c: 'attack' | 'defense' | 'strategy' | 'forbidden', p: number }[] = [
  { t: '击', c: 'attack', p: 3 }, 
  { t: '斩', c: 'attack', p: 4 }, 
  { t: '裂', c: 'attack', p: 2 }, 
  { t: '焚', c: 'attack', p: 5 }, 
  { t: '烧', c: 'attack', p: 4 }, 
  { t: '杀', c: 'attack', p: 4 }, 
  { t: '绝', c: 'attack', p: 0 }, 
  { t: '坚', c: 'defense', p: 3 },
  { t: '固', c: 'defense', p: 2 },
  { t: '守', c: 'defense', p: 4 },
  { t: '封', c: 'defense', p: 5 },
  { t: '御', c: 'defense', p: 5 },
  { t: '安', c: 'defense', p: 2 },
  { t: '息', c: 'defense', p: 3 },
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

export const DISTORTION_CHARS = ['$', '&', '#', '*', '@', '!', '?', 'ø', '†', '‡', '死', '空', '嘘'];
export const CHINESE_NUMBERS = ['零', '一', '二', '三', '四', '五', '六', '七', '八'];
