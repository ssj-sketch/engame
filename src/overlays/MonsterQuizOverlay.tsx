import React, { useState, useEffect, useCallback } from 'react';
import { useSpeechRecognition, levenshteinDistance } from '../hooks/useSpeechRecognition';
import { BALANCE } from '../data/gameBalance';

const MONSTER_EMOJI: Record<string, string> = {
  slime: '🟢',
  goblin: '👾',
  dragon: '🐉',
};

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
  onAnswer: (monsterId: number, correct: boolean, attempts: number) => void;
  onAttack: (monsterId: number) => void;
  onClose: () => void;
}

export const MonsterQuizOverlay: React.FC<Props> = ({
  monsterData,
  collectedHints,
  weaponDurability,
  onAnswer,
  onAttack,
  onClose,
}) => {
  const [mode, setMode] = useState<'quiz' | 'attack'>('quiz');
  const [attempts, setAttempts] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [sttDisplay, setSttDisplay] = useState<{ text: string; isCorrect: boolean | null } | null>(null);
  const { isListening, transcript, startListening, isSupported, reset } = useSpeechRecognition();

  const speakWord = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(monsterData.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
    return utterance;
  }, [monsterData.word]);

  // Auto: wait for overlay animation, speak word, then start listening
  useEffect(() => {
    if (!isSupported) return;
    // Wait for overlay slide-up animation to finish (0.3s) + extra pause
    const delayTimer = setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(monsterData.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      utterance.onend = () => {
        // Small delay after TTS finishes before starting STT
        setTimeout(() => {
          startListening();
        }, 300);
      };
      speechSynthesis.speak(utterance);
    }, 800);
    return () => {
      clearTimeout(delayTimer);
      speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monsterData.monsterId]);

  // Evaluate voice transcript
  useEffect(() => {
    if (transcript) {
      const normalized = transcript.toLowerCase().trim();
      const target = monsterData.word.toLowerCase().trim();

      const isCorrect =
        normalized === target ||
        normalized.includes(target) ||
        levenshteinDistance(normalized, target) <= 1;

      // Show STT result with animation
      setSttDisplay({ text: normalized, isCorrect });

      if (isCorrect) {
        setFeedback('✅ 정답!');
        setTimeout(() => {
          onAnswer(monsterData.monsterId, true, attempts);
        }, 1200);
      } else {
        setFeedback(`❌ 다시 시도하세요!`);
        setTimeout(() => {
          setSttDisplay(null);
        }, 2000);
        setAttempts(a => a + 1);
        reset();
      }
    }
  }, [transcript, monsterData, attempts, onAnswer, reset]);

  const handleTextSubmit = () => {
    const normalized = textInput.toLowerCase().trim();
    const target = monsterData.word.toLowerCase().trim();
    const isCorrect = normalized === target || levenshteinDistance(normalized, target) <= 1;

    if (isCorrect) {
      setFeedback('✅ 정답!');
      setTimeout(() => {
        onAnswer(monsterData.monsterId, true, attempts);
      }, 800);
    } else {
      setFeedback(`❌ "${normalized}" - 다시 시도하세요!`);
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

  const emoji = MONSTER_EMOJI[monsterData.type] || '👹';

  // Render word with hint highlights
  const renderWordHints = () => {
    return monsterData.word.split('').map((letter, i) => {
      const isHinted = collectedHints.includes(letter);
      return (
        <span
          key={i}
          style={{
            display: 'inline-block',
            width: 32,
            height: 40,
            lineHeight: '40px',
            textAlign: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: '0 3px',
            borderBottom: '3px solid',
            borderColor: isHinted ? '#FFD700' : '#555',
            color: isHinted ? '#FFD700' : '#888',
          }}
        >
          {isHinted ? letter.toUpperCase() : '_'}
        </span>
      );
    });
  };

  return (
    <div className="overlay-backdrop">
      <div className="overlay-panel monster-quiz-panel">
        {/* Monster display */}
        <div className="monster-display" style={{ position: 'relative' }}>
          <span style={{ fontSize: '64px' }}>{emoji}</span>
          <div style={{ fontSize: '14px', color: '#aaa', marginTop: 4 }}>{monsterData.type}</div>

          {/* STT recognized word - speech bubble */}
          {sttDisplay && (
            <div className={`stt-bubble ${sttDisplay.isCorrect ? 'stt-correct' : 'stt-wrong'}`}>
              <span className="stt-bubble-text">"{sttDisplay.text}"</span>
              <div className="stt-bubble-arrow" />
            </div>
          )}
        </div>

        {/* Word hints */}
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <div style={{ marginBottom: 8, fontSize: 14, color: '#aaa' }}>이 단어를 말하거나 입력하세요:</div>
          <div>{renderWordHints()}</div>
          <button onClick={speakWord} className="speak-btn">🔊 듣기</button>
        </div>

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
            {isListening && (
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
              무기: ⚔️ 내구도 {weaponDurability}%
            </div>
            <button
              onClick={handleAttack}
              className="attack-action-btn"
              disabled={weaponDurability <= 0}
            >
              ⚔️ 공격하여 처치
            </button>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
              내구도 -{BALANCE.ATTACK_DURABILITY_COST}% | 보석 보상 없음
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
