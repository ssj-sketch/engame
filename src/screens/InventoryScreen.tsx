import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { getWeaponDef, getRarityColor, getRarityLabel, computeEffectiveAttack, getMaxDurability, WEAPON_DEFS } from '../data/weapons';

type Tab = 'gems' | 'jams' | 'weapon' | 'hints';

const GEM_TYPES = [
  { name: 'Ruby', emoji: '🔴' },
  { name: 'Sapphire', emoji: '🔵' },
  { name: 'Emerald', emoji: '🟢' },
  { name: 'Diamond', emoji: '💎' },
  { name: 'Amethyst', emoji: '🟣' },
  { name: 'Topaz', emoji: '🟡' },
  { name: 'Opal', emoji: '⚪' },
  { name: 'Onyx', emoji: '⚫' },
];

const CHAR_ICONS: Record<string, string> = {
  knight: '🛡️',
  archer: '🎯',
  viking: '⛏️',
};

const InventoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, weaponInventory, equippedWeaponId, selectedCharacter, session, inventory, equipWeapon, loadFromStorage } = useGameStore();
  const [tab, setTab] = useState<Tab>('weapon');

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleEquip = (weaponId: number) => {
    if (weaponId !== equippedWeaponId) {
      equipWeapon(weaponId);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 420, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={() => navigate('/')} style={{ padding: '8px 16px', borderRadius: 8, background: '#333', color: '#fff', fontSize: 14, border: 'none', cursor: 'pointer', marginRight: 16 }}>← 뒤로</button>
        <h2 style={{ color: '#4A90D9', margin: 0 }}>🎒 인벤토리</h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {(['weapon', 'gems', 'jams', 'hints'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 8,
              background: tab === t ? '#4A90D9' : '#2a2a4a',
              color: '#fff',
              fontSize: 13,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {t === 'weapon' ? '⚔️' : t === 'gems' ? '💎' : t === 'jams' ? '🫙' : '📝'}
            {' '}{t === 'weapon' ? '무기' : t === 'gems' ? '보석' : t === 'jams' ? '잼' : '힌트'}
          </button>
        ))}
      </div>

      {/* Weapon Tab */}
      {tab === 'weapon' && (
        <div>
          <div style={{ fontSize: 14, color: '#aaa', marginBottom: 12, textAlign: 'center' }}>
            보유 무기 {weaponInventory.length} / {WEAPON_DEFS.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {weaponInventory.map(item => {
              const def = getWeaponDef(item.weaponId);
              if (!def) return null;
              const isEquipped = item.weaponId === equippedWeaponId;
              const rarityColor = getRarityColor(def.rarity);
              const effectiveAtk = computeEffectiveAttack(item, selectedCharacter);
              const maxDur = getMaxDurability(item);
              const durPercent = Math.round((item.durability / maxDur) * 100);
              const durColor = durPercent > 50 ? '#48BB78' : durPercent > 25 ? '#D69E2E' : '#E53E3E';
              const hasBonus = def.characterBonus === selectedCharacter;

              return (
                <button
                  key={item.weaponId}
                  onClick={() => handleEquip(item.weaponId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 14,
                    borderRadius: 12,
                    background: isEquipped ? '#1a2a4a' : '#1a1a3a',
                    border: `2px solid ${isEquipped ? '#4A90D9' : rarityColor + '66'}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    position: 'relative',
                    color: '#fff',
                  }}
                >
                  {/* Emoji */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 8,
                    background: `${rarityColor}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, flexShrink: 0,
                  }}>
                    {def.emoji}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 'bold', fontSize: 15 }}>{def.name}</span>
                      {item.upgradeLevel > 0 && (
                        <span style={{ color: '#FFD700', fontSize: 12 }}>+{item.upgradeLevel}</span>
                      )}
                      {hasBonus && (
                        <span style={{ fontSize: 12, color: rarityColor }}>{CHAR_ICONS[selectedCharacter]}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: rarityColor, marginTop: 2 }}>
                      {getRarityLabel(def.rarity)}
                      {def.specialEffect && ` · ${def.specialEffect.description}`}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 12, color: '#ccc' }}>ATK {effectiveAtk}</span>
                      <div style={{ flex: 1, height: 6, background: '#333', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${durPercent}%`, height: '100%', background: durColor, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 11, color: durColor }}>{item.durability}/{maxDur}</span>
                    </div>
                  </div>

                  {/* Equipped badge */}
                  {isEquipped && (
                    <div style={{
                      position: 'absolute', top: -6, right: -6,
                      background: '#4A90D9', color: '#fff',
                      fontSize: 10, fontWeight: 'bold',
                      padding: '2px 8px', borderRadius: 10,
                    }}>
                      장착중
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Gems Tab */}
      {tab === 'gems' && (
        <div>
          <div style={{ textAlign: 'center', fontSize: 24, marginBottom: 16 }}>
            총: 💎 {user.totalGems}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {GEM_TYPES.map(gem => (
              <div key={gem.name} style={{
                background: '#1a1a3a',
                borderRadius: 12,
                padding: 12,
                textAlign: 'center',
                border: '1px solid #333',
              }}>
                <div style={{ fontSize: 28 }}>{gem.emoji}</div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{gem.name}</div>
                <div style={{ fontSize: 14, color: '#FFD700' }}>
                  {inventory.gems[gem.name.toLowerCase()] || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jams Tab */}
      {tab === 'jams' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🫙</div>
          <div style={{ fontSize: 28, color: '#FF69B4', fontWeight: 'bold' }}>{user.totalJams}</div>
          <div style={{ fontSize: 14, color: '#888', marginTop: 8 }}>
            무기 수리와 강화에 사용됩니다
          </div>
        </div>
      )}

      {/* Hints Tab */}
      {tab === 'hints' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#aaa', marginBottom: 12 }}>
            현재 세션에서 수집한 힌트
          </div>
          {session.collectedHints.length > 0 ? (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {session.collectedHints.map((h, i) => (
                <div key={i} style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#FFD700',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 'bold',
                }}>
                  {h.toUpperCase()}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#555', fontSize: 16, marginTop: 24 }}>
              아직 힌트가 없습니다. 스테이지를 플레이하세요!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryScreen;
