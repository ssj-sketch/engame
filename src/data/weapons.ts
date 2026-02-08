import { CharacterType } from '../services/storageService';
import { WeaponInventoryItem } from '../types/weapon';
import { StageProgress } from '../types/player';

// ─── Types ───

export type WeaponCategory = 'sword' | 'bow' | 'axe' | 'staff' | 'hammer';
export type WeaponRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface WeaponSpecialEffect {
  type: 'hint_bonus' | 'gem_bonus' | 'durability_save';
  value: number;        // percentage (15 = 15%)
  description: string;  // Korean description
}

export interface WeaponDef {
  id: number;
  name: string;
  category: WeaponCategory;
  rarity: WeaponRarity;
  emoji: string;
  baseAttackPower: number;
  maxDurability: number;
  specialEffect?: WeaponSpecialEffect;
  characterBonus?: CharacterType;
  characterBonusMultiplier?: number; // e.g. 1.2 = +20%
  obtainMethod: 'starter' | 'stage_reward' | 'forge_craft' | 'treasure' | 'milestone';
  obtainCondition?: string;
}

// ─── Weapon Database (12 weapons) ───

export const WEAPON_DEFS: WeaponDef[] = [
  {
    id: 1,
    name: '초보자의 검',
    category: 'sword',
    rarity: 'common',
    emoji: '⚔️',
    baseAttackPower: 10,
    maxDurability: 100,
    obtainMethod: 'starter',
  },
  {
    id: 2,
    name: '오크 방패검',
    category: 'sword',
    rarity: 'common',
    emoji: '🗡️',
    baseAttackPower: 12,
    maxDurability: 120,
    characterBonus: 'knight',
    characterBonusMultiplier: 1.2,
    obtainMethod: 'stage_reward',
    obtainCondition: 'unit_2_clear',
  },
  {
    id: 3,
    name: '사냥꾼의 활',
    category: 'bow',
    rarity: 'common',
    emoji: '🏹',
    baseAttackPower: 8,
    maxDurability: 100,
    specialEffect: { type: 'hint_bonus', value: 15, description: '힌트 드롭 +15%' },
    characterBonus: 'archer',
    characterBonusMultiplier: 1.25,
    obtainMethod: 'stage_reward',
    obtainCondition: 'unit_3_clear',
  },
  {
    id: 4,
    name: '바이킹 도끼',
    category: 'axe',
    rarity: 'uncommon',
    emoji: '🪓',
    baseAttackPower: 15,
    maxDurability: 80,
    characterBonus: 'viking',
    characterBonusMultiplier: 1.3,
    obtainMethod: 'stage_reward',
    obtainCondition: 'unit_5_clear',
  },
  {
    id: 5,
    name: '마법사의 지팡이',
    category: 'staff',
    rarity: 'uncommon',
    emoji: '🪄',
    baseAttackPower: 10,
    maxDurability: 130,
    specialEffect: { type: 'gem_bonus', value: 20, description: '보석 보상 +20%' },
    obtainMethod: 'forge_craft',
  },
  {
    id: 6,
    name: '전투 망치',
    category: 'hammer',
    rarity: 'uncommon',
    emoji: '🔨',
    baseAttackPower: 18,
    maxDurability: 70,
    specialEffect: { type: 'durability_save', value: 20, description: '내구도 절약 20%' },
    characterBonus: 'viking',
    characterBonusMultiplier: 1.15,
    obtainMethod: 'stage_reward',
    obtainCondition: 'unit_8_clear',
  },
  {
    id: 7,
    name: '얼음 검',
    category: 'sword',
    rarity: 'rare',
    emoji: '❄️',
    baseAttackPower: 16,
    maxDurability: 100,
    specialEffect: { type: 'hint_bonus', value: 25, description: '힌트 드롭 +25%' },
    characterBonus: 'knight',
    characterBonusMultiplier: 1.2,
    obtainMethod: 'treasure',
    obtainCondition: 'unit_10_plus_treasure',
  },
  {
    id: 8,
    name: '불꽃 활',
    category: 'bow',
    rarity: 'rare',
    emoji: '🔥',
    baseAttackPower: 14,
    maxDurability: 100,
    specialEffect: { type: 'gem_bonus', value: 30, description: '보석 보상 +30%' },
    characterBonus: 'archer',
    characterBonusMultiplier: 1.25,
    obtainMethod: 'forge_craft',
  },
  {
    id: 9,
    name: '번개 도끼',
    category: 'axe',
    rarity: 'rare',
    emoji: '⚡',
    baseAttackPower: 20,
    maxDurability: 90,
    characterBonus: 'viking',
    characterBonusMultiplier: 1.2,
    obtainMethod: 'milestone',
    obtainCondition: 'stages_50',
  },
  {
    id: 10,
    name: '크리스탈 지팡이',
    category: 'staff',
    rarity: 'epic',
    emoji: '💠',
    baseAttackPower: 18,
    maxDurability: 140,
    specialEffect: { type: 'gem_bonus', value: 40, description: '보석 보상 +40%' },
    obtainMethod: 'forge_craft',
  },
  {
    id: 11,
    name: '엑스칼리버',
    category: 'sword',
    rarity: 'epic',
    emoji: '🌟',
    baseAttackPower: 22,
    maxDurability: 110,
    specialEffect: { type: 'hint_bonus', value: 30, description: '힌트 드롭 +30%' },
    characterBonus: 'knight',
    characterBonusMultiplier: 1.3,
    obtainMethod: 'milestone',
    obtainCondition: 'stages_100',
  },
  {
    id: 12,
    name: '드래곤 활',
    category: 'bow',
    rarity: 'legendary',
    emoji: '🐉',
    baseAttackPower: 20,
    maxDurability: 120,
    specialEffect: { type: 'gem_bonus', value: 25, description: '보석+25%, 힌트+25%' },
    characterBonus: 'archer',
    characterBonusMultiplier: 1.35,
    obtainMethod: 'milestone',
    obtainCondition: 'all_units_3star',
  },
];

// ─── Helpers ───

export function getWeaponDef(id: number): WeaponDef | undefined {
  return WEAPON_DEFS.find(w => w.id === id);
}

const RARITY_COLORS: Record<WeaponRarity, string> = {
  common: '#9CA3AF',
  uncommon: '#48BB78',
  rare: '#4A90D9',
  epic: '#9B59B6',
  legendary: '#F39C12',
};

export function getRarityColor(rarity: WeaponRarity): string {
  return RARITY_COLORS[rarity];
}

const RARITY_LABELS: Record<WeaponRarity, string> = {
  common: '일반',
  uncommon: '고급',
  rare: '희귀',
  epic: '영웅',
  legendary: '전설',
};

export function getRarityLabel(rarity: WeaponRarity): string {
  return RARITY_LABELS[rarity];
}

/**
 * Compute effective attack power considering upgrade level and character bonus
 */
export function computeEffectiveAttack(
  item: WeaponInventoryItem,
  characterType: CharacterType,
): number {
  const def = getWeaponDef(item.weaponId);
  if (!def) return 10;

  let atk = def.baseAttackPower + item.upgradeLevel * 2;

  // Apply character bonus
  if (def.characterBonus === characterType && def.characterBonusMultiplier) {
    atk = Math.round(atk * def.characterBonusMultiplier);
  }

  return atk;
}

/**
 * Get max durability for a weapon with upgrade bonuses
 */
export function getMaxDurability(item: WeaponInventoryItem): number {
  const def = getWeaponDef(item.weaponId);
  if (!def) return 100;
  return def.maxDurability + item.upgradeLevel * 10;
}

/**
 * Check which weapons should be unlocked based on progress
 * Returns array of newly unlockable WeaponDefs
 */
export function checkWeaponUnlocks(
  progress: Record<number, StageProgress>,
  ownedWeaponIds: number[],
): WeaponDef[] {
  const newWeapons: WeaponDef[] = [];
  const completedStages = Object.values(progress).filter(p => p.isCompleted);
  const totalCompleted = completedStages.length;

  for (const def of WEAPON_DEFS) {
    // Skip already owned
    if (ownedWeaponIds.includes(def.id)) continue;
    // Skip craft/treasure/starter (handled elsewhere)
    if (def.obtainMethod === 'forge_craft' || def.obtainMethod === 'treasure' || def.obtainMethod === 'starter') continue;

    const cond = def.obtainCondition;
    if (!cond) continue;

    if (def.obtainMethod === 'stage_reward') {
      // unit_X_clear → check if all stages of unit X are completed
      const match = cond.match(/^unit_(\d+)_clear$/);
      if (match) {
        const unitId = parseInt(match[1], 10);
        // Check if at least one stage from this unit is completed
        // We need stages data, but for simplicity check by stageId ranges
        // Units have sequential stage IDs. We'll check if any stage in this unit is complete.
        // Since we don't import stages here, we use a simpler check:
        // Unit stages start approximately at unitId * 8 - 7 (rough heuristic)
        // Better: just check by counting total stages
        const unitStageIds = getStageIdsForUnit(unitId);
        const allUnitComplete = unitStageIds.length > 0 &&
          unitStageIds.every(sid => progress[sid]?.isCompleted);
        if (allUnitComplete) {
          newWeapons.push(def);
        }
      }
    } else if (def.obtainMethod === 'milestone') {
      if (cond === 'stages_50' && totalCompleted >= 50) {
        newWeapons.push(def);
      } else if (cond === 'stages_100' && totalCompleted >= 100) {
        newWeapons.push(def);
      } else if (cond === 'all_units_3star') {
        const all3Star = completedStages.every(p => p.stars >= 3);
        if (all3Star && totalCompleted >= 200) {
          newWeapons.push(def);
        }
      }
    }
  }

  return newWeapons;
}

// Stage ID ranges per unit (loaded lazily)
let _stageMap: Record<number, number[]> | null = null;

function getStageIdsForUnit(unitId: number): number[] {
  if (!_stageMap) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const stages = require('./stages.json') as Array<{ id: number; unitId: number }>;
      _stageMap = {};
      for (const s of stages) {
        if (!_stageMap[s.unitId]) _stageMap[s.unitId] = [];
        _stageMap[s.unitId].push(s.id);
      }
    } catch {
      _stageMap = {};
    }
  }
  return _stageMap[unitId] || [];
}

/**
 * Check if a treasure drop should award a weapon (for units 10+)
 */
export function rollTreasureWeaponDrop(
  stageUnitId: number,
  ownedWeaponIds: number[],
): WeaponDef | null {
  // Only units 10+ can drop the Ice Sword from treasure
  if (stageUnitId < 10) return null;

  const treasureWeapons = WEAPON_DEFS.filter(
    w => w.obtainMethod === 'treasure' && !ownedWeaponIds.includes(w.id)
  );

  if (treasureWeapons.length === 0) return null;

  // 5% chance per treasure
  if (Math.random() > 0.05) return null;

  return treasureWeapons[Math.floor(Math.random() * treasureWeapons.length)];
}
