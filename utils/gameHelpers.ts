
import { MapNode, NodeType, Enemy, EnemyIntent, Region } from '../types';

/**
 * 地图配置常量
 * 方便后期通过调整数值快速改变游戏平衡性
 */
const MAP_CONFIG = {
  GRID_SIZE: 7,
  MINE_COUNT: 10,
  PROBABILITIES: {
    SHOP: 0.05,     // 真理黑市
    REST: 0.07,     // 逻辑篝火
    ROLLER: 0.06,   // 逻辑重塑 (压路机)
    TREASURE: 0.06, // 认知秘宝 (宝箱)
    EVENT: 0.11,    // 叙事事件
  }
};

/**
 * 判断坐标是否在地图范围内
 */
const isValidCoord = (x: number, y: number): boolean => {
  return x >= 0 && x < MAP_CONFIG.GRID_SIZE && y >= 0 && y < MAP_CONFIG.GRID_SIZE;
};

/**
 * 获取指定坐标的邻居节点坐标
 */
const getNeighborCoords = (x: number, y: number) => {
  const neighbors = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (isValidCoord(nx, ny)) {
        neighbors.push({ x: nx, y: ny });
      }
    }
  }
  return neighbors;
};

/**
 * 根据权重随机选择节点内容
 */
const selectRandomContent = (): MapNode['content'] => {
  const roll = Math.random();
  const p = MAP_CONFIG.PROBABILITIES;

  if (roll < p.SHOP) return 'SHOP';
  if (roll < p.SHOP + p.REST) return 'REST';
  if (roll < p.SHOP + p.REST + p.ROLLER) return 'ROLLER';
  if (roll < p.SHOP + p.REST + p.ROLLER + p.TREASURE) return 'TREASURE';
  if (roll < p.SHOP + p.REST + p.ROLLER + p.TREASURE + p.EVENT) return 'EVENT';
  
  return 'NONE';
};

/**
 * 创建认知图谱 (地图生成核心逻辑)
 */
export const createMap = (currentPos: { x: number, y: number }): MapNode[] => {
  let nodes: MapNode[] = [];

  // 1. 初始化基础网格
  for (let y = 0; y < MAP_CONFIG.GRID_SIZE; y++) {
    for (let x = 0; x < MAP_CONFIG.GRID_SIZE; x++) {
      nodes.push({
        id: `${x}-${y}`,
        type: 'SAFE',
        x,
        y,
        isRevealed: false,
        neighborMines: 0,
        content: 'NONE'
      });
    }
  }
  
  // 2. 标记起点
  const startNode = nodes.find(n => n.x === currentPos.x && n.y === currentPos.y);
  if (startNode) {
    startNode.isRevealed = true;
    startNode.type = 'START';
  }

  // 3. 随机布雷 (逻辑陷阱/战斗节点)
  let minesPlaced = 0;
  while (minesPlaced < MAP_CONFIG.MINE_COUNT) {
    const randomIdx = Math.floor(Math.random() * nodes.length);
    const targetNode = nodes[randomIdx];
    
    // 不在起点且当前不是地雷时布雷
    if (targetNode.type !== 'MINE' && targetNode.type !== 'START') {
      targetNode.type = 'MINE';
      minesPlaced++;
    }
  }

  // 4. 为非雷节点填充内容和计算邻居雷数
  nodes.forEach(node => {
    // 填充特殊内容
    if (node.type === 'SAFE') {
      node.content = selectRandomContent();
    }

    // 计算周围雷数
    if (node.type !== 'MINE') {
      const neighbors = getNeighborCoords(node.x, node.y);
      let mineCount = 0;
      neighbors.forEach(coord => {
        const neighborNode = nodes.find(n => n.x === coord.x && n.y === coord.y);
        if (neighborNode && neighborNode.type === 'MINE') {
          mineCount++;
        }
      });
      node.neighborMines = mineCount;
    }
  });

  return nodes;
};

/**
 * 生成观测对象的意图 (战斗逻辑意图生成)
 */
export const generateEnemyIntent = (enemy: Enemy): EnemyIntent => {
  const roll = Math.random();

  // 基础意图权重
  const weights = {
    ATTACK: 0.5,   // 攻击
    DEFEND: 0.2,   // 防御
    DISTORT: 0.15, // 扭曲 (Boss专属/精英化逻辑)
    HEAL: 0.15     // 修复
  };

  if (roll < weights.ATTACK) {
    return { 
      type: 'ATTACK', 
      value: enemy.attack, 
      description: `欲释放 ${enemy.attack} 击` 
    };
  }
  
  if (roll < weights.ATTACK + weights.DEFEND) {
    const shieldValue = Math.floor(enemy.hp * 0.1) + 8;
    return { 
      type: 'DEFEND', 
      value: shieldValue, 
      description: `在加固定义 (盾 +${shieldValue})` 
    };
  }
  
  if (roll < weights.ATTACK + weights.DEFEND + weights.DISTORT) {
    if (enemy.isBoss) {
      return { 
        type: 'DISTORT', 
        value: enemy.logicDistortion, 
        description: `在扭曲认知 (清晰度 -${enemy.logicDistortion}%)` 
      };
    } else {
      // 普通敌人使用逻辑干扰代替扭曲，主要攻击意志
      const damage = Math.max(5, Math.floor(enemy.attack * 0.75));
      return { 
        type: 'ATTACK', 
        value: damage, 
        description: `认知崩落：冲击意志 (${damage})` 
      };
    }
  }
  
  // 修复/回复意图
  const healValue = 20 + Math.floor(enemy.maxHp * 0.05);
  return { 
    type: 'HEAL', 
    value: healValue, 
    description: `在寻找修复 (HP +${healValue})` 
  };
};
