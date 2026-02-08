export const BALANCE = {
  ATTACK_DURABILITY_COST: 10,
  HINT_DROP_RATE_DEFAULT: 0.6,
  WEAPON_BROKEN_THRESHOLD: 0,
  WEAPON_WARNING_THRESHOLD: 30,
  REPAIR_BASIC: { costJams: 5, costGems: 0, restore: 30 },
  REPAIR_FULL: { costJams: 15, costGems: 0, restore: 100 },
  REPAIR_ENHANCED: { costJams: 30, costGems: 5, restore: 100, bonusAttack: 2 },
  STAGE_CLEAR_GEMS_MIN: 3,
  STAGE_CLEAR_GEMS_MAX: 5,
  TREASURE_GEMS_MIN: 5,
  TREASURE_GEMS_MAX: 10,
  TREASURE_JAMS_MIN: 3,
  TREASURE_JAMS_MAX: 5,
  STAR_ONE: 50,
  STAR_TWO: 75,
  STAR_THREE: 95,
  MONSTER_SPACING: 500,
  LEVEL_PADDING: 800,
  PLAYER_SPEED: 200,
  PLAYER_JUMP: -350,
  ATTACK_COOLDOWN: 500,

  // Weapon forge upgrade costs per level (1-5)
  FORGE_UPGRADE: [
    { level: 1, costJams: 10, costGems: 3, atkBonus: 2, durBonus: 10 },
    { level: 2, costJams: 20, costGems: 5, atkBonus: 2, durBonus: 10 },
    { level: 3, costJams: 35, costGems: 10, atkBonus: 3, durBonus: 15 },
    { level: 4, costJams: 50, costGems: 15, atkBonus: 3, durBonus: 15 },
    { level: 5, costJams: 80, costGems: 25, atkBonus: 5, durBonus: 20 },
  ] as const,

  // Weapon craft recipes (weaponId -> cost)
  CRAFT_RECIPES: {
    5: { costJams: 30, costGems: 15 },
    8: { costJams: 50, costGems: 25 },
    10: { costJams: 80, costGems: 40 },
  } as Record<number, { costJams: number; costGems: number }>,

  WEAPON_MAX_UPGRADE: 5,

  // Shop prices
  SHOP: {
    REPAIR_KIT_SMALL_COST: 2,
    REPAIR_KIT_LARGE_COST: 5,
    JAM_PACK_SMALL_COST: 3,
    JAM_PACK_LARGE_COST: 8,
    GEM_PACK_SMALL_COST: 15,
    GEM_PACK_LARGE_COST: 40,
    ENHANCED_REPAIR_COST: 10,
    STARTER_BUNDLE_COST: 12,
  },

  // Shop weapon prices (weaponId -> cost in gems)
  SHOP_WEAPONS: {
    2:  { costGems: 8,  costJams: 0 },   // 오크 방패검 (common, knight)
    3:  { costGems: 8,  costJams: 0 },   // 사냥꾼의 활 (common, archer)
    4:  { costGems: 15, costJams: 5 },   // 바이킹 도끼 (uncommon, viking)
    5:  { costGems: 15, costJams: 10 },  // 마법사의 지팡이 (uncommon)
    6:  { costGems: 18, costJams: 8 },   // 전투 망치 (uncommon, viking)
    7:  { costGems: 30, costJams: 15 },  // 얼음 검 (rare, knight)
    8:  { costGems: 30, costJams: 20 },  // 불꽃 활 (rare, archer)
    9:  { costGems: 40, costJams: 25 },  // 번개 도끼 (rare, viking)
    10: { costGems: 60, costJams: 35 },  // 크리스탈 지팡이 (epic)
    11: { costGems: 80, costJams: 50 },  // 엑스칼리버 (epic, knight)
    12: { costGems: 120, costJams: 80 }, // 드래곤 활 (legendary, archer)
  } as Record<number, { costGems: number; costJams: number }>,
};
