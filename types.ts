
export enum GameState {
  MENU = '菜单',
  IDENTITY_SELECTION = '身份选择',
  MAP = '认知图谱',
  ADVENTURE = '探索叙事', 
  EVENT = '特殊事件',    
  COMBAT = '逻辑博弈',
  SHOP = '真理黑市',
  REST = '逻辑篝火',
  ROLLER = '逻辑重塑',
  TREASURE = '认知秘宝',
  GAMEOVER = '现实崩塌',
  VICTORY = '抵达彼岸'
}

export enum Region {
  SENSES = '感官废墟',
  LOGIC = '逻辑荒漠',
  TRUTH = '真理核心'
}

export type NodeType = 'MINE' | 'SAFE' | 'BOSS' | 'START';
export type IntentType = 'ATTACK' | 'DEFEND' | 'DISTORT' | 'HEAL' | 'UNKNOWN';

export interface EnemyIntent {
  type: IntentType;
  value: number;
  description: string;
}

export interface MapNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  isRevealed: boolean;
  neighborMines: number;
  content: 'EVENT' | 'SHOP' | 'REST' | 'ROLLER' | 'TREASURE' | 'NONE';
}

export interface WordCard {
  id: string;
  text: string;
  category: 'attack' | 'defense' | 'strategy' | 'forbidden';
  power: number;
  isCursed?: boolean;
  cost?: number;
  isMerged?: boolean; 
}

export interface TagItem {
  id: string;
  name: string;
  description: string;
  rarity: 'COMMON' | 'DIVINE';
  effect?: (stats: GameStats, enemy: Enemy | null) => { stats: GameStats; enemy: Enemy | null; log: string };
}

export interface GameStats {
  vocabulary: number;
  maxVocabulary: number;
  lucidity: number;
  maxLucidity: number;
  shield: number;
  burn: number; 
  day: number;
  inventory: WordCard[];
  tagItems: TagItem[];
  discoveredCombos: string[];
  stage: Region;
  nodesCleared: number;
  accumulatedDanger: number; 
  tags: string[]; 
  hasRevival?: boolean;
  currentPos: { x: number, y: number };
}

export interface Enemy {
  name: string;
  description: string;
  hp: number;
  maxHp: number;
  correction: number;
  maxCorrection: number; 
  attack: number;
  logicDistortion: number;
  burn: number;
  intent?: EnemyIntent;
  tags?: string[];
  turnCount?: number;
  isBoss?: boolean; // New flag to control lucidity reduction
}

export interface ComboEffect {
  phrase: string;
  description: string;
  action: (stats: GameStats, enemy: Enemy) => { stats: GameStats; enemy: Enemy; log: string };
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  requirements?: string[]; // Trigger only if player has one of these words
  options: {
    label: string;
    action: (stats: GameStats) => { stats: GameStats; log: string; nextState?: GameState };
    requiredWord?: string; // Specific option may require a word
  }[];
}

export interface Identity {
  id: string;
  name: string;
  description: string;
  startingWords: WordCard[];
  initialLucidity: number;
  initialVocabulary: number;
}
