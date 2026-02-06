import React, { useState, useCallback } from 'react';
import { VirtualKeyboard } from '../components/VirtualKeyboard';

interface Props {
  word: string;
  hints: string[];
  onSubmit: (correct: boolean) => void;
  onClose: () => void;
}

export const TreasureBoxOverlay: React.FC<Props> = ({ word, hints, onSubmit, onClose }) => {
  const [letters, setLetters] = useState<string[]>(new Array(word.length).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const speakWord = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  }, [word]);

  const handleKeyPress = (key: string) => {
    if (key === 'BACKSPACE') {
      const newLetters = [...letters];
      if (letters[activeIndex] === '' && activeIndex > 0) {
        newLetters[activeIndex - 1] = '';
        setLetters(newLetters);
        setActiveIndex(activeIndex - 1);
      } else {
        newLetters[activeIndex] = '';
        setLetters(newLetters);
      }
      return;
    }

    if (key === 'ENTER') {
      checkAnswer();
      return;
    }

    if (activeIndex < word.length) {
      const newLetters = [...letters];
      newLetters[activeIndex] = key.toLowerCase();
      setLetters(newLetters);
      if (activeIndex < word.length - 1) {
        setActiveIndex(activeIndex + 1);
      }
    }
  };

  const checkAnswer = () => {
    const answer = letters.join('').toLowerCase();
    if (answer === word.toLowerCase()) {
      setFeedback('✅ Correct! Treasure opened!');
      setTimeout(() => onSubmit(true), 1000);
    } else {
      setFeedback('❌ Try again!');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="overlay-backdrop">
      <div className={`overlay-panel treasure-panel ${shake ? 'shake' : ''}`}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '56px' }}>📦✨</span>
          <h3 style={{ color: '#FFD700', margin: '8px 0' }}>Treasure Box!</h3>
          <p style={{ color: '#aaa', fontSize: 14 }}>Spell the word to open the treasure</p>
          <button onClick={speakWord} className="speak-btn">🔊 Listen to the word</button>
        </div>

        {/* Letter boxes */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '20px 0' }}>
          {word.split('').map((letter, i) => {
            const isHinted = hints.includes(letter);
            const isFilled = letters[i] !== '';
            const isActive = i === activeIndex;

            return (
              <div
                key={i}
                onClick={() => setActiveIndex(i)}
                style={{
                  width: 44,
                  height: 52,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  background: isActive ? '#2a2a4a' : '#1a1a3a',
                  border: `2px solid ${isActive ? '#FFD700' : isHinted ? '#FFD70066' : '#333'}`,
                  borderRadius: 8,
                  color: isFilled ? '#fff' : isHinted ? '#FFD700' : '#555',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {isFilled ? letters[i].toUpperCase() : isHinted ? letter.toUpperCase() : ''}
              </div>
            );
          })}
        </div>

        {/* Hints display */}
        {hints.length > 0 && (
          <div style={{ textAlign: 'center', fontSize: 13, color: '#FFD700', marginBottom: 8 }}>
            Collected hints: {hints.map(h => h.toUpperCase()).join(', ')}
          </div>
        )}

        {/* Feedback */}
        {feedback && <div className="quiz-feedback">{feedback}</div>}

        {/* Virtual keyboard */}
        <VirtualKeyboard onKeyPress={handleKeyPress} />

        {/* Submit button */}
        <button
          onClick={checkAnswer}
          className="submit-btn"
          style={{ width: '100%', marginTop: 12 }}
        >
          Check ✓
        </button>
      </div>
    </div>
  );
};
