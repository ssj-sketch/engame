export interface UserState {
  name: string;
  level: number;
  totalGems: number;
  totalJams: number;
}

export interface WeaponState {
  id: number;
  name: string;
  durability: number;
  attackPower: number;
}

export interface StageProgress {
  stageId: number;
  stars: number;
  isCompleted: boolean;
  bestScore: number;
  attempts: number;
}
