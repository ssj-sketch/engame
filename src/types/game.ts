export interface Unit {
  id: number;
  name: string;
  description: string;
  orderNum: number;
  phonicsFocus: string;
  emoji: string;
}

export interface Stage {
  id: number;
  unitId: number;
  name: string;
  orderNum: number;
  monsterCount: number;
  requiredStars: number;
}

export interface Word {
  id: number;
  unitId: number;
  word: string;
  difficulty: number;
}

export interface MonsterData {
  id: number;
  stageId: number;
  wordId: number;
  type: string;
  hp: number;
  hintDropRate: number;
  positionX: number;
}
