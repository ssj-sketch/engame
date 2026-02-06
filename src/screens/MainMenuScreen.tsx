import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

const MainMenuScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, loadFromStorage } = useGameStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <div style={{
      width: '100%',
      maxWidth: 400,
      padding: 24,
      textAlign: 'center',
    }}>
      {/* Title */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 36, fontWeight: 'bold', color: '#FFD700' }}>
          ✨ Phonics
        </div>
        <div style={{ fontSize: 32, fontWeight: 'bold', color: '#fff' }}>
          Adventure
        </div>
      </div>

      {/* Character */}
      <div style={{
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: 'rgba(74, 144, 217, 0.2)',
        border: '2px solid #4A90D9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 12px',
      }}>
        <span style={{ fontSize: 56 }}>🧙‍♂️</span>
      </div>
      <div style={{ color: '#aaa', fontSize: 14, marginBottom: 32 }}>
        Lv.{user.level} | 💎 {user.totalGems} | 🫙 {user.totalJams}
      </div>

      {/* Menu Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={() => navigate('/map')}
          style={{
            padding: '16px 0',
            borderRadius: 28,
            background: '#4A90D9',
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          🎮 Game Start
        </button>

        <button
          onClick={() => navigate('/inventory')}
          style={{
            padding: '14px 0',
            borderRadius: 28,
            background: '#2a2a4a',
            color: '#fff',
            fontSize: 16,
            border: '1px solid #444',
            cursor: 'pointer',
          }}
        >
          🎒 Inventory
        </button>

        <button
          onClick={() => navigate('/forge')}
          style={{
            padding: '14px 0',
            borderRadius: 28,
            background: '#2a2a4a',
            color: '#fff',
            fontSize: 16,
            border: '1px solid #444',
            cursor: 'pointer',
          }}
        >
          ⚒️ Forge
        </button>

        <button
          onClick={() => navigate('/report')}
          style={{
            padding: '14px 0',
            borderRadius: 28,
            background: '#2a2a4a',
            color: '#fff',
            fontSize: 16,
            border: '1px solid #444',
            cursor: 'pointer',
          }}
        >
          📊 Learning Report
        </button>
      </div>
    </div>
  );
};

export default MainMenuScreen;
