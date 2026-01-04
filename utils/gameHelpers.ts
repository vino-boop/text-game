
import { MapNode, NodeType, Enemy, EnemyIntent, Region } from '../types';

const GRID_SIZE = 7;
const MINE_COUNT = 10;

export const createMap = (currentPos: { x: number, y: number }): MapNode[] => {
  let nodes: MapNode[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      nodes.push({ id: `${x}-${y}`, type: 'SAFE', x, y, isRevealed: false, neighborMines: 0, content: 'NONE' });
    }
  }
  
  const startNode = nodes.find(n => n.x === currentPos.x && n.y === currentPos.y);
  if (startNode) {
    startNode.isRevealed = true;
    startNode.type = 'START';
  }

  let mines = 0;
  while (mines < MINE_COUNT) {
    const idx = Math.floor(Math.random() * nodes.length);
    const n = nodes[idx];
    if (n.type === 'SAFE' && !(n.x === currentPos.x && n.y === currentPos.y)) {
      n.type = 'MINE';
      mines++;
    }
  }

  nodes.forEach(node => {
    if (node.type === 'SAFE' && !(node.x === currentPos.x && node.y === currentPos.y)) {
      const roll = Math.random();
      if (roll > 0.94) node.content = 'SHOP';
      else if (roll > 0.85) node.content = 'REST';
      else if (roll > 0.70) node.content = 'EVENT';
    }
  });

  return nodes.map(node => {
    if (node.type === 'MINE') return node;
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const neighbor = nodes.find(n => n.x === node.x + dx && n.y === node.y + dy);
        if (neighbor && neighbor.type === 'MINE') count++;
      }
    }
    return { ...node, neighborMines: count };
  });
};

export const generateEnemyIntent = (enemy: Enemy): EnemyIntent => {
  const roll = Math.random();
  if (roll < 0.5) return { type: 'ATTACK', value: enemy.attack, description: `欲释放 ${enemy.attack} 击` };
  if (roll < 0.7) return { type: 'DEFEND', value: Math.floor(enemy.hp * 0.1) + 8, description: `在加固定义` };
  if (roll < 0.85) return { type: 'DISTORT', value: enemy.logicDistortion, description: `在扭曲认知` };
  return { type: 'HEAL', value: 20, description: `在寻找修复` };
};
