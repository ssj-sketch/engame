import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { BALANCE } from '../data/gameBalance';

const ForgeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, weapon, repairWeapon, loadFromStorage } = useGameStore();
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleRepair = (type: 'basic' | 'full' | 'enhanced') => {
    const success = repairWeapon(type);
    if (success) {
      setFeedback('✅ Weapon repaired!');
    } else {
      setFeedback('❌ Not enough resources!');
    }
    setTimeout(() => setFeedback(null), 2000);
  };

  const repairOptions = [
    {
      type: 'basic' as const,
      label: 'Basic Repair',
      description: `Restore +${BALANCE.REPAIR_BASIC.restore}% durability`,
      cost: `🫙 ${BALANCE.REPAIR_BASIC.costJams}`,
      affordable: user.totalJams >= BALANCE.REPAIR_BASIC.costJams,
    },
    {
      type: 'full' as const,
      label: 'Full Repair',
      description: 'Restore to 100% durability',
      cost: `🫙 ${BALANCE.REPAIR_FULL.costJams}`,
      affordable: user.totalJams >= BALANCE.REPAIR_FULL.costJams,
    },
    {
      type: 'enhanced' as const,
      label: 'Enhanced Repair',
      description: `100% + Attack +${BALANCE.REPAIR_ENHANCED.bonusAttack}`,
      cost: `🫙 ${BALANCE.REPAIR_ENHANCED.costJams} + 💎 ${BALANCE.REPAIR_ENHANCED.costGems}`,
      affordable: user.totalJams >= BALANCE.REPAIR_ENHANCED.costJams && user.totalGems >= BALANCE.REPAIR_ENHANCED.costGems,
    },
  ];

  const durabilityColor = weapon.durability > 50 ? '#48BB78' : weapon.durability > 25 ? '#D69E2E' : '#E53E3E';

  return (
    <div style={{ width: '100%', maxWidth: 420, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={() => navigate('/')} style={{ padding: '8px 16px', borderRadius: 8, background: '#333', color: '#fff', fontSize: 14, border: 'none', cursor: 'pointer', marginRight: 16 }}>← Back</button>
        <h2 style={{ color: '#D69E2E', margin: 0 }}>⚒️ Forge</h2>
      </div>

      {/* Resources */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, justifyContent: 'center' }}>
        <div style={{ padding: '8px 16px', background: '#1a1a3a', borderRadius: 8 }}>💎 {user.totalGems}</div>
        <div style={{ padding: '8px 16px', background: '#1a1a3a', borderRadius: 8 }}>🫙 {user.totalJams}</div>
      </div>

      {/* Current weapon */}
      <div style={{ background: '#1a1a3a', borderRadius: 16, padding: 20, marginBottom: 20, textAlign: 'center', border: '1px solid #333' }}>
        <span style={{ fontSize: 48 }}>⚔️</span>
        <h3 style={{ color: '#fff', margin: '8px 0' }}>{weapon.name}</h3>
        <div style={{ fontSize: 14, color: '#aaa', marginBottom: 8 }}>Attack Power: {weapon.attackPower}</div>

        {/* Durability bar */}
        <div style={{ marginBottom: 4, fontSize: 14, color: durabilityColor }}>
          Durability: {weapon.durability}%
        </div>
        <div style={{ width: '100%', height: 12, background: '#333', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ width: `${weapon.durability}%`, height: '100%', background: durabilityColor, borderRadius: 6, transition: 'all 0.3s' }} />
        </div>
      </div>

      {/* Repair options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {repairOptions.map((opt) => (
          <button
            key={opt.type}
            onClick={() => handleRepair(opt.type)}
            disabled={!opt.affordable}
            style={{
              padding: 14,
              borderRadius: 12,
              background: opt.affordable ? '#2a2a4a' : '#1a1a2a',
              border: `1px solid ${opt.affordable ? '#4A90D9' : '#333'}`,
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
