export interface WeaponInventoryItem {
  weaponId: number;
  durability: number;
  upgradeLevel: number; // 0~5
  acquiredAt: string;   // ISO date
}
