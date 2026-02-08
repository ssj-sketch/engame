import React, { useState, useEffect, useCallback } from 'react';
import { useSpeechRecognition, matchWord } from '../hooks/useSpeechRecognition';
import { BALANCE } from '../data/gameBalance';
import { getMonsterDisplayName } from '../data/monsterTypes';

interface MonsterEncounterData {
  monsterId: number;
  wordId: number;
  word: string;
  type: string;
  hintDropRate: number;
}

interface Props {
  monsterData: MonsterEncounterData;
  collectedHints: string[];
  weaponDurability: number;
  weaponEmoji?: string;
  weaponName?: string;
  onAnswer: (monsterId: number, correct: boolean, attempts: number) => void;
  onAttack: (monsterId: number) => void;
  onClose: () => void;
}

export const MonsterQuizOverlay: React.FC<Props> = ({
  monsterData,
  collectedHints,
  weaponDurability,
  weaponEmoji = '⚔️',
  weaponName = '무기',
  onAnswer,
  onAttack,
  onClose,
}) => {
  const [mode, setMode] = useState<'quiz' | 'attack'>('quiz');
  const [attempts, setAttempts] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [sttDisplay, setSttDisplay] = useState<{ text: string; isCorrect: boolean | null } | null>(null);
  const [resolved, setResolved] = useState(false);

  const {
    isListening, transcript, interimTranscript,
    allAlternatives, startListening, isSupported, reset,
  } = useSpeechRecognition();

  const speakWord = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(monsterData.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
    return utterance;
  }, [monsterData.word]);

  // Auto: start listening after overlay animation finishes (no TTS)
  useEffect(() => {
    if (!isSupported) return;
    const delayTimer = setTimeout(() => {
      startListening();
    }, 800);
    return () => clearTimeout(delayTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monsterData.monsterId]);

  // Evaluate voice transcript using enhanced matchWord
  useEffect(() => {
    if (!transcript || resolved) return;

    const result = matchWord(monsterData.word, allAlternatives, transcript);

    // Show STT result with animation
    setSttDisplay({ text: result.bestMatch, isCorrect: result.matched });

    if (result.matched) {
      setResolved(true);
      setFeedback('✅ 정답!');
      setTimeout(() => {
        onAnswer(monsterData.monsterId, true, attempts);
      }, 1200);
    } else {
      setFeedback('❌ 다시 시도하세요!');
      setTimeout(() => {
        setSttDisplay(null);
      }, 2000);
      setAttempts(a => a + 1);
      reset();
    }
  }, [transcript, monsterData, attempts, onAnswer, reset, allAlternatives, resolved]);

  const handleTextSubmit = () => {
    const result = matchWord(monsterData.word, [], textInput);

    if (result.matched) {
      setFeedback('✅ 정답!');
      setTimeout(() => {
        onAnswer(monsterData.monsterId, true, attempts);
      }, 800);
    } else {
      setFeedback(`❌ "${textInput.toLowerCase().trim()}" - 다시 시도하세요!`);
      setAttempts(a => a + 1);
      setTextInput('');
    }
  };

  const handleAttack = () => {
    if (weaponDurability <= BALANCE.WEAPON_BROKEN_THRESHOLD) {
      setFeedback('⚠️ 무기가 부서졌어요! 대장간에서 수리하세요.');
      return;
    }
    setFeedback('⚔️ 처치! 퀴즈를 건너뜁니다...');
    setTimeout(() => {
      onAttack(monsterData.monsterId);
    }, 600);
  };

  // Render word with hint highlights - bigger, game-like style
  const renderWordDisplay = () => {
    return monsterData.word.split('').map((letter, i) => {
      const isHinted = collectedHints.includes(letter);
      return (
        <span key={i} className={`word-letter ${isHinted ? 'hinted' : 'hidden'}`}>
          {isHinted ? letter.toUpperCase() : '?'}
        </span>
      );
    });
  };

  return (
    <div className="overlay-backdrop">
      <div className="overlay-panel monster-quiz-panel">

        {/* Monster image display */}
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{
            display: 'inline-block',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            padding: 8,
          }}>
            <img
              src={`${process.env.PUBLIC_URL}/assets/monsters/${monsterData.type}.png`}
              alt={getMonsterDisplayName(monsterData.type)}
              style={{
                width: 96,
                height: 96,
                imageRendering: 'pixelated',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
              }}
            />
          </div>
          <div style={{ fontSize: 14, color: '#ccc', marginTop: 4, fontWeight: 'bold' }}>
            {getMonsterDisplayName(monsterData.type)}
          </div>
        </div>

        {/* Word display - centered, prominent */}
        <div className="quiz-word-area">
          <div className="quiz-word-label">Say the word!</div>
          <div className="quiz-word-letters">{renderWordDisplay()}</div>
          <button onClick={speakWord} className="speak-btn-game">
            🔊
          </button>
        </div>

        {/* STT speech bubble - floating above word */}
        {sttDisplay && (
          <div className={`stt-result-badge ${sttDisplay.isCorrect ? 'stt-correct' : 'stt-wrong'}`}>
            "{sttDisplay.text}"
          </div>
        )}

        {/* Interim transcript - real-time display */}
        {isListening && interimTranscript && !sttDisplay && (
          <div className="stt-interim">
            🎙️ {interimTranscript}
          </div>
        )}

        {/* Mode tabs */}
        <div className="mode-tabs">
          <button
            className={`mode-tab ${mode === 'quiz' ? 'active' : ''}`}
            onClick={() => setMode('quiz')}
          >🎤 음성 / 입력</button>
          <button
            className={`mode-tab ${mode === 'attack' ? 'active' : ''}`}
            onClick={() => setMode('attack')}
          >⚔️ 공격</button>
        </div>

        {/* Quiz mode */}
        {mode === 'quiz' && (
          <div className="quiz-section">
            {isSupported ? (
              <button
                className={`mic-btn ${isListening ? 'listening' : ''}`}
                onClick={startListening}
                disabled={isListening}
              >
                {isListening ? '🎙️ 듣는 중...' : '🎤 눌러서 말하기'}
              </button>
            ) : null}

            {/* Live listening indicator */}
            {isListening && !interimTranscript && (
              <div className="stt-listening-indicator">
                <span className="stt-wave">🔊</span>
                <span style={{ color: '#4A90D9', fontSize: 14 }}>음성을 인식하고 있습니다...</span>
              </div>
            )}

            <div className="text-input-section">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                placeholder="단어를 입력하세요..."
                className="quiz-text-input"
                autoFocus={!isSupported}
              />
              <button onClick={handleTextSubmit} className="submit-btn">확인</button>
            </div>
          </div>
        )}

        {/* Attack mode - skip quiz by defeating monster */}
        {mode === 'attack' && (
          <div className="attack-section">
            <div style={{ fontSize: 14, color: '#aaa', marginBottom: 8 }}>
              {weaponEmoji} {weaponName} · 내구도 {weaponDurability}%
            </div>
            <button
              onClick={handleAttack}
              className="attack-action-btn"
              disabled={weaponDurability <= 0}
            >
              {weaponEmoji} 공격하여 처치
            </button>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
              내구도 -{BALANCE.ATTACK_DURABILITY_COST} | 보석 보상 없음
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="quiz-feedback">{feedback}</div>
        )}

        {/* Collected hints - shown only in quiz mode */}
        {mode === 'quiz' && collectedHints.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: '#FFD700' }}>
            힌트: {collectedHints.map(h => h.toUpperCase()).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};
