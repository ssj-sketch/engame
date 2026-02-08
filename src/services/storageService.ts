import { UserState, WeaponState, StageProgress } from '../types/player';
import { QuizLog } from '../types/quiz';
import { WeaponInventoryItem } from '../types/weapon';

export type CharacterType = 'knight' | 'archer' | 'viking';

export interface SaveData {
  version: number;
  user: UserState;
  weapon: WeaponState;
  progress: Record<number, StageProgress>;
  inventory: {
    gems: Record<string, number>;
    jams: number;
  };
  quizLogs: QuizLog[];
  selectedCharacter?: CharacterType;
  // v2 fields
  weaponInventory?: WeaponInventoryItem[];
  equippedWeaponId?: number;
}

const STORAGE_KEY = 'phonics-adventure-save';
const CURRENT_VERSION = 2;

function migrateV1ToV2(data: SaveData): SaveData {
  const existingWeapon = data.weapon || { id: 1, name: 'Starter Sword', durability: 100, attackPower: 10 };
  return {
    ...data,
    version: 2,
    weaponInventory: [{
      weaponId: existingWeapon.id,
      durability: existingWeapon.durability,
      upgradeLevel: 0,
      acquiredAt: new Date().toISOString(),
    }],
    equippedWeaponId: existingWeapon.id,
  };
}

export const storageService = {
  load(): SaveData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      let data = JSON.parse(raw) as SaveData;

      // Migrate from v1 to v2
      if (!data.version || data.version < 2) {
        data = migrateV1ToV2(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }

      return data;
    } catch {
      return null;
    }
  },

  save(data: SaveData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  getDefaultSave(): SaveData {
    return {
      version: CURRENT_VERSION,
      user: { name: 'Player', level: 1, totalGems: 0, totalJams: 10 },
      weapon: { id: 1, name: '초보자의 검', durability: 100, attackPower: 10 },
      progress: {},
      inventory: { gems: {}, jams: 10 },
      quizLogs: [],
      weaponInventory: [{
        weaponId: 1,
        durability: 100,
        upgradeLevel: 0,
        acquiredAt: new Date().toISOString(),
      }],
      equippedWeaponId: 1,
    };
  },

  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
