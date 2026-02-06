import React from 'react';
import { BALANCE } from '../data/gameBalance';

interface Props {
  score: number;
  gems: number;
  jams: number;
  onBackToMap: () => void;
  onNextStage: () => void;
}

export const StageCompleteOverlay: React.FC<Props> = ({ score, gems, jams, onBackToMap, onNextStage }) => {
  const stars = score >= BALANCE.STAR_THREE ? 3
    : score >= BALANCE.STAR_TWO ? 2
    : score >= BALANCE.STAR_ONE ? 1 : 0;

  return (
    <div className="overlay-backdrop">
      <div className="overlay-panel stage-complete-panel">
        <h2 style={{ color: '#FFD700', textAlign: 'center', margin: '0 0 12px' }}>
          스테이지 클리어!
        </h2>

        {/* Stars */}
        <div style={{ textAlign: 'center', fontSize: 48, margin: '16px 0' }}>
          {[1, 2, 3].map(i => (
            <span key={i} style={{ opacity: i <= stars ? 1 : 0.2 }}>⭐</span>
          ))}
        </div>

        {/* Score */}
        <div style={{ textAlign: 'center', fontSize: 18, color: '#fff', marginBottom: 16 }}>
          점수: {score}%
        </div>

        {/* Rewards */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          marginBottom: 24,
          padding: '12px 0',
          borderTop: '1px solid #333',
          borderBottom: '1px solid #333',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28 }}>💎</div>
            <div style={{ color: '#FFD700', fontSize: 16 }}>{gems}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28 }}>🫙</div>
            <div style={{ color: '#FF69B4', fontSize: 16 }}>{jams}</div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onBackToMap}
            style={{
              flex: 1,
              padding: '14px 0',
              borderRadius: 12,
              background: '#333',
              color: '#fff',
              fontSize: 16,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            🗺️ 지도
          </button>
          <button
            onClick={onNextStage}
            style={{
              flex: 1,
              padding: '14px 0',
              borderRadius: 12,
              background: '#4A90D9',
              color: '#fff',
              fontSize: 16,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            다음 ▶
          </button>
        </div>
      </div>
    </div>
  );
};
