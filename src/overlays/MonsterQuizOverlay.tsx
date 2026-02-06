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
  const { isListening, transcript, startListening, isSupported, reset } = useSpeechRecognition();

  const speakWord = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(monsterData.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  }, [monsterData.word]);

  // Evaluate voice transcript
  useEffect(() => {
    if (transcript) {
      const normalized = transcript.toLowerCase().trim();
      const target = monsterData.word.toLowerCase().trim();

      const isCorrect =
        normalized === target ||
        normalized.includes(target) ||
        levenshteinDistance(normalized, target) <= 1;

      if (isCorrect) {
        setFeedback('✅ Correct!');
        setTimeout(() => {
          onAnswer(monsterData.monsterId, true, attempts);
        }, 800);
      } else {
        setFeedback(`❌ "${normalized}" - Try again!`);
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
      setFeedback('✅ Correct!');
      setTimeout(() => {
        onAnswer(monsterData.monsterId, true, attempts);
      }, 800);
    } else {
      setFeedback(`❌ "${normalized}" - Try again!`);
      setAttempts(a => a + 1);
      setTextInput('');
    }
  };

  const handleAttack = () => {
    if (weaponDurability <= BALANCE.WEAPON_BROKEN_THRESHOLD) {
      setFeedback('⚠️ Weapon broken! Visit the Forge to repair.');
      return;
    }
    onAttack(monsterData.monsterId);
    setFeedback(`⚔️ Attack! Durability: ${weaponDurability - BALANCE.ATTACK_DURABILITY_COST}%`);
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
        <div className="monster-display">
          <span style={{ fontSize: '64px' }}>{emoji}</span>
          <div style={{ fontSize: '14px', color: '#aaa', marginTop: 4 }}>{monsterData.type}</div>
        </div>

        {/* Word hints */}
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <div style={{ marginBottom: 8, fontSize: 14, color: '#aaa' }}>Say or spell this word:</div>
          <div>{renderWordHints()}</div>
          <button onClick={speakWord} className="speak-btn">🔊 Listen</button>
        </div>

        {/* Mode tabs */}
        <div className="mode-tabs">
          <button
            className={`mode-tab ${mode === 'quiz' ? 'active' : ''}`}
            onClick={() => setMode('quiz')}
          >🎤 Voice / Type</button>
          <button
            className={`mode-tab ${mode === 'attack' ? 'active' : ''}`}
            onClick={() => setMode('attack')}
          >⚔️ Attack</button>
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
                {isListening ? '🎙️ Listening...' : '🎤 Tap to Speak'}
              </button>
            ) : null}

            <div className="text-input-section">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                placeholder="Type the word..."
                className="quiz-text-input"
                autoFocus={!isSupported}
              />
              <button onClick={handleTextSubmit} className="submit-btn">Check</button>
            </div>
          </div>
        )}

        {/* Attack mode */}
        {mode === 'attack' && (
          <div className="attack-section">
            <div style={{ fontSize: 14, color: '#aaa', marginBottom: 8 }}>
              Weapon: ⚔️ {weaponDurability}% durability
            </div>
            <button
              onClick={handleAttack}
              className="attack-action-btn"
              disabled={weaponDurability <= 0}
            >
              ⚔️ Attack Monster
            </button>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
              -{BALANCE.ATTACK_DURABILITY_COST}% durability | {Math.round(monsterData.hintDropRate * 100)}% hint chance
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="quiz-feedback">{feedback}</div>
        )}

        {/* Collected hints */}
        {collectedHints.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: '#FFD700' }}>
            Hints: {collectedHints.map(h => h.toUpperCase()).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};
