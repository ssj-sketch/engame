import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

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

const InventoryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, weapon, inventory, session, loadFromStorage } = useGameStore();
  const [tab, setTab] = useState<Tab>('gems');

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <div style={{ width: '100%', maxWidth: 420, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={() => navigate('/')} style={{ padding: '8px 16px', borderRadius: 8, background: '#333', color: '#fff', fontSize: 14, border: 'none', cursor: 'pointer', marginRight: 16 }}>← Back</button>
        <h2 style={{ color: '#4A90D9', margin: 0 }}>🎒 Inventory</h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {(['gems', 'jams', 'weapon', 'hints'] as Tab[]).map(t => (
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
            {t === 'gems' ? '💎' : t === 'jams' ? '🫙' : t === 'weapon' ? '⚔️' : '📝'}
            {' '}{t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'gems' && (
        <div>
          <div style={{ textAlign: 'center', fontSize: 24, marginBottom: 16 }}>
            Total: 💎 {user.totalGems}
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

      {tab === 'jams' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🫙</div>
          <div style={{ fontSize: 28, color: '#FF69B4', fontWeight: 'bold' }}>{user.totalJams}</div>
          <div style={{ fontSize: 14, color: '#888', marginTop: 8 }}>
            Used for weapon repairs at the Forge
          </div>
        </div>
      )}

      {tab === 'weapon' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>⚔️</div>
          <h3 style={{ color: '#fff', margin: '8px 0' }}>{weapon.name}</h3>
          <div style={{ fontSize: 14, color: '#aaa' }}>
            Attack: {weapon.attackPower} | Durability: {weapon.durability}%
          </div>
          <div style={{ width: '60%', height: 10, background: '#333', borderRadius: 5, overflow: 'hidden', margin: '12px auto' }}>
            <div style={{
              width: `${weapon.durability}%`,
              height: '100%',
              background: weapon.durability > 50 ? '#48BB78' : weapon.durability > 25 ? '#D69E2E' : '#E53E3E',
              borderRadius: 5,
            }} />
          </div>
        </div>
      )}

      {tab === 'hints' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#aaa', marginBottom: 12 }}>
            Hints collected in current session
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
              No hints collected yet. Play a stage to collect hints!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryScreen;
