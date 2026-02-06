import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import wordsData from '../data/words.json';
import { Word } from '../types/game';

const LearningReportScreen: React.FC = () => {
  const navigate = useNavigate();
  const { quizLogs, loadFromStorage } = useGameStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const allWords = wordsData as Word[];

  const stats = useMemo(() => {
    if (quizLogs.length === 0) return null;

    const totalAttempts = quizLogs.length;
    const correctCount = quizLogs.filter(q => q.isCorrect).length;
    const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

    // Word-level stats
    const wordStats: Record<number, { correct: number; total: number; word: string }> = {};
    quizLogs.forEach(log => {
      if (!wordStats[log.wordId]) {
        const w = allWords.find(aw => aw.id === log.wordId);
        wordStats[log.wordId] = { correct: 0, total: 0, word: w?.word || '?' };
      }
      wordStats[log.wordId].total++;
      if (log.isCorrect) wordStats[log.wordId].correct++;
    });

    const wordList = Object.values(wordStats).sort((a, b) => {
      const accA = a.total > 0 ? a.correct / a.total : 0;
      const accB = b.total > 0 ? b.correct / b.total : 0;
      return accA - accB;
    });

    return { totalAttempts, correctCount, accuracy, wordList };
  }, [quizLogs, allWords]);

  return (
    <div style={{ width: '100%', maxWidth: 420, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={() => navigate('/')} style={{ padding: '8px 16px', borderRadius: 8, background: '#333', color: '#fff', fontSize: 14, border: 'none', cursor: 'pointer', marginRight: 16 }}>← Back</button>
        <h2 style={{ color: '#48BB78', margin: 0 }}>📊 Learning Report</h2>
      </div>

      {!stats ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#555' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
          <div>No quiz data yet. Play some stages first!</div>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 12,
            marginBottom: 24,
          }}>
            <div style={{ background: '#1a1a3a', borderRadius: 12, padding: 14, textAlign: 'center', border: '1px solid #333' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#4A90D9' }}>{stats.totalAttempts}</div>
              <div style={{ fontSize: 12, color: '#888' }}>Attempts</div>
            </div>
            <div style={{ background: '#1a1a3a', borderRadius: 12, padding: 14, textAlign: 'center', border: '1px solid #333' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#48BB78' }}>{stats.correctCount}</div>
              <div style={{ fontSize: 12, color: '#888' }}>Correct</div>
            </div>
            <div style={{ background: '#1a1a3a', borderRadius: 12, padding: 14, textAlign: 'center', border: '1px solid #333' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: stats.accuracy >= 70 ? '#48BB78' : '#D69E2E' }}>{stats.accuracy}%</div>
              <div style={{ fontSize: 12, color: '#888' }}>Accuracy</div>
            </div>
          </div>

          {/* Word breakdown */}
          <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 12 }}>Word Performance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {stats.wordList.map((ws, i) => {
              const acc = ws.total > 0 ? Math.round((ws.correct / ws.total) * 100) : 0;
              const barColor = acc >= 80 ? '#48BB78' : acc >= 50 ? '#D69E2E' : '#E53E3E';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
                  <div style={{ width: 60, fontWeight: 'bold', fontSize: 15 }}>{ws.word}</div>
                  <div style={{ flex: 1, height: 8, background: '#333', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${acc}%`, height: '100%', background: barColor, borderRadius: 4 }} />
                  </div>
                  <div style={{ width: 40, textAlign: 'right', fontSize: 13, color: barColor }}>{acc}%</div>
                  <div style={{ width: 50, textAlign: 'right', fontSize: 11, color: '#666' }}>{ws.correct}/{ws.total}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default LearningReportScreen;
