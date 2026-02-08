import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { BALANCE } from '../data/gameBalance';
import { WEAPON_DEFS, getRarityColor, getRarityLabel, WeaponDef } from '../data/weapons';

type ShopTab = 'weapons' | 'potions' | 'materials' | 'special';

interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  costGems: number;
  costJams: number;
  action: () => void;
  canAfford: boolean;
}

const CHAR_LABELS: Record<string, string> = {
  knight: '기사',
  archer: '궁수',
  viking: '바이킹',
};

const CHAR_ICONS: Record<string, string> = {
  knight: '🛡️',
  archer: '🎯',
  viking: '⛏️',
};

const ShopScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, selectedCharacter, weaponInventory, loadFromStorage, addGems, addJams, addWeaponToInventory, repairWeapon } = useGameStore();
  const [tab, setTab] = useState<ShopTab>('weapons');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleBuyItem = (item: ShopItem) => {
    if (!item.canAfford) {
      showFeedback('❌ 재화가 부족합니다!');
      return;
    }
    if (item.costGems > 0) addGems(-item.costGems);
    if (item.costJams > 0) addJams(-item.costJams);
    item.action();
    showFeedback(`✅ ${item.name} 구매 완료!`);
  };

  const handleBuyWeapon = (def: WeaponDef, price: { costGems: number; costJams: number }) => {
    const owned = weaponInventory.some(w => w.weaponId === def.id);
    if (owned) {
      showFeedback('이미 보유 중인 무기입니다!');
      return;
    }
    if (user.totalGems < price.costGems || user.totalJams < price.costJams) {
      showFeedback('❌ 재화가 부족합니다!');
      return;
    }
    if (price.costGems > 0) addGems(-price.costGems);
    if (price.costJams > 0) addJams(-price.costJams);
    if (addWeaponToInventory(def.id)) {
      showFeedback(`✅ ${def.name} 구매 완료!`);
    } else {
      // Refund on failure
      if (price.costGems > 0) addGems(price.costGems);
      if (price.costJams > 0) addJams(price.costJams);
      showFeedback('❌ 구매에 실패했습니다!');
    }
  };

  // Build weapon shop list (exclude starter weapon id=1)
  const shopWeapons = WEAPON_DEFS
    .filter(def => def.id !== 1 && BALANCE.SHOP_WEAPONS?.[def.id])
    .map(def => {
      const price = BALANCE.SHOP_WEAPONS[def.id];
      const owned = weaponInventory.some(w => w.weaponId === def.id);
      const affordable = user.totalGems >= price.costGems && user.totalJams >= price.costJams;
      const isCharMatch = def.characterBonus === selectedCharacter;
      return { def, price, owned, affordable, isCharMatch };
    });

  // Sort: character-matched weapons first, then by rarity
  const rarityOrder: Record<string, number> = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
  shopWeapons.sort((a, b) => {
    if (a.isCharMatch !== b.isCharMatch) return a.isCharMatch ? -1 : 1;
    return rarityOrder[a.def.rarity] - rarityOrder[b.def.rarity];
  });

  const potionItems: ShopItem[] = [
    {
      id: 'repair_basic',
      name: '수리 키트 (소)',
      emoji: '🔧',
      description: `무기 내구도 +${BALANCE.REPAIR_BASIC.restore} 회복`,
      costGems: BALANCE.SHOP.REPAIR_KIT_SMALL_COST,
      costJams: 0,
      canAfford: user.totalGems >= BALANCE.SHOP.REPAIR_KIT_SMALL_COST,
      action: () => { repairWeapon('basic'); },
    },
    {
      id: 'repair_full',
      name: '수리 키트 (대)',
      emoji: '🔨',
      description: '무기 내구도 완전 회복',
      costGems: BALANCE.SHOP.REPAIR_KIT_LARGE_COST,
      costJams: 0,
      canAfford: user.totalGems >= BALANCE.SHOP.REPAIR_KIT_LARGE_COST,
      action: () => { repairWeapon('full'); },
    },
    {
      id: 'jam_pack_small',
      name: '잼 꾸러미 (소)',
      emoji: '🫙',
      description: '잼 10개 획득',
      costGems: BALANCE.SHOP.JAM_PACK_SMALL_COST,
      costJams: 0,
      canAfford: user.totalGems >= BALANCE.SHOP.JAM_PACK_SMALL_COST,
      action: () => { addJams(10); },
    },
    {
      id: 'jam_pack_large',
      name: '잼 꾸러미 (대)',
      emoji: '🍯',
      description: '잼 30개 획득',
      costGems: BALANCE.SHOP.JAM_PACK_LARGE_COST,
      costJams: 0,
      canAfford: user.totalGems >= BALANCE.SHOP.JAM_PACK_LARGE_COST,
      action: () => { addJams(30); },
    },
  ];

  const materialItems: ShopItem[] = [
    {
      id: 'gem_pack_small',
      name: '보석 주머니 (소)',
      emoji: '💎',
      description: '보석 5개 획득',
      costGems: 0,
      costJams: BALANCE.SHOP.GEM_PACK_SMALL_COST,
      canAfford: user.totalJams >= BALANCE.SHOP.GEM_PACK_SMALL_COST,
      action: () => { addGems(5); },
    },
    {
      id: 'gem_pack_large',
      name: '보석 주머니 (대)',
      emoji: '💰',
      description: '보석 15개 획득',
      costGems: 0,
      costJams: BALANCE.SHOP.GEM_PACK_LARGE_COST,
      canAfford: user.totalJams >= BALANCE.SHOP.GEM_PACK_LARGE_COST,
      action: () => { addGems(15); },
    },
  ];

  const specialItems: ShopItem[] = [
    {
      id: 'repair_enhanced',
      name: '강화 수리 키트',
      emoji: '⚡',
      description: `내구도 완전 회복 + 공격력 +${BALANCE.REPAIR_ENHANCED.bonusAttack}`,
      costGems: BALANCE.SHOP.ENHANCED_REPAIR_COST,
      costJams: 0,
      canAfford: user.totalGems >= BALANCE.SHOP.ENHANCED_REPAIR_COST,
      action: () => { repairWeapon('enhanced'); },
    },
    {
      id: 'starter_bundle',
      name: '초보자 번들',
      emoji: '🎁',
      description: '보석 10 + 잼 20 획득',
      costGems: BALANCE.SHOP.STARTER_BUNDLE_COST,
      costJams: 0,
      canAfford: user.totalGems >= BALANCE.SHOP.STARTER_BUNDLE_COST,
      action: () => { addGems(10); addJams(20); },
    },
  ];

  const currentItems = tab === 'potions' ? potionItems
    : tab === 'materials' ? materialItems
    : tab === 'special' ? specialItems
    : [];

  const renderCostLabel = (costGems: number, costJams: number) => {
    const parts: string[] = [];
    if (costGems > 0) parts.push(`💎 ${costGems}`);
    if (costJams > 0) parts.push(`🫙 ${costJams}`);
    return parts.join(' + ');
  };

  return (
    <div style={{ width: '100%', maxWidth: 420, padding: 24, height: '100vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <button
          onClick={() => navigate('/')}
          style={{ padding: '8px 16px', borderRadius: 8, background: '#333', color: '#fff', fontSize: 14, border: 'none', cursor: 'pointer', marginRight: 16 }}
        >
          ← 뒤로
        </button>
        <h2 style={{ color: '#48BB78', margin: 0 }}>🛒 상점</h2>
      </div>

      {/* Resources */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, justifyContent: 'center' }}>
        <div style={{ padding: '8px 16px', background: '#1a1a3a', borderRadius: 8, color: '#FFD700' }}>💎 {user.totalGems}</div>
        <div style={{ padding: '8px 16px', background: '#1a1a3a', borderRadius: 8, color: '#FF69B4' }}>🫙 {user.totalJams}</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {([
          { key: 'weapons' as const, label: '⚔️ 무기' },
          { key: 'potions' as const, label: '🧪 소모품' },
          { key: 'materials' as const, label: '💎 재화' },
          { key: 'special' as const, label: '⭐ 특별' },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8,
              background: tab === t.key ? '#48BB78' : '#2a2a4a',
              color: tab === t.key ? '#000' : '#fff',
              fontSize: 13, fontWeight: tab === t.key ? 'bold' : 'normal',
              border: 'none', cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Character match banner (weapons tab) */}
      {tab === 'weapons' && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '8px 12px', marginBottom: 12,
          background: '#1a2a3a', borderRadius: 8, border: '1px solid #4A90D966',
        }}>
          <span style={{ fontSize: 16 }}>{CHAR_ICONS[selectedCharacter]}</span>
          <span style={{ fontSize: 13, color: '#4A90D9' }}>
            {CHAR_LABELS[selectedCharacter]} 추천 무기 우선 표시
          </span>
        </div>
      )}

      {/* Weapon items */}
      {tab === 'weapons' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shopWeapons.map(({ def, price, owned, affordable, isCharMatch }) => {
            const rarityColor = getRarityColor(def.rarity);
            return (
              <div
                key={def.id}
                style={{
                  padding: 14, borderRadius: 12,
                  background: isCharMatch ? '#1a2a3a' : '#1a1a3a',
                  border: `2px solid ${isCharMatch ? '#4A90D9' : rarityColor + '44'}`,
                  opacity: owned ? 0.5 : 1,
                  position: 'relative',
                }}
              >
                {/* Character match badge */}
                {isCharMatch && !owned && (
                  <div style={{
                    position: 'absolute', top: -8, right: 10,
                    background: '#4A90D9', color: '#fff',
                    fontSize: 10, fontWeight: 'bold',
                    padding: '2px 8px', borderRadius: 10,
                  }}>
                    {CHAR_ICONS[selectedCharacter]} 추천
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {/* Weapon icon */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 10,
                    background: `${rarityColor}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, flexShrink: 0,
                  }}>
                    {def.emoji}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 'bold', fontSize: 15, color: '#fff' }}>{def.name}</span>
                      {def.characterBonus && (
                        <span style={{ fontSize: 11, color: rarityColor }}>
                          {CHAR_ICONS[def.characterBonus]}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: rarityColor, marginTop: 2 }}>
                      {getRarityLabel(def.rarity)}
                    </div>
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                      ATK {def.baseAttackPower} · 내구 {def.maxDurability}
                      {def.characterBonus && (
                        <span style={{ color: '#4A90D9' }}>
                          {' '}· {CHAR_LABELS[def.characterBonus]} +{Math.round(((def.characterBonusMultiplier || 1) - 1) * 100)}%
                        </span>
                      )}
                    </div>
                    {def.specialEffect && (
                      <div style={{ fontSize: 11, color: '#FFD700', marginTop: 2 }}>
                        {def.specialEffect.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  <div style={{ fontSize: 13, color: '#FFD700' }}>
                    {renderCostLabel(price.costGems, price.costJams)}
                  </div>
                  {owned ? (
                    <span style={{ fontSize: 13, color: '#48BB78' }}>보유 중 ✓</span>
                  ) : (
                    <button
                      onClick={() => handleBuyWeapon(def, price)}
                      disabled={!affordable}
                      style={{
                        padding: '8px 18px', borderRadius: 8,
                        background: affordable ? '#48BB78' : '#333',
                        color: affordable ? '#000' : '#555',
                        fontSize: 13, fontWeight: 'bold', border: 'none',
                        cursor: affordable ? 'pointer' : 'not-allowed',
                      }}
                    >
                      구매
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Consumable / Material / Special items */}
      {tab !== 'weapons' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {currentItems.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 14, borderRadius: 12,
                background: '#1a1a3a',
                border: `1px solid ${item.canAfford ? '#48BB7866' : '#33333366'}`,
                opacity: item.canAfford ? 1 : 0.6,
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: '#2a2a4a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, flexShrink: 0,
              }}>
                {item.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 'bold', fontSize: 15, color: '#fff' }}>{item.name}</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{item.description}</div>
              </div>
              <button
                onClick={() => handleBuyItem(item)}
                disabled={!item.canAfford}
                style={{
                  padding: '8px 14px', borderRadius: 8,
                  background: item.canAfford ? '#48BB78' : '#333',
                  color: item.canAfford ? '#000' : '#555',
                  fontSize: 13, fontWeight: 'bold', border: 'none',
                  cursor: item.canAfford ? 'pointer' : 'not-allowed',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                {renderCostLabel(item.costGems, item.costJams)}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div style={{
          textAlign: 'center', marginTop: 16, padding: 10,
          background: '#2a2a4a', borderRadius: 8, fontSize: 16,
        }}>
          {feedback}
        </div>
      )}
    </div>
  );
};

export default ShopScreen;
