import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import unitsData from '../data/units.json';
import stagesData from '../data/stages.json';
import { Unit, Stage } from '../types/game';

const MapSelectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { progress, loadFromStorage } = useGameStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const units = unitsData as Unit[];
  const stages = stagesData as Stage[];

  const isUnitUnlocked = (unit: Unit): boolean => {
    if (unit.orderNum === 1) return true;
    // Previous unit must have at least 1 stage completed
    const prevUnit = units.find(u => u.orderNum === unit.orderNum - 1);
    if (!prevUnit) return true;
    const prevStages = stages.filter(s => s.unitId === prevUnit.id);
    return prevStages.some(s => progress[s.id]?.isCompleted);
  };

  const getUnitStars = (unitId: number): number => {
    const unitStages = stages.filter(s => s.unitId === unitId);
    return unitStages.reduce((total, s) => total + (progress[s.id]?.stars || 0), 0);
  };

  const getUnitMaxStars = (unitId: number): number => {
    return stages.filter(s => s.unitId === unitId).length * 3;
  };

  const getFirstIncompleteStage = (unitId: number): Stage | undefined => {
    const unitStages = stages.filter(s => s.unitId === unitId).sort((a, b) => a.orderNum - b.orderNum);
    return unitStages.find(s => !progress[s.id]?.isCompleted) || unitStages[0];
  };

  return (
    <div style={{ width: '100%', maxWidth: 500, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            background: '#333',
            color: '#fff',
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
            marginRight: 16,
          }}
        >
          ← Back
        </button>
        <h2 style={{ color: '#FFD700', margin: 0 }}>🗺️ Map Selection</h2>
      </div>

      {/* Unit path */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        {units.map((unit, index) => {
          const unlocked = isUnitUnlocked(unit);
          const stars = getUnitStars(unit.id);
          const maxStars = getUnitMaxStars(unit.id);

          return (
            <React.Fragment key={unit.id}>
              {index > 0 && (
                <div style={{
                  width: 2,
                  height: 20,
                  background: unlocked ? '#4A90D9' : '#333',
                }}/>
              )}
              <button
                onClick={() => {
                  if (!unlocked) return;
                  const stage = getFirstIncompleteStage(unit.id);
                  if (stage) navigate(`/game/${unit.id}/${stage.id}`);
                }}
                disabled={!unlocked}
                style={{
                  width: '100%',
                  maxWidth: 360,
                  padding: 16,
                  borderRadius: 16,
                  background: unlocked ? '#1a1a3a' : '#111',
                  border: `2px solid ${unlocked ? '#4A90D9' : '#333'}`,
                  color: unlocked ? '#fff' : '#555',
                  cursor: unlocked ? 'pointer' : 'not-allowed',
                  textAlign: 'left',
                  opacity: unlocked ? 1 : 0.5,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 36 }}>
                    {unlocked ? unit.emoji : '🔒'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>
                      Unit {unit.orderNum}: {unit.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#888' }}>
                      {unit.phonicsFocus}
                    </div>
                    <div style={{ fontSize: 13, color: '#FFD700', marginTop: 4 }}>
                      {'⭐'.repeat(Math.min(stars, 3))}{' '}
                      <span style={{ color: '#666' }}>{stars}/{maxStars}</span>
                    </div>
                  </div>
                  {unlocked && (
                    <span style={{ fontSize: 20, color: '#4A90D9' }}>▶</span>
                  )}
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default MapSelectionScreen;
