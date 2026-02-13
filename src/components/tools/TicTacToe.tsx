'use client';

import { useMemo, useState } from 'react';

type Cell = 'X' | 'O' | null;

export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');

  const winner = useMemo(() => getWinner(board), [board]);
  const status = winner
    ? `Winner: ${winner}`
    : board.every(Boolean)
    ? 'Draw'
    : `Turn: ${turn}`;

  const click = (i: number) => {
    if (board[i] || winner) return;
    const next = board.slice();
    next[i] = turn;
    setBoard(next);
    setTurn(turn === 'X' ? 'O' : 'X');
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setTurn('X');
  };

  return (
    <div style={{ border: '1px solid #eee', borderRadius: 14, padding: 14 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <div style={{ fontWeight: 800 }}>{status}</div>
        <button onClick={reset} style={btn}>
          Reset
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 90px)',
          gap: 8,
        }}
      >
        {board.map((c, i) => (
          <button
            key={i}
            onClick={() => click(i)}
            style={{
              width: 90,
              height: 90,
              borderRadius: 14,
              border: '1px solid #ddd',
              fontSize: 28,
              fontWeight: 900,
              background: 'white',
              cursor: 'pointer',
            }}
          >
            {c ?? ''}
          </button>
        ))}
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 10,
  border: '1px solid #ddd',
  background: 'white',
  cursor: 'pointer',
};

function getWinner(b: Cell[]): 'X' | 'O' | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, c, d] of lines) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return null;
}
