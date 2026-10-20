import { useEffect, useState } from 'react';
import type { GameSnapshot } from '../core/GameEngine';
import { PIECE_SVGS } from '../../pieces';
import { useBoardFlip, type PieceGrid } from '../../boardAnimation';

const FILE_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANK_LABELS = ['8', '7', '6', '5', '4', '3', '2', '1'];

interface PuzzleBoardProps {
  snapshot: GameSnapshot;
  onSelectSquare: (row: number, col: number) => void;
}

/**
 * Puzzle board. Renders the exact same markup and classes as the shared
 * ChessBoard (Computer / Online) - .board > button.square with in-square
 * rank/file labels, .target / .capture move markers - so all three modes
 * look and behave identically. Only puzzle-specific extras live here:
 * hint highlight, wrong-move shake and the checkmate overlay.
 */
export function PuzzleBoard({ snapshot, onSelectSquare }: PuzzleBoardProps) {
  const [shake, setShake] = useState(false);
  const animationRef = useBoardFlip(snapshot.board as PieceGrid, 'w');

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
    <div className="board-wrap">
      <div
        ref={animationRef}
        className={`board${shake ? ' shake' : ''}`}
        role="grid"
        aria-label="Chess puzzle board"
      >
        {Array.from({ length: 8 }).map((_, r) =>
          Array.from({ length: 8 }).map((__, c) => {
            const cell = snapshot.board[r][c];
            const dark = (r + c) % 2 === 1;
            const squareName = `${FILE_LABELS[c]}${RANK_LABELS[r]}`;
            const classes = [
              'square',
              dark ? 'dark' : 'light',
              isSelected(r, c) ? 'selected' : '',
              isHint(r, c) ? 'hint-sq' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={squareName}
                type="button"
                role="gridcell"
                className={classes}
                data-square={squareName}
                aria-label={
                  cell
                    ? `${squareName} ${cell.color === 'w' ? 'white' : 'black'} ${cell.type.toLowerCase()}`
                    : squareName
                }
                onClick={() => onSelectSquare(r, c)}
              >
                {c === 0 && <small className="rank">{RANK_LABELS[r]}</small>}
                {r === 7 && <small className="file">{FILE_LABELS[c]}</small>}
                {cell && (
                  <img
                    className={`piece-svg piece-svg--${cell.color}`}
                    data-piece={`${cell.color}${cell.type.toLowerCase()}`}
                    src={PIECE_SVGS[cell.color][cell.type.toLowerCase()]}
                    alt={`${cell.color === 'w' ? 'white' : 'black'} ${cell.type.toLowerCase()}`}
                    draggable={false}
                  />
                )}
                {isPossible(r, c) && <span className={cell ? 'capture' : 'target'} />}
              </button>
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
  );
}
