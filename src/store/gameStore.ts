import { create } from 'zustand';
import { UserState, WeaponState, StageProgress } from '../types/player';
import { QuizLog } from '../types/quiz';
import { storageService, SaveData } from '../services/storageService';
import { BALANCE } from '../data/gameBalance';

interface GameSession {
  currentStageId: number | null;
  collectedHints: string[];
  monstersDefeated: number[];
  sessionQuizLogs: QuizLog[];
}

interface GameStore {
  user: UserState;
  weapon: WeaponState;
  progress: Record<number, StageProgress>;
  inventory: { gems: Record<string, number>; jams: number };
  quizLogs: QuizLog[];
  session: GameSession;

  // Actions
  loadFromStorage: () => void;
  saveToStorage: () => void;
  addGems: (amount: number) => void;
  addJams: (amount: number) => void;
  updateDurability: (delta: number) => void;
  repairWeapon: (type: 'basic' | 'full' | 'enhanced') => boolean;
  recordQuiz: (log: Omit<QuizLog, 'id' | 'createdAt'>) => void;
  completeStage: (stageId: number, score: number) => void;

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

export const useGameStore = create<GameStore>((set, get) => {
  const defaults = storageService.getDefaultSave();

  return {
    user: defaults.user,
    weapon: defaults.weapon,
    progress: defaults.progress,
    inventory: defaults.inventory,
    quizLogs: defaults.quizLogs,
    session: { ...defaultSession },

    loadFromStorage: () => {
      const saved = storageService.load();
      if (saved) {
        set({
          user: saved.user,
          weapon: saved.weapon,
          progress: saved.progress,
          inventory: saved.inventory,
          quizLogs: saved.quizLogs,
        });
      }
    },

    saveToStorage: () => {
      const state = get();
      const data: SaveData = {
        version: 1,
        user: state.user,
        weapon: state.weapon,
        progress: state.progress,
        inventory: state.inventory,
        quizLogs: state.quizLogs,
      };
      storageService.save(data);
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
      set((state) => ({
        weapon: {
          ...state.weapon,
          durability: Math.max(0, Math.min(100, state.weapon.durability + delta)),
        },
      }));
      get().saveToStorage();
    },

    repairWeapon: (type) => {
      const state = get();
      const config = type === 'basic' ? BALANCE.REPAIR_BASIC
        : type === 'full' ? BALANCE.REPAIR_FULL
        : BALANCE.REPAIR_ENHANCED;

      if (state.user.totalJams < config.costJams) return false;
      if (config.costGems > 0 && state.user.totalGems < config.costGems) return false;

      set((s) => ({
        user: {
          ...s.user,
          totalJams: s.user.totalJams - config.costJams,
          totalGems: s.user.totalGems - config.costGems,
        },
        weapon: {
          ...s.weapon,
          durability: Math.min(100, type === 'basic' ? s.weapon.durability + config.restore : config.restore),
          attackPower: type === 'enhanced' ? s.weapon.attackPower + (BALANCE.REPAIR_ENHANCED.bonusAttack || 0) : s.weapon.attackPower,
        },
        inventory: {
          ...s.inventory,
          jams: s.inventory.jams - config.costJams,
        },
      }));
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
