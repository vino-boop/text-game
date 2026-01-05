
import { Enemy, Region } from '../types';

export const FIXED_ENEMIES: Record<Region, Enemy[]> = {
  [Region.SENSES]: [
    {
      name: "无名之舌",
      description: "在感官废墟中游荡的软体定义，不断舔舐着幸存者的记忆。",
      hp: 60, maxHp: 60, correction: 0, maxCorrection: 100, attack: 12, logicDistortion: 5, burn: 0, tags: []
    },
    {
      name: "回声之影",
      description: "曾经的对话残留在空气中形成的聚合体，逻辑极为松散。",
      hp: 50, maxHp: 50, correction: 0, maxCorrection: 100, attack: 10, logicDistortion: 8, burn: 0, tags: []
    },
    {
      name: "色彩剥落者",
      description: "它夺走一切事物的颜色，将其定义为“虚无”。",
      hp: 75, maxHp: 75, correction: 0, maxCorrection: 100, attack: 15, logicDistortion: 3, burn: 0, tags: []
    }
  ],
  [Region.LOGIC]: [
    {
      name: "矛盾螺旋",
      description: "由无数悖论交织而成的几何体，近距离接触会导致逻辑过载。",
      hp: 150, maxHp: 150, correction: 0, maxCorrection: 100, attack: 22, logicDistortion: 15, burn: 0, tags: []
    },
    {
      name: "二律背反",
      description: "同时拥有两种互斥的定义，攻击它就像在否定现实。",
      hp: 180, maxHp: 180, correction: 0, maxCorrection: 100, attack: 25, logicDistortion: 10, burn: 0, tags: []
    },
    {
      name: "真值表收割机",
      description: "冰冷的执行者，它只承认“对”与“错”。",
      hp: 200, maxHp: 200, correction: 0, maxCorrection: 100, attack: 30, logicDistortion: 5, burn: 0, tags: []
    }
  ],
  [Region.TRUTH]: [
    {
      name: "盲目痴愚之音",
      description: "位于真理核心的杂音，任何文字在它面前都显得苍白。",
      hp: 400, maxHp: 400, correction: 0, maxCorrection: 100, attack: 45, logicDistortion: 30, burn: 0, tags: []
    },
    {
      name: "绝对定义者",
      description: "它是一切规则的源头，也是一切规则的终结。",
      hp: 500, maxHp: 500, correction: 0, maxCorrection: 100, attack: 55, logicDistortion: 20, burn: 0, tags: []
    }
  ]
};

export const BOSSES: Record<Region, Enemy> = {
  [Region.SENSES]: {
    name: "【感知领主】视界崩毁者",
    description: "剥夺了所有生灵观测能力的至高存在。",
    hp: 300, maxHp: 300, correction: 0, maxCorrection: 120, attack: 25, logicDistortion: 10, burn: 0, tags: [], isBoss: true
  },
  [Region.LOGIC]: {
    name: "【逻辑判官】因果律剪裁者",
    description: "它在修剪不符合真理的因果枝条。",
    hp: 600, maxHp: 600, correction: 0, maxCorrection: 150, attack: 40, logicDistortion: 20, burn: 0, tags: [], isBoss: true
  },
  [Region.TRUTH]: {
    name: "【余晖核心】最初的定义",
    description: "梦境的终点，一切的起始与结束。",
    hp: 1200, maxHp: 1200, correction: 0, maxCorrection: 200, attack: 60, logicDistortion: 50, burn: 0, tags: [], isBoss: true
  }
};
