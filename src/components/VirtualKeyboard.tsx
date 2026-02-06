import React from 'react';

interface Props {
  onKeyPress: (key: string) => void;
}

const ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['BACKSPACE', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'ENTER'],
];

export const VirtualKeyboard: React.FC<Props> = ({ onKeyPress }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
      {ROWS.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 3 }}>
          {row.map((key) => {
            const isSpecial = key === 'BACKSPACE' || key === 'ENTER';
            const label = key === 'BACKSPACE' ? '⌫' : key === 'ENTER' ? '✓' : key;
            return (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                style={{
                  width: isSpecial ? 48 : 30,
                  height: 38,
                  borderRadius: 6,
                  border: 'none',
                  background: isSpecial ? '#4A90D9' : '#2a2a4a',
                  color: '#fff',
                  fontSize: isSpecial ? 16 : 14,
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
