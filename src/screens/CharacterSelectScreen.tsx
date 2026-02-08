import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { CharacterType } from '../services/storageService';

const CHARACTERS: { id: CharacterType; name: string; nameKo: string; desc: string; color: string }[] = [
  { id: 'knight', name: 'Knight', nameKo: '기사', desc: '용감한 검과 방패의 전사', color: '#E74C3C' },
  { id: 'archer', name: 'Archer', nameKo: '궁수', desc: '빠르고 정확한 숲의 사냥꾼', color: '#2ECC71' },
  { id: 'viking', name: 'Viking', nameKo: '바이킹', desc: '강력한 망치의 북방 전사', color: '#E67E22' },
];

const CharacterSelectScreen: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCharacter, selectCharacter, loadFromStorage } = useGameStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleSelect = (charId: CharacterType) => {
    selectCharacter(charId);
  };

  const handleConfirm = () => {
    navigate('/map');
  };

  return (
    <div style={{
      width: '100%', maxWidth: 500, height: '100vh',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', padding: '24px 20px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              position: 'absolute', left: 20,
              padding: '6px 14px', borderRadius: 8,
              background: '#333', color: '#fff', fontSize: 13,
              border: 'none', cursor: 'pointer',
            }}
          >
            ← 뒤로
          </button>
          <h2 style={{ color: '#FFD700', margin: 0, fontSize: 20 }}>
            ⚔️ 캐릭터 선택
          </h2>
        </div>
        <p style={{ color: '#888', fontSize: 13, margin: 0 }}>
          함께 모험할 영웅을 선택하세요!
        </p>
      </div>

      {/* Character cards */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        gap: 16, justifyContent: 'center',
      }}>
        {CHARACTERS.map(char => {
          const isSelected = selectedCharacter === char.id;
          return (
            <button
              key={char.id}
              onClick={() => handleSelect(char.id)}
              style={{
                width: '100%', padding: '16px 20px',
                borderRadius: 20,
                background: isSelected
                  ? `linear-gradient(135deg, ${char.color}30 0%, ${char.color}15 100%)`
                  : '#1a1a3a',
                border: `3px solid ${isSelected ? char.color : '#333'}`,
                color: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.3s',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isSelected ? `0 0 20px ${char.color}40` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Character image */}
                <div style={{
                  width: 80, height: 80, flexShrink: 0,
                  borderRadius: 16,
                  background: isSelected
                    ? `radial-gradient(circle, ${char.color}20 0%, transparent 70%)`
                    : '#0a0a1a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${isSelected ? char.color + '60' : '#222'}`,
                }}>
                  <img
                    src={`${process.env.PUBLIC_URL}/assets/characters/${char.id}.png`}
                    alt={char.name}
                    style={{
                      width: 64, height: 64,
                      filter: isSelected ? 'drop-shadow(0 2px 8px rgba(255,255,255,0.3))' : 'none',
                    }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 'bold', fontSize: 18, marginBottom: 4,
                    color: isSelected ? char.color : '#fff',
                  }}>
                    {char.nameKo}
                    <span style={{ fontSize: 13, color: '#888', fontWeight: 'normal', marginLeft: 8 }}>
                      {char.name}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#aaa' }}>
                    {char.desc}
                  </div>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: char.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0,
                  }}>
                    ✓
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        style={{
          width: '100%', padding: '16px',
          borderRadius: 16, marginTop: 20,
          background: 'linear-gradient(135deg, #4A90D9 0%, #357ABD 100%)',
          color: '#fff', fontSize: 18, fontWeight: 'bold',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(74, 144, 217, 0.4)',
        }}
      >
        🗺️ 모험 시작!
      </button>
    </div>
  );
};

export default CharacterSelectScreen;
