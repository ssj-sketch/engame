import { create } from 'zustand';
import { UserState, WeaponState, StageProgress } from '../types/player';
import { WeaponInventoryItem } from '../types/weapon';
import { QuizLog } from '../types/quiz';
import { storageService, SaveData, CharacterType } from '../services/storageService';
import { BALANCE } from '../data/gameBalance';
import { getWeaponDef, getMaxDurability } from '../data/weapons';

interface GameSession {
  currentStageId: number | null;
  collectedHints: string[];
  monstersDefeated: number[];
  sessionQuizLogs: QuizLog[];
}

interface GameStore {
  user: UserState;
  weapon: WeaponState;
  weaponInventory: WeaponInventoryItem[];
  equippedWeaponId: number;
  progress: Record<number, StageProgress>;
  inventory: { gems: Record<string, number>; jams: number };
  quizLogs: QuizLog[];
  session: GameSession;
  selectedCharacter: CharacterType;

  // Actions
  loadFromStorage: () => void;
  saveToStorage: () => void;
  addGems: (amount: number) => void;
  addJams: (amount: number) => void;
  updateDurability: (delta: number) => void;
  repairWeapon: (type: 'basic' | 'full' | 'enhanced') => boolean;
  recordQuiz: (log: Omit<QuizLog, 'id' | 'createdAt'>) => void;
  completeStage: (stageId: number, score: number) => void;
  selectCharacter: (character: CharacterType) => void;

  // Weapon actions
  equipWeapon: (weaponId: number) => void;
  addWeaponToInventory: (weaponId: number) => boolean;
  upgradeWeapon: () => boolean;

  // Session actions
  startSession: (stageId: number) => void;
  addHint: (letter: string) => void;
  defeatMonster: (monsterId: number) => void;
  clearSession: () => void;
}

const defaultSession: GameSession = {
  currentStageId: null,
  collectedHints: [],
  monstersDefeated: [],
  sessionQuizLogs: [],
};

/** Compute derived WeaponState from inventory item + WeaponDef */
function computeWeapon(inventory: WeaponInventoryItem[], equippedId: number): WeaponState {
  const item = inventory.find(w => w.weaponId === equippedId);
  const def = getWeaponDef(equippedId);

  if (!item || !def) {
    return { id: 1, name: '초보자의 검', durability: 100, attackPower: 10 };
  }

  return {
    id: def.id,
    name: def.name,
    durability: item.durability,
    attackPower: def.baseAttackPower + item.upgradeLevel * 2,
  };
}

export const useGameStore = create<GameStore>((set, get) => {
  const defaults = storageService.getDefaultSave();
  const defaultInv = defaults.weaponInventory || [{ weaponId: 1, durability: 100, upgradeLevel: 0, acquiredAt: new Date().toISOString() }];
  const defaultEquipped = defaults.equippedWeaponId || 1;

  return {
    user: defaults.user,
    weapon: computeWeapon(defaultInv, defaultEquipped),
    weaponInventory: defaultInv,
    equippedWeaponId: defaultEquipped,
    progress: defaults.progress,
    inventory: defaults.inventory,
    quizLogs: defaults.quizLogs,
    session: { ...defaultSession },
    selectedCharacter: defaults.selectedCharacter || 'knight',

    loadFromStorage: () => {
      const saved = storageService.load();
      if (saved) {
        const weaponInv = saved.weaponInventory || [{ weaponId: 1, durability: 100, upgradeLevel: 0, acquiredAt: new Date().toISOString() }];
        const equippedId = saved.equippedWeaponId || 1;
        set({
          user: saved.user,
          weapon: computeWeapon(weaponInv, equippedId),
          weaponInventory: weaponInv,
          equippedWeaponId: equippedId,
          progress: saved.progress,
          inventory: saved.inventory,
          quizLogs: saved.quizLogs,
          selectedCharacter: saved.selectedCharacter || 'knight',
        });
      }
    },

    saveToStorage: () => {
      const state = get();
      const data: SaveData = {
        version: 2,
        user: state.user,
        weapon: state.weapon,
        progress: state.progress,
        inventory: state.inventory,
        quizLogs: state.quizLogs,
        selectedCharacter: state.selectedCharacter,
        weaponInventory: state.weaponInventory,
        equippedWeaponId: state.equippedWeaponId,
      };
      storageService.save(data);
    },

    selectCharacter: (character) => {
      set({ selectedCharacter: character });
      get().saveToStorage();
    },

    addGems: (amount) => {
      set((state) => ({
        user: { ...state.user, totalGems: state.user.totalGems + amount },
      }));
      get().saveToStorage();
    },

    addJams: (amount) => {
      set((state) => ({
        user: { ...state.user, totalJams: state.user.totalJams + amount },
        inventory: { ...state.inventory, jams: state.inventory.jams + amount },
      }));
      get().saveToStorage();
    },

    updateDurability: (delta) => {
      set((state) => {
        const equippedId = state.equippedWeaponId;
        const item = state.weaponInventory.find(w => w.weaponId === equippedId);
        const maxDur = item ? getMaxDurability(item) : 100;
        const newInventory = state.weaponInventory.map(w =>
          w.weaponId === equippedId
            ? { ...w, durability: Math.max(0, Math.min(maxDur, w.durability + delta)) }
            : w
        );
        return {
          weaponInventory: newInventory,
          weapon: computeWeapon(newInventory, equippedId),
        };
      });
      get().saveToStorage();
    },

    repairWeapon: (type) => {
      const state = get();
      const config = type === 'basic' ? BALANCE.REPAIR_BASIC
        : type === 'full' ? BALANCE.REPAIR_FULL
        : BALANCE.REPAIR_ENHANCED;

      if (state.user.totalJams < config.costJams) return false;
      if (config.costGems > 0 && state.user.totalGems < config.costGems) return false;

      set((s) => {
        const equippedId = s.equippedWeaponId;
        const item = s.weaponInventory.find(w => w.weaponId === equippedId);
        const maxDur = item ? getMaxDurability(item) : 100;

        const newInventory = s.weaponInventory.map(w => {
          if (w.weaponId !== equippedId) return w;
          const newDur = type === 'basic'
            ? Math.min(maxDur, w.durability + config.restore)
            : maxDur;
          return { ...w, durability: newDur };
        });

        return {
          user: {
            ...s.user,
            totalJams: s.user.totalJams - config.costJams,
            totalGems: s.user.totalGems - config.costGems,
          },
          inventory: {
            ...s.inventory,
            jams: s.inventory.jams - config.costJams,
          },
          weaponInventory: newInventory,
          weapon: computeWeapon(newInventory, equippedId),
        };
      });
      get().saveToStorage();
      return true;
    },

    // ─── Weapon Actions ───

    equipWeapon: (weaponId) => {
      const state = get();
      if (!state.weaponInventory.some(w => w.weaponId === weaponId)) return;

      set((s) => ({
        equippedWeaponId: weaponId,
        weapon: computeWeapon(s.weaponInventory, weaponId),
      }));
      get().saveToStorage();
    },

    addWeaponToInventory: (weaponId) => {
      const state = get();
      if (state.weaponInventory.some(w => w.weaponId === weaponId)) return false;

      const def = getWeaponDef(weaponId);
      if (!def) return false;

      const newItem: WeaponInventoryItem = {
        weaponId,
        durability: def.maxDurability,
        upgradeLevel: 0,
        acquiredAt: new Date().toISOString(),
      };

      set((s) => ({
        weaponInventory: [...s.weaponInventory, newItem],
      }));
      get().saveToStorage();
      return true;
    },

    upgradeWeapon: () => {
      const state = get();
      const item = state.weaponInventory.find(w => w.weaponId === state.equippedWeaponId);
      if (!item) return false;

      const nextLevel = item.upgradeLevel + 1;
      if (nextLevel > BALANCE.WEAPON_MAX_UPGRADE) return false;

      const upgradeCost = BALANCE.FORGE_UPGRADE[nextLevel - 1];
      if (!upgradeCost) return false;
      if (state.user.totalJams < upgradeCost.costJams) return false;
      if (state.user.totalGems < upgradeCost.costGems) return false;

      set((s) => {
        const newInventory = s.weaponInventory.map(w =>
          w.weaponId === s.equippedWeaponId
            ? { ...w, upgradeLevel: nextLevel }
            : w
        );
        return {
          user: {
            ...s.user,
            totalJams: s.user.totalJams - upgradeCost.costJams,
            totalGems: s.user.totalGems - upgradeCost.costGems,
          },
          inventory: {
            ...s.inventory,
            jams: s.inventory.jams - upgradeCost.costJams,
          },
          weaponInventory: newInventory,
          weapon: computeWeapon(newInventory, s.equippedWeaponId),
        };
      });
      get().saveToStorage();
      return true;
    },

    recordQuiz: (log) => {
      const newLog: QuizLog = {
        ...log,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      };
      set((state) => ({
        quizLogs: [...state.quizLogs, newLog],
        session: {
          ...state.session,
          sessionQuizLogs: [...state.session.sessionQuizLogs, newLog],
        },
      }));
      get().saveToStorage();
    },

    completeStage: (stageId, score) => {
      const stars = score >= BALANCE.STAR_THREE ? 3
        : score >= BALANCE.STAR_TWO ? 2
        : score >= BALANCE.STAR_ONE ? 1 : 0;

      set((state) => {
        const prev = state.progress[stageId];
        return {
          progress: {
            ...state.progress,
            [stageId]: {
              stageId,
              stars: prev ? Math.max(prev.stars, stars) : stars,
              isCompleted: true,
              bestScore: prev ? Math.max(prev.bestScore, score) : score,
              attempts: prev ? prev.attempts + 1 : 1,
            },
          },
        };
      });
      get().saveToStorage();
    },

    startSession: (stageId) => {
      set({
        session: {
          currentStageId: stageId,
          collectedHints: [],
          monstersDefeated: [],
          sessionQuizLogs: [],
        },
      });
    },

    addHint: (letter) => {
      set((state) => ({
        session: {
          ...state.session,
          collectedHints: [...state.session.collectedHints, letter],
        },
      }));
    },

    defeatMonster: (monsterId) => {
      set((state) => ({
        session: {
          ...state.session,
          monstersDefeated: [...state.session.monstersDefeated, monsterId],
        },
      }));
    },

    clearSession: () => {
      set({ session: { ...defaultSession } });
    },
  };
});
