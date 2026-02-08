import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { BALANCE } from '../data/gameBalance';

type ShopTab = 'potions' | 'materials' | 'special';

interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  costType: 'gems' | 'jams';
  cost: number;
  action: () => void;
  canAfford: boolean;
}

const ShopScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, loadFromStorage, addGems, addJams, repairWeapon } = useGameStore();
  const [tab, setTab] = useState<ShopTab>('potions');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleBuy = (item: ShopItem) => {
    if (!item.canAfford) {
      showFeedback('❌ 재화가 부족합니다!');
      return;
    }
    // Deduct cost
    if (item.costType === 'gems') {
      addGems(-item.cost);
    } else {
      addJams(-item.cost);
    }
    item.action();
    showFeedback(`✅ ${item.name} 구매 완료!`);
  };

  const potionItems: ShopItem[] = [
    {
      id: 'repair_basic',
      name: '수리 키트 (소)',
      emoji: '🔧',
      description: `무기 내구도 +${BALANCE.REPAIR_BASIC.restore} 회복`,
      costType: 'gems',
      cost: BALANCE.SHOP?.REPAIR_KIT_SMALL_COST ?? 2,
      canAfford: user.totalGems >= (BALANCE.SHOP?.REPAIR_KIT_SMALL_COST ?? 2),
      action: () => {
        repairWeapon('basic');
      },
    },
    {
      id: 'repair_full',
      name: '수리 키트 (대)',
      emoji: '🔨',
      description: '무기 내구도 완전 회복',
      costType: 'gems',
      cost: BALANCE.SHOP?.REPAIR_KIT_LARGE_COST ?? 5,
      canAfford: user.totalGems >= (BALANCE.SHOP?.REPAIR_KIT_LARGE_COST ?? 5),
      action: () => {
        repairWeapon('full');
      },
    },
    {
      id: 'jam_pack_small',
      name: '잼 꾸러미 (소)',
      emoji: '🫙',
      description: '잼 10개 획득',
      costType: 'gems',
      cost: BALANCE.SHOP?.JAM_PACK_SMALL_COST ?? 3,
      canAfford: user.totalGems >= (BALANCE.SHOP?.JAM_PACK_SMALL_COST ?? 3),
      action: () => {
        addJams(10);
      },
    },
    {
      id: 'jam_pack_large',
      name: '잼 꾸러미 (대)',
      emoji: '🍯',
      description: '잼 30개 획득',
      costType: 'gems',
      cost: BALANCE.SHOP?.JAM_PACK_LARGE_COST ?? 8,
      canAfford: user.totalGems >= (BALANCE.SHOP?.JAM_PACK_LARGE_COST ?? 8),
      action: () => {
        addJams(30);
      },
    },
  ];

  const materialItems: ShopItem[] = [
    {
      id: 'gem_pack_small',
      name: '보석 주머니 (소)',
      emoji: '💎',
      description: '보석 5개 획득',
      costType: 'jams',
      cost: BALANCE.SHOP?.GEM_PACK_SMALL_COST ?? 15,
      canAfford: user.totalJams >= (BALANCE.SHOP?.GEM_PACK_SMALL_COST ?? 15),
      action: () => {
        addGems(5);
      },
    },
    {
      id: 'gem_pack_large',
      name: '보석 주머니 (대)',
      emoji: '💰',
      description: '보석 15개 획득',
      costType: 'jams',
      cost: BALANCE.SHOP?.GEM_PACK_LARGE_COST ?? 40,
      canAfford: user.totalJams >= (BALANCE.SHOP?.GEM_PACK_LARGE_COST ?? 40),
      action: () => {
        addGems(15);
      },
    },
  ];

  const specialItems: ShopItem[] = [
    {
      id: 'repair_enhanced',
      name: '강화 수리 키트',
      emoji: '⚡',
      description: `내구도 완전 회복 + 공격력 +${BALANCE.REPAIR_ENHANCED.bonusAttack}`,
      costType: 'gems',
      cost: BALANCE.SHOP?.ENHANCED_REPAIR_COST ?? 10,
      canAfford: user.totalGems >= (BALANCE.SHOP?.ENHANCED_REPAIR_COST ?? 10),
      action: () => {
        repairWeapon('enhanced');
      },
    },
    {
      id: 'starter_bundle',
      name: '초보자 번들',
      emoji: '🎁',
      description: '보석 10 + 잼 20 획득',
      costType: 'gems',
      cost: BALANCE.SHOP?.STARTER_BUNDLE_COST ?? 12,
      canAfford: user.totalGems >= (BALANCE.SHOP?.STARTER_BUNDLE_COST ?? 12),
      action: () => {
        addGems(10);
        addJams(20);
      },
    },
  ];

  const currentItems = tab === 'potions' ? potionItems
    : tab === 'materials' ? materialItems
    : specialItems;

  return (
    <div style={{ width: '100%', maxWidth: 420, padding: 24 }}>
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
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {([
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
              fontSize: 14, fontWeight: tab === t.key ? 'bold' : 'normal',
              border: 'none', cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {currentItems.map(item => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 14,
              borderRadius: 12,
              background: '#1a1a3a',
              border: `1px solid ${item.canAfford ? '#48BB7866' : '#33333366'}`,
              opacity: item.canAfford ? 1 : 0.6,
            }}
          >
            {/* Icon */}
            <div style={{
              width: 48, height: 48, borderRadius: 10,
              background: '#2a2a4a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, flexShrink: 0,
            }}>
              {item.emoji}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 'bold', fontSize: 15, color: '#fff' }}>
                {item.name}
              </div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                {item.description}
              </div>
            </div>

            {/* Buy button */}
            <button
              onClick={() => handleBuy(item)}
              disabled={!item.canAfford}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                background: item.canAfford ? '#48BB78' : '#333',
                color: item.canAfford ? '#000' : '#555',
                fontSize: 13,
                fontWeight: 'bold',
                border: 'none',
                cursor: item.canAfford ? 'pointer' : 'not-allowed',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {item.costType === 'gems' ? '💎' : '🫙'} {item.cost}
            </button>
          </div>
        ))}
      </div>

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
