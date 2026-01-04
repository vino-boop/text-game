
import { GameStats, Enemy, ComboEffect, WordCard } from '../types';

/**
 * The Core Logic Module: Truth Eroder
 * This module manages all state transitions for combat.
 * Negative effects (Backfires) are marked with isNegative/isCursed.
 */

export const COMBOS: Record<string, ComboEffect> = {
  // ==========================================
  // --- 2-Word Combos (Exactly 60) ---
  // ==========================================
  
  // Resonant / Positive (40)
  "击斩": { phrase: "击斩", description: "造成15点物理伤害。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 15 }, log: "【击斩】：精准的物理打击。" }) },
  "坚固": { phrase: "坚固", description: "获得20点护盾。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 20 }, enemy: e, log: "【坚固】：强化现实外壳。" }) },
  "守御": { phrase: "守御", description: "获得25点护盾。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 25 }, enemy: e, log: "【守御】：标准化的防御定义。" }) },
  "绝杀": { phrase: "绝杀", description: "造成35点爆发伤害。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 35 }, log: "【绝杀】：逻辑链条的终点。" }) },
  "封固": { phrase: "封固", description: "护盾+15，敌方攻击-3。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 15 }, enemy: { ...e, attack: Math.max(1, e.attack - 3) }, log: "【封固】：锁死对方定义。" }) },
  "裂碎": { phrase: "裂碎", description: "造成25点伤害。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 25 }, log: "【裂碎】：物质界面的崩坏。" }) },
  "焚绝": { phrase: "焚绝", description: "造成10点伤害，增加逻辑畸变。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 10, logicDistortion: e.logicDistortion + 2 }, log: "【焚绝】：燃烧逻辑底色。" }) },
  "幻移": { phrase: "幻移", description: "获得15护盾并获得1次闪避。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 15, tags: [...s.tags, 'evasive'] }, enemy: e, log: "【幻移】：错位定义的闪避。" }) },
  "反击": { phrase: "反击", description: "获得1次反弹效果。", action: (s, e) => ({ stats: { ...s, tags: [...s.tags, 'reflect'] }, enemy: e, log: "【反击】：以彼之道还施彼身。" }) },
  "移影": { phrase: "移影", description: "护盾+10并清除封印状态。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 10, tags: s.tags.filter(t => !t.startsWith('sealed')) }, enemy: e, log: "【移影】：在暗影中重塑自我。" }) },
  "安固": { phrase: "安固", description: "意志+10，理智+10。", action: (s, e) => ({ stats: { ...s, lucidity: Math.min(s.maxLucidity, s.lucidity + 10), vocabulary: Math.min(s.maxVocabulary, s.vocabulary + 10) }, enemy: e, log: "【安固】：认知平衡。" }) },
  "斩裂": { phrase: "斩裂", description: "造成22点伤害。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 22 }, log: "【斩裂】：利刃般的逻辑。" }) },
  "坚守": { phrase: "坚守", description: "获得22点护盾。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 22 }, enemy: e, log: "【坚守】：不动的防御。" }) },
  "碎击": { phrase: "碎击", description: "造成18点伤害。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 18 }, log: "【碎击】：力量的集中。" }) },
  "绝斩": { phrase: "绝斩", description: "造成30点伤害。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 30 }, log: "【绝斩】：终局一击。" }) },
  "息守": { phrase: "息守", description: "理智+5，护盾+10。", action: (s, e) => ({ stats: { ...s, lucidity: Math.min(s.maxLucidity, s.lucidity + 5), shield: s.shield + 10 }, enemy: e, log: "【息守】：平缓的防御。" }) },
  "固御": { phrase: "固御", description: "获得28点护盾。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 28 }, enemy: e, log: "【固御】：厚重的重定义。" }) },
  "杀焚": { phrase: "杀焚", description: "造成25点伤害。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 25 }, log: "【杀焚】：毁灭的烈焰。" }) },
  "裂击": { phrase: "裂击", description: "造成18点伤害。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 18 }, log: "【裂击】：精准的撕裂。" }) },
  "安御": { phrase: "安御", description: "获得20护盾，回复5理智。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 20, lucidity: Math.min(s.maxLucidity, s.lucidity + 5) }, enemy: e, log: "【安御】：平和的加固。" }) },
  "幻击": { phrase: "幻击", description: "造成15点穿透伤害。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 15 }, log: "【幻击】：难以捉摸的攻击。" }) },
  "影封": { phrase: "影封", description: "敌方无法回复稳定性。", action: (s, e) => ({ stats: s, enemy: { ...e, tags: [...(e.tags || []), 'no_heal'] }, log: "【影封】：封印敌方的修复逻辑。" }) },
  "反移": { phrase: "反移", description: "反弹敌方攻击力的一半。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - Math.floor(e.attack / 2) }, log: "【反移】：借力打力。" }) },
  "焚坚": { phrase: "焚坚", description: "造成12伤害，获得10护盾。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 10 }, enemy: { ...e, hp: e.hp - 12 }, log: "【焚坚】：攻守转换。" }) },
  "碎守": { phrase: "碎守", description: "牺牲10护盾造成25伤害。", action: (s, e) => ({ stats: { ...s, shield: Math.max(0, s.shield - 10) }, enemy: { ...e, hp: e.hp - 25 }, log: "【碎守】：碎裂防御后的爆发。" }) },
  "斩御": { phrase: "斩御", description: "造成15伤害，获得15护盾。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 15 }, enemy: { ...e, hp: e.hp - 15 }, log: "【斩御】：平衡的博弈。" }) },
  "杀裂": { phrase: "杀裂", description: "造成28点伤害。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 28 }, log: "【杀裂】：残酷的切割。" }) },
  "绝息": { phrase: "绝息", description: "造成10伤害，减弱敌方攻击。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 10, attack: Math.max(1, e.attack - 3) }, log: "【绝息】：剥夺生机。" }) },
  "安击": { phrase: "安击", description: "造成12伤害，回复3理智。", action: (s, e) => ({ stats: { ...s, lucidity: Math.min(s.maxLucidity, s.lucidity + 3) }, enemy: { ...e, hp: e.hp - 12 }, log: "【安击】：温柔的一击。" }) },
  "无移": { phrase: "无移", description: "理智+5。", action: (s, e) => ({ stats: { ...s, lucidity: Math.min(s.maxLucidity, s.lucidity + 5) }, enemy: e, log: "【无移】：思绪放空。" }) },
  "影移": { phrase: "影移", description: "意志+8。", action: (s, e) => ({ stats: { ...s, vocabulary: Math.min(s.maxVocabulary, s.vocabulary + 8) }, enemy: e, log: "【影移】：潜行的意志。" }) },
  "反空": { phrase: "反空", description: "理智+10。", action: (s, e) => ({ stats: { ...s, lucidity: Math.min(s.maxLucidity, s.lucidity + 10) }, enemy: e, log: "【反空】：逆转虚无。" }) },
  "移反": { phrase: "移反", description: "反切敌方意图。", action: (s, e) => ({ stats: { ...s, tags: [...s.tags, 'counter_all'] }, enemy: e, log: "【移反】：因果反切。" }) },
  "无影": { phrase: "无影", description: "回复10意志。", action: (s, e) => ({ stats: { ...s, vocabulary: Math.min(s.maxVocabulary, s.vocabulary + 10) }, enemy: e, log: "【无影】：无迹可寻。" }) },
  "空影": { phrase: "空影", description: "获得10点护盾。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 10 }, enemy: e, log: "【空影】：虚无的屏障。" }) },
  "息固": { phrase: "息固", description: "回复10意志，获得10护盾。", action: (s, e) => ({ stats: { ...s, vocabulary: Math.min(s.maxVocabulary, s.vocabulary + 10), shield: s.shield + 10 }, enemy: e, log: "【息固】：安定的逻辑。" }) },
  "封杀": { phrase: "封杀", description: "造成20伤害并禁止回复。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 20, tags: [...(e.tags || []), 'no_heal'] }, log: "【封杀】：绝对的封禁。" }) },
  "御焚": { phrase: "御焚", description: "反弹5伤害并获得15护盾。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 15 }, enemy: { ...e, hp: e.hp - 5 }, log: "【御焚】：反震打击。" }) },
  "影斩": { phrase: "影斩", description: "造成18穿透伤害。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 18 }, log: "【影斩】：无形之刃。" }) },
  "反封": { phrase: "反封", description: "理智+8，获得10护盾。", action: (s, e) => ({ stats: { ...s, lucidity: Math.min(s.maxLucidity, s.lucidity + 8), shield: s.shield + 10 }, enemy: e, log: "【反封】：打破枷锁。" }) },

  // Backfires / Negative (20)
  "杀安": { phrase: "杀安", description: "逻辑悖论：损失15意志。", action: (s, e) => ({ stats: { ...s, vocabulary: s.vocabulary - 15 }, enemy: e, log: "【杀安】：你试图杀死平安，逻辑发生反噬。" }) },
  "绝守": { phrase: "绝守", description: "护盾清零，损失10意志。", action: (s, e) => ({ stats: { ...s, shield: 0, vocabulary: s.vocabulary - 10 }, enemy: e, log: "【绝守】：极端防御导致自我解体。" }) },
  "焚息": { phrase: "焚息", description: "理智下降15点。", action: (s, e) => ({ stats: { ...s, lucidity: Math.max(0, s.lucidity - 15) }, enemy: e, log: "【焚息】：灼伤灵魂的呼吸。" }) },
  "碎安": { phrase: "碎安", description: "意志-10，理智-10。", action: (s, e) => ({ stats: { ...s, vocabulary: s.vocabulary - 10, lucidity: Math.max(0, s.lucidity - 10) }, enemy: e, log: "【碎安】：平静被粉碎。" }) },
  "无击": { phrase: "无击", description: "无效行为，损失5意志。", action: (s, e) => ({ stats: { ...s, vocabulary: s.vocabulary - 5 }, enemy: e, log: "【无击】：你攻击了虚无。" }) },
  "空斩": { phrase: "空斩", description: "意志损失12。", action: (s, e) => ({ stats: { ...s, vocabulary: s.vocabulary - 12 }, enemy: e, log: "【空斩】：定义斩在了空处。" }) },
  "影安": { phrase: "影安", description: "理智下降20。", action: (s, e) => ({ stats: { ...s, lucidity: Math.max(0, s.lucidity - 20) }, enemy: e, log: "【影安】：阴影中的危险安宁。" }) },
  "反焚": { phrase: "反焚", description: "护盾-10，意志-5。", action: (s, e) => ({ stats: { ...s, shield: Math.max(0, s.shield - 10), vocabulary: s.vocabulary - 5 }, enemy: e, log: "【反焚】：失控的逻辑火焰。" }) },
  "移杀": { phrase: "移杀", description: "杀意偏转。损失15意志。", action: (s, e) => ({ stats: { ...s, vocabulary: s.vocabulary - 15 }, enemy: e, log: "【移杀】：杀意发生了位移。" }) },
  "封安": { phrase: "封安", description: "意志上限-5点。", action: (s, e) => ({ stats: { ...s, maxVocabulary: s.maxVocabulary - 5, vocabulary: Math.min(s.vocabulary, s.maxVocabulary - 5) }, enemy: e, log: "【封安】：你封死了自己的退路。" }) },
  "绝反": { phrase: "绝反", description: "防御崩坏，获得易伤Tag。", action: (s, e) => ({ stats: { ...s, tags: [...s.tags, 'vulnerable'] }, enemy: e, log: "【绝反】：由于极端的反射逻辑，你变得脆弱了。" }) },
  "杀影": { phrase: "杀影", description: "理智下降15。", action: (s, e) => ({ stats: { ...s, lucidity: Math.max(0, s.lucidity - 15) }, enemy: e, log: "【杀影】：你试图杀死幻觉，却被幻觉反扑。" }) },
  "焚御": { phrase: "焚御", description: "护盾过热崩塌。护盾清零。", action: (s, e) => ({ stats: { ...s, shield: 0 }, enemy: e, log: "【焚御】：防御过载，定义消融。" }) },
  "无无": { phrase: "无无", description: "虚无的平方。损失10理智。", action: (s, e) => ({ stats: { ...s, lucidity: Math.max(0, s.lucidity - 10) }, enemy: e, log: "【无无】：你凝视了不该看的地方。" }) },
  "裂安": { phrase: "裂安", description: "意志平衡断裂。意志-15。", action: (s, e) => ({ stats: { ...s, vocabulary: s.vocabulary - 15 }, enemy: e, log: "【裂安】：宁静的定义出现了裂痕。" }) },
  "移息": { phrase: "移息", description: "呼吸被剥夺。获得虚弱Tag。", action: (s, e) => ({ stats: { ...s, tags: [...s.tags, 'reduced_healing'] }, enemy: e, log: "【移息】：由于逻辑位移，你变得难以维持现状。" }) },
  "封击": { phrase: "封击", description: "攻击力永久-2（本场）。", action: (s, e) => ({ stats: { ...s, tags: [...s.tags, 'weakened_logic'] }, enemy: e, log: "【封击】：你封印了自己的破坏性。" }) },
  "幻斩": { phrase: "幻斩", description: "认知自伤。理智-12。", action: (s, e) => ({ stats: { ...s, lucidity: Math.max(0, s.lucidity - 12) }, enemy: e, log: "【幻斩】：幻想的利刃划伤了自我。" }) },
  "反安": { phrase: "反安", description: "意志/理智各损10点。", action: (s, e) => ({ stats: { ...s, vocabulary: s.vocabulary - 10, lucidity: Math.max(0, s.lucidity - 10) }, enemy: e, log: "【反安】：拒绝平静导致了更深的崩塌。" }) },
  "焚杀": { phrase: "焚杀", description: "狂热自残。理智-10，造成30伤害。", action: (s, e) => ({ stats: { ...s, lucidity: Math.max(0, s.lucidity - 10) }, enemy: { ...e, hp: e.hp - 30 }, log: "【焚杀】：狂乱的定义抹除。" }) },

  // ==========================================
  // --- 3-Word Combos (Exactly 30) ---
  // ==========================================
  
  // Resonant (20)
  "坚固守": { phrase: "坚固守", description: "获得45点超强护盾。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 45 }, enemy: e, log: "【坚固守】：三重防御定义。" }) },
  "击斩绝": { phrase: "击斩绝", description: "造成65点巨量物理伤害。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 65 }, log: "【击斩绝】：完美的逻辑抹杀。" }) },
  "安息守": { phrase: "安息守", description: "回复30意志，理智回满。", action: (s, e) => ({ stats: { ...s, vocabulary: Math.min(s.maxVocabulary, s.vocabulary + 30), lucidity: s.maxLucidity }, enemy: e, log: "【安息守】：认知层面的完全重构。" }) },
  "幻影移": { phrase: "幻影移", description: "获得2回合高度闪避，造成15穿透。", action: (s, e) => ({ stats: { ...s, tags: [...s.tags, 'evasive', 'evasive'] }, enemy: { ...e, hp: e.hp - 15 }, log: "【幻影移】：在高维定义的边缘行走。" }) },
  "封御坚": { phrase: "封御坚", description: "获得50护盾，敌方攻击永久-2。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 50 }, enemy: { ...e, attack: Math.max(1, e.attack - 2) }, log: "【封御坚】：不可逾越的防御边界。" }) },
  "焚裂杀": { phrase: "焚裂杀", description: "造成50伤害，斩杀血量低于150的敌人。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp < 150 ? 0 : e.hp - 50 }, log: "【焚裂杀】：由于过度的现实磨损，定义发生了坍塌。" }) },
  "移反击": { phrase: "移反击", description: "反向定义打击。造成敌方15%最大生命值的伤害。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - Math.floor(e.maxHp * 0.15) }, log: "【移反击】：反转定义的反向冲击。" }) },
  "绝斩坚": { phrase: "绝斩坚", description: "造成35伤害，获得25护盾。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 25 }, enemy: { ...e, hp: e.hp - 35 }, log: "【绝斩坚】：攻守一体的极致。" }) },
  "固御安": { phrase: "固御安", description: "回复20意志，15理智，30护盾。", action: (s, e) => ({ stats: { ...s, vocabulary: Math.min(s.maxVocabulary, s.vocabulary + 20), lucidity: Math.min(s.maxLucidity, s.lucidity + 15), shield: s.shield + 30 }, enemy: e, log: "【固御安】：完美的稳态定义。" }) },
  "裂碎击": { phrase: "裂碎击", description: "造成45伤害，大幅削弱敌方下回合意图。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 45, attack: Math.max(1, e.attack - 8) }, log: "【裂碎击】：沉重的逻辑敲击。" }) },
  "安息移": { phrase: "安息移", description: "回复25意志，回避下次所有伤害。", action: (s, e) => ({ stats: { ...s, vocabulary: Math.min(s.maxVocabulary, s.vocabulary + 25), tags: [...s.tags, 'invincible'] }, enemy: e, log: "【安息移】：静默的相位偏移。" }) },
  "封御固": { phrase: "封御固", description: "获得55护盾，回复15理智。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 55, lucidity: Math.min(s.maxLucidity, s.lucidity + 15) }, enemy: e, log: "【封御固】：绝对不动的防御链。" }) },
  "斩裂碎": { phrase: "斩裂碎", description: "造成40伤害，敌方稳定性上限降低20。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 40, maxHp: e.maxHp - 20 }, log: "【斩裂碎】：根基层面的逻辑剥落。" }) },
  "击焚绝": { phrase: "击焚绝", description: "造成55点穿透伤害。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 55 }, log: "【击焚绝】：毁灭性的博弈逻辑。" }) },
  "反移幻": { phrase: "反移幻", description: "本回合受击100%反弹，并回复20理智。", action: (s, e) => ({ stats: { ...s, tags: [...s.tags, 'reflect'], lucidity: Math.min(s.maxLucidity, s.lucidity + 20) }, enemy: e, log: "【反移幻】：完全反转真实。" }) },
  "坚守御": { phrase: "坚守御", description: "获得50点护盾。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 50 }, enemy: e, log: "【坚守御】：不可动摇的自我。" }) },
  "裂裂裂": { phrase: "裂裂裂", description: "现实剥落。造成50点伤害。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 50 }, log: "【裂裂裂】：空间出现了大量死字。" }) },
  "碎碎碎": { phrase: "碎碎碎", description: "造成40伤害，敌方意图永久削弱。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 40, logicDistortion: e.logicDistortion + 5 }, log: "【碎碎碎】：将其意志粉碎成渣。" }) },
  "安安安": { phrase: "安安安", description: "补满意志，回复30理智。", action: (s, e) => ({ stats: { ...s, vocabulary: s.maxVocabulary, lucidity: Math.min(s.maxLucidity, s.lucidity + 30) }, enemy: e, log: "【安安安】：深层禅定状态。" }) },
  "息守固": { phrase: "息守固", description: "理智+20，护盾+40。", action: (s, e) => ({ stats: { ...s, lucidity: Math.min(s.maxLucidity, s.lucidity + 20), shield: s.shield + 40 }, enemy: e, log: "【息守固】：安定的防线。" }) },

  // Backfires (10)
  "无空幻": { phrase: "无空幻", description: "理智与护盾强制归零。", action: (s, e) => ({ stats: { ...s, lucidity: 0, shield: 0 }, enemy: e, log: "【无空幻】：坠入无底深渊。" }) },
  "杀无息": { phrase: "杀无息", description: "意志降至1点。", action: (s, e) => ({ stats: { ...s, vocabulary: 1 }, enemy: e, log: "【杀无息】：你剥夺了自己存在的定义。" }) },
  "无空移": { phrase: "无空移", description: "意志大幅流失40点。", action: (s, e) => ({ stats: { ...s, vocabulary: s.vocabulary - 40 }, enemy: e, log: "【无空移】：在虚无中迷失了方向。" }) },
  "封安息": { phrase: "封安息", description: "本场博弈永久失去回复能力。", action: (s, e) => ({ stats: { ...s, tags: [...s.tags, 'sealed_healing'] }, enemy: e, log: "【封安息】：由于逻辑错位，你封印了自己的生机。" }) },
  "焚焚焚": { phrase: "焚焚焚", description: "理智暴跌30，全场燃烧。", action: (s, e) => ({ stats: { ...s, lucidity: Math.max(0, s.lucidity - 30) }, enemy: { ...e, hp: e.hp - 60 }, log: "【焚焚焚】：失控的认知烈焰。" }) },
  "杀杀杀": { phrase: "杀杀杀", description: "造成60伤害，意志损耗30。", action: (s, e) => ({ stats: { ...s, vocabulary: s.vocabulary - 30 }, enemy: { ...e, hp: e.hp - 60 }, log: "【杀杀杀】：血腥而疯狂的定义抹除。" }) },
  "空幻影": { phrase: "空幻影", description: "理智下降25，护盾+40。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 40, lucidity: Math.max(0, s.lucidity - 25) }, enemy: e, log: "【空幻影】：建立在幻觉之上的虚弱防御。" }) },
  "杀绝反": { phrase: "杀绝反", description: "意志/理智平衡完全崩溃，各损30点。", action: (s, e) => ({ stats: { ...s, vocabulary: s.vocabulary - 30, lucidity: Math.max(0, s.lucidity - 30) }, enemy: e, log: "【杀绝反】：无序定义的极端反噬。" }) },
  "封封封": { phrase: "封封封", description: "意志上限永久降低40点。", action: (s, e) => ({ stats: { ...s, maxVocabulary: s.maxVocabulary - 40, vocabulary: Math.min(s.vocabulary, s.maxVocabulary - 40) }, enemy: e, log: "【封封封】：你将现实彻底锁死了。" }) },
  "御裂焚": { phrase: "御裂焚", description: "意志崩解。损失50点意志。", action: (s, e) => ({ stats: { ...s, vocabulary: s.vocabulary - 50 }, enemy: e, log: "【御裂焚】：崩解的盾牌碎片刺穿了自我。" }) },

  // ==========================================
  // --- 4-Word Combos (Exactly 20) ---
  // ==========================================
  
  "坚固守御": { phrase: "坚固守御", description: "获得120点超量护盾，意志补满。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 120, vocabulary: s.maxVocabulary }, enemy: e, log: "【坚固守御】：真理级别的防御定义。" }) },
  "击斩裂碎": { phrase: "击斩裂碎", description: "造成200点终极物理伤害。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 200 }, log: "【击斩裂碎】：物理现实的彻底终结。" }) },
  "幻影移反": { phrase: "幻影移反", description: "认知锁定并极大增加回避。回避3回合。", action: (s, e) => ({ stats: { ...s, lucidity: 100, tags: [...s.tags, 'god_eye', 'evasive', 'evasive', 'evasive'] }, enemy: e, log: "【幻影移反】：你已脱离逻辑的引力。" }) },
  "封安息固": { phrase: "封安息固", description: "意志/理智补满，并在五回合内无敌。", action: (s, e) => ({ stats: { ...s, vocabulary: s.maxVocabulary, lucidity: s.maxLucidity, tags: [...s.tags, 'invincible', 'invincible', 'invincible', 'invincible', 'invincible'] }, enemy: e, log: "【封安息固】：逻辑的永恒宁静。" }) },
  "焚绝杀裂": { phrase: "焚绝杀裂", description: "牺牲50%理智，敌方稳定性强制归1。", action: (s, e) => ({ stats: { ...s, lucidity: Math.floor(s.lucidity / 2) }, enemy: { ...e, hp: 1 }, log: "【焚绝杀裂】：以疯狂为代价，你拆解了敌方的根基。" }) },
  "无空幻影": { phrase: "无空幻影", description: "【天灾】意志/理智/护盾强制归1。", action: (s, e) => ({ stats: { ...s, vocabulary: 1, lucidity: 1, shield: 0 }, enemy: e, log: "【无空幻影】：你试图定义虚无，最终被虚无完全同化。" }) },
  "斩击焚碎": { phrase: "斩击焚碎", description: "造成150点混合定义伤害。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 150 }, log: "【斩击焚碎】：全方位的定性打击。" }) },
  "守固御坚": { phrase: "守固御坚", description: "获得100护盾，50意志。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 100, vocabulary: Math.min(s.maxVocabulary, s.vocabulary + 50) }, enemy: e, log: "【守固御坚】：终极真理之墙。" }) },
  "反移幻影": { phrase: "反移幻影", description: "意志/理智+40，获得3次反弹。", action: (s, e) => ({ stats: { ...s, vocabulary: Math.min(s.maxVocabulary, s.vocabulary + 40), lucidity: Math.min(s.maxLucidity, s.lucidity + 40), tags: [...s.tags, 'reflect', 'reflect', 'reflect'] }, enemy: e, log: "【反移幻影】：游走在因果律的边缘。" }) },
  "焚杀绝斩": { phrase: "焚杀绝斩", description: "理智上限减半，造成300点伤害。", action: (s, e) => ({ stats: { ...s, maxLucidity: Math.floor(s.maxLucidity / 2), lucidity: Math.min(s.lucidity, Math.floor(s.maxLucidity / 2)) }, enemy: { ...e, hp: e.hp - 300 }, log: "【焚杀绝斩】：狂乱的终局祭礼。" }) },
  "安息守固": { phrase: "安息守固", description: "意志回满，获得80护盾。", action: (s, e) => ({ stats: { ...s, vocabulary: s.maxVocabulary, shield: s.shield + 80 }, enemy: e, log: "【安息守固】：安定的逻辑基座。" }) },
  "击裂碎斩": { phrase: "击裂碎斩", description: "造成150伤害，削弱敌方三回合攻击。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 150, attack: Math.max(1, e.attack - 15) }, log: "【击裂碎斩】：物质定义的彻底崩溃。" }) },
  "封御坚守": { phrase: "封御坚守", description: "获得150点绝不动摇的护盾。", action: (s, e) => ({ stats: { ...s, shield: s.shield + 150 }, enemy: e, log: "【封御坚守】：叹息之墙的复刻。" }) },
  "无空移影": { phrase: "无空移影", description: "理智永久-20%，意志回满。", action: (s, e) => ({ stats: { ...s, maxLucidity: s.maxLucidity - 20, lucidity: Math.min(s.lucidity, s.maxLucidity - 20), vocabulary: s.maxVocabulary }, enemy: e, log: "【无空移影】：用灵魂碎片交换意志。" }) },
  "移反空幻": { phrase: "移反空幻", description: "【反转】交换敌我当前血量比例。", action: (s, e) => {
    const sP = s.vocabulary / s.maxVocabulary;
    const eP = e.hp / e.maxHp;
    return { stats: { ...s, vocabulary: Math.floor(eP * s.maxVocabulary) }, enemy: { ...e, hp: Math.floor(sP * e.maxHp) }, log: "【移反空幻】：因果逻辑的彻底颠倒。" };
  } },
  "杀绝焚碎": { phrase: "杀绝焚碎", description: "意志消耗40%，造成200点伤害。", action: (s, e) => ({ stats: { ...s, vocabulary: Math.max(1, Math.floor(s.vocabulary * 0.6)) }, enemy: { ...e, hp: e.hp - 200 }, log: "【杀绝焚碎】：绝望的最后爆发。" }) },
  "息守固安": { phrase: "息守固安", description: "理智补满，获得60护盾。", action: (s, e) => ({ stats: { ...s, lucidity: s.maxLucidity, shield: s.shield + 60 }, enemy: e, log: "【息守固安】：重筑认知防线。" }) },
  "击斩焚绝": { phrase: "击斩焚绝", description: "造成120点真实伤害。", action: (s, e) => ({ stats: s, enemy: { ...e, hp: e.hp - 120 }, log: "【击斩焚绝】：纯粹的毁灭性逻辑。" }) },
  "安固御封": { phrase: "安固御封", description: "意志/理智各回复50点，护盾+50。", action: (s, e) => ({ stats: { ...s, vocabulary: Math.min(s.maxVocabulary, s.vocabulary + 50), lucidity: Math.min(s.maxLucidity, s.lucidity + 50), shield: s.shield + 50 }, enemy: e, log: "【安固御封】：完美的自我重塑。" }) },
  "反幻影移": { phrase: "反幻影移", description: "获得5回合回避，回复20理智。", action: (s, e) => ({ stats: { ...s, lucidity: Math.min(s.maxLucidity, s.lucidity + 20), tags: [...s.tags, 'evasive', 'evasive', 'evasive', 'evasive', 'evasive'] }, enemy: e, log: "【反幻影移】：幽灵般的逻辑路径。" }) }
};

/**
 * Execute the logical chain. This is the only entry point for combat processing.
 * It handles the combo matching AND the individual word fallback logic.
 */
export function executeLogicChain(logicSlot: WordCard[], stats: GameStats, enemy: Enemy): { stats: GameStats; enemy: Enemy; log: string[]; comboResult?: { phrase: string, description: string, isNegative?: boolean, isCursed?: boolean } } {
  const chainStr = logicSlot.map(c => c.text).join('');
  let s = { ...stats };
  let e = { ...enemy };
  let logs: string[] = [];
  let comboResult = undefined;

  // 1. Check for defined Combo
  if (COMBOS[chainStr]) {
    const combo = COMBOS[chainStr];
    const res = combo.action(s, e);
    s = res.stats;
    e = res.enemy;
    logs.push(res.log);
    
    // Determine combo visual category
    const isNeg = combo.description.includes('损失') || combo.description.includes('下降') || combo.description.includes('清零') || combo.description.includes('归1') || combo.description.includes('暴跌');
    const isCursed = logicSlot.length === 4 && isNeg || chainStr.includes('无无');
    
    comboResult = { phrase: combo.phrase, description: combo.description, isNegative: isNeg, isCursed: isCursed };
    
    if (!s.discoveredCombos.includes(chainStr)) {
      s.discoveredCombos = [...s.discoveredCombos, chainStr];
    }
  } 
  // 2. Logic Collapse for undefined long chains (2-4 words)
  else if (logicSlot.length >= 2) {
    s.vocabulary -= 25;
    s.lucidity = Math.max(0, s.lucidity - 15);
    logs.push("【逻辑坍缩】：该序列无法在当前的现实模型中被定义。");
    logs.push("认知反噬：损耗 25 意志与 15 理智。");
    comboResult = { phrase: "逻辑坍缩", description: "由于逻辑不匹配，现实拒绝了你的定义", isNegative: true, isCursed: true };
  }
  // 3. Fallback: Individual word power (1 word only or very weak logic)
  else {
    logicSlot.forEach(word => {
      if (word.category === 'attack') {
        e.hp -= word.power;
        logs.push(`执行 [${word.text}]：物理干涉，造成 ${word.power} 点修正。`);
      } else if (word.category === 'defense') {
        if (s.tags.includes('sealed_healing') && (word.text === '安' || word.text === '息')) {
          logs.push(`执行 [${word.text}]：生机封印中，定义失效。`);
        } else if (word.text === '安' || word.text === '息') {
          s.vocabulary = Math.min(s.maxVocabulary, s.vocabulary + word.power);
          logs.push(`执行 [${word.text}]：定义存续，回复 ${word.power} 点意志。`);
        } else {
          s.shield += word.power;
          logs.push(`执行 [${word.text}]：定义加固，产生 ${word.power} 点护盾。`);
        }
      } else {
        logs.push(`执行 [${word.text}]：策略单字无法单独影响宏观现实。`);
      }
    });
  }

  return { stats: s, enemy: e, log: logs, comboResult };
}
