import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { BALANCE } from '../data/gameBalance';
import { getWeaponDef, getRarityColor, getRarityLabel, computeEffectiveAttack, getMaxDurability } from '../data/weapons';

type ForgeTab = 'repair' | 'upgrade' | 'craft';

const ForgeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, weapon, weaponInventory, equippedWeaponId, selectedCharacter, repairWeapon, upgradeWeapon, addWeaponToInventory, loadFromStorage } = useGameStore();
  const [forgeTab, setForgeTab] = useState<ForgeTab>('repair');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const equippedItem = weaponInventory.find(w => w.weaponId === equippedWeaponId);
  const equippedDef = getWeaponDef(equippedWeaponId);
  const maxDur = equippedItem ? getMaxDurability(equippedItem) : 100;
  const durPercent = equippedItem ? Math.round((equippedItem.durability / maxDur) * 100) : 100;
  const durabilityColor = durPercent > 50 ? '#48BB78' : durPercent > 25 ? '#D69E2E' : '#E53E3E';

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleRepair = (type: 'basic' | 'full' | 'enhanced') => {
    if (repairWeapon(type)) {
      showFeedback('✅ 수리 완료!');
    } else {
      showFeedback('❌ 재료가 부족합니다!');
    }
  };

  const handleUpgrade = () => {
    if (upgradeWeapon()) {
      showFeedback('✅ 강화 성공!');
    } else {
      showFeedback('❌ 재료가 부족하거나 최대 레벨입니다!');
    }
  };

  const handleCraft = (weaponId: number) => {
    const recipe = BALANCE.CRAFT_RECIPES[weaponId];
    if (!recipe) return;
    if (user.totalJams < recipe.costJams || user.totalGems < recipe.costGems) {
      showFeedback('❌ 재료가 부족합니다!');
      return;
    }

    const store = useGameStore.getState();
    store.addGems(-recipe.costGems);
    store.addJams(-recipe.costJams);

    if (addWeaponToInventory(weaponId)) {
      showFeedback('✅ 무기 제작 완료!');
    } else {
      store.addGems(recipe.costGems);
      store.addJams(recipe.costJams);
      showFeedback('이미 보유 중인 무기입니다!');
    }
  };

  const repairOptions = [
    {
      type: 'basic' as const,
      label: '기본 수리',
      description: `내구도 +${BALANCE.REPAIR_BASIC.restore} 회복`,
      cost: `🫙 ${BALANCE.REPAIR_BASIC.costJams}`,
      affordable: user.totalJams >= BALANCE.REPAIR_BASIC.costJams,
    },
    {
      type: 'full' as const,
      label: '완전 수리',
      description: `내구도 ${maxDur} 회복`,
      cost: `🫙 ${BALANCE.REPAIR_FULL.costJams}`,
      affordable: user.totalJams >= BALANCE.REPAIR_FULL.costJams,
    },
    {
      type: 'enhanced' as const,
      label: '강화 수리',
      description: `${maxDur} + 공격력 +${BALANCE.REPAIR_ENHANCED.bonusAttack}`,
      cost: `🫙 ${BALANCE.REPAIR_ENHANCED.costJams} + 💎 ${BALANCE.REPAIR_ENHANCED.costGems}`,
      affordable: user.totalJams >= BALANCE.REPAIR_ENHANCED.costJams && user.totalGems >= BALANCE.REPAIR_ENHANCED.costGems,
    },
  ];

  const currentUpgradeLevel = equippedItem?.upgradeLevel || 0;
  const nextLevel = currentUpgradeLevel + 1;
  const canUpgrade = nextLevel <= BALANCE.WEAPON_MAX_UPGRADE;
  const upgradeCost = canUpgrade ? BALANCE.FORGE_UPGRADE[nextLevel - 1] : null;
  const canAffordUpgrade = upgradeCost
    ? user.totalJams >= upgradeCost.costJams && user.totalGems >= upgradeCost.costGems
    : false;

  const craftableWeapons = Object.entries(BALANCE.CRAFT_RECIPES).map(([idStr, recipe]) => {
    const weaponId = parseInt(idStr, 10);
    const def = getWeaponDef(weaponId);
    const owned = weaponInventory.some(w => w.weaponId === weaponId);
    const affordable = user.totalJams >= recipe.costJams && user.totalGems >= recipe.costGems;
    return { weaponId, def, recipe, owned, affordable };
  }).filter(c => c.def);

  return (
    <div style={{ width: '100%', maxWidth: 420, padding: 24, height: '100vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={() => navigate('/')} style={{ padding: '8px 16px', borderRadius: 8, background: '#333', color: '#fff', fontSize: 14, border: 'none', cursor: 'pointer', marginRight: 16 }}>← 뒤로</button>
        <h2 style={{ color: '#D69E2E', margin: 0 }}>⚒️ 대장간</h2>
      </div>

      {/* Resources */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, justifyContent: 'center' }}>
        <div style={{ padding: '8px 16px', background: '#1a1a3a', borderRadius: 8 }}>💎 {user.totalGems}</div>
        <div style={{ padding: '8px 16px', background: '#1a1a3a', borderRadius: 8 }}>🫙 {user.totalJams}</div>
      </div>

      {/* Current weapon */}
      <div style={{ background: '#1a1a3a', borderRadius: 16, padding: 16, marginBottom: 16, textAlign: 'center', border: `1px solid ${equippedDef ? getRarityColor(equippedDef.rarity) + '66' : '#333'}` }}>
        <span style={{ fontSize: 40 }}>{equippedDef?.emoji || '⚔️'}</span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{weapon.name}</span>
          {currentUpgradeLevel > 0 && <span style={{ color: '#FFD700', fontSize: 14 }}>+{currentUpgradeLevel}</span>}
        </div>
        <div style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>
          공격력: {equippedItem ? computeEffectiveAttack(equippedItem, selectedCharacter) : weapon.attackPower}
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: durabilityColor }}>
          내구도: {equippedItem?.durability || 0}/{maxDur}
        </div>
        <div style={{ width: '80%', height: 10, background: '#333', borderRadius: 5, overflow: 'hidden', margin: '4px auto 0' }}>
          <div style={{ width: `${durPercent}%`, height: '100%', background: durabilityColor, borderRadius: 5, transition: 'all 0.3s' }} />
        </div>
      </div>

      {/* Forge tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {([
          { key: 'repair' as const, label: '🔧 수리' },
          { key: 'upgrade' as const, label: '⬆️ 강화' },
          { key: 'craft' as const, label: '🛠️ 제작' },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setForgeTab(t.key)}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8,
              background: forgeTab === t.key ? '#D69E2E' : '#2a2a4a',
              color: forgeTab === t.key ? '#000' : '#fff',
              fontSize: 14, fontWeight: forgeTab === t.key ? 'bold' : 'normal',
              border: 'none', cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Repair */}
      {forgeTab === 'repair' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {repairOptions.map((opt) => (
            <button
              key={opt.type}
              onClick={() => handleRepair(opt.type)}
              disabled={!opt.affordable}
              style={{
                padding: 14, borderRadius: 12,
                background: opt.affordable ? '#2a2a4a' : '#1a1a2a',
                border: `1px solid ${opt.affordable ? '#D69E2E' : '#333'}`,
                color: opt.affordable ? '#fff' : '#555',
                cursor: opt.affordable ? 'pointer' : 'not-allowed',
                textAlign: 'left',
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: 15 }}>{opt.label}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{opt.description}</div>
              <div style={{ fontSize: 13, color: '#FFD700', marginTop: 4 }}>{opt.cost}</div>
            </button>
          ))}
        </div>
      )}

      {/* Upgrade */}
      {forgeTab === 'upgrade' && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: '#aaa', marginBottom: 8 }}>강화 레벨</div>
            <div style={{ fontSize: 28 }}>
              {Array.from({ length: BALANCE.WEAPON_MAX_UPGRADE }, (_, i) => (
                <span key={i} style={{ opacity: i < currentUpgradeLevel ? 1 : 0.2 }}>⭐</span>
              ))}
            </div>
            <div style={{ fontSize: 13, color: '#ccc', marginTop: 4 }}>
              Lv.{currentUpgradeLevel} / {BALANCE.WEAPON_MAX_UPGRADE}
            </div>
          </div>
          {canUpgrade && upgradeCost ? (
            <div style={{ background: '#2a2a4a', borderRadius: 12, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: '#fff', marginBottom: 8 }}>다음 강화 (Lv.{nextLevel})</div>
              <div style={{ fontSize: 13, color: '#48BB78', marginBottom: 4 }}>
                공격력 +{upgradeCost.atkBonus} · 최대 내구도 +{upgradeCost.durBonus}
              </div>
              <div style={{ fontSize: 13, color: '#FFD700', marginBottom: 12 }}>
                🫙 {upgradeCost.costJams} + 💎 {upgradeCost.costGems}
              </div>
              <button
                onClick={handleUpgrade}
                disabled={!canAffordUpgrade}
                style={{
                  padding: '12px 32px', borderRadius: 12,
                  background: canAffordUpgrade ? '#D69E2E' : '#333',
                  color: canAffordUpgrade ? '#000' : '#555',
                  fontSize: 16, fontWeight: 'bold', border: 'none',
                  cursor: canAffordUpgrade ? 'pointer' : 'not-allowed',
                }}
              >
                ⬆️ 강화하기
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#FFD700', fontSize: 16, padding: 24 }}>
              최대 강화 레벨 도달!
            </div>
          )}
        </div>
      )}

      {/* Craft */}
      {forgeTab === 'craft' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {craftableWeapons.map(({ weaponId, def, recipe, owned, affordable }) => {
            if (!def) return null;
            const rarityColor = getRarityColor(def.rarity);
            return (
              <div key={weaponId} style={{ padding: 14, borderRadius: 12, background: '#1a1a3a', border: `1px solid ${rarityColor}66`, opacity: owned ? 0.5 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: `${rarityColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                    {def.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: 15, color: '#fff' }}>{def.name}</div>
                    <div style={{ fontSize: 12, color: rarityColor }}>{getRarityLabel(def.rarity)}</div>
                    <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                      ATK {def.baseAttackPower} · 내구 {def.maxDurability}
                      {def.specialEffect && ` · ${def.specialEffect.description}`}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  <div style={{ fontSize: 13, color: '#FFD700' }}>🫙 {recipe.costJams} + 💎 {recipe.costGems}</div>
                  {owned ? (
                    <span style={{ fontSize: 13, color: '#48BB78' }}>보유 중 ✓</span>
                  ) : (
                    <button
                      onClick={() => handleCraft(weaponId)}
                      disabled={!affordable}
                      style={{
                        padding: '8px 20px', borderRadius: 8,
                        background: affordable ? '#D69E2E' : '#333',
                        color: affordable ? '#000' : '#555',
                        fontSize: 14, fontWeight: 'bold', border: 'none',
                        cursor: affordable ? 'pointer' : 'not-allowed',
                      }}
                    >
                      제작
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div style={{ textAlign: 'center', marginTop: 16, padding: 10, background: '#2a2a4a', borderRadius: 8, fontSize: 16 }}>
          {feedback}
        </div>
      )}
    </div>
  );
};

export default ForgeScreen;
