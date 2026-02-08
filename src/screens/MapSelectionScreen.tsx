import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import unitsData from '../data/units.json';
import stagesData from '../data/stages.json';
import { Unit, Stage } from '../types/game';

/* ── 월드(페이지) 정의 ── */
const WORLDS = [
  { id: 1, name: '초원 마을', subtitle: 'CVC 단모음', bg: 'linear-gradient(180deg, #1a3a5c 0%, #0d2137 50%, #1a4a2e 100%)', unitRange: [1, 5], color: '#4A90D9' },
  { id: 2, name: '신비의 숲', subtitle: '블렌드 & 다이그래프', bg: 'linear-gradient(180deg, #2d1b4e 0%, #1a2e1a 50%, #0d2137 100%)', unitRange: [6, 8], color: '#E67E22' },
  { id: 3, name: '마법의 호수', subtitle: 'Silent-e & 이중모음', bg: 'linear-gradient(180deg, #1a3a5c 0%, #1b2d4e 50%, #2e1a4a 100%)', unitRange: [9, 14], color: '#9B59B6' },
  { id: 4, name: '화산 계곡', subtitle: 'R-통제 & 다음절', bg: 'linear-gradient(180deg, #4a1a1a 0%, #2d1b0a 50%, #1a2a3a 100%)', unitRange: [15, 21], color: '#E74C3C' },
  { id: 5, name: '별빛 성', subtitle: '사이트워드', bg: 'linear-gradient(180deg, #1a1a3a 0%, #2a1a4a 50%, #0d1a37 100%)', unitRange: [22, 24], color: '#F39C12' },
];

/* ── S자 경로 노드 위치 ── */
function getNodePositions(count: number, mapW: number, mapH: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const padY = 50;
  const usableH = mapH - padY * 2;

  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0.5;
    const y = mapH - padY - t * usableH;
    const centerX = mapW / 2;
    const amplitude = mapW * 0.28;
    const x = centerX + Math.sin((i + 0.5) * Math.PI) * amplitude;
    positions.push({ x, y });
  }
  return positions;
}

/* ── SVG 곡선 경로 ── */
function buildPath(positions: { x: number; y: number }[]): string {
  if (positions.length < 2) return '';
  let d = `M ${positions[0].x} ${positions[0].y}`;
  for (let i = 1; i < positions.length; i++) {
    const prev = positions[i - 1];
    const curr = positions[i];
    const cpY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${cpY}, ${curr.x} ${cpY}, ${curr.x} ${curr.y}`;
  }
  return d;
}

const MAP_W = 360;
const MAP_H = 440;

/* ────────────────────── */
const MapSelectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { progress, loadFromStorage } = useGameStore();
  const [currentWorld, setCurrentWorld] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  useEffect(() => { loadFromStorage(); }, [loadFromStorage]);

  const units = unitsData as Unit[];
  const stages = stagesData as Stage[];

  /* ── 유틸 ── */
  const isUnitUnlocked = (unit: Unit): boolean => {
    if (unit.orderNum === 1) return true;
    const prev = units.find(u => u.orderNum === unit.orderNum - 1);
    if (!prev) return true;
    return stages.filter(s => s.unitId === prev.id).some(s => progress[s.id]?.isCompleted);
  };

  const isStageUnlocked = (stage: Stage): boolean => {
    const unit = units.find(u => u.id === stage.unitId);
    if (!unit || !isUnitUnlocked(unit)) return false;
    if (stage.orderNum === 1) return true;
    const unitStages = stages.filter(s => s.unitId === stage.unitId);
    const totalStars = unitStages.filter(s => s.orderNum < stage.orderNum)
      .reduce((sum, s) => sum + (progress[s.id]?.stars || 0), 0);
    return totalStars >= stage.requiredStars;
  };

  const getUnitStars = (uid: number) =>
    stages.filter(s => s.unitId === uid).reduce((t, s) => t + (progress[s.id]?.stars || 0), 0);
  const getUnitMaxStars = (uid: number) =>
    stages.filter(s => s.unitId === uid).length * 3;
  const getUnitCompleted = (uid: number) =>
    stages.filter(s => s.unitId === uid && progress[s.id]?.isCompleted).length;
  const getUnitTotal = (uid: number) =>
    stages.filter(s => s.unitId === uid).length;

  const world = WORLDS[currentWorld];
  const worldUnits = units.filter(u => u.orderNum >= world.unitRange[0] && u.orderNum <= world.unitRange[1]);
  const positions = getNodePositions(worldUnits.length, MAP_W, MAP_H);
  const pathD = buildPath(positions);

  /* ===== 스테이지 상세 ===== */
  if (selectedUnit) {
    const unitStages = stages.filter(s => s.unitId === selectedUnit.id).sort((a, b) => a.orderNum - b.orderNum);
    const stars = getUnitStars(selectedUnit.id);
    const maxStars = getUnitMaxStars(selectedUnit.id);
    const stgH = Math.max(MAP_H, unitStages.length * 70 + 120);
    const stgPositions = getNodePositions(unitStages.length, MAP_W, stgH);
    const stgPath = buildPath(stgPositions);

    return (
      <div style={{
        width: '100%', maxWidth: 500, height: '100vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        background: world.bg,
      }}>
        {/* 헤더 */}
        <div style={{
          padding: '10px 14px', flexShrink: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <button onClick={() => setSelectedUnit(null)} style={{
            padding: '5px 10px', borderRadius: 8, background: '#333',
            color: '#fff', fontSize: 13, border: 'none', cursor: 'pointer',
          }}>←</button>
          <span style={{ fontSize: 22 }}>{selectedUnit.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', fontSize: 13, color: '#fff' }}>
              Unit {selectedUnit.orderNum}: {selectedUnit.name}
            </div>
            <div style={{ fontSize: 10, color: '#aaa' }}>
              {selectedUnit.phonicsFocus} · ⭐ {stars}/{maxStars}
            </div>
          </div>
        </div>

        {/* 스테이지 맵 스크롤 */}
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: MAP_W, margin: '0 auto', height: stgH }}>
            <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
              <path d={stgPath} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={14} strokeLinecap="round" />
              <path d={stgPath} fill="none" stroke="#3a3a5a" strokeWidth={10} strokeLinecap="round" />
              <path d={stgPath} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={2} strokeDasharray="6 10" strokeLinecap="round" />
            </svg>

            {unitStages.map((stage, idx) => {
              const pos = stgPositions[idx];
              if (!pos) return null;
              const sp = progress[stage.id];
              const unlocked = isStageUnlocked(stage);
              const completed = sp?.isCompleted || false;
              const stStars = sp?.stars || 0;
              const isRight = idx % 2 === 0;

              return (
                <React.Fragment key={stage.id}>
                  <button
                    onClick={() => unlocked && navigate(`/game/${selectedUnit.id}/${stage.id}`)}
                    disabled={!unlocked}
                    style={{
                      position: 'absolute', left: pos.x - 24, top: pos.y - 24,
                      width: 48, height: 48, borderRadius: '50%',
                      background: completed ? world.color : unlocked ? '#2a2a5a' : '#151520',
                      border: `3px solid ${completed ? '#FFD700' : unlocked ? world.color : '#2a2a3a'}`,
                      color: '#fff', cursor: unlocked ? 'pointer' : 'default',
                      opacity: unlocked ? 1 : 0.35,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, fontWeight: 'bold',
                      boxShadow: completed ? `0 0 14px ${world.color}80` : unlocked ? `0 0 6px ${world.color}30` : 'none',
                      zIndex: 3, transition: 'all 0.3s',
                    }}
                  >
                    {unlocked ? (completed ? '✓' : idx + 1) : '🔒'}
                  </button>
                  <div style={{
                    position: 'absolute',
                    left: isRight ? pos.x + 32 : pos.x - 120,
                    top: pos.y - 14, width: 85,
                    fontSize: 11, color: unlocked ? '#ccc' : '#444',
                    textAlign: isRight ? 'left' : 'right', zIndex: 1,
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  }}>
                    <div style={{ fontWeight: 'bold' }}>{stage.name}</div>
                    <div style={{ marginTop: 1 }}>
                      {[1, 2, 3].map(s => (
                        <span key={s} style={{ fontSize: 10, opacity: stStars >= s ? 1 : 0.2 }}>⭐</span>
                      ))}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ===== 월드맵 메인 ===== */
  return (
    <div style={{
      width: '100%', maxWidth: 500, height: '100vh',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: world.bg, transition: 'background 0.5s',
    }}>
      {/* 상단 바 */}
      <div style={{
        padding: '10px 14px', flexShrink: 0,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <button onClick={() => navigate('/')} style={{
          padding: '5px 10px', borderRadius: 8, background: '#333',
          color: '#fff', fontSize: 13, border: 'none', cursor: 'pointer',
        }}>← 홈</button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: 15, color: '#FFD700' }}>
            🏰 {world.name}
          </div>
          <div style={{ fontSize: 10, color: '#aaa' }}>{world.subtitle}</div>
        </div>
        <div style={{ width: 42 }} />
      </div>

      {/* 월드 인디케이터 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '6px 0', flexShrink: 0 }}>
        {WORLDS.map((w, i) => (
          <button key={w.id} onClick={() => setCurrentWorld(i)} style={{
            width: i === currentWorld ? 22 : 8, height: 8, borderRadius: 4,
            background: i === currentWorld ? w.color : '#444',
            border: 'none', cursor: 'pointer', transition: 'all 0.3s',
          }} />
        ))}
      </div>

      {/* 맵 영역 */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: MAP_W, height: MAP_H }}>
          {/* 배경 장식 */}
          {['🌲', '⭐', '🌿', '✨', '🏔️'].map((e, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: [30, 100, 300, 360, 180][i],
              left: [20, 290, 40, 280, 160][i],
              fontSize: [30, 20, 28, 18, 24][i],
              opacity: 0.08, pointerEvents: 'none',
            }}>{e}</div>
          ))}

          {/* SVG 도로 */}
          <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
            <path d={pathD} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={22} strokeLinecap="round" />
            <path d={pathD} fill="none" stroke="#3a3a5a" strokeWidth={18} strokeLinecap="round" />
            <path d={pathD} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={2} strokeDasharray="8 14" strokeLinecap="round" />
          </svg>

          {/* 유닛 노드 */}
          {worldUnits.map((unit, idx) => {
            const pos = positions[idx];
            if (!pos) return null;
            const unlocked = isUnitUnlocked(unit);
            const st = getUnitStars(unit.id);
            const mx = getUnitMaxStars(unit.id);
            const done = getUnitCompleted(unit.id);
            const total = getUnitTotal(unit.id);
            const allDone = done === total && total > 0;
            const sz = 60;

            return (
              <React.Fragment key={unit.id}>
                <button
                  onClick={() => unlocked && setSelectedUnit(unit)}
                  disabled={!unlocked}
                  style={{
                    position: 'absolute', left: pos.x - sz / 2, top: pos.y - sz / 2,
                    width: sz, height: sz, borderRadius: '50%',
                    background: allDone
                      ? `radial-gradient(circle, ${world.color}, ${world.color}bb)`
                      : unlocked ? 'radial-gradient(circle, #2a2a5a, #1a1a3a)' : '#111',
                    border: `3px solid ${allDone ? '#FFD700' : unlocked ? world.color : '#2a2a3a'}`,
                    cursor: unlocked ? 'pointer' : 'default',
                    opacity: unlocked ? 1 : 0.3,
                    fontSize: unlocked ? 28 : 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: allDone
                      ? `0 0 20px ${world.color}80`
                      : unlocked ? `0 0 10px ${world.color}30` : 'none',
                    zIndex: 3, transition: 'all 0.3s',
                  }}
                >
                  {unlocked ? unit.emoji : '🔒'}
                </button>

                {/* 라벨 */}
                <div style={{
                  position: 'absolute',
                  left: pos.x - 55, top: pos.y + sz / 2 + 2,
                  width: 110, textAlign: 'center',
                  pointerEvents: 'none', zIndex: 2,
                }}>
                  <div style={{
                    fontSize: 11, fontWeight: 'bold',
                    color: unlocked ? '#fff' : '#444',
                    textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                  }}>Unit {unit.orderNum}</div>
                  {unlocked && (
                    <div style={{ marginTop: 1 }}>
                      {[1, 2, 3].map(s => (
                        <span key={s} style={{ fontSize: 9, opacity: st >= s ? 1 : 0.2 }}>⭐</span>
                      ))}
                      <span style={{ fontSize: 9, color: '#888', marginLeft: 2 }}>{st}/{mx}</span>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 16px', flexShrink: 0,
        background: 'rgba(0,0,0,0.5)',
      }}>
        <button
          onClick={() => setCurrentWorld(Math.max(0, currentWorld - 1))}
          disabled={currentWorld === 0}
          style={{
            padding: '8px 16px', borderRadius: 10,
            background: currentWorld > 0 ? '#333' : '#1a1a1a',
            color: currentWorld > 0 ? '#fff' : '#333',
            border: 'none', cursor: currentWorld > 0 ? 'pointer' : 'default',
            fontSize: 14, fontWeight: 'bold',
          }}
        >◀ 이전</button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: world.color, fontWeight: 'bold' }}>World {world.id}</div>
          <div style={{ fontSize: 10, color: '#666' }}>
            {world.unitRange[1] - world.unitRange[0] + 1}개 단원
          </div>
        </div>
        <button
          onClick={() => setCurrentWorld(Math.min(WORLDS.length - 1, currentWorld + 1))}
          disabled={currentWorld === WORLDS.length - 1}
          style={{
            padding: '8px 16px', borderRadius: 10,
            background: currentWorld < WORLDS.length - 1 ? '#333' : '#1a1a1a',
            color: currentWorld < WORLDS.length - 1 ? '#fff' : '#333',
            border: 'none', cursor: currentWorld < WORLDS.length - 1 ? 'pointer' : 'default',
            fontSize: 14, fontWeight: 'bold',
          }}
        >다음 ▶</button>
      </div>
    </div>
  );
};

export default MapSelectionScreen;
