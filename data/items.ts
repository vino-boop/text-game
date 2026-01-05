
import { TagItem } from '../types';

export const DIVINE_ARTIFACTS: TagItem[] = [
  {
    id: "art_palanquin",
    name: "红缎",
    description: "被动：因果缝补。当你的意志彻底耗尽时，强制保留1点意志并回复50%意志。每场博弈仅生效一次。",
    rarity: 'DIVINE'
  },
  {
    id: "art_mirror",
    name: "菱镜",
    description: "被动：观测偏移。每回合开始时，有几率将本回合受到的首波冲击反弹给观测者。",
    rarity: 'DIVINE'
  },
  {
    id: "art_candle",
    name: "脂烛",
    description: "被动：真理之光。只要你的清明度高于50，所有防御定义产生的护盾效果提升。",
    rarity: 'DIVINE'
  },
  {
    id: "art_rationality",
    name: "理性",
    description: "被动：逻辑守恒。你的护盾现在不会随回合结束而自动消失。",
    rarity: 'DIVINE'
  }
];

export const COMMON_ITEMS: TagItem[] = [
  {
    id: "itm_chisel",
    name: "刻刀",
    description: "被动：刻扣现实。下三次博弈的首个回合，观测者将被剥夺行动能力。",
    rarity: 'COMMON'
  },
  {
    id: "itm_rational_ember",
    name: "理性余烬",
    description: "被动：强制续行。在意志力归零时，强行以1点意志力继续战斗2回合。",
    rarity: 'COMMON'
  },
  {
    id: "itm_void_heart",
    name: "虚无之心",
    description: "被动：无中生有。每回合开始时若无护盾，自动获得少量护盾。",
    rarity: 'COMMON'
  },
  {
    id: "itm_shadow",
    name: "影子",
    description: "被动：认知代行。大幅提高清晰度上限，但意志上限永久降低。",
    rarity: 'COMMON'
  },
  {
    id: "itm_altar_shard",
    name: "祭坛碎片",
    description: "被动：加固反馈。每次获得护盾时，都会额外获得3点护盾。",
    rarity: 'COMMON'
  },
  {
    id: "itm_echo",
    name: "回响",
    description: "被动：绝境共鸣。当你的生命值低于5%时，所有逻辑损耗效果翻倍。",
    rarity: 'COMMON'
  },
  {
    id: "itm_nostalgia",
    name: "乡愁",
    description: "被动：旧日重影。当你的意志低于30%时，所有“防御”类单字的效果额外提升。",
    rarity: 'COMMON'
  },
  {
    id: "itm_inked",
    name: "墨染",
    description: "被动：墨色蔓延。所有“攻击”类单字现在会额外附带微量的灼烧感。",
    rarity: 'COMMON'
  },
  {
    id: "itm_fluid",
    name: "修正流体",
    description: "被动：逻辑渗透。每回合结束时，观测者的修正进度自动提升。",
    rarity: 'COMMON'
  },
  {
    id: "itm_embers",
    name: "逻辑余烬",
    description: "被动：余温引燃。每回合开始时，令观测者获得少许持续燃烧状态。",
    rarity: 'COMMON'
  },
  {
    id: "itm_anchor",
    name: "生锈锚",
    description: "被动：第一防线。每场博弈的第一回合，自动获得额外的现实护盾。",
    rarity: 'COMMON'
  },
  {
    id: "itm_spine",
    name: "一段脊椎",
    description: "被动：生命脉动。每回合结束时，若你的意志较低，回复少量意志。",
    rarity: 'COMMON'
  },
  {
    id: "itm_thorn",
    name: "铁荆棘",
    description: "被动：逻辑倒钩。受到冲击时，对观测者反弹伤害。",
    rarity: 'COMMON'
  },
  {
    id: "itm_teeth",
    name: "死者牙齿",
    description: "被动：嗜血定义。所有攻击定义的损耗效果提升。",
    rarity: 'COMMON'
  },
  {
    id: "itm_key",
    name: "生锈钥匙",
    description: "被动：路径锚定。在地图上移动时，理智的损耗减半。",
    rarity: 'COMMON'
  }
];

export const ALL_ITEMS = [...DIVINE_ARTIFACTS, ...COMMON_ITEMS];
