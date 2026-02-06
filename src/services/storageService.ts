import { UserState, WeaponState, StageProgress } from '../types/player';
import { QuizLog } from '../types/quiz';

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
}

const STORAGE_KEY = 'phonics-adventure-save';
const CURRENT_VERSION = 1;

export const storageService = {
  load(): SaveData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw) as SaveData;
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
      weapon: { id: 1, name: 'Starter Sword', durability: 100, attackPower: 10 },
      progress: {},
      inventory: { gems: {}, jams: 10 },
      quizLogs: [],
    };
  },

  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
