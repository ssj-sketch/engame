import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

const CHAR_NAMES: Record<string, string> = {
  knight: '기사',
  archer: '궁수',
  viking: '바이킹',
};

const MainMenuScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, selectedCharacter, loadFromStorage } = useGameStore();

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
          ✨ 파닉스
        </div>
        <div style={{ fontSize: 32, fontWeight: 'bold', color: '#fff' }}>
          어드벤처
        </div>
      </div>

      {/* Character - clickable to change */}
      <button
        onClick={() => navigate('/character')}
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(74, 144, 217, 0.2)',
          border: '2px solid #4A90D9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 8px',
          cursor: 'pointer',
          transition: 'all 0.3s',
          position: 'relative',
        }}
      >
        <img
          src={`${process.env.PUBLIC_URL}/assets/characters/${selectedCharacter}.png`}
          alt={selectedCharacter}
          style={{ width: 80, height: 80 }}
        />
        <div style={{
          position: 'absolute', bottom: -4, right: -4,
          width: 28, height: 28, borderRadius: '50%',
          background: '#4A90D9', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, border: '2px solid #0a0a1a',
        }}>
          ✏️
        </div>
      </button>
      <div style={{ color: '#ccc', fontSize: 14, marginBottom: 4 }}>
        {CHAR_NAMES[selectedCharacter] || selectedCharacter}
      </div>
      <div style={{ color: '#aaa', fontSize: 13, marginBottom: 28 }}>
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
          🎮 게임 시작
        </button>

        <button
          onClick={() => navigate('/character')}
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
          ⚔️ 캐릭터 선택
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
          🎒 인벤토리
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
          ⚒️ 대장간
        </button>

        <button
          onClick={() => navigate('/shop')}
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
          🛒 상점
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
          📊 학습 리포트
        </button>
      </div>
    </div>
  );
};

export default MainMenuScreen;
