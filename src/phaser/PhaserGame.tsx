import React, { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { useParams, useNavigate } from 'react-router-dom';
import { createGameConfig } from './gameConfig';
import { EventBridge, EVENTS } from './EventBridge';
import { useGameStore } from '../store/gameStore';
import { MonsterQuizOverlay } from '../overlays/MonsterQuizOverlay';
import { TreasureBoxOverlay } from '../overlays/TreasureBoxOverlay';
import { StageCompleteOverlay } from '../overlays/StageCompleteOverlay';
import { BALANCE } from '../data/gameBalance';
import monstersData from '../data/monsters.json';
import wordsData from '../data/words.json';
import stagesData from '../data/stages.json';
import { MonsterData, Word, Stage } from '../types/game';
import '../styles/overlays.css';

type OverlayType = 'none' | 'monster-quiz' | 'treasure' | 'stage-complete' | 'pause';

interface MonsterEncounterData {
  monsterId: number;
  wordId: number;
  word: string;
  type: string;
  hintDropRate: number;
}

interface TreasureEncounterData {
  stageId: number;
  word: string;
}

export const PhaserGame: React.FC = () => {
  const { unitId, stageId } = useParams<{ unitId: string; stageId: string }>();
  const navigate = useNavigate();
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [overlay, setOverlay] = useState<OverlayType>('none');
  const [monsterData, setMonsterData] = useState<MonsterEncounterData | null>(null);
  const [treasureData, setTreasureData] = useState<TreasureEncounterData | null>(null);
  const [stageScore, setStageScore] = useState(0);
  const [sessionGems, setSessionGems] = useState(0);
  const [sessionJams, setSessionJams] = useState(0);

  const store = useGameStore();
  const stageIdNum = parseInt(stageId || '1', 10);

  useEffect(() => {
    if (!containerRef.current) return;

    store.loadFromStorage();
    store.startSession(stageIdNum);

    const config = createGameConfig(containerRef.current);
    gameRef.current = new Phaser.Game(config);

    const handleSceneReady = () => {
      const allMonsters = monstersData as MonsterData[];
      const allWords = wordsData as Word[];
      const stageMonsters = allMonsters.filter(m => m.stageId === stageIdNum);

      // Pick a treasure word from the stage's words
      const stageWordIds = stageMonsters.map(m => m.wordId);
      const stageWords = allWords.filter(w => stageWordIds.includes(w.id));
      const treasureWord = stageWords.length > 0
        ? stageWords[Math.floor(Math.random() * stageWords.length)].word
        : 'cat';

      const game = gameRef.current;
      if (game) {
        game.scene.start('GamePlay', {
          stageId: stageIdNum,
          monsters: stageMonsters,
          treasureWord,
        });
      }

      // Update HUD after a short delay to ensure UIScene is created
      setTimeout(() => {
        const currentState = useGameStore.getState();
        EventBridge.emit('hud:update', {
          gems: currentState.user.totalGems,
          jams: currentState.user.totalJams,
          durability: currentState.weapon.durability,
        });
      }, 100);
    };

    const handleMonsterEncounter = (data: MonsterEncounterData) => {
      setMonsterData(data);
      setOverlay('monster-quiz');
    };

    const handleTreasureEncounter = (data: TreasureEncounterData) => {
      setTreasureData(data);
      setOverlay('treasure');
    };

    const handleStageComplete = () => {
      // Use getState() to read the latest store state, avoiding stale closure
      const currentState = useGameStore.getState();
      const sessionLogs = currentState.session.sessionQuizLogs;
      const totalMonsters = (monstersData as MonsterData[]).filter(m => m.stageId === stageIdNum).length;
      // Only count monster quizzes (exclude treasure box spelling quizzes)
      const monsterLogs = sessionLogs.filter(q => q.monsterId !== 0);
      const correctFirst = monsterLogs.filter(q => q.isCorrect && q.attempts === 1).length;
      const score = totalMonsters > 0 ? Math.round((correctFirst / totalMonsters) * 100) : 100;
      setStageScore(score);
      currentState.completeStage(stageIdNum, score);
      setOverlay('stage-complete');
    };

    const handleHintCollected = (data: { letter: string }) => {
      store.addHint(data.letter);
    };

    EventBridge.on(EVENTS.SCENE_READY, handleSceneReady);
    EventBridge.on(EVENTS.MONSTER_ENCOUNTER, handleMonsterEncounter);
    EventBridge.on(EVENTS.TREASURE_ENCOUNTER, handleTreasureEncounter);
    EventBridge.on(EVENTS.STAGE_COMPLETE, handleStageComplete);
    EventBridge.on(EVENTS.HINT_COLLECTED, handleHintCollected);

    return () => {
      EventBridge.off(EVENTS.SCENE_READY, handleSceneReady);
      EventBridge.off(EVENTS.MONSTER_ENCOUNTER, handleMonsterEncounter);
      EventBridge.off(EVENTS.TREASURE_ENCOUNTER, handleTreasureEncounter);
      EventBridge.off(EVENTS.STAGE_COMPLETE, handleStageComplete);
      EventBridge.off(EVENTS.HINT_COLLECTED, handleHintCollected);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageIdNum]);

  const handleQuizAnswer = useCallback((monsterId: number, correct: boolean, attempts: number) => {
    const monster = (monstersData as MonsterData[]).find(m => m.id === monsterId);
    if (!monster) return;

    const currentState = useGameStore.getState();
    currentState.recordQuiz({
      wordId: monster.wordId,
      monsterId,
      quizType: 'voice',
      isCorrect: correct,
      attempts,
      hintsUsed: 0,
      timeSpentMs: 0,
    });

    if (correct) {
      // Random gem reward
      const gemReward = BALANCE.STAGE_CLEAR_GEMS_MIN +
        Math.floor(Math.random() * (BALANCE.STAGE_CLEAR_GEMS_MAX - BALANCE.STAGE_CLEAR_GEMS_MIN + 1));
      currentState.addGems(gemReward);
      currentState.defeatMonster(monsterId);
      setSessionGems(prev => prev + gemReward);

      const updatedState = useGameStore.getState();
      EventBridge.emit(EVENTS.QUIZ_ANSWERED, { monsterId, correct: true });
      EventBridge.emit('hud:update', { gems: updatedState.user.totalGems, durability: updatedState.weapon.durability });
      setOverlay('none');
    }
  }, []);

  const handleAttack = useCallback((monsterId: number) => {
    const monster = (monstersData as MonsterData[]).find(m => m.id === monsterId);
    if (!monster) return;

    const currentState = useGameStore.getState();
    if (currentState.weapon.durability <= BALANCE.WEAPON_BROKEN_THRESHOLD) {
      return;
    }

    // Consume durability
    currentState.updateDurability(-BALANCE.ATTACK_DURABILITY_COST);

    // Record as skipped quiz (not correct, so no score contribution)
    currentState.recordQuiz({
      wordId: monster.wordId,
      monsterId,
      quizType: 'voice',
      isCorrect: false,
      attempts: 0,
      hintsUsed: 0,
      timeSpentMs: 0,
    });

    currentState.defeatMonster(monsterId);

    // Defeat monster in Phaser scene (no gem reward for skipping)
    EventBridge.emit(EVENTS.QUIZ_ANSWERED, { monsterId, correct: true });

    const updatedState = useGameStore.getState();
    EventBridge.emit('hud:update', { durability: updatedState.weapon.durability });
    setOverlay('none');
  }, []);

  const handleTreasureSubmit = useCallback((correct: boolean) => {
    if (correct) {
      const gemReward = BALANCE.TREASURE_GEMS_MIN +
        Math.floor(Math.random() * (BALANCE.TREASURE_GEMS_MAX - BALANCE.TREASURE_GEMS_MIN + 1));
      const jamReward = BALANCE.TREASURE_JAMS_MIN +
        Math.floor(Math.random() * (BALANCE.TREASURE_JAMS_MAX - BALANCE.TREASURE_JAMS_MIN + 1));

      const currentState = useGameStore.getState();
      currentState.addGems(gemReward);
      currentState.addJams(jamReward);

      currentState.recordQuiz({
        wordId: 0,
        monsterId: 0,
        quizType: 'spelling',
        isCorrect: true,
        attempts: 1,
        hintsUsed: currentState.session.collectedHints.length,
        timeSpentMs: 0,
      });

      setSessionGems(prev => prev + gemReward);
      setSessionJams(prev => prev + jamReward);

      const updatedState = useGameStore.getState();
      EventBridge.emit(EVENTS.TREASURE_OPENED, { success: true });
      EventBridge.emit('hud:update', {
        gems: updatedState.user.totalGems,
        jams: updatedState.user.totalJams,
      });
      setOverlay('none');
    }
  }, []);

  const handleBackToMap = useCallback(() => {
    useGameStore.getState().clearSession();
    navigate('/map');
  }, [navigate]);

  const handleNextStage = useCallback(() => {
    useGameStore.getState().clearSession();
    const allStages = stagesData as Stage[];
    const currentStage = allStages.find(s => s.id === stageIdNum);
    if (currentStage) {
      const nextStage = allStages.find(s => s.unitId === currentStage.unitId && s.orderNum === currentStage.orderNum + 1);
      if (nextStage) {
        navigate(`/game/${unitId}/${nextStage.id}`);
        return;
      }
    }
    navigate('/map');
  }, [stageIdNum, unitId, navigate]);

  return (
    <div className="game-wrapper">
      <div ref={containerRef} className="phaser-container" />

      {/* Mobile controls */}
      <div className="mobile-controls">
        <div className="dpad">
          <button
            className="dpad-btn dpad-left"
            onTouchStart={() => EventBridge.emit(EVENTS.CONTROL_LEFT)}
            onTouchEnd={() => EventBridge.emit(EVENTS.CONTROL_STOP)}
            onMouseDown={() => EventBridge.emit(EVENTS.CONTROL_LEFT)}
            onMouseUp={() => EventBridge.emit(EVENTS.CONTROL_STOP)}
          >◀</button>
          <button
            className="dpad-btn dpad-right"
            onTouchStart={() => EventBridge.emit(EVENTS.CONTROL_RIGHT)}
            onTouchEnd={() => EventBridge.emit(EVENTS.CONTROL_STOP)}
            onMouseDown={() => EventBridge.emit(EVENTS.CONTROL_RIGHT)}
            onMouseUp={() => EventBridge.emit(EVENTS.CONTROL_STOP)}
          >▶</button>
        </div>
        <button
          className="action-btn attack-btn"
          onClick={() => EventBridge.emit(EVENTS.CONTROL_ATTACK)}
        >⚔️</button>
      </div>

      {/* Overlays */}
      {overlay === 'monster-quiz' && monsterData && (
        <MonsterQuizOverlay
          monsterData={monsterData}
          collectedHints={store.session.collectedHints}
          weaponDurability={store.weapon.durability}
          onAnswer={handleQuizAnswer}
          onAttack={handleAttack}
          onClose={() => setOverlay('none')}
        />
      )}

      {overlay === 'treasure' && treasureData && (
        <TreasureBoxOverlay
          word={treasureData.word}
          hints={store.session.collectedHints}
          onSubmit={handleTreasureSubmit}
          onClose={() => setOverlay('none')}
        />
      )}

      {overlay === 'stage-complete' && (
        <StageCompleteOverlay
          score={stageScore}
          gems={sessionGems}
          jams={sessionJams}
          onBackToMap={handleBackToMap}
          onNextStage={handleNextStage}
        />
      )}

      {/* Back button */}
      <button className="back-btn" onClick={handleBackToMap}>← Back</button>
    </div>
  );
};
