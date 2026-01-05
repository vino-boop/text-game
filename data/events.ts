
import { GameEvent, GameStats, GameState } from '../types';
import { ALL_WORDS } from '../constants';
import { ALL_ITEMS } from './items';

export const EVENT_POOL: Record<string, GameEvent> = {
  // Fix: Added missing description field to satisfy GameEvent interface required by types.ts
  "naming_ceremony": {
    id: "e_naming_ceremony",
    title: "【逻辑的崩塌：命名仪式】",
    description: "在这个扭曲的祭坛前，一个无法名状的轮廓正渴望着被定义。你可以感受到现实在它周围剧烈震颤，等待着某种认知的注入。",
    requirements: ["击", "封", "空"],
    options: [
      {
        label: "赋予 [击] (理智-5)",
        requiredWord: "击",
        action: (s) => ({
          stats: { ...s, lucidity: Math.max(0, s.lucidity - 5) },
          log: "【赋予】：你将抽象的恐惧转化为具体的物理实体。它变得可被伤害。"
        })
      },
      {
        label: "赋予 [封] (获遗物【刻刀】)",
        requiredWord: "封",
        action: (s) => {
          const chisel = ALL_ITEMS.find(i => i.id === 'itm_chisel')!;
          return {
            stats: { 
              ...s, 
              tagItems: [...s.tagItems, chisel],
              tags: [...s.tags, 'chisel_charge_3'] 
            },
            log: "【赋予】：你将其囚禁。怪物缩成了一柄锋利的刻刀。"
          };
        }
      }
    ]
  },
  "burning_books": {
    id: "e_burning_books",
    title: "【焚书的辩论】",
    description: "一个疯狂的学者正在烧毁古籍， he尖叫着：“火才是唯一的真理，因为它不记录任何谎言！”",
    requirements: ["焚", "固"],
    options: [
      {
        label: "加入 [焚] (失去所有防御字，攻击字增强)",
        requiredWord: "焚",
        action: (s) => {
          const newInv = s.inventory.filter(w => w.category !== 'defense');
          const finalInv = newInv.map(w => w.category === 'attack' ? { ...w, power: w.power + 2 } : w);
          return {
            stats: { ...s, inventory: finalInv },
            log: "【纯粹】：你亲手焚毁了所有虚伪的防线，逻辑的破坏力达到了顶峰。"
          };
        }
      },
      {
        label: "施加 [固] (获得遗物【理性余烬】)",
        requiredWord: "固",
        action: (s) => {
          const item = ALL_ITEMS.find(i => i.id === 'itm_rational_ember')!;
          return {
            stats: { ...s, tagItems: [...s.tagItems, item] },
            log: "【保护】：你保住了残存的文字，理性的火种在你心中长存。"
          };
        }
      }
    ]
  },
  "birth_pain": {
    id: "e_birth_pain",
    title: "【诞生之痛：第一个字】",
    description: "你在泥泞中看到最初的人类试图在石壁上划下第一道痕迹。",
    requirements: ["裂", "守"],
    options: [
      {
        label: "引导 [裂] (攻击单字破甲效果)",
        requiredWord: "裂",
        action: (s) => ({
          stats: { ...s, tags: [...s.tags, 'armor_pierce'] },
          log: "你教会了他切分世界，逻辑现在更具穿透力。"
        })
      },
      {
        label: "引导 [守] (防御单字回复生命)",
        requiredWord: "守",
        action: (s) => ({
          stats: { ...s, tags: [...s.tags, 'heal_on_defend'] },
          log: "你教会了他敬畏世界，每一次防守都是对自我的补完。"
        })
      }
    ]
  },
  "memory_limb": {
    id: "e_memory_limb",
    title: "【记忆的幻肢】",
    description: "你遇见了一个死去的战友，他看起来如此真实，甚至记得你小时候的绰号。",
    requirements: ["幻", "安"],
    options: [
      {
        label: "识破 [幻] (增加意志力)",
        requiredWord: "幻",
        action: (s) => ({
          stats: { ...s, vocabulary: Math.min(s.maxVocabulary, s.vocabulary + 50) },
          log: "这是大脑的放电，战友消散了，但你的意志变得坚定。"
        } )
      },
      {
        label: "沉溺 [安] (回复全部生命，降低理智上限)",
        requiredWord: "安",
        action: (s) => ({
          stats: { ...s, vocabulary: s.maxVocabulary, maxLucidity: s.maxLucidity - 10, lucidity: Math.min(s.lucidity, s.maxLucidity - 10) },
          log: "宁愿在谎言中安息，肉体恢复了，灵魂却在枯萎。"
        })
      }
    ]
  },
  "absolute_stillness": {
    id: "e_stillness",
    title: "【绝对静止的荒原】",
    description: "这里的空气不再流动，声音也无法传播。理性告诉你，这里是逻辑的终点。",
    requirements: ["息", "无"],
    options: [
      {
        label: "打破 [息] (触发真空之战)",
        requiredWord: "息",
        action: (s) => ({
          stats: s,
          log: "你强行呼吸，现实在震动。",
          nextState: GameState.COMBAT
        })
      },
      {
        label: "顺应 [无] (获得【虚无之心】)",
        requiredWord: "无",
        action: (s) => {
          const item = ALL_ITEMS.find(i => i.id === 'itm_void_heart')!;
          return {
            stats: { ...s, tagItems: [...s.tagItems, item] },
            log: "你成为了荒原的一部分。虚无之中，盾牌自现。"
          };
        }
      }
    ]
  },
  "shadow_trial": {
    id: "e_shadow_trial",
    title: "【影之审判】",
    description: "你的影子突然站了起来，指责你用文字掩盖了暴行。",
    requirements: ["斩", "杀", "移"],
    options: [
      {
        label: "斩断 [斩/杀] (攻击提升，理智降低)",
        requiredWord: "斩",
        action: (s) => ({
          stats: { ...s, lucidity: Math.max(0, s.lucidity - 20), tags: [...s.tags, 'pure_killer'] },
          log: "你杀掉了自己的阴暗面。你变得更强，也更疯了。"
        })
      },
      {
        label: "交换 [移] (获得【影子】)",
        requiredWord: "移",
        action: (s) => {
          const shadow = ALL_ITEMS.find(i => i.id === 'itm_shadow')!;
          return {
            stats: { 
              ...s, 
              maxVocabulary: s.maxVocabulary - 40, 
              vocabulary: Math.min(s.vocabulary, s.maxVocabulary - 40),
              maxLucidity: s.maxLucidity + 30,
              lucidity: s.maxLucidity + 30,
              tagItems: [...s.tagItems, shadow] 
            },
            log: "让影子代替你行走。你的视野变得异常宽阔。"
          };
        }
      }
    ]
  },
  "inverted_altar": {
    id: "e_altar",
    title: "【倒错的祭坛】",
    description: "祭坛上刻着：“只有当你失去防备，神才会注视你。”",
    requirements: ["反", "坚", "御"],
    options: [
      {
        label: "反转 [反+坚] (护盾转化为攻击力)",
        requiredWord: "反",
        action: (s) => ({
          stats: { ...s, shield: 0, tags: [...s.tags, `shield_to_atk_${s.shield}`] },
          log: "防御坍塌为最锋利的尖刺。"
        })
      },
      {
        label: "献祭 [御] (获得【祭坛碎片】)",
        requiredWord: "御",
        action: (s) => {
          const shard = ALL_ITEMS.find(i => i.id === 'itm_altar_shard')!;
          return {
            stats: { ...s, inventory: s.inventory.filter(w => w.text !== '御'), tagItems: [...s.tagItems, shard] },
            log: "你放弃了御守的定义，换取了更深层的加固反馈。"
          };
        }
      }
    ]
  },
  "babel_tower": {
    id: "e_babel",
    title: "【语言的巴别塔】",
    description: "你看到一座由文字堆叠的高塔正在坍塌，每个落下的字都在重新定义现实。",
    requirements: ["绝", "坚"],
    options: [
      {
        label: "接住 [绝] (获得【回响】)",
        requiredWord: "绝",
        action: (s) => {
          const item = ALL_ITEMS.find(i => i.id === 'itm_echo')!;
          return {
            stats: { ...s, tagItems: [...s.tagItems, item] },
            log: "在绝望的底层，你听到了真理的回响。"
          };
        }
      },
      {
        label: "接住 [坚] (获得【理性】)",
        requiredWord: "坚",
        action: (s) => {
          const item = ALL_ITEMS.find(i => i.id === 'art_rationality')!;
          return {
            stats: { ...s, tagItems: [...s.tagItems, item] },
            log: "你抓住了理性的基石，护盾将不再消散。"
          };
        }
      }
    ]
  },
  "eternal_incineration": {
    id: "e_eternal_fire",
    title: "【永恒的焚烧】",
    description: "一具尸体在永不熄灭的火焰中哀嚎，他请求你终结这种“存在”。",
    requirements: ["息", "绝", "烧"],
    options: [
      {
        label: "终结 [息/绝] (烧伤递减减缓)",
        requiredWord: "息",
        action: (s) => ({
          stats: { ...s, tags: [...s.tags, 'slow_burn_decay'] },
          log: "赋予寂灭。从此，逻辑的余温将更加持久。"
        })
      },
      {
        label: "研究 [烧] (理智提升，失去红色字)",
        requiredWord: "烧",
        action: (s) => {
          const redWords = s.inventory.filter(w => w.category === 'attack');
          const lostWord = redWords[Math.floor(Math.random() * redWords.length)];
          return {
            stats: { 
              ...s, 
              lucidity: Math.min(s.maxLucidity, s.lucidity + 40), 
              inventory: s.inventory.filter(w => w.id !== lostWord?.id) 
            },
            log: `你洞察了火焰。你变得更清醒了，但失去了对 [${lostWord?.text || '毁'}] 的掌控。`
          };
        }
      }
    ]
  }
};
