import { useEffect, useState } from 'react';
import type { GameSnapshot } from '../core/GameEngine';
import { PIECE_SVGS } from '../../pieces';

const FILE_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANK_LABELS = ['8', '7', '6', '5', '4', '3', '2', '1'];

interface PuzzleBoardProps {
  snapshot: GameSnapshot;
  onSelectSquare: (row: number, col: number) => void;
}

export function PuzzleBoard({ snapshot, onSelectSquare }: PuzzleBoardProps) {
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (snapshot.feedback.type === 'wrong') {
      setShake(true);
      const t = window.setTimeout(() => setShake(false), 320);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [snapshot.feedback]);

  const isSelected = (r: number, c: number) =>
    snapshot.selected?.row === r && snapshot.selected?.col === c;
  const isPossible = (r: number, c: number) =>
    snapshot.legalDestinations.some((d) => d.row === r && d.col === c);
  const isHint = (r: number, c: number) =>
    snapshot.hintSquare?.row === r && snapshot.hintSquare?.col === c;

  return (
    <div className="board-frame">
      <div className="board-labels-rank" aria-hidden="true">
        {RANK_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="board-wrap">
        <div
          className={`board${shake ? ' shake' : ''}`}
          role="grid"
          aria-label="Chess puzzle board"
        >
          {Array.from({ length: 8 }).map((_, r) =>
            Array.from({ length: 8 }).map((__, c) => {
              const cell = snapshot.board[r][c];
              const isLight = (r + c) % 2 === 0;
              const classes = [
                'sq',
                isLight ? 'light' : 'dark',
                cell ? 'has-piece' : '',
                isSelected(r, c) ? 'selected' : '',
                isPossible(r, c) ? 'possible' : '',
                isHint(r, c) ? 'hint-sq' : '',
              ]
                .filter(Boolean)
                .join(' ');

              const squareName = `${FILE_LABELS[c]}${RANK_LABELS[r]}`;

              return (
                <div
                  key={`${r}-${c}`}
                  className={classes}
                  role="gridcell"
                  aria-label={
                    cell
                      ? `${squareName}, ${cell.color === 'w' ? 'white' : 'black'} ${cell.type}`
                      : squareName
                  }
                  tabIndex={-1}
                  onClick={() => onSelectSquare(r, c)}
                >
                  {cell && (
                    <img
                      className={`piece-svg piece-svg--${cell.color}`}
                      src={PIECE_SVGS[cell.color][cell.type.toLowerCase()]}
                      alt=""
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            }),
          )}
        </div>
        <div className={`mate-overlay${snapshot.puzzleDone ? ' show' : ''}`}>
          <div className="mate-overlay-inner">
            <div className="mate-overlay-icon">&#9812;</div>
            <div className="mate-overlay-text">Checkmate</div>
          </div>
        </div>
      </div>
      <div className="board-labels-file" aria-hidden="true">
        {FILE_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
